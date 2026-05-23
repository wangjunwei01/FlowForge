import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ExecutionRecord } from '@/types'

type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'paused'

export const useExecutionStore = defineStore('execution', () => {
  const status = ref<ExecutionStatus>('idle')
  const logs = ref<ExecutionRecord[]>([])
  const startTime = ref<string | null>(null)
  const endTime = ref<string | null>(null)

  function reset(): void {
    status.value = 'idle'
    logs.value = []
    startTime.value = null
    endTime.value = null
  }

  function addLog(record: ExecutionRecord): void {
    logs.value.push(record)
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