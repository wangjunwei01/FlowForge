use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: std::collections::HashMap<String, String>,
    pub params: std::collections::HashMap<String, String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<HttpBody>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auth: Option<AuthConfig>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub follow_redirects: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub proxy: Option<ProxyConfig>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ssl: Option<SslConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct HttpBody {
    #[serde(rename = "type")]
    pub body_type: String,
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub binary_file_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: std::collections::HashMap<String, String>,
    pub body: String,
    pub size: u64,
    pub duration: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
#[allow(dead_code)]
pub enum AuthConfig {
    #[serde(rename = "none")]
    None,
    #[serde(rename = "basic")]
    Basic { username: String, password: String },
    #[serde(rename = "bearer")]
    Bearer { token: String },
    #[serde(rename = "apikey")]
    ApiKey {
        key: String,
        value: String,
        #[serde(rename = "addTo")]
        add_to: String,
    },
    #[serde(rename = "oauth2")]
    OAuth2 {
        #[serde(rename = "grantType")]
        grant_type: String,
        #[serde(rename = "tokenUrl")]
        token_url: String,
        #[serde(rename = "clientId")]
        client_id: String,
        #[serde(rename = "clientSecret")]
        client_secret: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        scopes: Option<Vec<String>>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct ProxyConfig {
    pub enabled: bool,
    #[serde(rename = "type")]
    pub proxy_type: String,
    pub host: String,
    pub port: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct SslConfig {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verify: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_cert_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_key_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ca_cert_path: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_http_request_serde_roundtrip() {
        let req = HttpRequest {
            method: "GET".to_string(),
            url: "https://example.com".to_string(),
            headers: std::collections::HashMap::new(),
            params: std::collections::HashMap::new(),
            body: None,
            auth: None,
            timeout: Some(5000),
            follow_redirects: Some(true),
            proxy: None,
            ssl: None,
        };

        let json = serde_json::to_string(&req).unwrap();
        let deserialized: HttpRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.method, "GET");
        assert_eq!(deserialized.url, "https://example.com");
        assert_eq!(deserialized.timeout, Some(5000));
    }

    #[test]
    fn test_auth_config_serde() {
        let auth = AuthConfig::Bearer {
            token: "test-token".to_string(),
        };

        let json = serde_json::to_string(&auth).unwrap();
        assert!(json.contains("\"type\":\"bearer\""));

        let deserialized: AuthConfig = serde_json::from_str(&json).unwrap();
        match deserialized {
            AuthConfig::Bearer { token } => assert_eq!(token, "test-token"),
            _ => panic!("Expected Bearer auth"),
        }
    }

    #[test]
    fn test_auth_config_api_key_camel_case() {
        let auth = AuthConfig::ApiKey {
            key: "X-API-Key".to_string(),
            value: "secret".to_string(),
            add_to: "header".to_string(),
        };

        let json = serde_json::to_string(&auth).unwrap();
        assert!(json.contains("\"addTo\":\"header\""));

        let deserialized: AuthConfig = serde_json::from_str(&json).unwrap();
        match deserialized {
            AuthConfig::ApiKey { add_to, .. } => assert_eq!(add_to, "header"),
            _ => panic!("Expected ApiKey auth"),
        }
    }

    #[test]
    fn test_proxy_config_serde() {
        let proxy = ProxyConfig {
            enabled: true,
            proxy_type: "http".to_string(),
            host: "proxy.example.com".to_string(),
            port: 8080,
            username: Some("user".to_string()),
            password: None,
        };

        let json = serde_json::to_string(&proxy).unwrap();
        assert!(json.contains("\"type\":\"http\""));

        let deserialized: ProxyConfig = serde_json::from_str(&json).unwrap();

        assert!(deserialized.enabled);
        assert_eq!(deserialized.proxy_type, "http");
        assert_eq!(deserialized.port, 8080);
    }

    #[test]
    fn test_http_request_camel_case_serialization() {
        let req = HttpRequest {
            method: "POST".to_string(),
            url: "https://api.example.com/data".to_string(),
            headers: std::collections::HashMap::new(),
            params: std::collections::HashMap::new(),
            body: Some(HttpBody {
                body_type: "json".to_string(),
                content: "{\"key\":\"value\"}".to_string(),
                binary_file_path: None,
            }),
            auth: None,
            timeout: Some(10000),
            follow_redirects: Some(false),
            proxy: None,
            ssl: None,
        };

        let json = serde_json::to_string(&req).unwrap();
        // Verify camelCase field names
        assert!(json.contains("\"followRedirects\""));
        // body_type has #[serde(rename = "type")], so it serializes as "type" not "bodyType"
        assert!(json.contains("\"type\":\"json\""));
        // Ensure snake_case versions are absent
        assert!(!json.contains("\"follow_redirects\""));
        assert!(!json.contains("\"body_type\""));
    }
}