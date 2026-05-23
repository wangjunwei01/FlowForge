<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import { useI18n } from 'vue-i18n'
import { useFlowStore } from './stores/flow'
import { useTabStore } from './stores/tabs'
import { useSettingsStore } from './stores/settings'
import { createEmptyFlow } from './types'
import BaseLayout from './components/layout/BaseLayout.vue'

const { initTheme } = useTheme()
const { locale } = useI18n()
const flowStore = useFlowStore()
const tabStore = useTabStore()
const settingsStore = useSettingsStore()

onMounted(async () => {
  // Initialize theme and load settings (including locale)
  initTheme()
  await settingsStore.loadSettings()

  // Sync locale from settings to i18n
  locale.value = settingsStore.locale

  // Create default flow
  const flow = createEmptyFlow('default-flow', 'Default Flow')
  flowStore.flows[flow.id] = flow
  flowStore.currentFlowId = flow.id

  tabStore.openTab({
    id: flow.id,
    flowId: flow.id,
    title: flow.name,
    isDirty: false,
  })

  console.log('App mounted, flow created:', flow.id)
})
</script>

<template>
  <BaseLayout />
</template>

<style>
@import './assets/styles/main.css';
</style>
