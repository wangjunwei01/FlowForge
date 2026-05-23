/**
 * High-level file service that wraps LocalProvider with migration support,
 * backup/rollback, and error handling.
 */

import { getLocalProvider } from '@/providers'
import { migrateWithRollback, needsMigration } from '@/services/migration.service'
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema'
import type { Flow, Project, ExecutionRecord, NodeDisplayConfig, ProjectMeta, FlowMeta } from '@/types'

const provider = getLocalProvider()

// ── Project operations ──

export async function loadProject(id: string): Promise<Project> {
  const project = await provider.getProject(id)
  if (project.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const result = migrateWithRollback(project, project.schemaVersion)
    if (result.success && result.data) {
      return result.data as Project
    }
    console.warn(`Migration failed for project ${id}: ${result.error}`)
  }
  return project
}

export async function saveProject(project: Project): Promise<void> {
  const toSave = { ...project, updatedAt: new Date().toISOString() }
  await provider.saveProject(toSave)
}

export async function deleteProject(id: string): Promise<void> {
  await provider.deleteProject(id)
}

export async function listProjects(): Promise<ProjectMeta[]> {
  return await provider.listProjects()
}

// ── Flow operations ──

export async function loadFlow(projectId: string, id: string): Promise<Flow> {
  const flow = await provider.getFlow(projectId, id)
  if (flow.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const result = migrateWithRollback(flow, flow.schemaVersion)
    if (result.success && result.data) {
      return result.data as Flow
    }
    console.warn(`Migration failed for flow ${id}: ${result.error}`)
  }
  return flow
}

export async function saveFlow(projectId: string, flow: Flow): Promise<void> {
  const toSave = { ...flow, updatedAt: new Date().toISOString(), schemaVersion: CURRENT_SCHEMA_VERSION }
  await provider.saveFlow(projectId, toSave)
}

export async function deleteFlow(projectId: string, id: string): Promise<void> {
  await provider.deleteFlow(projectId, id)
}

export async function listFlows(projectId: string): Promise<FlowMeta[]> {
  return await provider.listFlows(projectId)
}

// ── Execution history ──

export async function saveExecution(projectId: string, execution: ExecutionRecord): Promise<void> {
  await provider.saveExecution(projectId, execution)
}

export async function getExecutions(projectId: string, flowId: string, limit?: number): Promise<ExecutionRecord[]> {
  return await provider.getExecutions(projectId, flowId, limit)
}

// ── Display config ──

export async function saveDisplayConfig(projectId: string, nodeId: string, config: NodeDisplayConfig): Promise<void> {
  await provider.saveDisplayConfig(projectId, nodeId, config)
}

export async function getDisplayConfig(projectId: string, nodeId: string): Promise<NodeDisplayConfig | null> {
  return await provider.getDisplayConfig(projectId, nodeId)
}

// ── Settings ──

export async function readSetting(key: string): Promise<string | null> {
  return await provider.readSetting(key)
}

export async function writeSetting(key: string, value: string): Promise<void> {
  await provider.writeSetting(key, value)
}

// ── Draft operations (crash recovery) ──

export async function saveDraft(projectId: string, flow: Flow): Promise<void> {
  await provider.saveDraft(projectId, flow)
}

export async function loadDraft(projectId: string, flowId: string): Promise<Flow | null> {
  return await provider.loadDraft(projectId, flowId)
}

export async function deleteDraft(projectId: string, flowId: string): Promise<void> {
  await provider.deleteDraft(projectId, flowId)
}

// ── Migration check ──

export function checkNeedsMigration(data: { schemaVersion: number }): boolean {
  return needsMigration(data)
}