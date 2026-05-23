import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Flow } from '@/types'
import {
  loadFlow,
  saveFlow,
  deleteFlow as deleteFlowFromStorage,
  listFlows,
} from '@/services/file.service'

export const useFlowStore = defineStore('flow', () => {
  const flows = ref<Record<string, Flow>>({})
  const currentFlowId = ref<string | null>(null)
  const loaded = ref(false)

  async function loadProjectFlows(projectId: string): Promise<void> {
    try {
      const flowList = await listFlows(projectId)
      for (const meta of flowList) {
        try {
          const flow = await loadFlow(projectId, meta.id)
          flows.value[flow.id] = flow
        } catch {
          console.warn(`Failed to load flow ${meta.id}`)
        }
      }
      loaded.value = true
    } catch (error) {
      console.error('Failed to load flows:', error)
    }
  }

  async function createFlow(projectId: string, flow: Flow): Promise<void> {
    flows.value[flow.id] = flow
    currentFlowId.value = flow.id
    try {
      await saveFlow(projectId, flow)
    } catch (error) {
      console.error('Failed to save flow:', error)
    }
  }

  async function deleteFlow(projectId: string, id: string): Promise<void> {
    delete flows.value[id]
    if (currentFlowId.value === id) {
      currentFlowId.value = null
    }
    try {
      await deleteFlowFromStorage(projectId, id)
    } catch (error) {
      console.error('Failed to delete flow:', error)
    }
  }

  function updateFlow(id: string, data: Partial<Flow>): void {
    if (flows.value[id]) {
      flows.value[id] = { ...flows.value[id], ...data, updatedAt: new Date().toISOString() }
    }
  }

  function setCurrentFlowId(id: string | null): void {
    currentFlowId.value = id
  }

  return {
    flows,
    currentFlowId,
    loaded,
    loadProjectFlows,
    createFlow,
    deleteFlow,
    updateFlow,
    setCurrentFlowId,
  }
})