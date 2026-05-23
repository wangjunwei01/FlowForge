import type { MockRoute, MockNodeData } from './node.types'

export type { MockRoute, MockNodeData }

export interface MockConfig {
  port: number
  routes: MockRoute[]
  corsEnabled?: boolean
  defaultHeaders?: Record<string, string>
}

export type MockMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export function isMockMethod(value: string): value is MockMethod {
  return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(value)
}