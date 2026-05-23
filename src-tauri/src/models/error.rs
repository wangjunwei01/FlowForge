use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
#[allow(dead_code)]
pub enum AppError {
    #[serde(rename = "E001")]
    Unknown { message: String },
    #[serde(rename = "E002")]
    IpcError { message: String },
    #[serde(rename = "E003")]
    Validation { message: String, details: Option<serde_json::Value> },
    #[serde(rename = "E004")]
    NotFound { resource: String, id: String },
    #[serde(rename = "E005")]
    Permission { message: String },
    #[serde(rename = "E006")]
    Network { message: String },
    #[serde(rename = "E007")]
    Timeout { message: String },
    #[serde(rename = "E008")]
    Parse { message: String },
    #[serde(rename = "E009")]
    FsError { message: String, path: Option<String> },
    #[serde(rename = "E010")]
    ScriptError { message: String },
    #[serde(rename = "E011")]
    ExecutionError { message: String, node_id: Option<String> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrontendError {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
}

impl AppError {
    pub fn code(&self) -> &str {
        match self {
            AppError::Unknown { .. } => "E001",
            AppError::IpcError { .. } => "E002",
            AppError::Validation { .. } => "E003",
            AppError::NotFound { .. } => "E004",
            AppError::Permission { .. } => "E005",
            AppError::Network { .. } => "E006",
            AppError::Timeout { .. } => "E007",
            AppError::Parse { .. } => "E008",
            AppError::FsError { .. } => "E009",
            AppError::ScriptError { .. } => "E010",
            AppError::ExecutionError { .. } => "E011",
        }
    }

    pub fn message(&self) -> &str {
        match self {
            AppError::Unknown { message } => message,
            AppError::IpcError { message } => message,
            AppError::Validation { message, .. } => message,
            AppError::NotFound { .. } => "Resource not found",
            AppError::Permission { message } => message,
            AppError::Network { message } => message,
            AppError::Timeout { message } => message,
            AppError::Parse { message } => message,
            AppError::FsError { message, .. } => message,
            AppError::ScriptError { message } => message,
            AppError::ExecutionError { message, .. } => message,
        }
    }

    pub fn to_frontend(&self) -> FrontendError {
        FrontendError {
            code: self.code().to_string(),
            message: self.message().to_string(),
            details: match self {
                AppError::Validation { details, .. } => details.clone(),
                AppError::NotFound { resource, id } => Some(serde_json::json!({
                    "resource": resource,
                    "id": id
                })),
                AppError::FsError { path, .. } => {
                    path.as_ref().map(|p| serde_json::json!({"path": p}))
                }
                AppError::ExecutionError { node_id, .. } => {
                    node_id.as_ref().map(|n| serde_json::json!({"nodeId": n}))
                }
                _ => None,
            },
        }
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}] {}", self.code(), self.message())
    }
}

impl std::error::Error for AppError {}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        self.to_frontend().serialize(serializer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_error_to_frontend() {
        let err = AppError::Network {
            message: "Connection refused".to_string(),
        };
        let fe = err.to_frontend();
        assert_eq!(fe.code, "E006");
        assert_eq!(fe.message, "Connection refused");
        assert_eq!(fe.details, None);
    }

    #[test]
    fn test_app_error_to_frontend_with_details() {
        let err = AppError::NotFound {
            resource: "flow".to_string(),
            id: "flow-123".to_string(),
        };
        let fe = err.to_frontend();
        assert_eq!(fe.code, "E004");
        assert!(fe.details.is_some());
        let details = fe.details.unwrap();
        assert_eq!(details["resource"], "flow");
        assert_eq!(details["id"], "flow-123");
    }

    #[test]
    fn test_app_error_to_frontend_validation() {
        let err = AppError::Validation {
            message: "Invalid input".to_string(),
            details: Some(serde_json::json!({"field": "url"})),
        };
        let fe = err.to_frontend();
        assert_eq!(fe.code, "E003");
        assert_eq!(fe.details.unwrap()["field"], "url");
    }

    #[test]
    fn test_frontend_error_serialization() {
        let err = AppError::Timeout {
            message: "Request timed out".to_string(),
        };
        let fe = err.to_frontend();
        let json = serde_json::to_string(&fe).unwrap();
        assert!(json.contains("\"code\":\"E007\""));
        assert!(json.contains("\"message\":\"Request timed out\""));
        assert!(!json.contains("details")); // skip_serializing_if
    }
}