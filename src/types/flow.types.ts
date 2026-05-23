import type { FlowNode, FlowEdge } from './edge.types'
import type { Variable } from './mapping.types'
import { CURRENT_SCHEMA_VERSION } from '@/constants/schema'

export interface FlowMeta {
  id: string
  name: string
  description?: string
  schemaVersion: number
  createdAt: string
  updatedAt: string
  nodeCount: number
}

export interface Flow {
  id: string
  name: string
  schemaVersion: number
  nodes: Record<string, FlowNode>
  edges: Record<string, FlowEdge>
  variables: Variable[]
  createdAt: string
  updatedAt: string
}

export interface FlowSnapshot {
  id: string
  name: string
  schemaVersion: number
  nodes: FlowNode[]
  edges: FlowEdge[]
  variables: Variable[]
  createdAt: string
  updatedAt: string
}

export interface HistoryState {
  past: Flow[]
  present: Flow
  future: Flow[]
}

export function toSnapshot(flow: Flow): FlowSnapshot {
  return {
    id: flow.id,
    name: flow.name,
    schemaVersion: flow.schemaVersion,
    nodes: Object.values(flow.nodes),
    edges: Object.values(flow.edges),
    variables: flow.variables,
    createdAt: flow.createdAt,
    updatedAt: flow.updatedAt,
  }
}

export function fromSnapshot(snapshot: FlowSnapshot): Flow {
  const nodes: Record<string, FlowNode> = {}
  for (const node of snapshot.nodes) {
    nodes[node.id] = node
  }
  const edges: Record<string, FlowEdge> = {}
  for (const edge of snapshot.edges) {
    edges[edge.id] = edge
  }
  return {
    id: snapshot.id,
    name: snapshot.name,
    schemaVersion: snapshot.schemaVersion,
    nodes,
    edges,
    variables: snapshot.variables,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  }
}

export function createEmptyFlow(id: string, name: string): Flow {
  return {
    id,
    name,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    nodes: {},
    edges: {},
    variables: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}