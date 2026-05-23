use crate::models::error::AppError;

#[tauri::command]
pub fn keyring_save(service: String, account: String, secret: String) -> Result<(), AppError> {
    crate::services::keyring::save(&service, &account, &secret)
}

#[tauri::command]
pub fn keyring_get(service: String, account: String) -> Result<String, AppError> {
    crate::services::keyring::get(&service, &account)
}

#[tauri::command]
pub fn keyring_delete(service: String, account: String) -> Result<(), AppError> {
    crate::services::keyring::delete(&service, &account)
}