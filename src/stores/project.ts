import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Project {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Record<string, Project>>({})
  const currentProjectId = ref<string | null>(null)

  function createProject(project: Project): void {
    projects.value[project.id] = project
    currentProjectId.value = project.id
  }

  function deleteProject(id: string): void {
    delete projects.value[id]
    if (currentProjectId.value === id) {
      currentProjectId.value = null
    }
  }

  return {
    projects,
    currentProjectId,
    createProject,
    deleteProject,
  }
})
