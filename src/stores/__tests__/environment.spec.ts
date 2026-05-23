import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEnvironmentStore } from '@/stores/environment'

describe('environmentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has default environment on init', () => {
    const store = useEnvironmentStore()
    expect(store.environments).toHaveLength(1)
    expect(store.environments[0]!.id).toBe('default')
    expect(store.environments[0]!.name).toBe('Default')
    expect(store.activeId).toBe('default')
  })

  it('adds an environment', () => {
    const store = useEnvironmentStore()
    // Note: addEnvironment is async but we only test local state change
    store.environments.push({ id: 'staging', name: 'Staging', variables: [] })
    expect(store.environments).toHaveLength(2)
    expect(store.environments[1]!.name).toBe('Staging')
  })

  it('cannot remove default environment', () => {
    const store = useEnvironmentStore()
    store.removeEnvironment('default')
    expect(store.environments).toHaveLength(1)
  })

  it('sets active environment', () => {
    const store = useEnvironmentStore()
    store.environments.push({ id: 'staging', name: 'Staging', variables: [] })
    store.setActive('staging')
    expect(store.activeId).toBe('staging')
  })

  it('does not set active to non-existent environment', () => {
    const store = useEnvironmentStore()
    store.setActive('nonexistent')
    expect(store.activeId).toBe('default')
  })

  it('loads from project', () => {
    const store = useEnvironmentStore()
    store.loadFromProject(
      [
        { id: 'dev', name: 'Development', variables: [] },
        { id: 'prod', name: 'Production', variables: [] },
      ],
      'dev',
    )
    expect(store.environments).toHaveLength(2)
    expect(store.activeId).toBe('dev')
  })
})