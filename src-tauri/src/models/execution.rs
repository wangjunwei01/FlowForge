use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeExecutionResult {
    pub node_id: String,
    pub status: String,
    pub response: Option<serde_json::Value>,
    pub error: Option<String>,
    pub duration: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionRecord {
    pub id: String,
    pub flow_id: String,
    pub status: String,
    pub start_time: String,
    pub end_time: String,
    pub node_results: HashMap<String, NodeExecutionResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldDisplayConfig {
    pub field: String,
    pub label: String,
    pub format: Option<String>,
    pub format_options: Option<serde_json::Value>,
    pub visible: bool,
    pub order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DisplayConfig {
    pub node_id: String,
    pub view_mode: String,
    pub fields: Vec<FieldDisplayConfig>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_execution_record_serde() {
        let record = ExecutionRecord {
            id: "exec-1".to_string(),
            flow_id: "flow-1".to_string(),
            status: "success".to_string(),
            start_time: "2024-01-01T00:00:00Z".to_string(),
            end_time: "2024-01-01T00:00:01Z".to_string(),
            node_results: HashMap::new(),
        };

        let json = serde_json::to_string(&record).unwrap();
        let deserialized: ExecutionRecord = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, "exec-1");
        assert_eq!(deserialized.flow_id, "flow-1");
        assert!(json.contains("\"nodeResults\""));
        assert!(!json.contains("\"node_results\""));
    }

    #[test]
    fn test_display_config_serde() {
        let config = DisplayConfig {
            node_id: "node-1".to_string(),
            view_mode: "formatted".to_string(),
            fields: vec![FieldDisplayConfig {
                field: "status".to_string(),
                label: "Status".to_string(),
                format: Some("number".to_string()),
                format_options: None,
                visible: true,
                order: 0,
            }],
        };

        let json = serde_json::to_string(&config).unwrap();
        let deserialized: DisplayConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.node_id, "node-1");
        assert_eq!(deserialized.fields.len(), 1);
        assert!(json.contains("\"viewMode\""));
        assert!(!json.contains("\"view_mode\""));
    }
}