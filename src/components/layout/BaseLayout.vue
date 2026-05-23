<script setup lang="ts">
</script>

<template>
  <div class="base-layout">
    <header class="layout-header">
      <div class="header-title">FlowForge</div>
    </header>
    <div class="layout-body">
      <aside class="layout-sidebar">
        <div class="sidebar-content">
          <p>{{ $t('sidebar.nodes') }}</p>
        </div>
      </aside>
      <main class="layout-main">
        <router-view />
      </main>
      <aside class="layout-config-panel">
        <div class="config-content">
          <p>Config Panel</p>
        </div>
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

.sidebar-content {
  padding: 12px;
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

.config-content {
  padding: 12px;
}
</style>