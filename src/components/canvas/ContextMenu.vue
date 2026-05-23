<script setup lang="ts">
import { computed } from 'vue'
import type { ContextMenuTarget } from '@/composables/useContextMenu'

const props = defineProps<{
  target: ContextMenuTarget | null
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'action', action: string): void
  (e: 'close'): void
}>()

const position = computed(() => {
  if (!props.target) return { left: '0', top: '0' }
  return {
    left: `${props.target.x}px`,
    top: `${props.target.y}px`,
  }
})

const nodeMenuItems = [
  { action: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
  { action: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D' },
  { action: 'divider' },
  { action: 'disable', label: 'Disable' },
  { action: 'divider' },
  { action: 'delete', label: 'Delete', shortcut: 'Del' },
]

const edgeMenuItems = [
  { action: 'edit-mapping', label: 'Edit Mapping' },
  { action: 'divider' },
  { action: 'delete', label: 'Delete', shortcut: 'Del' },
]

const canvasMenuItems = [
  { action: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
  { action: 'select-all', label: 'Select All', shortcut: 'Ctrl+A' },
  { action: 'divider' },
  { action: 'fit-view', label: 'Fit View' },
  { action: 'reset-view', label: 'Reset View' },
]

const menuItems = computed(() => {
  if (!props.target) return []
  if (props.target.type === 'node') return nodeMenuItems
  if (props.target.type === 'edge') return edgeMenuItems
  return canvasMenuItems
})

function onAction(action: string): void {
  emit('action', action)
  emit('close')
}

function onClickOutside(event: MouseEvent): void {
  if ((event.target as HTMLElement).closest('.context-menu')) return
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && target"
      class="context-menu-backdrop"
      @click="onClickOutside"
      @contextmenu.prevent
    >
      <div
        class="context-menu"
        :style="position"
      >
        <template v-for="(item, index) in menuItems" :key="index">
          <div v-if="item.action === 'divider'" class="menu-divider"></div>
          <div
            v-else
            class="menu-item"
            @click="onAction(item.action)"
          >
            <span class="menu-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="menu-shortcut">{{ item.shortcut }}</span>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.context-menu {
  position: fixed;
  min-width: 160px;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.menu-item:hover {
  background: var(--bg-color-tertiary);
}

.menu-label {
  color: var(--text-color-primary);
  font-size: var(--font-size-sm);
}

.menu-shortcut {
  color: var(--text-color-secondary);
  font-size: var(--font-size-xs);
  margin-left: 16px;
}

.menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

/* Dark mode */
:global(.dark) .context-menu {
  background: var(--bg-color-tertiary);
  border-color: var(--border-color);
}
</style>