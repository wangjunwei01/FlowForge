#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;
mod utils;

use services::app_state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState {
        http_cancel_tokens: std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new())),
        ws_connections: std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new())),
        sse_cancellations: std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new())),
        grpc_cancellations: std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new())),
        mock_server: std::sync::Arc::new(tokio::sync::Mutex::new(None)),
        proto_manager: std::sync::Arc::new(tokio::sync::RwLock::new(services::proto_manager::ProtoManager::new())),
        app_handle: std::sync::Arc::new(tokio::sync::Mutex::new(None)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::greet::greet,
            commands::http::http_request,
            commands::http::http_cancel,
            commands::mock::mock_start,
            commands::mock::mock_stop,
            commands::mock::mock_add_route,
            commands::mock::mock_remove_route,
            commands::mock::mock_list_routes,
            commands::mock::mock_get_request_log,
            commands::mock::mock_clear_request_log,
            commands::script::script_execute,
            commands::proto::proto_upload,
            commands::proto::proto_list,
            commands::proto::proto_get,
            commands::proto::proto_delete,
            commands::store::read_project,
            commands::store::write_project,
            commands::store::delete_project,
            commands::store::list_projects,
            commands::store::read_flow,
            commands::store::write_flow,
            commands::store::delete_flow,
            commands::store::list_flows,
            commands::store::save_execution,
            commands::store::list_executions,
            commands::store::save_display_config,
            commands::store::get_display_config,
            commands::store::read_setting,
            commands::store::write_setting,
            commands::store::save_draft,
            commands::store::load_draft,
            commands::store::delete_draft,
            commands::websocket::ws_connect,
            commands::websocket::ws_send,
            commands::websocket::ws_disconnect,
            commands::sse::sse_connect,
            commands::sse::sse_disconnect,
            commands::grpc::grpc_request,
            commands::grpc::grpc_cancel,
            commands::keyring::keyring_save,
            commands::keyring::keyring_get,
            commands::keyring::keyring_delete,
        ])
        .setup(|app| {
            use tauri::Manager;
            services::LoggingService::init(app.handle());

            // Store the real app handle in AppState
            let state = app.state::<AppState>();
            let handle = app.handle().clone();
            if let Ok(mut guard) = state.app_handle.try_lock() {
                *guard = Some(handle);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running FlowForge");
}