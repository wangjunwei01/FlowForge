use crate::models::error::AppError;
use crate::models::websocket::{WsConnectRequest, WsMessage, WsStateChange};
use crate::services::app_state::AppState;
use futures_util::{SinkExt, StreamExt};
use tauri::Emitter;
use tokio_tungstenite::{connect_async, connect_async_tls_with_config};
use tokio_tungstenite::tungstenite::protocol::Message;

pub struct WsConnectionHandle {
    pub write: tokio::sync::Mutex<
        futures_util::stream::SplitSink<
            tokio_tungstenite::WebSocketStream<
                tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
            >,
            Message,
        >,
    >,
    pub cancel: tokio_util::sync::CancellationToken,
}

pub async fn ws_connect(
    state: &AppState,
    req: WsConnectRequest,
) -> Result<(), AppError> {
    let id = req.id.clone();
    let url = req.url.clone();

    let (ws_stream, _response) = if req.protocols.is_empty() {
        connect_async(&url).await.map_err(|e| AppError::Network {
            message: format!("WebSocket connection failed: {}", e),
        })?
    } else {
        // Build request with protocols
        let mut request = tokio_tungstenite::tungstenite::http::Request::builder()
            .uri(&url)
            .method("GET");
        for proto in &req.protocols {
            request = request.header("Sec-WebSocket-Protocol", proto.as_str());
        }
        for (key, value) in &req.headers {
            request = request.header(key.as_str(), value.as_str());
        }
        let request = request.body(()).map_err(|e| AppError::Network {
            message: format!("Failed to build WebSocket request: {}", e),
        })?;
        connect_async_tls_with_config(request, None, false, None).await.map_err(|e| AppError::Network {
            message: format!("WebSocket connection failed: {}", e),
        })?
    };

    let (write, mut read) = ws_stream.split();
    let cancel_token = tokio_util::sync::CancellationToken::new();
    let cancel_clone = cancel_token.clone();

    let handle = WsConnectionHandle {
        write: tokio::sync::Mutex::new(write),
        cancel: cancel_token,
    };

    state
        .ws_connections
        .lock()
        .await
        .insert(id.clone(), handle);

    // Emit connected state
    let app_handle = state.app_handle.clone();
    {
        let guard = app_handle.lock().await;
        if let Some(ref h) = *guard {
            let _ = h.emit(
                "ws-state",
                WsStateChange {
                    id: id.clone(),
                    state: "connected".to_string(),
                    reason: None,
                },
            );
        }
    }

    // Spawn receive task
    let id_for_task = id.clone();
    let app_handle_recv = state.app_handle.clone();

    tokio::spawn(async move {
        loop {
            tokio::select! {
                msg = read.next() => {
                    match msg {
                        Some(Ok(msg)) => match msg {
                            Message::Text(text) => {
                                let ws_msg = WsMessage {
                                    id: id_for_task.clone(),
                                    message_type: "text".to_string(),
                                    data: text.to_string(),
                                };
                                let guard = app_handle_recv.lock().await;
                                if let Some(ref h) = *guard {
                                    let _ = h.emit("ws-message", ws_msg);
                                }
                            }
                            Message::Binary(data) => {
                                let ws_msg = WsMessage {
                                    id: id_for_task.clone(),
                                    message_type: "binary".to_string(),
                                    data: format!("[{} bytes]", data.len()),
                                };
                                let guard = app_handle_recv.lock().await;
                                if let Some(ref h) = *guard {
                                    let _ = h.emit("ws-message", ws_msg);
                                }
                            }
                            Message::Close(_) => {
                                let guard = app_handle_recv.lock().await;
                                if let Some(ref h) = *guard {
                                    let _ = h.emit(
                                        "ws-state",
                                        WsStateChange {
                                            id: id_for_task.clone(),
                                            state: "disconnected".to_string(),
                                            reason: Some("Connection closed".to_string()),
                                        },
                                    );
                                }
                                break;
                            }
                            _ => {}
                        },
                        Some(Err(e)) => {
                            let guard = app_handle_recv.lock().await;
                            if let Some(ref h) = *guard {
                                let _ = h.emit(
                                    "ws-state",
                                    WsStateChange {
                                        id: id_for_task.clone(),
                                        state: "error".to_string(),
                                        reason: Some(e.to_string()),
                                    },
                                );
                            }
                            break;
                        }
                        None => {
                            let guard = app_handle_recv.lock().await;
                            if let Some(ref h) = *guard {
                                let _ = h.emit(
                                    "ws-state",
                                    WsStateChange {
                                        id: id_for_task.clone(),
                                        state: "disconnected".to_string(),
                                        reason: Some("Stream ended".to_string()),
                                    },
                                );
                            }
                            break;
                        }
                    }
                }
                _ = cancel_clone.cancelled() => {
                    let guard = app_handle_recv.lock().await;
                    if let Some(ref h) = *guard {
                        let _ = h.emit(
                            "ws-state",
                            WsStateChange {
                                id: id_for_task.clone(),
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

pub async fn ws_send(
    state: &AppState,
    id: &str,
    message: &str,
    message_type: &str,
) -> Result<(), AppError> {
    let connections = state.ws_connections.lock().await;
    let handle = connections.get(id).ok_or(AppError::NotFound {
        resource: "ws_connection".to_string(),
        id: id.to_string(),
    })?;

    let msg = match message_type {
        "binary" => Message::Binary(message.as_bytes().to_vec().into()),
        _ => Message::Text(message.to_string().into()),
    };

    let mut write = handle.write.lock().await;
    write.send(msg).await.map_err(|e| AppError::Network {
        message: format!("Failed to send WebSocket message: {}", e),
    })
}

pub async fn ws_disconnect(
    state: &AppState,
    id: &str,
) -> Result<(), AppError> {
    let mut connections = state.ws_connections.lock().await;
    if let Some(handle) = connections.remove(id) {
        handle.cancel.cancel();
        let mut write = handle.write.lock().await;
        let _ = write.close().await;
    }
    Ok(())
}