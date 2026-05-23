import type { Environment } from './mapping.types'

export interface Project {
  id: string
  name: string
  description?: string
  schemaVersion: number
  flows: string[]
  environments: Environment[]
  activeEnvironmentId: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMeta {
  id: string
  name: string
  description?: string
  flowCount: number
  createdAt: string
  updatedAt: string
}