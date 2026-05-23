use crate::models::error::AppError;

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::FsError {
            message: err.to_string(),
            path: None,
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Parse {
            message: err.to_string(),
        }
    }
}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        if err.is_timeout() {
            AppError::Timeout {
                message: format!("Request timed out: {}", err),
            }
        } else {
            AppError::Network {
                message: format!("HTTP request failed: {}", err),
            }
        }
    }
}

impl From<tokio_tungstenite::tungstenite::Error> for AppError {
    fn from(err: tokio_tungstenite::tungstenite::Error) -> Self {
        AppError::Network {
            message: format!("WebSocket error: {}", err),
        }
    }
}

impl From<rquickjs::Error> for AppError {
    fn from(err: rquickjs::Error) -> Self {
        AppError::ScriptError {
            message: format!("Script engine error: {}", err),
        }
    }
}