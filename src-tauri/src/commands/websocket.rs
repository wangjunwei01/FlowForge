use crate::models::error::AppError;
use crate::models::websocket::WsConnectRequest;
use crate::services::app_state::AppState;

#[tauri::command]
pub async fn ws_connect(
    state: tauri::State<'_, AppState>,
    request: WsConnectRequest,
) -> Result<(), AppError> {
    crate::services::websocket_client::ws_connect(&state, request).await
}

#[tauri::command]
pub async fn ws_send(
    state: tauri::State<'_, AppState>,
    id: String,
    message: String,
    message_type: Option<String>,
) -> Result<(), AppError> {
    crate::services::websocket_client::ws_send(
        &state,
        &id,
        &message,
        message_type.as_deref().unwrap_or("text"),
    )
    .await
}

#[tauri::command]
pub async fn ws_disconnect(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), AppError> {
    crate::services::websocket_client::ws_disconnect(&state, &id).await
}