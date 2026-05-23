import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFlowStore } from '@/stores/flow'
import type { Flow } from '@/types'
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema'

describe('flowStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty flows', () => {
    const store = useFlowStore()
    expect(Object.keys(store.flows)).toHaveLength(0)
    expect(store.currentFlowId).toBeNull()
  })

  it('sets current flow id', () => {
    const store = useFlowStore()
    store.setCurrentFlowId('f1')
    expect(store.currentFlowId).toBe('f1')

    store.setCurrentFlowId(null)
    expect(store.currentFlowId).toBeNull()
  })

  it('updates flow in memory', () => {
    const store = useFlowStore()
    const flow: Flow = {
      id: 'f1',
      name: 'Test Flow',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      nodes: {},
      edges: {},
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store.flows['f1'] = flow
    store.updateFlow('f1', { name: 'Updated Flow' })
    expect(store.flows['f1'].name).toBe('Updated Flow')
  })

  it('updates flow updatedAt on change', () => {
    const store = useFlowStore()
    const flow: Flow = {
      id: 'f1',
      name: 'Test Flow',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      nodes: {},
      edges: {},
      variables: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    store.flows['f1'] = flow
    store.updateFlow('f1', { name: 'Updated' })
    expect(store.flows['f1'].updatedAt).not.toBe('2024-01-01T00:00:00.000Z')
  })

  it('ignores update for non-existent flow', () => {
    const store = useFlowStore()
    store.updateFlow('nonexistent', { name: 'Ghost' })
    expect(store.flows['nonexistent']).toBeUndefined()
  })
})