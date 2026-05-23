use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct FlowNode {
    pub id: String,
    pub node_type: String,
    pub position: Position,
    pub data: serde_json::Value,
    pub inputs: Vec<Port>,
    pub outputs: Vec<Port>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Port {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub port_type: String,
    #[serde(rename = "dataType")]
    pub data_type: String,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct FlowEdge {
    pub id: String,
    pub source: String,
    pub source_handle: String,
    pub target: String,
    pub target_handle: String,
    pub data_mapping: Vec<DataMapping>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DataMapping {
    pub mapping_type: String,
    pub source: String,
    pub target: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct Flow {
    pub id: String,
    pub name: String,
    pub schema_version: i32,
    pub nodes: std::collections::HashMap<String, FlowNode>,
    pub edges: std::collections::HashMap<String, FlowEdge>,
    pub variables: Vec<Variable>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Variable {
    pub key: String,
    pub value: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct Project {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub schema_version: i32,
    pub flows: Vec<String>,
    pub environments: Vec<Environment>,
    pub active_environment_id: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Environment {
    pub id: String,
    pub name: String,
    pub variables: Vec<Variable>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_flow_serde_roundtrip() {
        let flow = Flow {
            id: "flow-1".to_string(),
            name: "Test Flow".to_string(),
            schema_version: 1,
            nodes: std::collections::HashMap::new(),
            edges: std::collections::HashMap::new(),
            variables: vec![Variable {
                key: "baseUrl".to_string(),
                value: "https://api.example.com".to_string(),
                description: Some("Base URL".to_string()),
                enabled: true,
            }],
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&flow).unwrap();
        let deserialized: Flow = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, flow.id);
        assert_eq!(deserialized.name, flow.name);
        assert_eq!(deserialized.schema_version, flow.schema_version);
        assert_eq!(deserialized.variables.len(), 1);
        assert_eq!(deserialized.variables[0].key, "baseUrl");
    }

    #[test]
    fn test_flow_camel_case_serialization() {
        let flow = Flow {
            id: "flow-1".to_string(),
            name: "Test".to_string(),
            schema_version: 1,
            nodes: std::collections::HashMap::new(),
            edges: std::collections::HashMap::new(),
            variables: vec![],
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&flow).unwrap();
        assert!(json.contains("\"schemaVersion\""));
        assert!(json.contains("\"createdAt\""));
        assert!(json.contains("\"updatedAt\""));
        assert!(!json.contains("\"schema_version\""));
        assert!(!json.contains("\"created_at\""));
    }

    #[test]
    fn test_port_type_rename() {
        let port = Port {
            id: "in-1".to_string(),
            name: "Input".to_string(),
            port_type: "input".to_string(),
            data_type: "json".to_string(),
            required: true,
        };

        let json = serde_json::to_string(&port).unwrap();
        assert!(json.contains("\"type\":\"input\""));
        assert!(json.contains("\"dataType\":\"json\""));
        assert!(!json.contains("\"portType\""));
    }

    #[test]
    fn test_project_serde_roundtrip() {
        let project = Project {
            id: "proj-1".to_string(),
            name: "Test Project".to_string(),
            description: Some("A test project".to_string()),
            schema_version: 1,
            flows: vec!["flow-1".to_string()],
            environments: vec![Environment {
                id: "default".to_string(),
                name: "Default".to_string(),
                variables: vec![],
            }],
            active_environment_id: "default".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&project).unwrap();
        let deserialized: Project = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, project.id);
        assert_eq!(deserialized.name, project.name);
        assert_eq!(deserialized.description, project.description);
        assert_eq!(deserialized.flows.len(), 1);
        assert_eq!(deserialized.environments.len(), 1);
    }

    #[test]
    fn test_flow_node_serde() {
        let node = FlowNode {
            id: "node-1".to_string(),
            node_type: "HTTP_REQUEST".to_string(),
            position: Position { x: 100.0, y: 200.0 },
            data: serde_json::json!({"method": "GET", "url": "https://example.com"}),
            inputs: vec![Port {
                id: "in-1".to_string(),
                name: "Input".to_string(),
                port_type: "input".to_string(),
                data_type: "json".to_string(),
                required: true,
            }],
            outputs: vec![],
        };

        let json = serde_json::to_string(&node).unwrap();
        let deserialized: FlowNode = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, "node-1");
        assert_eq!(deserialized.node_type, "HTTP_REQUEST");
        assert_eq!(deserialized.position.x, 100.0);
    }

    #[test]
    fn test_flow_with_nodes_serde() {
        let mut flow = Flow {
            id: "flow-1".to_string(),
            name: "Test".to_string(),
            schema_version: 1,
            nodes: std::collections::HashMap::new(),
            edges: std::collections::HashMap::new(),
            variables: vec![],
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let node = FlowNode {
            id: "node-1".to_string(),
            node_type: "SCRIPT".to_string(),
            position: Position { x: 50.0, y: 100.0 },
            data: serde_json::json!({"label": "Script Node"}),
            inputs: vec![],
            outputs: vec![],
        };
        flow.nodes.insert("node-1".to_string(), node);

        let json = serde_json::to_string(&flow).unwrap();
        let deserialized: Flow = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.nodes.len(), 1);
        assert!(deserialized.nodes.contains_key("node-1"));
    }
}