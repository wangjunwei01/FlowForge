import type { NodeType, AnyNodeData, DataMapping } from './node.types'

export interface Port {
  id: string
  name: string
  type: 'input' | 'output'
  dataType: 'any' | 'json' | 'string' | 'number' | 'boolean' | 'binary' | 'stream'
  required: boolean
}

export interface FlowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: AnyNodeData
  inputs: Port[]
  outputs: Port[]
}

export interface FlowEdge {
  id: string
  source: string
  sourceHandle: string
  target: string
  targetHandle: string
  dataMapping: DataMapping[]
}