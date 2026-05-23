use crate::models::error::AppError;
use crate::models::grpc::{GrpcRequest, GrpcResponse};

#[tauri::command]
pub fn grpc_request(request: GrpcRequest) -> Result<GrpcResponse, AppError> {
    crate::services::grpc_client::grpc_unary_request(&request)
}

#[tauri::command]
pub fn grpc_cancel(_cancel_token_id: String) -> Result<(), AppError> {
    crate::services::grpc_client::grpc_cancel("")
}