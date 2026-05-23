use crate::models::error::AppError;
use crate::models::proto::{ProtoFileInfo, ProtoParsingResult};
use std::collections::HashMap;

pub struct ProtoManager {
    cache: HashMap<String, ProtoParsingResult>,
}

impl ProtoManager {
    pub fn new() -> Self {
        ProtoManager {
            cache: HashMap::new(),
        }
    }

    pub fn parse(&mut self, name: &str, content: &str) -> Result<ProtoParsingResult, AppError> {
        let result = parse_proto_content(content)?;
        self.cache.insert(name.to_string(), result.clone());
        Ok(result)
    }

    pub fn get(&self, name: &str) -> Option<&ProtoParsingResult> {
        self.cache.get(name)
    }

    pub fn list(&self) -> Vec<ProtoFileInfo> {
        self.cache
            .iter()
            .map(|(name, result)| ProtoFileInfo {
                name: name.clone(),
                package: result.package.clone(),
                service_count: result.services.len(),
                message_count: result.messages.len(),
            })
            .collect()
    }

    pub fn delete(&mut self, name: &str) -> Result<(), AppError> {
        if self.cache.remove(name).is_some() {
            Ok(())
        } else {
            Err(AppError::NotFound {
                resource: "proto_file".to_string(),
                id: name.to_string(),
            })
        }
    }

    pub fn upload(
        &mut self,
        name: &str,
        content: &str,
        data_dir: &std::path::Path,
    ) -> Result<ProtoParsingResult, AppError> {
        let proto_dir = data_dir.join("protos");
        std::fs::create_dir_all(&proto_dir).map_err(|e| AppError::FsError {
            message: format!("Failed to create proto directory: {}", e),
            path: Some(proto_dir.to_string_lossy().to_string()),
        })?;

        let file_path = proto_dir.join(format!("{}.proto", name));
        std::fs::write(&file_path, content).map_err(|e| AppError::FsError {
            message: format!("Failed to write proto file: {}", e),
            path: Some(file_path.to_string_lossy().to_string()),
        })?;

        self.parse(name, content)
    }
}

fn parse_proto_content(content: &str) -> Result<ProtoParsingResult, AppError> {
    let mut package = None;
    let mut services = Vec::new();
    let mut messages = Vec::new();

    for line in content.lines() {
        let trimmed = line.trim();

        if trimmed.starts_with("package ") {
            package = Some(trimmed.trim_start_matches("package ").trim_end_matches(';').trim().to_string());
        }

        if trimmed.starts_with("service ") {
            let name = trimmed
                .trim_start_matches("service ")
                .trim()
                .trim_end_matches('{')
                .trim()
                .to_string();
            if !name.is_empty() {
                services.push(crate::models::proto::ProtoService {
                    name: name.clone(),
                    package: package.clone(),
                    methods: Vec::new(),
                });
            }
        }

        if trimmed.starts_with("rpc ") {
            // Parse: rpc MethodName(InputType) returns (OutputType);
            let inner = trimmed.trim_start_matches("rpc ").trim();
            if let Some(paren_start) = inner.find('(') {
                let method_name = inner[..paren_start].trim().to_string();
                let rest = &inner[paren_start + 1..];
                // rest: "InputType) returns (OutputType);" or "InputType) returns (OutputType) {"
                let input_end = rest.find(')').unwrap_or(rest.len());
                let input_type = rest[..input_end].trim().to_string();

                let after_input = &rest[input_end..];
                // Find "returns" and then the output type
                let output_type = if let Some(returns_idx) = after_input.find("returns") {
                    let after_returns = &after_input[returns_idx + 7..];
                    let after_returns = after_returns.trim();
                    if after_returns.starts_with('(') {
                        let close_paren = after_returns[1..].find(')').unwrap_or(after_returns.len() - 1);
                        after_returns[1..close_paren + 1].trim().to_string()
                    } else {
                        String::new()
                    }
                } else {
                    String::new()
                };

                if let Some(last_service) = services.last_mut() {
                    last_service.methods.push(crate::models::proto::ProtoMethod {
                        name: method_name,
                        input_type,
                        output_type,
                    });
                }
            }
        }

        if trimmed.starts_with("message ") {
            let name = trimmed
                .trim_start_matches("message ")
                .trim()
                .trim_end_matches('{')
                .trim()
                .to_string();
            if !name.is_empty() {
                messages.push(crate::models::proto::ProtoMessage {
                    name,
                    fields: Vec::new(), // Simplified: field parsing not needed for skeleton
                });
            }
        }
    }

    Ok(ProtoParsingResult {
        services,
        messages,
        package,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_proto() {
        let content = r#"
package helloworld;

service Greeter {
    rpc SayHello(HelloRequest) returns (HelloReply);
    rpc StreamGreetings(HelloRequest) returns (stream HelloReply);
}

message HelloRequest {
    string name = 1;
}

message HelloReply {
    string message = 1;
}
"#;

        let mut manager = ProtoManager::new();
        let result = manager.parse("helloworld", content).unwrap();

        assert_eq!(result.package, Some("helloworld".to_string()));
        assert_eq!(result.services.len(), 1);
        assert_eq!(result.services[0].name, "Greeter");
        assert_eq!(result.services[0].methods.len(), 2);
        assert_eq!(result.services[0].methods[0].name, "SayHello");
        assert_eq!(result.services[0].methods[0].input_type, "HelloRequest");
        assert_eq!(result.services[0].methods[0].output_type, "HelloReply");
        assert_eq!(result.messages.len(), 2);
    }

    #[test]
    fn test_proto_caching() {
        let content = "package test;\nservice TestService { rpc Foo(In) returns (Out); }";
        let mut manager = ProtoManager::new();

        manager.parse("test", content).unwrap();
        assert!(manager.get("test").is_some());
        assert!(manager.get("nonexistent").is_none());

        let list = manager.list();
        assert_eq!(list.len(), 1);
    }

    #[test]
    fn test_proto_delete() {
        let content = "package test;\nservice TestService {}";
        let mut manager = ProtoManager::new();
        manager.parse("test", content).unwrap();
        assert!(manager.delete("test").is_ok());
        assert!(manager.get("test").is_none());
    }
}