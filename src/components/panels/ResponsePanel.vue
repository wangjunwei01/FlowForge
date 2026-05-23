<script setup lang="ts">
import { ref, computed } from 'vue'
import type { HttpResponse } from '@/services/http.service'

const props = defineProps<{
  response: HttpResponse | null
  error: string | null
  loading: boolean
}>()

const activeTab = ref<'body' | 'headers' | 'info'>('body')

const formattedBody = computed(() => {
  if (!props.response?.body) return ''

  // Try to format as JSON
  try {
    const parsed = JSON.parse(props.response.body)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return props.response.body
  }
})

const statusClass = computed(() => {
  if (!props.response) return ''
  const status = props.response.status
  if (status >= 200 && status < 300) return 'status-success'
  if (status >= 400 && status < 500) return 'status-client-error'
  if (status >= 500) return 'status-server-error'
  return 'status-redirect'
})

const sizeFormatted = computed(() => {
  if (!props.response) return '0 B'
  const size = props.response.size
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
})

const timeFormatted = computed(() => {
  if (!props.response) return '0 ms'
  return `${props.response.time} ms`
})
</script>

<template>
  <div class="response-panel">
    <!-- Loading state -->
    <div v-if="loading" class="response-loading">
      <span class="spinner"></span>
      <span>Request in progress...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="response-error">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>

    <!-- No response state -->
    <div v-else-if="!response" class="response-empty">
      <p>Send a request to see the response</p>
    </div>

    <!-- Response content -->
    <template v-else>
      <!-- Status bar -->
      <div class="response-status-bar">
        <span class="status-badge" :class="statusClass">
          {{ response.status }} {{ response.statusText }}
        </span>
        <span class="status-meta">
          <span>{{ timeFormatted }}</span>
          <span>{{ sizeFormatted }}</span>
        </span>
      </div>

      <!-- Tabs -->
      <div class="response-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'body' }"
          @click="activeTab = 'body'"
        >
          Body
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'headers' }"
          @click="activeTab = 'headers'"
        >
          Headers ({{ Object.keys(response.headers).length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'info' }"
          @click="activeTab = 'info'"
        >
          Info
        </button>
      </div>

      <!-- Tab content -->
      <div class="response-content">
        <!-- Body tab -->
        <div v-if="activeTab === 'body'" class="tab-content">
          <pre class="response-body">{{ formattedBody || '(empty)' }}</pre>
        </div>

        <!-- Headers tab -->
        <div v-if="activeTab === 'headers'" class="tab-content">
          <div v-for="(value, key) in response.headers" :key="key" class="header-row">
            <span class="header-key">{{ key }}</span>
            <span class="header-value">{{ value }}</span>
          </div>
        </div>

        <!-- Info tab -->
        <div v-if="activeTab === 'info'" class="tab-content">
          <div class="info-row">
            <span class="info-label">Response Time</span>
            <span class="info-value">{{ timeFormatted }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Response Size</span>
            <span class="info-value">{{ sizeFormatted }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.response-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color);
}

.response-loading,
.response-error,
.response-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.response-error {
  color: var(--color-danger);
}

.error-icon {
  font-size: 24px;
}

.response-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #fff;
}

.status-success { background: #10b981; }
.status-client-error { background: #f59e0b; }
.status-server-error { background: #ef4444; }
.status-redirect { background: #3b82f6; }

.status-meta {
  display: flex;
  gap: 12px;
  font-size: var(--font-size-xs);
  color: var(--text-color-secondary);
}

.response-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-color-primary);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.response-content {
  flex: 1;
  overflow: auto;
}

.tab-content {
  padding: 8px;
}

.response-body {
  margin: 0;
  padding: 8px;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--bg-color-secondary);
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}

.header-row,
.info-row {
  display: flex;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.header-key,
.info-label {
  font-weight: 500;
  color: var(--text-color-primary);
  min-width: 120px;
}

.header-value,
.info-value {
  color: var(--text-color-secondary);
  word-break: break-all;
}

/* Dark mode */
:global(.dark) .response-body {
  background: var(--bg-color-tertiary);
}
</style>
