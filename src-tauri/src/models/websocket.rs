use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WsMessage {
    pub id: String,
    #[serde(rename = "type")]
    pub message_type: String,
    pub data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WsStateChange {
    pub id: String,
    pub state: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WsConnectRequest {
    pub id: String,
    pub url: String,
    #[serde(default)]
    pub protocols: Vec<String>,
    #[serde(default)]
    pub headers: std::collections::HashMap<String, String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ws_message_type_rename() {
        let msg = WsMessage {
            id: "ws-1".to_string(),
            message_type: "text".to_string(),
            data: "hello".to_string(),
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"text\""));
        assert!(!json.contains("\"messageType\""));
    }

    #[test]
    fn test_ws_state_change_serde() {
        let change = WsStateChange {
            id: "ws-1".to_string(),
            state: "connected".to_string(),
            reason: None,
        };

        let json = serde_json::to_string(&change).unwrap();
        let deserialized: WsStateChange = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.state, "connected");
    }
}