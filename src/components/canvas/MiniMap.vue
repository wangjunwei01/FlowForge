<script setup lang="ts">
import { MiniMap } from '@vue-flow/minimap'

const nodeColor = '#42b883'
const nodeStrokeColor = '#33a06f'
</script>

<template>
  <div class="minimap-container">
    <MiniMap
      :node-color="nodeColor"
      :node-stroke-color="nodeStrokeColor"
      pannable
      zoomable
    />
  </div>
</template>

<style>
@import '@vue-flow/minimap/dist/style.css';

.minimap-container {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}

.vue-flow__minimap {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  width: 150px;
  height: 100px;
}

/* Dark mode */
:global(.dark) .vue-flow__minimap {
  background: var(--bg-color-tertiary);
  border-color: var(--border-color);
}
</style>