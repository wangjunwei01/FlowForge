<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeType, NODE_TYPE_LABELS } from '@/constants/node-types'
import { useDragDrop } from '@/composables/useDragDrop'

const { onDragStart } = useDragDrop()

const searchQuery = ref('')

const nodeTypes = Object.values(NodeType)

const filteredNodes = computed(() => {
  if (!searchQuery.value) return nodeTypes

  const query = searchQuery.value.toLowerCase()
  return nodeTypes.filter((type) => {
    const label = NODE_TYPE_LABELS[type]
    return type.toLowerCase().includes(query) || label.toLowerCase().includes(query)
  })
})

const nodeIcons: Record<NodeType, string> = {
  [NodeType.HTTP_REQUEST]: '🌐',
  [NodeType.GRPC_REQUEST]: '⚡',
  [NodeType.WEBSOCKET]: '🔌',
  [NodeType.SSE]: '📡',
  [NodeType.SCRIPT]: '📜',
  [NodeType.DATA_TRANSFORM]: '🔄',
  [NodeType.MOCK]: '🎭',
}
</script>

<template>
  <div class="sidebar-panel">
    <div class="sidebar-header">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search nodes..."
      />
    </div>
    <div class="node-list">
      <div
        v-for="type in filteredNodes"
        :key="type"
        class="node-item"
        draggable="true"
        @dragstart="onDragStart($event, type)"
      >
        <span class="node-icon">{{ nodeIcons[type] }}</span>
        <span class="node-label">{{ NODE_TYPE_LABELS[type] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 8px;
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-color-secondary);
  color: var(--text-color-primary);
  font-size: var(--font-size-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.node-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 4px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-color-secondary);
  cursor: grab;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.node-item:hover {
  background: var(--bg-color-tertiary);
  border-color: var(--color-primary);
}

.node-item:active {
  cursor: grabbing;
}

.node-icon {
  font-size: 16px;
}

.node-label {
  color: var(--text-color-primary);
  font-size: var(--font-size-sm);
}

/* Dark mode */
:global(.dark) .search-input {
  background: var(--bg-color-tertiary);
  border-color: var(--border-color);
}

:global(.dark) .node-item {
  background: var(--bg-color-tertiary);
  border-color: var(--border-color);
}

:global(.dark) .node-item:hover {
  background: var(--bg-color-secondary);
}
</style>

<style>
.drag-ghost {
  position: fixed;
  top: -100px;
  left: -100px;
  padding: 8px 12px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10000;
  pointer-events: none;
}
</style>