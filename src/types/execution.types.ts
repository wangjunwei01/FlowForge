import type { Environment } from './mapping.types'
import type { Cookie } from './cookie.types'

export type ErrorStrategy = 'abort' | 'skip' | 'retry'

export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryOn: number[]
}

export interface ResponseData {
  raw: unknown
  formatted?: Record<string, unknown>
  displayConfig?: NodeDisplayConfig
  truncated?: boolean
  sizeBytes?: number
}

export interface NodeExecutionResult {
  nodeId: string
  status: 'success' | 'failed' | 'skipped'
  response?: ResponseData
  error?: string
  duration: number
}

export interface ExecutionRecord {
  id: string
  flowId: string
  status: 'success' | 'failed' | 'partial'
  startTime: string
  endTime: string
  nodeResults: Record<string, NodeExecutionResult>
}

export interface ExecutionContext {
  variables: Record<string, string>
  nodeResults: Record<string, unknown>
  cookies: Record<string, Cookie[]>
  environment: Environment
}

export interface Breakpoint {
  nodeId: string
  condition?: string
  enabled: boolean
}

export interface DebugState {
  breakpoints: Breakpoint[]
  currentNodeId: string | null
  callStack: string[]
  nodeResults: Record<string, NodeExecutionResult>
}

export interface DebugNodeResult {
  nodeId: string
  inputData: unknown
  outputData: unknown
  duration: number
}

export interface FieldDisplayConfig {
  field: string
  label: string
  format?: 'raw' | 'datetime' | 'number' | 'boolean' | 'custom'
  formatOptions?: {
    dateFormat?: string
    numberFormat?: string
    customTemplate?: string
  }
  visible: boolean
  order: number
}

export interface NodeDisplayConfig {
  nodeId: string
  viewMode: 'raw' | 'formatted' | 'mapped'
  fields: FieldDisplayConfig[]
}