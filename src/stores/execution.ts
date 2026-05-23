import { defineStore } from 'pinia'
import { ref } from 'vue'

type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'paused'

export interface ExecutionLog {
  nodeId: string
  nodeName: string
  status: 'success' | 'failed' | 'skipped'
  duration: number
  timestamp: number
  error?: string
}

export const useExecutionStore = defineStore('execution', () => {
  const status = ref<ExecutionStatus>('idle')
  const logs = ref<ExecutionLog[]>([])
  const startTime = ref<number | null>(null)
  const endTime = ref<number | null>(null)

  function reset(): void {
    status.value = 'idle'
    logs.value = []
    startTime.value = null
    endTime.value = null
  }

  function addLog(log: ExecutionLog): void {
    logs.value.push(log)
  }

  return {
    status,
    logs,
    startTime,
    endTime,
    reset,
    addLog,
  }
})
