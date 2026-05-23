<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { FlowNode, MockNodeData, Port } from '@/types'
import { NodeType } from '@/types'
import type { NodeProps } from '@vue-flow/core'

interface ExtendedFlowNode extends FlowNode {
  status?: 'pending' | 'running' | 'success' | 'error'
  mockRunning?: boolean
}

const props = defineProps<NodeProps<ExtendedFlowNode>>()

const data = props.data.data as MockNodeData
const inputs = props.data.inputs as Port[]
const outputs = props.data.outputs as Port[]

const routeCount = data.routes?.length ?? 0
const isRunning = props.data.mockRunning ?? false
</script>

<template>
  <BaseNode
    :id="props.id"
    :type="NodeType.MOCK"
    :data="data"
    :inputs="inputs"
    :outputs="outputs"
    :selected="props.selected"
    :status="props.data.status"
  >
    <div class="mock-node-content">
      <span class="mock-port">Port: {{ data.port }}</span>
      <span class="mock-routes">{{ routeCount }} route(s)</span>
      <span class="mock-status" :class="{ running: isRunning }">{{ isRunning ? 'Running' : 'Stopped' }}</span>
    </div>
  </BaseNode>
</template>

<style scoped>
.mock-node-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mock-port {
  color: var(--text-color-primary);
}

.mock-routes {
  color: var(--text-color-secondary);
}

.mock-status {
  font-size: 10px;
  color: #6b7280;
}

.mock-status.running {
  color: #10b981;
}
</style>