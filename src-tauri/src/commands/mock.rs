use crate::models::error::AppError;
use crate::models::mock::{MockRequestLog, MockRouteConfig, MockServerStatus, MockStartRequest};
use crate::services::app_state::AppState;

#[tauri::command]
pub async fn mock_start(
    state: tauri::State<'_, AppState>,
    request: MockStartRequest,
) -> Result<MockServerStatus, AppError> {
    let handle = crate::services::mock_server::start_mock_server(
        request.port,
        request.cors_enabled,
        request.default_headers,
    )
    .await?;

    let status = handle.get_status().await;
    *state.mock_server.lock().await = Some(handle);
    Ok(status)
}

#[tauri::command]
pub async fn mock_stop(state: tauri::State<'_, AppState>) -> Result<(), AppError> {
    let handle = state.mock_server.lock().await.take();
    if let Some(h) = handle {
        crate::services::mock_server::stop_mock_server(h).await
    } else {
        Err(AppError::Validation {
            message: "No mock server is running".to_string(),
            details: None,
        })
    }
}

#[tauri::command]
pub async fn mock_add_route(
    state: tauri::State<'_, AppState>,
    route: MockRouteConfig,
) -> Result<(), AppError> {
    let guard = state.mock_server.lock().await;
    let handle = guard.as_ref().ok_or(AppError::Validation {
        message: "No mock server is running".to_string(),
        details: None,
    })?;
    handle.routes.write().await.push(route);
    Ok(())
}

#[tauri::command]
pub async fn mock_remove_route(
    state: tauri::State<'_, AppState>,
    method: String,
    path: String,
) -> Result<(), AppError> {
    let guard = state.mock_server.lock().await;
    let handle = guard.as_ref().ok_or(AppError::Validation {
        message: "No mock server is running".to_string(),
        details: None,
    })?;
    let mut routes = handle.routes.write().await;
    let before = routes.len();
    routes.retain(|r| !(r.method == method && r.path == path));
    if routes.len() == before {
        Err(AppError::NotFound {
            resource: "mock_route".to_string(),
            id: format!("{} {}", method, path),
        })
    } else {
        Ok(())
    }
}

#[tauri::command]
pub async fn mock_list_routes(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<MockRouteConfig>, AppError> {
    let guard = state.mock_server.lock().await;
    let handle = guard.as_ref().ok_or(AppError::Validation {
        message: "No mock server is running".to_string(),
        details: None,
    })?;
    let routes = handle.routes.read().await;
    Ok(routes.clone())
}

#[tauri::command]
pub async fn mock_get_request_log(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<MockRequestLog>, AppError> {
    let guard = state.mock_server.lock().await;
    let handle = guard.as_ref().ok_or(AppError::Validation {
        message: "No mock server is running".to_string(),
        details: None,
    })?;
    let log = handle.request_log.read().await;
    Ok(log.clone())
}

#[tauri::command]
pub async fn mock_clear_request_log(
    state: tauri::State<'_, AppState>,
) -> Result<(), AppError> {
    let guard = state.mock_server.lock().await;
    let handle = guard.as_ref().ok_or(AppError::Validation {
        message: "No mock server is running".to_string(),
        details: None,
    })?;
    handle.request_log.write().await.clear();
    Ok(())
}