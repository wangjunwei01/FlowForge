use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MockRouteConfig {
    pub method: String,
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub headers: Option<std::collections::HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub delay_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MockStartRequest {
    pub port: u16,
    #[serde(default)]
    pub cors_enabled: bool,
    #[serde(default)]
    pub default_headers: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MockRequestLog {
    pub id: String,
    pub method: String,
    pub path: String,
    pub headers: std::collections::HashMap<String, String>,
    pub query: String,
    pub body: Option<String>,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MockServerStatus {
    pub running: bool,
    pub port: u16,
    pub route_count: usize,
    pub request_count: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mock_route_config_serde() {
        let route = MockRouteConfig {
            method: "GET".to_string(),
            path: "/api/users".to_string(),
            status: Some(200),
            headers: None,
            body: Some(r#"{"users":[]}"#.to_string()),
            delay_ms: None,
        };

        let json = serde_json::to_string(&route).unwrap();
        let deserialized: MockRouteConfig = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.method, "GET");
        assert_eq!(deserialized.path, "/api/users");
        assert_eq!(deserialized.status, Some(200));
        assert!(json.contains("\"delayMs\"") == false); // skip_serializing_if
    }

    #[test]
    fn test_mock_start_request_serde() {
        let req = MockStartRequest {
            port: 8080,
            cors_enabled: true,
            default_headers: std::collections::HashMap::new(),
        };

        let json = serde_json::to_string(&req).unwrap();
        assert!(json.contains("corsEnabled"));
        assert!(json.contains("defaultHeaders"));
        assert!(!json.contains("cors_enabled"));
    }
}