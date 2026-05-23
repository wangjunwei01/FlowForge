use std::sync::Arc;
use tauri::AppHandle;
use tokio::sync::{Mutex, RwLock};

use crate::services::mock_server::MockServerHandle;
use crate::services::proto_manager::ProtoManager;
use crate::services::websocket_client::WsConnectionHandle;
use tokio_util::sync::CancellationToken;

pub struct AppState {
    pub http_cancel_tokens: Arc<Mutex<std::collections::HashMap<String, CancellationToken>>>,
    pub ws_connections: Arc<Mutex<std::collections::HashMap<String, WsConnectionHandle>>>,
    pub sse_cancellations: Arc<Mutex<std::collections::HashMap<String, CancellationToken>>>,
    #[allow(dead_code)]
    pub grpc_cancellations: Arc<Mutex<std::collections::HashMap<String, CancellationToken>>>,
    pub mock_server: Arc<Mutex<Option<MockServerHandle>>>,
    pub proto_manager: Arc<RwLock<ProtoManager>>,
    pub app_handle: Arc<Mutex<Option<AppHandle>>>,
}