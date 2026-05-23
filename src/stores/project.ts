import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '@/types'
import {
  loadProject,
  saveProject,
  deleteProject as deleteProjectFromStorage,
  listProjects,
} from '@/services/file.service'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Record<string, Project>>({})
  const currentProjectId = ref<string | null>(null)
  let loaded = false

  async function loadProjects(): Promise<void> {
    if (loaded) return
    try {
      const projectList = await listProjects()
      for (const meta of projectList) {
        try {
          const project = await loadProject(meta.id)
          projects.value[project.id] = project
        } catch {
          console.warn(`Failed to load project ${meta.id}`)
        }
      }
      loaded = true
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  async function createProject(project: Project): Promise<void> {
    projects.value[project.id] = project
    currentProjectId.value = project.id
    try {
      await saveProject(project)
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  async function deleteProject(id: string): Promise<void> {
    delete projects.value[id]
    if (currentProjectId.value === id) {
      currentProjectId.value = null
    }
    try {
      await deleteProjectFromStorage(id)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  async function updateProject(id: string, data: Partial<Project>): Promise<void> {
    if (projects.value[id]) {
      projects.value[id] = { ...projects.value[id], ...data, updatedAt: new Date().toISOString() }
      try {
        await saveProject(projects.value[id])
      } catch (error) {
        console.error('Failed to save project:', error)
      }
    }
  }

  async function loadProjectById(id: string): Promise<void> {
    try {
      const project = await loadProject(id)
      projects.value[project.id] = project
    } catch (error) {
      console.error(`Failed to load project ${id}:`, error)
    }
  }

  function setCurrentProjectId(id: string | null): void {
    currentProjectId.value = id
  }

  return {
    projects,
    currentProjectId,
    loaded,
    loadProjects,
    createProject,
    deleteProject,
    updateProject,
    loadProjectById,
    setCurrentProjectId,
  }
})