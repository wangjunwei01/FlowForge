use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtoService {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub package: Option<String>,
    pub methods: Vec<ProtoMethod>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtoMethod {
    pub name: String,
    pub input_type: String,
    pub output_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtoMessage {
    pub name: String,
    pub fields: Vec<ProtoField>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtoField {
    pub name: String,
    #[serde(rename = "type")]
    pub field_type: String,
    pub number: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repeated: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtoParsingResult {
    pub services: Vec<ProtoService>,
    pub messages: Vec<ProtoMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub package: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtoFileInfo {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub package: Option<String>,
    pub service_count: usize,
    pub message_count: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_proto_field_type_rename() {
        let field = ProtoField {
            name: "id".to_string(),
            field_type: "int32".to_string(),
            number: 1,
            repeated: Some(true),
        };

        let json = serde_json::to_string(&field).unwrap();
        assert!(json.contains("\"type\":\"int32\""));
        assert!(!json.contains("\"fieldType\""));
        assert!(json.contains("\"number\":1"));
    }

    #[test]
    fn test_proto_parsing_result_serde() {
        let result = ProtoParsingResult {
            services: vec![ProtoService {
                name: "Greeter".to_string(),
                package: Some("helloworld".to_string()),
                methods: vec![ProtoMethod {
                    name: "SayHello".to_string(),
                    input_type: "HelloRequest".to_string(),
                    output_type: "HelloReply".to_string(),
                }],
            }],
            messages: vec![ProtoMessage {
                name: "HelloRequest".to_string(),
                fields: vec![],
            }],
            package: Some("helloworld".to_string()),
        };

        let json = serde_json::to_string(&result).unwrap();
        let deserialized: ProtoParsingResult = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.services.len(), 1);
        assert_eq!(deserialized.messages.len(), 1);
        assert!(json.contains("\"serviceCount\"") == false); // not a field
        assert!(json.contains("\"inputType\""));
    }
}