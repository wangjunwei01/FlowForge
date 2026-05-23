import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCanvasStore } from '@/stores/canvas'
import { NodeType } from '@/types'

describe('canvasStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty nodes and edges', () => {
    const store = useCanvasStore()
    expect(Object.keys(store.nodes)).toHaveLength(0)
    expect(Object.keys(store.edges)).toHaveLength(0)
    expect(store.selectedNodeIds.size).toBe(0)
    expect(store.selectedEdgeIds.size).toBe(0)
  })

  it('adds a node', () => {
    const store = useCanvasStore()
    const node = {
      id: 'node-1',
      type: NodeType.HTTP_REQUEST,
      position: { x: 100, y: 100 },
      data: { label: 'Test', method: 'GET', url: '', headers: {}, params: {} },
      inputs: [],
      outputs: [],
    }
    store.addNode(node)
    expect(store.nodes['node-1']).toEqual(node)
  })

  it('removes a node', () => {
    const store = useCanvasStore()
    const node = {
      id: 'node-1',
      type: NodeType.HTTP_REQUEST,
      position: { x: 100, y: 100 },
      data: { label: 'Test', method: 'GET', url: '', headers: {}, params: {} },
      inputs: [],
      outputs: [],
    }
    store.addNode(node)
    store.removeNode('node-1')
    expect(store.nodes['node-1']).toBeUndefined()
  })

  it('updates a node', () => {
    const store = useCanvasStore()
    const node = {
      id: 'node-1',
      type: NodeType.HTTP_REQUEST,
      position: { x: 100, y: 100 },
      data: { label: 'Test', method: 'GET', url: '', headers: {}, params: {} },
      inputs: [],
      outputs: [],
    }
    store.addNode(node)
    store.updateNode('node-1', { position: { x: 200, y: 200 } })
    expect(store.nodes['node-1']?.position).toEqual({ x: 200, y: 200 })
  })

  it('adds an edge', () => {
    const store = useCanvasStore()
    const edge = {
      id: 'edge-1',
      source: 'node-1',
      sourceHandle: 'output',
      target: 'node-2',
      targetHandle: 'input',
      dataMapping: [],
    }
    store.addEdge(edge)
    expect(store.edges['edge-1']).toEqual(edge)
  })

  it('removes an edge', () => {
    const store = useCanvasStore()
    const edge = {
      id: 'edge-1',
      source: 'node-1',
      sourceHandle: 'output',
      target: 'node-2',
      targetHandle: 'input',
      dataMapping: [],
    }
    store.addEdge(edge)
    store.removeEdge('edge-1')
    expect(store.edges['edge-1']).toBeUndefined()
  })

  it('clears selection', () => {
    const store = useCanvasStore()
    store.selectedNodeIds.add('node-1')
    store.selectedEdgeIds.add('edge-1')
    store.clearSelection()
    expect(store.selectedNodeIds.size).toBe(0)
    expect(store.selectedEdgeIds.size).toBe(0)
  })
})