use crate::models::error::AppError;
use crate::models::script::{ScriptExecuteRequest, ScriptResult};

#[tauri::command]
pub fn script_execute(request: ScriptExecuteRequest) -> Result<ScriptResult, AppError> {
    Ok(crate::services::script_engine::ScriptEngine::execute(&request))
}