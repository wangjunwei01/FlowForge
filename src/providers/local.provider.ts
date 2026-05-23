import { invoke } from '@tauri-apps/api/core'
import type { Flow, FlowMeta, Project, ProjectMeta, ExecutionRecord, NodeDisplayConfig } from '@/types'
import type { DataProvider } from './types'

function isAppError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

export class LocalProvider implements DataProvider {
  // 流程操作
  async getFlow(projectId: string, id: string): Promise<Flow> {
    return await invoke<Flow>('read_flow', { projectId, flowId: id })
  }

  async saveFlow(projectId: string, flow: Flow): Promise<void> {
    await invoke('write_flow', { projectId, flow })
  }

  async deleteFlow(projectId: string, id: string): Promise<void> {
    await invoke('delete_flow', { projectId, flowId: id })
  }

  async listFlows(projectId: string): Promise<FlowMeta[]> {
    const flows = await invoke<Flow[]>('list_flows', { projectId })
    return flows.map((f) => ({
      id: f.id,
      name: f.name,
      schemaVersion: f.schemaVersion,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      nodeCount: Object.keys(f.nodes).length,
    }))
  }

  // 项目操作
  async getProject(id: string): Promise<Project> {
    return await invoke<Project>('read_project', { projectId: id })
  }

  async saveProject(project: Project): Promise<void> {
    await invoke('write_project', { project })
  }

  async deleteProject(id: string): Promise<void> {
    await invoke('delete_project', { projectId: id })
  }

  async listProjects(): Promise<ProjectMeta[]> {
    const projects = await invoke<Project[]>('list_projects')
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      flowCount: p.flows.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))
  }

  // Execution history
  async saveExecution(projectId: string, execution: ExecutionRecord): Promise<void> {
    await invoke('save_execution', { projectId, execution })
  }

  async getExecutions(projectId: string, flowId: string, limit?: number): Promise<ExecutionRecord[]> {
    return await invoke<ExecutionRecord[]>('list_executions', { projectId, flowId, limit })
  }

  // Display config
  async saveDisplayConfig(projectId: string, nodeId: string, config: NodeDisplayConfig): Promise<void> {
    await invoke('save_display_config', { projectId, nodeId, config })
  }

  async getDisplayConfig(projectId: string, nodeId: string): Promise<NodeDisplayConfig | null> {
    try {
      return await invoke<NodeDisplayConfig>('get_display_config', { projectId, nodeId })
    } catch (error) {
      if (isAppError(error) && (error as { code: string }).code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  // 设置
  async readSetting(key: string): Promise<string | null> {
    try {
      return await invoke<string>('read_setting', { key })
    } catch (error) {
      if (isAppError(error) && (error as { code: string }).code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  async writeSetting(key: string, value: string): Promise<void> {
    await invoke('write_setting', { key, value })
  }

  // 草稿操作（崩溃恢复）
  async saveDraft(projectId: string, flow: Flow): Promise<void> {
    await invoke('save_draft', { projectId, flow })
  }

  async loadDraft(projectId: string, flowId: string): Promise<Flow | null> {
    try {
      return await invoke<Flow>('load_draft', { projectId, flowId })
    } catch (error) {
      if (isAppError(error) && (error as { code: string }).code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  async deleteDraft(projectId: string, flowId: string): Promise<void> {
    await invoke('delete_draft', { projectId, flowId })
  }

  }

let providerInstance: LocalProvider | null = null

export function getLocalProvider(): LocalProvider {
  if (!providerInstance) {
    providerInstance = new LocalProvider()
  }
  return providerInstance
}