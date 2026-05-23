import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCanvasStore } from '@/stores/canvas'
import type { FlowNode, FlowEdge } from '@/types'
import { NodeType } from '@/types'

describe('canvasStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add and remove nodes', () => {
    const store = useCanvasStore()
    const node: FlowNode = {
      id: '1',
      type: NodeType.HTTP_REQUEST,
      position: { x: 0, y: 0 },
      data: { label: 'Test Node', method: 'GET', url: 'https://example.com', headers: {}, params: {} },
      inputs: [],
      outputs: [],
    }
    store.addNode(node)
    expect(store.nodes['1']).toEqual(node)
    store.removeNode('1')
    expect(store.nodes['1']).toBeUndefined()
  })

  it('should add and remove edges', () => {
    const store = useCanvasStore()
    const edge: FlowEdge = {
      id: 'e1',
      source: '1',
      sourceHandle: 'out-1',
      target: '2',
      targetHandle: 'in-1',
      dataMapping: [],
    }
    store.addEdge(edge)
    expect(store.edges['e1']).toEqual(edge)
    store.removeEdge('e1')
    expect(store.edges['e1']).toBeUndefined()
  })

  it('should clear selection', () => {
    const store = useCanvasStore()
    store.selectedNodeIds.add('n1')
    store.selectedEdgeIds.add('e1')
    store.clearSelection()
    expect(store.selectedNodeIds.size).toBe(0)
    expect(store.selectedEdgeIds.size).toBe(0)
  })
})