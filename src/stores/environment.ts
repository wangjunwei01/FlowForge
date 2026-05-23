import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Environment } from '@/types'
import { useProjectStore } from '@/stores/project'

export const useEnvironmentStore = defineStore('environment', () => {
  const environments = ref<Environment[]>([{ id: 'default', name: 'Default', variables: [] }])
  const activeId = ref('default')

  async function addEnvironment(env: Environment): Promise<void> {
    environments.value.push(env)
    await syncToProject()
  }

  async function removeEnvironment(id: string): Promise<void> {
    if (id === 'default') return
    environments.value = environments.value.filter((e) => e.id !== id)
    if (activeId.value === id) {
      activeId.value = 'default'
    }
    await syncToProject()
  }

  function setActive(id: string): void {
    if (environments.value.find((e) => e.id === id)) {
      activeId.value = id
    }
  }

  async function updateEnvironment(id: string, data: Partial<Environment>): Promise<void> {
    const index = environments.value.findIndex((e) => e.id === id)
    if (index === -1) return
    const existing = environments.value[index]!
    environments.value[index] = Object.assign({}, existing, data, { id: existing.id })
    await syncToProject()
  }

  function loadFromProject(envs: Environment[], activeEnvId: string): void {
    environments.value = envs
    activeId.value = activeEnvId
  }

  async function syncToProject(): Promise<void> {
    const projectStore = useProjectStore()
    const projectId = projectStore.currentProjectId
    if (!projectId) return
    const project = projectStore.projects[projectId]
    if (!project) return
    await projectStore.updateProject(projectId, {
      environments: [...environments.value],
      activeEnvironmentId: activeId.value,
    })
  }

  return {
    environments,
    activeId,
    addEnvironment,
    removeEnvironment,
    setActive,
    updateEnvironment,
    loadFromProject,
    syncToProject,
  }
})