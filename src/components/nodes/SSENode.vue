<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { FlowNode, SSENodeData, Port } from '@/types'
import { NodeType } from '@/types'
import type { NodeProps } from '@vue-flow/core'

interface ExtendedFlowNode extends FlowNode {
  status?: 'pending' | 'running' | 'success' | 'error'
}

const props = defineProps<NodeProps<ExtendedFlowNode>>()

const data = props.data.data as SSENodeData
const inputs = props.data.inputs as Port[]
const outputs = props.data.outputs as Port[]
</script>

<template>
  <BaseNode
    :id="props.id"
    :type="NodeType.SSE"
    :data="data"
    :inputs="inputs"
    :outputs="outputs"
    :selected="props.selected"
    :status="props.data.status"
  >
    <div class="sse-node-content">
      <span class="sse-url">{{ data.url || 'No URL' }}</span>
      <span v-if="data.lastEventId" class="sse-event-id">Last Event: {{ data.lastEventId }}</span>
    </div>
  </BaseNode>
</template>

<style scoped>
.sse-node-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sse-url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-color-primary);
}

.sse-event-id {
  color: var(--text-color-secondary);
  font-size: 10px;
}
</style>
