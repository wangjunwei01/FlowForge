<script setup lang="ts">
import { useTabStore } from '@/stores/tabs'

const tabStore = useTabStore()

function onTabClick(id: string): void {
  tabStore.activeTabId = id
}

function onTabClose(id: string, event: MouseEvent): void {
  event.stopPropagation()
  tabStore.closeTab(id)
}
</script>

<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabStore.tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ active: tab.id === tabStore.activeTabId, dirty: tab.isDirty }"
      @click="onTabClick(tab.id)"
    >
      <span class="tab-title">{{ tab.title }}</span>
      <span v-if="tab.isDirty" class="tab-dirty-dot"></span>
      <button class="tab-close" @click="onTabClose(tab.id, $event)">×</button>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  height: 36px;
  background: var(--bg-color-secondary);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  height: 100%;
  border-right: 1px solid var(--border-color);
  cursor: pointer;
  white-space: nowrap;
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.tab-item:hover {
  background: var(--bg-color-tertiary);
}

.tab-item.active {
  background: var(--canvas-bg);
  color: var(--text-color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.tab-item.dirty .tab-title {
  font-style: italic;
}

.tab-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-dirty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  font-size: 14px;
  cursor: pointer;
  border-radius: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.tab-item:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--bg-color-tertiary);
}

/* Dark mode */
:global(.dark) .tab-bar {
  background: var(--bg-color-tertiary);
}
</style>