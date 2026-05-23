use tauri::AppHandle;

pub struct LoggingService;

impl LoggingService {
    pub fn init(_app: &AppHandle) {
        log::info!("FlowForge logging service initialized");
    }
}