use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SSEEvent {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_type: Option<String>,
    pub data: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SSEStateChange {
    pub id: String,
    pub state: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SSEConnectRequest {
    pub id: String,
    pub url: String,
    #[serde(default)]
    pub headers: std::collections::HashMap<String, String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_event_id: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sse_event_serde() {
        let event = SSEEvent {
            id: "sse-1".to_string(),
            event_type: Some("message".to_string()),
            data: "hello world".to_string(),
            event_id: Some("evt-42".to_string()),
        };

        let json = serde_json::to_string(&event).unwrap();
        let deserialized: SSEEvent = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.data, "hello world");
        assert!(json.contains("\"eventType\""));
        assert!(!json.contains("\"event_type\""));
    }

    #[test]
    fn test_sse_state_change_serde() {
        let change = SSEStateChange {
            id: "sse-1".to_string(),
            state: "connected".to_string(),
            reason: Some("initial connect".to_string()),
        };

        let json = serde_json::to_string(&change).unwrap();
        assert!(json.contains("\"state\":\"connected\""));
    }
}