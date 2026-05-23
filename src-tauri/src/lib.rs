#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![commands::greet])
        .setup(|app| {
            services::LoggingService::init(app.handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running FlowForge");
}