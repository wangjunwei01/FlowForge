import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCanvasStore } from '@/stores/canvas'
import type { FlowNode, FlowEdge } from '@/stores/canvas'

describe('canvasStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add and remove nodes', () => {
    const store = useCanvasStore()
    const node: FlowNode = { id: '1', type: 'http-request', position: { x: 0, y: 0 }, data: {} }
    store.addNode(node)
    expect(store.nodes['1']).toEqual(node)
    store.removeNode('1')
    expect(store.nodes['1']).toBeUndefined()
  })

  it('should add and remove edges', () => {
    const store = useCanvasStore()
    const edge: FlowEdge = { id: 'e1', source: '1', target: '2' }
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
