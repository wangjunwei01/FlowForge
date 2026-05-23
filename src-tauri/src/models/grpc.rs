use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GrpcRequest {
    pub url: String,
    pub service_name: String,
    pub method_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_body: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<std::collections::HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deadline_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GrpcResponse {
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response_body: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub headers: Option<std::collections::HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_grpc_request_serde() {
        let req = GrpcRequest {
            url: "https://localhost:50051".to_string(),
            service_name: "Greeter".to_string(),
            method_name: "SayHello".to_string(),
            request_body: Some(serde_json::json!({"name": "world"})),
            metadata: None,
            deadline_ms: Some(5000),
        };

        let json = serde_json::to_string(&req).unwrap();
        let deserialized: GrpcRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.service_name, "Greeter");
        assert!(json.contains("\"serviceName\""));
        assert!(json.contains("\"deadlineMs\""));
        assert!(!json.contains("\"service_name\""));
    }
}