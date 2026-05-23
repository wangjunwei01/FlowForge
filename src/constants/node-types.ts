export enum NodeType {
  HttpRequest = 'http-request',
  HttpResponse = 'http-response',
  Grpc = 'grpc',
  WebSocket = 'websocket',
  SSE = 'sse',
  Script = 'script',
  Transform = 'transform',
  Mock = 'mock',
}

export enum FlowStatus {
  Draft = 'draft',
  Saved = 'saved',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export enum ExecutionStatus {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  Completed = 'completed',
  Failed = 'failed',
}

export const NODE_TYPES = Object.values(NodeType)
