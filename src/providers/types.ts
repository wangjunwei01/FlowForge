import type { Flow, FlowMeta, Project, ProjectMeta, ExecutionRecord, NodeDisplayConfig } from '@/types'

export interface DataProvider {
  // Flow operations
  getFlow(projectId: string, id: string): Promise<Flow>
  saveFlow(projectId: string, flow: Flow): Promise<void>
  deleteFlow(projectId: string, id: string): Promise<void>
  listFlows(projectId: string): Promise<FlowMeta[]>

  // Project operations
  getProject(id: string): Promise<Project>
  saveProject(project: Project): Promise<void>
  deleteProject(id: string): Promise<void>
  listProjects(): Promise<ProjectMeta[]>

  // Execution history
  saveExecution(projectId: string, execution: ExecutionRecord): Promise<void>
  getExecutions(projectId: string, flowId: string, limit?: number): Promise<ExecutionRecord[]>

  // Display config
  saveDisplayConfig(projectId: string, nodeId: string, config: NodeDisplayConfig): Promise<void>
  getDisplayConfig(projectId: string, nodeId: string): Promise<NodeDisplayConfig | null>

  // Settings
  readSetting(key: string): Promise<string | null>
  writeSetting(key: string, value: string): Promise<void>

  // Draft (crash recovery)
  saveDraft(projectId: string, flow: Flow): Promise<void>
  loadDraft(projectId: string, flowId: string): Promise<Flow | null>
  deleteDraft(projectId: string, flowId: string): Promise<void>

  }