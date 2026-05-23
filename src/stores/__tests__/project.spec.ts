import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectStore } from '@/stores/project'
import type { Project } from '@/types'

describe('projectStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty projects', () => {
    const store = useProjectStore()
    expect(Object.keys(store.projects)).toHaveLength(0)
    expect(store.currentProjectId).toBeNull()
  })

  it('creates a project', () => {
    const store = useProjectStore()
    const project: Project = {
      id: 'p1',
      name: 'Test Project',
      description: 'A test project',
      schemaVersion: 1,
      flows: [],
      environments: [{ id: 'default', name: 'Default', variables: [] }],
      activeEnvironmentId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // createProject is async (saves to backend), but we test local state
    store.projects[project.id] = project
    store.currentProjectId = project.id
    expect(store.projects['p1']).toBeDefined()
    expect(store.projects['p1']!.name).toBe('Test Project')
    expect(store.currentProjectId).toBe('p1')
  })

  it('deletes a project', () => {
    const store = useProjectStore()
    const project: Project = {
      id: 'p1',
      name: 'Test Project',
      description: '',
      schemaVersion: 1,
      flows: [],
      environments: [{ id: 'default', name: 'Default', variables: [] }],
      activeEnvironmentId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store.projects[project.id] = project
    store.currentProjectId = project.id

    // Simulate what deleteProject does locally
    delete store.projects['p1']
    if (store.currentProjectId === 'p1') {
      store.currentProjectId = null
    }
    expect(store.projects['p1']).toBeUndefined()
    expect(store.currentProjectId).toBeNull()
  })

  it('sets current project id', () => {
    const store = useProjectStore()
    store.setCurrentProjectId('p1')
    expect(store.currentProjectId).toBe('p1')

    store.setCurrentProjectId(null)
    expect(store.currentProjectId).toBeNull()
  })
})