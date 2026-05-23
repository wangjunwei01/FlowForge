use crate::models::error::AppError;
use crate::models::execution::{DisplayConfig, ExecutionRecord};
use crate::models::flow::{Flow, Project};
use tauri::Manager;

fn validate_path(path: &str) -> Result<(), AppError> {
    if path.contains("..") {
        return Err(AppError::Validation {
            message: "Path traversal not allowed".to_string(),
            details: None,
        });
    }
    Ok(())
}

fn get_app_data_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, AppError> {
    app.path().app_data_dir().map_err(|e| AppError::FsError {
        message: format!("Failed to get app data dir: {}", e),
        path: None,
    })
}

// ── Project commands ──

#[tauri::command]
pub async fn read_project(
    app: tauri::AppHandle,
    project_id: String,
) -> Result<Project, AppError> {
    validate_path(&project_id)?;
    let dir = get_app_data_dir(&app)?;
    let path = dir.join("projects").join(&project_id).join("project.json");
    let content = std::fs::read_to_string(&path).map_err(|e| AppError::FsError {
        message: format!("Failed to read project: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })?;
    serde_json::from_str(&content).map_err(|e| AppError::Parse {
        message: format!("Failed to parse project: {}", e),
    })
}

#[tauri::command]
pub async fn write_project(
    app: tauri::AppHandle,
    project: Project,
) -> Result<(), AppError> {
    validate_path(&project.id)?;
    let dir = get_app_data_dir(&app)?;
    let project_dir = dir.join("projects").join(&project.id);
    std::fs::create_dir_all(&project_dir).map_err(|e| AppError::FsError {
        message: format!("Failed to create project directory: {}", e),
        path: Some(project_dir.to_string_lossy().to_string()),
    })?;
    let path = project_dir.join("project.json");
    let content = serde_json::to_string_pretty(&project).map_err(|e| AppError::Parse {
        message: format!("Failed to serialize project: {}", e),
    })?;
    std::fs::write(&path, content).map_err(|e| AppError::FsError {
        message: format!("Failed to write project: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })
}

#[tauri::command]
pub async fn delete_project(
    app: tauri::AppHandle,
    project_id: String,
) -> Result<(), AppError> {
    validate_path(&project_id)?;
    let dir = get_app_data_dir(&app)?;
    let project_dir = dir.join("projects").join(&project_id);
    if project_dir.exists() {
        std::fs::remove_dir_all(&project_dir).map_err(|e| AppError::FsError {
            message: format!("Failed to delete project: {}", e),
            path: Some(project_dir.to_string_lossy().to_string()),
        })
    } else {
        Err(AppError::NotFound {
            resource: "project".to_string(),
            id: project_id,
        })
    }
}

#[tauri::command]
pub async fn list_projects(
    app: tauri::AppHandle,
) -> Result<Vec<Project>, AppError> {
    let dir = get_app_data_dir(&app)?;
    let projects_dir = dir.join("projects");
    if !projects_dir.exists() {
        return Ok(Vec::new());
    }
    let mut projects = Vec::new();
    let entries = std::fs::read_dir(&projects_dir).map_err(|e| AppError::FsError {
        message: format!("Failed to read projects directory: {}", e),
        path: Some(projects_dir.to_string_lossy().to_string()),
    })?;
    for entry in entries {
        let entry = entry.map_err(|e| AppError::FsError {
            message: format!("Failed to read directory entry: {}", e),
            path: None,
        })?;
        let path = entry.path().join("project.json");
        if path.exists() {
            let content = std::fs::read_to_string(&path).map_err(|e| AppError::FsError {
                message: format!("Failed to read project file: {}", e),
                path: Some(path.to_string_lossy().to_string()),
            })?;
            if let Ok(project) = serde_json::from_str::<Project>(&content) {
                projects.push(project);
            }
        }
    }
    Ok(projects)
}

// ── Flow commands ──

#[tauri::command]
pub async fn read_flow(
    app: tauri::AppHandle,
    project_id: String,
    flow_id: String,
) -> Result<Flow, AppError> {
    validate_path(&project_id)?;
    validate_path(&flow_id)?;
    let dir = get_app_data_dir(&app)?;
    let path = dir
        .join("projects")
        .join(&project_id)
        .join("flows")
        .join(&flow_id)
        .with_extension("json");
    let content = std::fs::read_to_string(&path).map_err(|e| AppError::FsError {
        message: format!("Failed to read flow: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })?;
    serde_json::from_str(&content).map_err(|e| AppError::Parse {
        message: format!("Failed to parse flow: {}", e),
    })
}

#[tauri::command]
pub async fn write_flow(
    app: tauri::AppHandle,
    project_id: String,
    flow: Flow,
) -> Result<(), AppError> {
    validate_path(&project_id)?;
    validate_path(&flow.id)?;
    let dir = get_app_data_dir(&app)?;
    let flow_dir = dir.join("projects").join(&project_id).join("flows");
    std::fs::create_dir_all(&flow_dir).map_err(|e| AppError::FsError {
        message: format!("Failed to create flows directory: {}", e),
        path: Some(flow_dir.to_string_lossy().to_string()),
    })?;
    let path = flow_dir.join(&flow.id).with_extension("json");
    let content = serde_json::to_string_pretty(&flow).map_err(|e| AppError::Parse {
        message: format!("Failed to serialize flow: {}", e),
    })?;
    std::fs::write(&path, content).map_err(|e| AppError::FsError {
        message: format!("Failed to write flow: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })
}

#[tauri::command]
pub async fn delete_flow(
    app: tauri::AppHandle,
    project_id: String,
    flow_id: String,
) -> Result<(), AppError> {
    validate_path(&project_id)?;
    validate_path(&flow_id)?;
    let dir = get_app_data_dir(&app)?;
    let path = dir
        .join("projects")
        .join(&project_id)
        .join("flows")
        .join(&flow_id)
        .with_extension("json");
    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| AppError::FsError {
            message: format!("Failed to delete flow: {}", e),
            path: Some(path.to_string_lossy().to_string()),
        })
    } else {
        Err(AppError::NotFound {
            resource: "flow".to_string(),
            id: flow_id,
        })
    }
}

#[tauri::command]
pub async fn list_flows(
    app: tauri::AppHandle,
    project_id: String,
) -> Result<Vec<Flow>, AppError> {
    validate_path(&project_id)?;
    let dir = get_app_data_dir(&app)?;
    let flows_dir = dir.join("projects").join(&project_id).join("flows");
    if !flows_dir.exists() {
        return Ok(Vec::new());
    }
    let mut flows = Vec::new();
    let entries = std::fs::read_dir(&flows_dir).map_err(|e| AppError::FsError {
        message: format!("Failed to read flows directory: {}", e),
        path: Some(flows_dir.to_string_lossy().to_string()),
    })?;
    for entry in entries {
        let entry = entry.map_err(|e| AppError::FsError {
            message: format!("Failed to read directory entry: {}", e),
            path: None,
        })?;
        let path = entry.path();
        if path.extension().map_or(false, |e| e == "json") {
            let content = std::fs::read_to_string(&path).map_err(|e| AppError::FsError {
                message: format!("Failed to read flow file: {}", e),
                path: Some(path.to_string_lossy().to_string()),
            })?;
            if let Ok(flow) = serde_json::from_str::<Flow>(&content) {
                flows.push(flow);
            }
        }
    }
    Ok(flows)
}

// ── Execution history commands ──

#[tauri::command]
pub async fn save_execution(
    app: tauri::AppHandle,
    project_id: String,
    execution: ExecutionRecord,
) -> Result<(), AppError> {
    validate_path(&project_id)?;
    validate_path(&execution.id)?;
    let dir = get_app_data_dir(&app)?;
    let history_dir = dir
        .join("projects")
        .join(&project_id)
        .join("history");
    std::fs::create_dir_all(&history_dir).map_err(|e| AppError::FsError {
        message: format!("Failed to create history directory: {}", e),
        path: Some(history_dir.to_string_lossy().to_string()),
    })?;
    let path = history_dir.join(&execution.id).with_extension("json");
    let content = serde_json::to_string_pretty(&execution).map_err(|e| AppError::Parse {
        message: format!("Failed to serialize execution: {}", e),
    })?;
    std::fs::write(&path, content).map_err(|e| AppError::FsError {
        message: format!("Failed to write execution: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })
}

#[tauri::command]
pub async fn list_executions(
    app: tauri::AppHandle,
    project_id: String,
    flow_id: String,
    limit: Option<usize>,
) -> Result<Vec<ExecutionRecord>, AppError> {
    validate_path(&project_id)?;
    validate_path(&flow_id)?;
    let dir = get_app_data_dir(&app)?;
    let history_dir = dir.join("projects").join(&project_id).join("history");
    if !history_dir.exists() {
        return Ok(Vec::new());
    }
    let mut executions = Vec::new();
    let entries = std::fs::read_dir(&history_dir).map_err(|e| AppError::FsError {
        message: format!("Failed to read history directory: {}", e),
        path: Some(history_dir.to_string_lossy().to_string()),
    })?;
    for entry in entries {
        let entry = entry.map_err(|e| AppError::FsError {
            message: format!("Failed to read directory entry: {}", e),
            path: None,
        })?;
        let path = entry.path();
        if path.extension().map_or(false, |e| e == "json") {
            let content = std::fs::read_to_string(&path).map_err(|e| AppError::FsError {
                message: format!("Failed to read execution file: {}", e),
                path: Some(path.to_string_lossy().to_string()),
            })?;
            if let Ok(record) = serde_json::from_str::<ExecutionRecord>(&content) {
                if record.flow_id == flow_id {
                    executions.push(record);
                }
            }
        }
    }
    // Sort by start_time descending
    executions.sort_by(|a, b| b.start_time.cmp(&a.start_time));
    if let Some(limit) = limit {
        executions.truncate(limit);
    }
    Ok(executions)
}

// ── Display config commands ──

#[tauri::command]
pub async fn save_display_config(
    app: tauri::AppHandle,
    project_id: String,
    config: DisplayConfig,
) -> Result<(), AppError> {
    validate_path(&project_id)?;
    validate_path(&config.node_id)?;
    let dir = get_app_data_dir(&app)?;
    let config_dir = dir
        .join("projects")
        .join(&project_id)
        .join("displays");
    std::fs::create_dir_all(&config_dir).map_err(|e| AppError::FsError {
        message: format!("Failed to create displays directory: {}", e),
        path: Some(config_dir.to_string_lossy().to_string()),
    })?;
    let path = config_dir.join(&config.node_id).with_extension("json");
    let content = serde_json::to_string_pretty(&config).map_err(|e| AppError::Parse {
        message: format!("Failed to serialize display config: {}", e),
    })?;
    std::fs::write(&path, content).map_err(|e| AppError::FsError {
        message: format!("Failed to write display config: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })
}

#[tauri::command]
pub async fn get_display_config(
    app: tauri::AppHandle,
    project_id: String,
    node_id: String,
) -> Result<DisplayConfig, AppError> {
    validate_path(&project_id)?;
    validate_path(&node_id)?;
    let dir = get_app_data_dir(&app)?;
    let path = dir
        .join("projects")
        .join(&project_id)
        .join("displays")
        .join(&node_id)
        .with_extension("json");
    if !path.exists() {
        return Err(AppError::NotFound {
            resource: "display_config".to_string(),
            id: node_id,
        });
    }
    let content = std::fs::read_to_string(&path).map_err(|e| AppError::FsError {
        message: format!("Failed to read display config: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })?;
    serde_json::from_str(&content).map_err(|e| AppError::Parse {
        message: format!("Failed to parse display config: {}", e),
    })
}

// ── Settings commands ──

#[tauri::command]
pub async fn read_setting(
    app: tauri::AppHandle,
    key: String,
) -> Result<String, AppError> {
    validate_path(&key)?;
    let dir = get_app_data_dir(&app)?;
    let settings_path = dir.join("settings.json");

    if !settings_path.exists() {
        return Err(AppError::NotFound {
            resource: "setting".to_string(),
            id: key,
        });
    }

    let content = std::fs::read_to_string(&settings_path).map_err(|e| AppError::FsError {
        message: format!("Failed to read settings: {}", e),
        path: Some(settings_path.to_string_lossy().to_string()),
    })?;

    let settings: std::collections::HashMap<String, String> =
        serde_json::from_str(&content).map_err(|e| AppError::Parse {
            message: format!("Failed to parse settings: {}", e),
        })?;

    settings
        .get(&key)
        .cloned()
        .ok_or(AppError::NotFound {
            resource: "setting".to_string(),
            id: key,
        })
}

#[tauri::command]
pub async fn write_setting(
    app: tauri::AppHandle,
    key: String,
    value: String,
) -> Result<(), AppError> {
    validate_path(&key)?;
    let dir = get_app_data_dir(&app)?;
    let settings_path = dir.join("settings.json");

    let mut settings: std::collections::HashMap<String, String> = if settings_path.exists() {
        let content =
            std::fs::read_to_string(&settings_path).map_err(|e| AppError::FsError {
                message: format!("Failed to read settings: {}", e),
                path: Some(settings_path.to_string_lossy().to_string()),
            })?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        std::collections::HashMap::new()
    };

    settings.insert(key, value);

    let content = serde_json::to_string_pretty(&settings).map_err(|e| AppError::Parse {
        message: format!("Failed to serialize settings: {}", e),
    })?;

    std::fs::write(&settings_path, content).map_err(|e| AppError::FsError {
        message: format!("Failed to write settings: {}", e),
        path: Some(settings_path.to_string_lossy().to_string()),
    })
}

// ── Draft commands (crash recovery) ──

#[tauri::command]
pub async fn save_draft(
    app: tauri::AppHandle,
    project_id: String,
    flow: Flow,
) -> Result<(), AppError> {
    validate_path(&project_id)?;
    validate_path(&flow.id)?;
    let dir = get_app_data_dir(&app)?;
    let drafts_dir = dir
        .join("projects")
        .join(&project_id)
        .join("drafts");
    std::fs::create_dir_all(&drafts_dir).map_err(|e| AppError::FsError {
        message: format!("Failed to create drafts directory: {}", e),
        path: Some(drafts_dir.to_string_lossy().to_string()),
    })?;
    let path = drafts_dir.join(&flow.id).with_extension("draft.json");
    let content = serde_json::to_string_pretty(&flow).map_err(|e| AppError::Parse {
        message: format!("Failed to serialize draft: {}", e),
    })?;
    std::fs::write(&path, content).map_err(|e| AppError::FsError {
        message: format!("Failed to write draft: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })
}

#[tauri::command]
pub async fn load_draft(
    app: tauri::AppHandle,
    project_id: String,
    flow_id: String,
) -> Result<Flow, AppError> {
    validate_path(&project_id)?;
    validate_path(&flow_id)?;
    let dir = get_app_data_dir(&app)?;
    let path = dir
        .join("projects")
        .join(&project_id)
        .join("drafts")
        .join(&flow_id)
        .with_extension("draft.json");
    if !path.exists() {
        return Err(AppError::NotFound {
            resource: "draft".to_string(),
            id: flow_id,
        });
    }
    let content = std::fs::read_to_string(&path).map_err(|e| AppError::FsError {
        message: format!("Failed to read draft: {}", e),
        path: Some(path.to_string_lossy().to_string()),
    })?;
    serde_json::from_str(&content).map_err(|e| AppError::Parse {
        message: format!("Failed to parse draft: {}", e),
    })
}

#[tauri::command]
pub async fn delete_draft(
    app: tauri::AppHandle,
    project_id: String,
    flow_id: String,
) -> Result<(), AppError> {
    validate_path(&project_id)?;
    validate_path(&flow_id)?;
    let dir = get_app_data_dir(&app)?;
    let path = dir
        .join("projects")
        .join(&project_id)
        .join("drafts")
        .join(&flow_id)
        .with_extension("draft.json");
    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| AppError::FsError {
            message: format!("Failed to delete draft: {}", e),
            path: Some(path.to_string_lossy().to_string()),
        })
    } else {
        Err(AppError::NotFound {
            resource: "draft".to_string(),
            id: flow_id,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_validate_path_rejects_traversal() {
        assert!(validate_path("../etc/passwd").is_err());
        assert!(validate_path("foo/../bar").is_err());
        assert!(validate_path("normal-id").is_ok());
        assert!(validate_path("proj-123").is_ok());
    }

    #[test]
    fn test_settings_round_trip() {
        let dir = std::env::temp_dir().join("flowforge_test_settings");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        let settings_path = dir.join("settings.json");

        // Write initial settings
        let mut settings = std::collections::HashMap::new();
        settings.insert("theme".to_string(), "dark".to_string());
        settings.insert("locale".to_string(), "zh-CN".to_string());
        let content = serde_json::to_string_pretty(&settings).unwrap();
        fs::write(&settings_path, &content).unwrap();

        // Read back
        let read_content = fs::read_to_string(&settings_path).unwrap();
        let read_settings: std::collections::HashMap<String, String> =
            serde_json::from_str(&read_content).unwrap();
        assert_eq!(read_settings.get("theme").unwrap(), "dark");
        assert_eq!(read_settings.get("locale").unwrap(), "zh-CN");

        // Update
        settings.insert("theme".to_string(), "light".to_string());
        let updated = serde_json::to_string_pretty(&settings).unwrap();
        fs::write(&settings_path, updated).unwrap();

        let read_again = fs::read_to_string(&settings_path).unwrap();
        let read_settings2: std::collections::HashMap<String, String> =
            serde_json::from_str(&read_again).unwrap();
        assert_eq!(read_settings2.get("theme").unwrap(), "light");

        let _ = fs::remove_dir_all(&dir);
    }
}