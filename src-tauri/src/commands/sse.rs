use crate::models::error::AppError;
use crate::models::sse::SSEConnectRequest;
use crate::services::app_state::AppState;

#[tauri::command]
pub async fn sse_connect(
    state: tauri::State<'_, AppState>,
    request: SSEConnectRequest,
) -> Result<(), AppError> {
    crate::services::sse_client::sse_connect(&state, request).await
}

#[tauri::command]
pub async fn sse_disconnect(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), AppError> {
    crate::services::sse_client::sse_disconnect(&state, &id).await
}