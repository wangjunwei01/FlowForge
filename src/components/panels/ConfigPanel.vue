<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvas'

const canvasStore = useCanvasStore()

const selectedNode = computed(() => {
  const ids = canvasStore.selectedNodeIds
  if (ids.size !== 1) return null
  const id = Array.from(ids)[0]!
  return canvasStore.nodes[id] ?? null
})

const selectedEdge = computed(() => {
  const ids = canvasStore.selectedEdgeIds
  if (ids.size !== 1) return null
  const id = Array.from(ids)[0]!
  return canvasStore.edges[id] ?? null
})
</script>

<template>
  <div class="config-panel">
    <template v-if="selectedNode">
      <div class="panel-header">
        <h3>Node Config</h3>
      </div>
      <div class="panel-content">
        <div class="field">
          <label>ID</label>
          <span>{{ selectedNode.id }}</span>
        </div>
        <div class="field">
          <label>Type</label>
          <span>{{ selectedNode.type }}</span>
        </div>
        <div class="field">
          <label>Label</label>
          <span>{{ selectedNode.data.label }}</span>
        </div>
      </div>
    </template>
    <template v-else-if="selectedEdge">
      <div class="panel-header">
        <h3>Edge Config</h3>
      </div>
      <div class="panel-content">
        <div class="field">
          <label>Source</label>
          <span>{{ selectedEdge.source }}</span>
        </div>
        <div class="field">
          <label>Target</label>
          <span>{{ selectedEdge.target }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="panel-header">
        <h3>Config</h3>
      </div>
      <div class="panel-empty">
        <p>Select a node or edge to configure</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.config-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--text-color-primary);
}

.panel-content {
  padding: 12px;
}

.field {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}

.field label {
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}

.field span {
  color: var(--text-color-primary);
  font-size: var(--font-size-sm);
}

.panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}
</style>