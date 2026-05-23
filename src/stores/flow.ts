import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Flow {
  id: string
  name: string
  description: string
  nodes: Record<string, unknown>
  edges: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

export const useFlowStore = defineStore('flow', () => {
  const flows = ref<Record<string, Flow>>({})
  const currentFlowId = ref<string | null>(null)

  function createFlow(flow: Flow): void {
    flows.value[flow.id] = flow
    currentFlowId.value = flow.id
  }

  function deleteFlow(id: string): void {
    delete flows.value[id]
    if (currentFlowId.value === id) {
      currentFlowId.value = null
    }
  }

  function updateFlow(id: string, data: Partial<Flow>): void {
    if (flows.value[id]) {
      flows.value[id] = { ...flows.value[id], ...data, updatedAt: Date.now() }
    }
  }

  return {
    flows,
    currentFlowId,
    createFlow,
    deleteFlow,
    updateFlow,
  }
})
