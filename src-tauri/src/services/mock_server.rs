use crate::models::error::AppError;
use crate::models::mock::{MockRequestLog, MockRouteConfig, MockServerStatus};
use axum::{
    body::Body,
    extract::Request as AxumRequest,
    http::{HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::any,
    Router,
};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;

#[derive(Debug)]
pub struct MockServerHandle {
    pub port: u16,
    pub shutdown_tx: tokio::sync::oneshot::Sender<()>,
    pub routes: Arc<RwLock<Vec<MockRouteConfig>>>,
    pub request_log: Arc<RwLock<Vec<MockRequestLog>>>,
}

impl MockServerHandle {
    pub async fn get_status(&self) -> MockServerStatus {
        let routes = self.routes.read().await;
        let log = self.request_log.read().await;
        MockServerStatus {
            running: true,
            port: self.port,
            route_count: routes.len(),
            request_count: log.len(),
        }
    }
}

pub async fn start_mock_server(
    port: u16,
    cors_enabled: bool,
    default_headers: std::collections::HashMap<String, String>,
) -> Result<MockServerHandle, AppError> {
    let routes: Arc<RwLock<Vec<MockRouteConfig>>> = Arc::new(RwLock::new(Vec::new()));
    let request_log: Arc<RwLock<Vec<MockRequestLog>>> = Arc::new(RwLock::new(Vec::new()));
    let default_headers_arc = Arc::new(default_headers);

    let routes_clone = routes.clone();
    let log_clone = request_log.clone();
    let headers_clone = default_headers_arc.clone();

    let app = Router::new().fallback(any(move |req: AxumRequest| {
        let routes = routes_clone.clone();
        let log = log_clone.clone();
        let default_headers = headers_clone.clone();
        let cors = cors_enabled;
        async move { handle_request(req, routes, log, default_headers, cors).await }
    }));

    let (shutdown_tx, shutdown_rx) = tokio::sync::oneshot::channel::<()>();

    let listener = tokio::net::TcpListener::bind(format!("127.0.0.1:{}", port))
        .await
        .map_err(|e| AppError::Network {
            message: format!("Failed to bind mock server on port {}: {}", port, e),
        })?;

    let actual_port = listener.local_addr().unwrap().port();

    tokio::spawn(async move {
        let _ = axum::serve(listener, app)
            .with_graceful_shutdown(async {
                let _ = shutdown_rx.await;
            })
            .await;
    });

    Ok(MockServerHandle {
        port: actual_port,
        shutdown_tx,
        routes,
        request_log,
    })
}

async fn handle_request(
    req: AxumRequest,
    routes: Arc<RwLock<Vec<MockRouteConfig>>>,
    log: Arc<RwLock<Vec<MockRequestLog>>>,
    default_headers: Arc<std::collections::HashMap<String, String>>,
    cors_enabled: bool,
) -> Response {
    // Handle CORS preflight
    if cors_enabled && req.method() == Method::OPTIONS {
        return build_cors_preflight_response();
    }

    let method = req.method().to_string();
    let path = req.uri().path().to_string();
    let query = req.uri().query().unwrap_or("").to_string();
    let req_headers: std::collections::HashMap<String, String> = req
        .headers()
        .iter()
        .filter_map(|(k, v)| Some((k.to_string(), v.to_str().ok()?.to_string())))
        .collect();

    let body = axum::body::to_bytes(req.into_body(), 10 * 1024 * 1024)
        .await
        .unwrap_or_default();
    let body_str = String::from_utf8_lossy(&body).to_string();

    // Log the request
    let log_entry = MockRequestLog {
        id: uuid::Uuid::new_v4().to_string(),
        method: method.clone(),
        path: path.clone(),
        headers: req_headers.clone(),
        query: query.clone(),
        body: if body_str.is_empty() {
            None
        } else {
            Some(body_str.clone())
        },
        timestamp: chrono::Utc::now().to_rfc3339(),
    };

    {
        let mut log_guard = log.write().await;
        log_guard.push(log_entry);
    }

    // Find matching route
    let routes_guard = routes.read().await;
    let matched_route = routes_guard.iter().find(|route| {
        let method_match = route.method.to_uppercase() == method.to_uppercase()
            || route.method == "*";
        let path_match = route.path == path || match_regex_path(&route.path, &path);
        method_match && path_match
    });

    if let Some(route) = matched_route {
        // Apply delay if configured
        if let Some(delay_ms) = route.delay_ms {
            tokio::time::sleep(Duration::from_millis(delay_ms)).await;
        }

        let status = route.status.unwrap_or(200);
        let mut response = axum::http::Response::builder().status(status);

        // Add default headers
        for (key, value) in default_headers.iter() {
            if let Ok(v) = HeaderValue::from_str(value) {
                response = response.header(key, v);
            }
        }

        // Add route-specific headers
        if let Some(ref route_headers) = route.headers {
            for (key, value) in route_headers {
                if let Ok(v) = HeaderValue::from_str(value) {
                    response = response.header(key, v);
                }
            }
        }

        // Add CORS headers
        if cors_enabled {
            response = response.header("Access-Control-Allow-Origin", "*");
            response =
                response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
            response = response.header("Access-Control-Allow-Headers", "*");
        }

        let body = route.body.clone().unwrap_or_default();
        response.body(Body::from(body)).unwrap().into_response()
    } else {
        // No matching route - 404
        let mut response = axum::http::Response::builder().status(404);
        if cors_enabled {
            response = response.header("Access-Control-Allow-Origin", "*");
        }
        response
            .body(Body::from(r#"{"error":"No matching route"}"#))
            .unwrap()
            .into_response()
    }
}

fn build_cors_preflight_response() -> Response {
    axum::http::Response::builder()
        .status(StatusCode::NO_CONTENT)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
        .header("Access-Control-Allow-Headers", "*")
        .header("Access-Control-Max-Age", "86400")
        .body(Body::empty())
        .unwrap()
        .into_response()
}

fn match_regex_path(pattern: &str, path: &str) -> bool {
    // Simple regex matching: if pattern contains regex special chars, try regex
    if pattern.contains('(') || pattern.contains('+') || (pattern.contains('*') && !pattern.starts_with('*')) {
        regex::Regex::new(pattern)
            .map(|re| re.is_match(path))
            .unwrap_or(false)
    } else {
        false
    }
}

pub async fn stop_mock_server(handle: MockServerHandle) -> Result<(), AppError> {
    let _ = handle.shutdown_tx.send(());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_start_mock_server() {
        let result = start_mock_server(0, false, std::collections::HashMap::new()).await;
        assert!(result.is_ok());

        let handle = result.unwrap();
        assert!(handle.port > 0);
        stop_mock_server(handle).await.ok();
    }

    #[tokio::test]
    async fn test_add_and_list_routes() {
        let handle = start_mock_server(0, false, std::collections::HashMap::new())
            .await
            .unwrap();

        {
            let mut routes = handle.routes.write().await;
            routes.push(MockRouteConfig {
                method: "GET".to_string(),
                path: "/api/test".to_string(),
                status: Some(200),
                headers: None,
                body: Some(r#"{"ok":true}"#.to_string()),
                delay_ms: None,
            });
        }

        let status = handle.get_status().await;
        assert_eq!(status.route_count, 1);
        assert_eq!(status.port, handle.port);

        stop_mock_server(handle).await.ok();
    }
}