<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFlowStore } from '@/stores/flow'
import { useTabStore } from '@/stores/tabs'
import { createEmptyFlow } from '@/types'

const router = useRouter()
const flowStore = useFlowStore()
const tabStore = useTabStore()

onMounted(() => {
  // Create a default flow for testing
  const flow = createEmptyFlow('default-flow', 'Default Flow')
  flowStore.flows[flow.id] = flow
  flowStore.currentFlowId = flow.id

  // Open a tab for this flow
  tabStore.openTab({
    id: flow.id,
    flowId: flow.id,
    title: flow.name,
    isDirty: false,
  })

  // Navigate to flow editor
  router.replace(`/flow/${flow.id}`)
})
</script>

<template>
  <div class="home-view">
    <p>Loading...</p>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>