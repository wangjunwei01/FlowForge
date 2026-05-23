use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct ExecutionRecord {
    pub id: String,
    pub flow_id: String,
    pub status: String,
    pub start_time: String,
    pub end_time: String,
    pub node_results: std::collections::HashMap<String, NodeExecutionResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeExecutionResult {
    pub node_id: String,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response: Option<ResponseData>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    pub duration: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseData {
    pub raw: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub formatted: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub truncated: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub size_bytes: Option<u64>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_execution_record_serde_roundtrip() {
        let record = ExecutionRecord {
            id: "exec-1".to_string(),
            flow_id: "flow-1".to_string(),
            status: "success".to_string(),
            start_time: "2024-01-01T00:00:00Z".to_string(),
            end_time: "2024-01-01T00:00:01Z".to_string(),
            node_results: std::collections::HashMap::new(),
        };

        let json = serde_json::to_string(&record).unwrap();
        let deserialized: ExecutionRecord = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, "exec-1");
        assert_eq!(deserialized.flow_id, "flow-1");
        assert_eq!(deserialized.status, "success");
    }

    #[test]
    fn test_execution_record_camel_case() {
        let record = ExecutionRecord {
            id: "exec-1".to_string(),
            flow_id: "flow-1".to_string(),
            status: "success".to_string(),
            start_time: "2024-01-01T00:00:00Z".to_string(),
            end_time: "2024-01-01T00:00:01Z".to_string(),
            node_results: std::collections::HashMap::new(),
        };

        let json = serde_json::to_string(&record).unwrap();
        assert!(json.contains("\"flowId\""));
        assert!(json.contains("\"startTime\""));
        assert!(json.contains("\"nodeResults\""));
    }

    #[test]
    fn test_response_data_serde() {
        let data = ResponseData {
            raw: serde_json::json!({"key": "value"}),
            formatted: None,
            truncated: Some(false),
            size_bytes: Some(1024),
        };

        let json = serde_json::to_string(&data).unwrap();
        let deserialized: ResponseData = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.size_bytes, Some(1024));
        assert_eq!(deserialized.truncated, Some(false));
    }
}