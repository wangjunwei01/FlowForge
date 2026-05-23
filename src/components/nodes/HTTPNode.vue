<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { FlowNode, HTTPNodeData, Port } from '@/types'
import { NodeType } from '@/types'
import type { NodeProps } from '@vue-flow/core'

interface ExtendedFlowNode extends FlowNode {
  status?: 'pending' | 'running' | 'success' | 'error'
}

const props = defineProps<NodeProps<ExtendedFlowNode>>()

const data = props.data.data as HTTPNodeData
const inputs = props.data.inputs as Port[]
const outputs = props.data.outputs as Port[]
const methodColors: Record<string, string> = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
  HEAD: '#06b6d4',
  OPTIONS: '#6b7280',
}

const methodColor = methodColors[data.method] ?? '#6b7280'
</script>

<template>
  <BaseNode
    :id="props.id"
    :type="NodeType.HTTP_REQUEST"
    :data="data"
    :inputs="inputs"
    :outputs="outputs"
    :selected="props.selected"
    :status="props.data.status"
  >
    <div class="http-node-content">
      <span class="http-method" :style="{ background: methodColor }">{{ data.method }}</span>
      <span class="http-url">{{ data.url || 'No URL' }}</span>
    </div>
  </BaseNode>
</template>

<style scoped>
.http-node-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.http-method {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}

.http-url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-color-secondary);
}
</style>
