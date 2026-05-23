export enum NodeType {
  HTTP_REQUEST = 'HTTP_REQUEST',
  GRPC_REQUEST = 'GRPC_REQUEST',
  WEBSOCKET = 'WEBSOCKET',
  SSE = 'SSE',
  SCRIPT = 'SCRIPT',
  DATA_TRANSFORM = 'DATA_TRANSFORM',
  MOCK = 'MOCK',
}

export const NODE_TYPE_LIST = Object.values(NodeType)

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.HTTP_REQUEST]: 'HTTP Request',
  [NodeType.GRPC_REQUEST]: 'gRPC Request',
  [NodeType.WEBSOCKET]: 'WebSocket',
  [NodeType.SSE]: 'SSE',
  [NodeType.SCRIPT]: 'Script',
  [NodeType.DATA_TRANSFORM]: 'Data Transform',
  [NodeType.MOCK]: 'Mock Server',
}