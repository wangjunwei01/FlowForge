use crate::models::error::AppError;
use crate::models::proto::{ProtoFileInfo, ProtoParsingResult};
use crate::services::app_state::AppState;
use tauri::Manager;

#[tauri::command]
pub async fn proto_upload(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    name: String,
    content: String,
) -> Result<ProtoParsingResult, AppError> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| AppError::FsError {
        message: format!("Failed to get app data dir: {}", e),
        path: None,
    })?;
    let mut manager = state.proto_manager.write().await;
    manager.upload(&name, &content, &app_data_dir)
}

#[tauri::command]
pub async fn proto_list(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<ProtoFileInfo>, AppError> {
    let manager = state.proto_manager.read().await;
    Ok(manager.list())
}

#[tauri::command]
pub async fn proto_get(
    state: tauri::State<'_, AppState>,
    name: String,
) -> Result<ProtoParsingResult, AppError> {
    let manager = state.proto_manager.read().await;
    manager.get(&name).cloned().ok_or(AppError::NotFound {
        resource: "proto_file".to_string(),
        id: name,
    })
}

#[tauri::command]
pub async fn proto_delete(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    name: String,
) -> Result<(), AppError> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| AppError::FsError {
        message: format!("Failed to get app data dir: {}", e),
        path: None,
    })?;
    let mut manager = state.proto_manager.write().await;
    manager.delete(&name)?;

    // Also delete the file from disk
    let file_path = app_data_dir.join("protos").join(format!("{}.proto", name));
    if file_path.exists() {
        std::fs::remove_file(&file_path).map_err(|e| AppError::FsError {
            message: format!("Failed to delete proto file: {}", e),
            path: Some(file_path.to_string_lossy().to_string()),
        })?;
    }

    Ok(())
}