<script setup lang="ts">
import { computed } from 'vue'
import NodeHandles from './NodeHandles.vue'
import type { Port, AnyNodeData } from '@/types'
import { NodeType } from '@/types'

const props = defineProps<{
  id: string
  type: NodeType
  data: AnyNodeData
  inputs: Port[]
  outputs: Port[]
  selected?: boolean
  status?: 'pending' | 'running' | 'success' | 'error'
}>()

const nodeTypeIcons: Record<NodeType, string> = {
  [NodeType.HTTP_REQUEST]: '🌐',
  [NodeType.GRPC_REQUEST]: '⚡',
  [NodeType.WEBSOCKET]: '🔌',
  [NodeType.SSE]: '📡',
  [NodeType.SCRIPT]: '📜',
  [NodeType.DATA_TRANSFORM]: '🔄',
  [NodeType.MOCK]: '🎭',
}

const statusColors: Record<string, string> = {
  pending: '#6b7280',
  running: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
}

const icon = computed(() => nodeTypeIcons[props.type] ?? '📦')
const statusColor = computed(() => statusColors[props.status ?? 'pending'])
</script>

<template>
  <div class="base-node" :class="{ selected, disabled: data.disabled }">
    <div class="node-header">
      <span class="node-icon">{{ icon }}</span>
      <span class="node-label">{{ data.label }}</span>
      <span v-if="status" class="node-status" :style="{ background: statusColor }"></span>
    </div>
    <div class="node-body">
      <slot></slot>
    </div>
    <NodeHandles :inputs="inputs" :outputs="outputs" />
  </div>
</template>

<style scoped>
.base-node {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  min-width: 180px;
  max-width: 280px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.base-node.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

.base-node.disabled {
  opacity: 0.6;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg-color-tertiary);
  border-bottom: 1px solid var(--border-color);
  border-radius: 8px 8px 0 0;
}

.node-icon {
  font-size: 14px;
}

.node-label {
  flex: 1;
  font-weight: 500;
  color: var(--text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.node-body {
  padding: 8px 10px;
  color: var(--text-color-secondary);
  font-size: 11px;
}

/* Dark mode */
:global(.dark) .base-node {
  background: var(--bg-color-secondary);
  border-color: var(--border-color);
}

:global(.dark) .node-header {
  background: var(--bg-color-tertiary);
  border-color: var(--border-color);
}
</style>