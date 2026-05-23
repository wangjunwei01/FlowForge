<script setup lang="ts">
import { MiniMap } from '@vue-flow/minimap'

const nodeColor = '#409eff'
const nodeStrokeColor = '#1d4ed8'
</script>

<template>
  <MiniMap
    :node-color="nodeColor"
    :node-stroke-color="nodeStrokeColor"
    pannable
    zoomable
  />
</template>

<style>
@import '@vue-flow/minimap/dist/style.css';

.vue-flow__minimap {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

/* Dark mode */
.dark .vue-flow__minimap {
  background: var(--bg-color-tertiary);
}
</style>