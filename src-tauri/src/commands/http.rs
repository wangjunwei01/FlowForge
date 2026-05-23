use crate::models::error::AppError;
use crate::models::request::HttpRequest;
use crate::services::app_state::AppState;

#[tauri::command]
pub async fn http_request(
    state: tauri::State<'_, AppState>,
    request: HttpRequest,
    cancel_token_id: Option<String>,
) -> Result<crate::models::request::HttpResponse, AppError> {
    crate::services::http_client::HttpService::execute(&state, request, cancel_token_id).await
}

#[tauri::command]
pub async fn http_cancel(
    state: tauri::State<'_, AppState>,
    cancel_token_id: String,
) -> Result<(), AppError> {
    crate::services::http_client::HttpService::cancel(&state, &cancel_token_id).await
}