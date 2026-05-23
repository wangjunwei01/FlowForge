#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to FlowForge.", name)
}