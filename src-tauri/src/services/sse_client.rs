use crate::models::error::AppError;
use crate::models::sse::{SSEConnectRequest, SSEEvent, SSEStateChange};
use crate::services::app_state::AppState;
use tauri::Emitter;

pub async fn sse_connect(
    state: &AppState,
    req: SSEConnectRequest,
) -> Result<(), AppError> {
    let id = req.id.clone();
    let url = req.url.clone();
    let headers_map = req.headers.clone();
    let last_event_id = req.last_event_id.clone();

    let cancel_token = tokio_util::sync::CancellationToken::new();
    state
        .sse_cancellations
        .lock()
        .await
        .insert(id.clone(), cancel_token.clone());

    let app_handle = state.app_handle.clone();

    // Emit connecting state
    {
        let guard = app_handle.lock().await;
        if let Some(ref h) = *guard {
            let _ = h.emit(
                "sse-state",
                SSEStateChange {
                    id: id.clone(),
                    state: "connecting".to_string(),
                    reason: None,
                },
            );
        }
    }

    tokio::spawn(async move {
        let client = reqwest::Client::new();
        let mut request = client.get(&url);

        for (key, value) in &headers_map {
            request = request.header(key.as_str(), value.as_str());
        }

        if let Some(ref eid) = last_event_id {
            request = request.header("Last-Event-ID", eid.as_str());
        }

        request = request.header("Accept", "text/event-stream");

        let response = match request.send().await {
            Ok(r) => r,
            Err(e) => {
                let guard = app_handle.lock().await;
                if let Some(ref h) = *guard {
                    let _ = h.emit(
                        "sse-state",
                        SSEStateChange {
                            id: id.clone(),
                            state: "error".to_string(),
                            reason: Some(format!("Connection failed: {}", e)),
                        },
                    );
                }
                return;
            }
        };

        // Emit connected state
        {
            let guard = app_handle.lock().await;
            if let Some(ref h) = *guard {
                let _ = h.emit(
                    "sse-state",
                    SSEStateChange {
                        id: id.clone(),
                        state: "connected".to_string(),
                        reason: None,
                    },
                );
            }
        }

        let byte_stream = response.bytes_stream();
        use futures_util::StreamExt;

        let mut event_type = String::new();
        let mut data = String::new();
        let mut event_id = String::new();

        let mut stream = Box::pin(byte_stream);

        loop {
            tokio::select! {
                chunk = stream.next() => {
                    match chunk {
                        Some(Ok(bytes)) => {
                            let text = String::from_utf8_lossy(&bytes);
                            for line in text.lines() {
                                if line.starts_with("event:") {
                                    event_type = line.trim_start_matches("event:").trim().to_string();
                                } else if line.starts_with("data:") {
                                    if !data.is_empty() {
                                        data.push('\n');
                                    }
                                    data.push_str(line.trim_start_matches("data:").trim());
                                } else if line.starts_with("id:") {
                                    event_id = line.trim_start_matches("id:").trim().to_string();
                                } else if line.is_empty() && (!data.is_empty() || !event_type.is_empty()) {
                                    let sse_event = SSEEvent {
                                        id: uuid::Uuid::new_v4().to_string(),
                                        event_type: if event_type.is_empty() {
                                            None
                                        } else {
                                            Some(event_type.clone())
                                        },
                                        data: data.clone(),
                                        event_id: if event_id.is_empty() {
                                            None
                                        } else {
                                            Some(event_id.clone())
                                        },
                                    };
                                    let guard = app_handle.lock().await;
                                    if let Some(ref h) = *guard {
                                        let _ = h.emit("sse-event", sse_event);
                                    }

                                    event_type.clear();
                                    data.clear();
                                    event_id.clear();
                                }
                            }
                        }
                        Some(Err(e)) => {
                            let guard = app_handle.lock().await;
                            if let Some(ref h) = *guard {
                                let _ = h.emit(
                                    "sse-state",
                                    SSEStateChange {
                                        id: id.clone(),
                                        state: "error".to_string(),
                                        reason: Some(format!("Stream error: {}", e)),
                                    },
                                );
                            }
                            break;
                        }
                        None => {
                            let guard = app_handle.lock().await;
                            if let Some(ref h) = *guard {
                                let _ = h.emit(
                                    "sse-state",
                                    SSEStateChange {
                                        id: id.clone(),
                                        state: "disconnected".to_string(),
                                        reason: Some("Stream ended".to_string()),
                                    },
                                );
                            }
                            break;
                        }
                    }
                }
                _ = cancel_token.cancelled() => {
                    let guard = app_handle.lock().await;
                    if let Some(ref h) = *guard {
                        let _ = h.emit(
                            "sse-state",
                            SSEStateChange {
                                id: id.clone(),
                                state: "disconnected".to_string(),
                                reason: Some("Cancelled".to_string()),
                            },
                        );
                    }
                    break;
                }
            }
        }
    });

    Ok(())
}

pub async fn sse_disconnect(
    state: &AppState,
    id: &str,
) -> Result<(), AppError> {
    let mut cancellations = state.sse_cancellations.lock().await;
    if let Some(token) = cancellations.remove(id) {
        token.cancel();
    }
    Ok(())
}