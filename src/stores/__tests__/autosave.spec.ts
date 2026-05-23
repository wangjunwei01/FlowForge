import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAutosaveStore } from '@/stores/autosave'

describe('autosaveStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with no unsaved changes', () => {
    const store = useAutosaveStore()
    expect(store.hasUnsavedChanges).toBe(false)
    expect(store.isSaving).toBe(false)
    expect(store.draftFlowId).toBeNull()
    expect(store.lastSavedAt).toBe(0)
  })

  it('marks dirty and clean', () => {
    const store = useAutosaveStore()
    store.markDirty()
    expect(store.hasUnsavedChanges).toBe(true)

    store.markClean()
    expect(store.hasUnsavedChanges).toBe(false)
    expect(store.lastSavedAt).toBeGreaterThan(0)
  })

  it('sets saving state', () => {
    const store = useAutosaveStore()
    store.setSaving(true)
    expect(store.isSaving).toBe(true)

    store.setSaving(false)
    expect(store.isSaving).toBe(false)
  })

  it('sets draft flow id', () => {
    const store = useAutosaveStore()
    store.setDraftFlowId('flow-1')
    expect(store.draftFlowId).toBe('flow-1')

    store.setDraftFlowId(null)
    expect(store.draftFlowId).toBeNull()
  })
})