<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { Port } from '@/types'

defineProps<{
  inputs: Port[]
  outputs: Port[]
}>()

const dataTypeColors: Record<string, string> = {
  any: '#9ca3af',
  json: '#3b82f6',
  string: '#10b981',
  number: '#f59e0b',
  boolean: '#8b5cf6',
  binary: '#6b7280',
  stream: '#06b6d4',
}
</script>

<template>
  <div class="node-handles">
    <div class="handles-inputs">
      <div v-for="port in inputs" :key="port.id" class="handle-row input-row">
        <Handle
          :id="port.id"
          type="target"
          :position="Position.Left"
          :style="{ background: dataTypeColors[port.dataType] ?? dataTypeColors.any }"
          class="node-handle"
        />
        <span class="handle-label">{{ port.name }}</span>
      </div>
    </div>
    <div class="handles-outputs">
      <div v-for="port in outputs" :key="port.id" class="handle-row output-row">
        <span class="handle-label">{{ port.name }}</span>
        <Handle
          :id="port.id"
          type="source"
          :position="Position.Right"
          :style="{ background: dataTypeColors[port.dataType] ?? dataTypeColors.any }"
          class="node-handle"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-handles {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
}

.handles-inputs,
.handles-outputs {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.handle-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-color-secondary);
}

.input-row {
  padding-left: 4px;
}

.output-row {
  padding-right: 4px;
  justify-content: flex-end;
}

.handle-label {
  white-space: nowrap;
}

.node-handle {
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
}
</style>
