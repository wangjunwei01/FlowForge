use crate::models::script::{ScriptExecuteRequest, ScriptResult};
use std::time::Instant;

pub struct ScriptEngine;

impl ScriptEngine {
    pub fn execute(req: &ScriptExecuteRequest) -> ScriptResult {
        let start = Instant::now();

        let rt = match rquickjs::Runtime::new() {
            Ok(rt) => rt,
            Err(e) => {
                return ScriptResult {
                    success: false,
                    output: None,
                    logs: None,
                    error: Some(format!("Failed to create JS runtime: {}", e)),
                    duration_ms: start.elapsed().as_millis() as u64,
                }
            }
        };

        let memory_limit = req.max_memory_bytes.unwrap_or(8 * 1024 * 1024) as usize;
        rt.set_memory_limit(memory_limit);
        rt.set_max_stack_size(1024 * 1024);

        let context = match rquickjs::Context::full(&rt) {
            Ok(ctx) => ctx,
            Err(e) => {
                return ScriptResult {
                    success: false,
                    output: None,
                    logs: None,
                    error: Some(format!("Failed to create JS context: {}", e)),
                    duration_ms: start.elapsed().as_millis() as u64,
                }
            }
        };

        let input_json = req.input.clone().unwrap_or(serde_json::Value::Null);
        let input_str = serde_json::to_string(&input_json).unwrap_or_else(|_| "null".to_string());
        let code = req.code.clone();
        let timeout_ms = req.timeout_ms.unwrap_or(5000);

        // Execute setup + user code, and convert result to JSON string inside the context
        let result: Result<String, String> = context.with(|ctx| {
            // Set up console.log and __logs via eval first
            ctx.eval::<(), _>("var __logs = []; var console = { log: function() { var args = Array.prototype.slice.call(arguments); __logs.push(args.map(String).join(' ')); } };")
                .map_err(|e| format!("{}", e))?;

            // Inject $input
            ctx.globals().set("$input", input_str.clone())
                .map_err(|e| format!("{}", e))?;

            // Execute user code, then JSON.stringify the result
            let wrapped = format!(
                "(function() {{ var __result = {}; return JSON.stringify(__result); }})()",
                code
            );
            let json_str: String = ctx.eval(&wrapped as &str)
                .map_err(|e| format!("{}", e))?;

            Ok(json_str)
        });

        // Collect logs from the context
        let collected_logs: Vec<String> = context.with(|ctx| {
            let log_array: rquickjs::Array = ctx.globals().get::<_, rquickjs::Array>("__logs").ok()?;
            let mut log_vec = Vec::new();
            for i in 0..log_array.len() {
                if let Ok(s) = log_array.get::<String>(i) {
                    log_vec.push(s);
                }
            }
            Some(log_vec)
        }).unwrap_or_default();

        let duration_ms = start.elapsed().as_millis() as u64;

        // Check timeout
        if duration_ms > timeout_ms {
            return ScriptResult {
                success: false,
                output: None,
                logs: if collected_logs.is_empty() { None } else { Some(collected_logs) },
                error: Some(format!("Script execution timed out after {}ms", timeout_ms)),
                duration_ms,
            };
        }

        match result {
            Ok(json_str) => {
                let output_value = serde_json::from_str(&json_str).ok();
                // If the result is a JSON string that represents a string, unwrap it
                let output = match &output_value {
                    Some(serde_json::Value::String(s)) => Some(serde_json::Value::String(s.clone())),
                    _ => output_value,
                };
                ScriptResult {
                    success: true,
                    output,
                    logs: if collected_logs.is_empty() { None } else { Some(collected_logs) },
                    error: None,
                    duration_ms,
                }
            }
            Err(e) => ScriptResult {
                success: false,
                output: None,
                logs: if collected_logs.is_empty() { None } else { Some(collected_logs) },
                error: Some(e),
                duration_ms,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_script_basic_execution() {
        let req = ScriptExecuteRequest {
            code: "1 + 1".to_string(),
            input: None,
            timeout_ms: Some(5000),
            max_memory_bytes: Some(8 * 1024 * 1024),
        };

        let result = ScriptEngine::execute(&req);
        assert!(result.success, "Expected success, got error: {:?}", result.error);
    }

    #[test]
    fn test_script_error_handling() {
        let req = ScriptExecuteRequest {
            code: "throw new Error('test error')".to_string(),
            input: None,
            timeout_ms: Some(5000),
            max_memory_bytes: Some(8 * 1024 * 1024),
        };

        let result = ScriptEngine::execute(&req);
        assert!(!result.success);
        assert!(result.error.is_some());
    }
}