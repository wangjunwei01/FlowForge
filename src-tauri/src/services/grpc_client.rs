use crate::models::error::AppError;
use crate::models::grpc::{GrpcRequest, GrpcResponse};

pub fn grpc_unary_request(_req: &GrpcRequest) -> Result<GrpcResponse, AppError> {
    Err(AppError::ScriptError {
        message: "gRPC client is not yet implemented".to_string(),
    })
}

pub fn grpc_cancel(_cancel_token_id: &str) -> Result<(), AppError> {
    Err(AppError::ScriptError {
        message: "gRPC client is not yet implemented".to_string(),
    })
}