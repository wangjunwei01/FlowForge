import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAutosaveStore = defineStore('autosave', () => {
  const lastSavedAt = ref<number>(0)
  const hasUnsavedChanges = ref(false)
  const isSaving = ref(false)
  const draftFlowId = ref<string | null>(null)

  function markDirty(): void {
    hasUnsavedChanges.value = true
  }

  function markClean(): void {
    hasUnsavedChanges.value = false
    lastSavedAt.value = Date.now()
  }

  function setSaving(value: boolean): void {
    isSaving.value = value
  }

  function setDraftFlowId(id: string | null): void {
    draftFlowId.value = id
  }

  return {
    lastSavedAt,
    hasUnsavedChanges,
    isSaving,
    draftFlowId,
    markDirty,
    markClean,
    setSaving,
    setDraftFlowId,
  }
})