use crate::models::error::AppError;

pub fn save(service: &str, account: &str, secret: &str) -> Result<(), AppError> {
    let entry = keyring::Entry::new(service, account).map_err(|e| AppError::Permission {
        message: format!("Failed to create keyring entry: {}", e),
    })?;
    entry.set_password(secret).map_err(|e| AppError::Permission {
        message: format!("Failed to save secret: {}", e),
    })
}

pub fn get(service: &str, account: &str) -> Result<String, AppError> {
    let entry = keyring::Entry::new(service, account).map_err(|e| AppError::Permission {
        message: format!("Failed to create keyring entry: {}", e),
    })?;
    entry.get_password().map_err(|e| match e {
        keyring::Error::NoEntry => AppError::NotFound {
            resource: "keyring_entry".to_string(),
            id: format!("{}/{}", service, account),
        },
        _ => AppError::Permission {
            message: format!("Failed to get secret: {}", e),
        },
    })
}

pub fn delete(service: &str, account: &str) -> Result<(), AppError> {
    let entry = keyring::Entry::new(service, account).map_err(|e| AppError::Permission {
        message: format!("Failed to create keyring entry: {}", e),
    })?;
    entry.delete_credential().map_err(|e| match e {
        keyring::Error::NoEntry => AppError::NotFound {
            resource: "keyring_entry".to_string(),
            id: format!("{}/{}", service, account),
        },
        _ => AppError::Permission {
            message: format!("Failed to delete secret: {}", e),
        },
    })
}