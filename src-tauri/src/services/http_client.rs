use crate::models::error::AppError;
use crate::models::request::HttpRequest;
use crate::services::app_state::AppState;
use std::time::{Duration, Instant};
use tokio_util::sync::CancellationToken;

pub struct HttpService;

impl HttpService {
    pub async fn execute(
        state: &AppState,
        request: HttpRequest,
        cancel_token_id: Option<String>,
    ) -> Result<crate::models::request::HttpResponse, AppError> {
        let cancel_token = CancellationToken::new();
        if let Some(ref id) = cancel_token_id {
            state
                .http_cancel_tokens
                .lock()
                .await
                .insert(id.clone(), cancel_token.clone());
        }

        let result = Self::do_execute(&request, cancel_token.clone()).await;

        if let Some(ref id) = cancel_token_id {
            state.http_cancel_tokens.lock().await.remove(id);
        }

        result
    }

    async fn do_execute(
        request: &HttpRequest,
        cancel_token: CancellationToken,
    ) -> Result<crate::models::request::HttpResponse, AppError> {
        let client = Self::build_client(request)?;
        let req_builder = Self::build_request(&client, request)?;

        let start = Instant::now();

        let response_result = tokio::select! {
            result = req_builder.send() => result,
            _ = cancel_token.cancelled() => {
                return Err(AppError::Network {
                    message: "Request was cancelled".to_string(),
                });
            }
        };

        let response = response_result.map_err(|e| AppError::Network {
            message: format!("HTTP request failed: {}", e),
        })?;

        let duration = start.elapsed().as_millis() as u64;
        let status = response.status();

        let mut headers = std::collections::HashMap::new();
        for (key, value) in response.headers() {
            if let Ok(v) = value.to_str() {
                headers.insert(key.as_str().to_string(), v.to_string());
            }
        }

        let body = response.text().await.map_err(|e| AppError::Network {
            message: format!("Failed to read response body: {}", e),
        })?;

        let size = body.len() as u64;

        Ok(crate::models::request::HttpResponse {
            status: status.as_u16(),
            status_text: status.canonical_reason().unwrap_or("").to_string(),
            headers,
            body,
            size,
            duration,
        })
    }

    pub async fn cancel(state: &AppState, cancel_token_id: &str) -> Result<(), AppError> {
        let tokens = state.http_cancel_tokens.lock().await;
        if let Some(token) = tokens.get(cancel_token_id) {
            token.cancel();
            Ok(())
        } else {
            Err(AppError::NotFound {
                resource: "cancel_token".to_string(),
                id: cancel_token_id.to_string(),
            })
        }
    }

    fn build_client(request: &HttpRequest) -> Result<reqwest::Client, AppError> {
        let mut builder = reqwest::Client::builder()
            .timeout(Duration::from_millis(request.timeout.unwrap_or(30000)))
            .redirect(if request.follow_redirects.unwrap_or(true) {
                reqwest::redirect::Policy::limited(10)
            } else {
                reqwest::redirect::Policy::none()
            });

        if let Some(ref proxy_config) = request.proxy {
            if proxy_config.enabled {
                let proxy_url = match proxy_config.proxy_type.as_str() {
                    "https" => format!("https://{}:{}", proxy_config.host, proxy_config.port),
                    "socks5" => format!("socks5://{}:{}", proxy_config.host, proxy_config.port),
                    _ => format!("http://{}:{}", proxy_config.host, proxy_config.port),
                };
                let mut proxy = reqwest::Proxy::all(&proxy_url).map_err(|e| AppError::Network {
                    message: format!("Invalid proxy: {}", e),
                })?;
                if let (Some(user), Some(pass)) = (&proxy_config.username, &proxy_config.password) {
                    proxy = proxy.basic_auth(user, pass);
                }
                builder = builder.proxy(proxy);
            }
        }

        if let Some(ref ssl) = request.ssl {
            if let Some(false) = ssl.verify {
                builder = builder.danger_accept_invalid_certs(true);
            }
        }

        builder.build().map_err(|e| AppError::Network {
            message: format!("Failed to build HTTP client: {}", e),
        })
    }

    fn build_request(
        client: &reqwest::Client,
        request: &HttpRequest,
    ) -> Result<reqwest::RequestBuilder, AppError> {
        let method = match request.method.to_uppercase().as_str() {
            "GET" => reqwest::Method::GET,
            "POST" => reqwest::Method::POST,
            "PUT" => reqwest::Method::PUT,
            "DELETE" => reqwest::Method::DELETE,
            "PATCH" => reqwest::Method::PATCH,
            "HEAD" => reqwest::Method::HEAD,
            "OPTIONS" => reqwest::Method::OPTIONS,
            _ => reqwest::Method::GET,
        };

        let mut url = reqwest::Url::parse(&request.url).map_err(|e| AppError::Validation {
            message: format!("Invalid URL: {}", e),
            details: None,
        })?;

        for (key, value) in &request.params {
            url.query_pairs_mut().append_pair(key, value);
        }

        let mut req_builder = client.request(method, url);

        for (key, value) in &request.headers {
            req_builder = req_builder.header(key.as_str(), value.as_str());
        }

        // Apply auth
        if let Some(ref auth) = request.auth {
            match auth {
                crate::models::request::AuthConfig::Bearer { token } => {
                    req_builder = req_builder.bearer_auth(token);
                }
                crate::models::request::AuthConfig::Basic { username, password } => {
                    req_builder = req_builder.basic_auth(username, Some(password));
                }
                crate::models::request::AuthConfig::ApiKey { key, value, add_to } => {
                    if add_to == "header" {
                        req_builder = req_builder.header(key.as_str(), value.as_str());
                    }
                }
                crate::models::request::AuthConfig::None => {}
                crate::models::request::AuthConfig::OAuth2 { .. } => {}
            }
        }

        // Apply body
        if let Some(ref body) = request.body {
            match body.body_type.as_str() {
                "json" => {
                    req_builder = req_builder.header("Content-Type", "application/json");
                    req_builder = req_builder.body(body.content.clone());
                }
                "form" => {
                    req_builder =
                        req_builder.header("Content-Type", "application/x-www-form-urlencoded");
                    req_builder = req_builder.body(body.content.clone());
                }
                "raw" => {
                    req_builder = req_builder.body(body.content.clone());
                }
                "binary" => {
                    if let Some(ref path) = body.binary_file_path {
                        let data = std::fs::read(path).map_err(|e| AppError::FsError {
                            message: format!("Failed to read binary file: {}", e),
                            path: Some(path.clone()),
                        })?;
                        req_builder = req_builder.body(data);
                    }
                }
                _ => {
                    req_builder = req_builder.body(body.content.clone());
                }
            }
        }

        Ok(req_builder)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::request::HttpRequest;

    fn make_request(method: &str, url: &str) -> HttpRequest {
        HttpRequest {
            method: method.to_string(),
            url: url.to_string(),
            headers: std::collections::HashMap::new(),
            params: std::collections::HashMap::new(),
            body: None,
            auth: None,
            timeout: Some(5000),
            follow_redirects: Some(true),
            proxy: None,
            ssl: None,
        }
    }

    #[test]
    fn test_build_client_default() {
        let req = make_request("GET", "https://example.com");
        let result = HttpService::build_client(&req);
        assert!(result.is_ok());
    }
}