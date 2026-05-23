<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'

const { zoomIn, zoomOut, fitView, setViewport } = useVueFlow()

function onZoomIn(): void {
  zoomIn()
}

function onZoomOut(): void {
  zoomOut()
}

function onFitView(): void {
  fitView({ padding: 0.2 })
}

function onResetView(): void {
  setViewport({ x: 0, y: 0, zoom: 1 })
}
</script>

<template>
  <div class="canvas-controls">
    <button class="control-btn" title="Zoom In" @click="onZoomIn">+</button>
    <button class="control-btn" title="Zoom Out" @click="onZoomOut">−</button>
    <button class="control-btn" title="Fit View" @click="onFitView">◎</button>
    <button class="control-btn" title="Reset View" @click="onResetView">⌂</button>
  </div>
</template>

<style scoped>
.canvas-controls {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  gap: 4px;
  z-index: 100;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-color-secondary);
  color: var(--text-color-primary);
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.control-btn:hover {
  background: var(--bg-color-tertiary);
  border-color: var(--color-primary);
}

/* Dark mode */
:global(.dark) .control-btn {
  background: var(--bg-color-tertiary);
  border-color: var(--border-color);
}
</style>