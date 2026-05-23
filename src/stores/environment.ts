import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Environment {
  id: string
  name: string
  variables: Record<string, string>
}

export const useEnvironmentStore = defineStore('environment', () => {
  const environments = ref<Environment[]>([{ id: 'default', name: 'Default', variables: {} }])
  const activeId = ref('default')

  function addEnvironment(env: Environment): void {
    environments.value.push(env)
  }

  function removeEnvironment(id: string): void {
    if (id === 'default') return
    environments.value = environments.value.filter((e) => e.id !== id)
    if (activeId.value === id) {
      activeId.value = 'default'
    }
  }

  function setActive(id: string): void {
    if (environments.value.find((e) => e.id === id)) {
      activeId.value = id
    }
  }

  return {
    environments,
    activeId,
    addEnvironment,
    removeEnvironment,
    setActive,
  }
})
