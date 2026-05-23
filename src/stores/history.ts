import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface HistoryAction {
  type: 'add_node' | 'remove_node' | 'update_node' | 'move_node' | 'add_edge' | 'remove_edge' | 'batch'
  timestamp: number
  data: unknown
  // For batch operations, contains sub-actions
  actions?: HistoryAction[]
}

const MAX_HISTORY_SIZE = 50

export const useHistoryStore = defineStore('history', () => {
  const undoStack = ref<HistoryAction[]>([])
  const redoStack = ref<HistoryAction[]>([])
  const isBatching = ref(false)
  const batchActions = ref<HistoryAction[]>([])

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function pushAction(action: HistoryAction): void {
    if (isBatching.value) {
      batchActions.value.push(action)
      return
    }

    undoStack.value.push(action)
    // Clear redo stack when new action is pushed
    redoStack.value = []

    // Limit history size
    if (undoStack.value.length > MAX_HISTORY_SIZE) {
      undoStack.value.shift()
    }
  }

  function startBatch(): void {
    isBatching.value = true
    batchActions.value = []
  }

  function endBatch(): void {
    if (!isBatching.value) return

    isBatching.value = false
    if (batchActions.value.length > 0) {
      pushAction({
        type: 'batch',
        timestamp: Date.now(),
        data: null,
        actions: [...batchActions.value],
      })
    }
    batchActions.value = []
  }

  function peekUndo(): HistoryAction | null {
    return undoStack.value.length > 0 ? undoStack.value[undoStack.value.length - 1]! : null
  }

  function popUndo(): HistoryAction | null {
    return undoStack.value.pop() ?? null
  }

  function pushRedo(action: HistoryAction): void {
    redoStack.value.push(action)
    if (redoStack.value.length > MAX_HISTORY_SIZE) {
      redoStack.value.shift()
    }
  }

  function popRedo(): HistoryAction | null {
    return redoStack.value.pop() ?? null
  }

  function clear(): void {
    undoStack.value = []
    redoStack.value = []
    batchActions.value = []
    isBatching.value = false
  }

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    isBatching,
    pushAction,
    startBatch,
    endBatch,
    peekUndo,
    popUndo,
    pushRedo,
    popRedo,
    clear,
  }
})