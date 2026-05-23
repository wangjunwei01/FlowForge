import HTTPNode from './HTTPNode.vue'
import GRPCNode from './GRPCNode.vue'
import WebSocketNode from './WebSocketNode.vue'
import SSENode from './SSENode.vue'
import ScriptNode from './ScriptNode.vue'
import TransformNode from './TransformNode.vue'
import MockNode from './MockNode.vue'

import { NodeType } from '@/types'
import type { Component } from 'vue'

export const nodeComponents: Record<NodeType, Component> = {
  [NodeType.HTTP_REQUEST]: HTTPNode,
  [NodeType.GRPC_REQUEST]: GRPCNode,
  [NodeType.WEBSOCKET]: WebSocketNode,
  [NodeType.SSE]: SSENode,
  [NodeType.SCRIPT]: ScriptNode,
  [NodeType.DATA_TRANSFORM]: TransformNode,
  [NodeType.MOCK]: MockNode,
}

export {
  HTTPNode,
  GRPCNode,
  WebSocketNode,
  SSENode,
  ScriptNode,
  TransformNode,
  MockNode,
}