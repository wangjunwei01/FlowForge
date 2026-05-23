export enum NodeType {
  HTTP_REQUEST = 'HTTP_REQUEST',
  GRPC_REQUEST = 'GRPC_REQUEST',
  WEBSOCKET = 'WEBSOCKET',
  SSE = 'SSE',
  SCRIPT = 'SCRIPT',
  DATA_TRANSFORM = 'DATA_TRANSFORM',
  MOCK = 'MOCK',
}

export interface NodeData {
  label: string
  description?: string
  disabled?: boolean
}

export interface HTTPNodeData extends NodeData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  url: string
  headers: Record<string, string>
  params: Record<string, string>
  body?: {
    type: 'json' | 'form' | 'raw' | 'binary' | 'none'
    content: string
    binaryFilePath?: string
  }
  auth?: AuthConfig
  timeout?: number
  followRedirects?: boolean
  proxy?: ProxyConfig
  ssl?: SSLConfig
  errorStrategy?: import('./execution.types').ErrorStrategy
  retryCount?: number
  retryDelay?: number
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2'
  basic?: { username: string; password: string }
  bearer?: { token: string }
  apikey?: { key: string; value: string; addTo: 'header' | 'query' }
  oauth2?: {
    grantType: 'authorization_code' | 'client_credentials' | 'password'
    tokenUrl: string
    clientId: string
    clientSecret: string
    scopes?: string[]
  }
}

export interface ProxyConfig {
  enabled: boolean
  type: 'http' | 'socks5'
  host: string
  port: number
  username?: string
  password?: string
}

export interface SSLConfig {
  verify?: boolean
  clientCertPath?: string
  clientKeyPath?: string
  caCertPath?: string
}

export interface GRPCNodeData extends NodeData {
  protoFile: string
  serviceName: string
  methodName: string
  address: string
  useTLS: boolean
  requestMessage: string
  deadline?: number
  metadata?: Record<string, string>
}

export interface WSMessage {
  id: string
  direction: 'send' | 'receive'
  content: string
  timestamp: string
  type?: 'text' | 'binary'
}

export interface WebSocketNodeData extends NodeData {
  url: string
  protocols: string[]
  messages: WSMessage[]
  reconnect?: boolean
  reconnectInterval?: number
}

export interface SSENodeData extends NodeData {
  url: string
  headers: Record<string, string>
  lastEventId?: string
  reconnect?: boolean
  reconnectInterval?: number
}

export interface MockRoute {
  method: string
  path: string
  statusCode: number
  headers: Record<string, string>
  body: string
  delay?: number
}

export interface MockNodeData extends NodeData {
  port: number
  routes: MockRoute[]
  autoStart: boolean
  corsEnabled?: boolean
  defaultHeaders?: Record<string, string>
}

export interface ScriptNodeData extends NodeData {
  language: 'javascript'
  code: string
  timeout?: number
  maxMemory?: number
}

export interface TransformNodeData extends NodeData {
  inputMapping: DataMapping[]
  outputMapping: DataMapping[]
}

export type DataMappingType = 'jsonpath' | 'script' | 'visual' | 'direct'

export interface DataMapping {
  type: DataMappingType
  source: string
  target: string
}

export type AnyNodeData =
  | HTTPNodeData
  | GRPCNodeData
  | WebSocketNodeData
  | SSENodeData
  | MockNodeData
  | ScriptNodeData
  | TransformNodeData