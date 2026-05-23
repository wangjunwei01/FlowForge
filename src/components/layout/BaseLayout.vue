<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { useI18n } from 'vue-i18n'
import SidebarPanel from '@/components/panels/SidebarPanel.vue'
import ConfigPanel from '@/components/panels/ConfigPanel.vue'

const { currentTheme, toggleTheme } = useTheme()
const { locale } = useI18n()

function toggleLocale() {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}
</script>

<template>
  <div class="base-layout">
    <header class="layout-header">
      <div class="header-title">FlowForge</div>
      <div class="header-actions">
        <button class="header-btn" :title="$t('theme.toggle')" @click="toggleTheme">
          {{ currentTheme === 'light' ? '🌙' : '☀️' }}
        </button>
        <button class="header-btn" @click="toggleLocale">
          {{ locale === 'zh-CN' ? 'EN' : '中' }}
        </button>
      </div>
    </header>
    <div class="layout-body">
      <aside class="layout-sidebar">
        <SidebarPanel />
      </aside>
      <main class="layout-main">
        <router-view />
      </main>
      <aside class="layout-config-panel">
        <ConfigPanel />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.base-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.layout-header {
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 12px;
  background-color: var(--bg-color-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.header-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 4px 8px;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-color-regular);
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.header-btn:hover {
  background-color: var(--bg-color-tertiary);
  border-color: var(--color-primary);
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.layout-sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  flex-shrink: 0;
}

.layout-main {
  flex: 1;
  overflow: hidden;
  background-color: var(--canvas-bg);
}

.layout-config-panel {
  width: var(--config-panel-width);
  background-color: var(--bg-panel);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  flex-shrink: 0;
}
</style>
