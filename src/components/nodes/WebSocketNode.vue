<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { FlowNode, WebSocketNodeData, Port } from '@/types'
import { NodeType } from '@/types'
import type { NodeProps } from '@vue-flow/core'

interface ExtendedFlowNode extends FlowNode {
  status?: 'pending' | 'running' | 'success' | 'error'
  connectionStatus?: 'connected' | 'disconnected' | 'connecting' | 'error'
}

const props = defineProps<NodeProps<ExtendedFlowNode>>()

const data = props.data.data as WebSocketNodeData
const inputs = props.data.inputs as Port[]
const outputs = props.data.outputs as Port[]

const connectionStatusColors: Record<string, string> = {
  connected: '#10b981',
  disconnected: '#6b7280',
  connecting: '#3b82f6',
  error: '#ef4444',
}

const connectionStatus = props.data.connectionStatus ?? 'disconnected'
const statusColor = connectionStatusColors[connectionStatus] ?? '#6b7280'
</script>

<template>
  <BaseNode
    :id="props.id"
    :type="NodeType.WEBSOCKET"
    :data="data"
    :inputs="inputs"
    :outputs="outputs"
    :selected="props.selected"
    :status="props.data.status"
  >
    <div class="ws-node-content">
      <span class="ws-url">{{ data.url || 'No URL' }}</span>
      <span class="ws-status" :style="{ color: statusColor }">{{ connectionStatus }}</span>
    </div>
  </BaseNode>
</template>

<style scoped>
.ws-node-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ws-url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-color-primary);
}

.ws-status {
  font-size: 10px;
  text-transform: uppercase;
}
</style>
