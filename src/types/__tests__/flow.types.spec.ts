import { describe, it, expect } from 'vitest'
import { toSnapshot, fromSnapshot, createEmptyFlow } from '@/types/flow.types'
import type { Flow } from '@/types'
import { NodeType } from '@/types'

describe('Flow type conversions', () => {
  const createTestFlow = (): Flow => ({
    id: 'flow-1',
    name: 'Test Flow',
    schemaVersion: 1,
    nodes: {
      'node-1': {
        id: 'node-1',
        type: NodeType.HTTP_REQUEST,
        position: { x: 100, y: 200 },
        data: { label: 'HTTP Request', method: 'GET', url: 'https://example.com', headers: {}, params: {} },
        inputs: [],
        outputs: [],
      },
      'node-2': {
        id: 'node-2',
        type: NodeType.SCRIPT,
        position: { x: 300, y: 200 },
        data: { label: 'Script', language: 'javascript', code: 'return input;' },
        inputs: [],
        outputs: [],
      },
    },
    edges: {
      'edge-1': {
        id: 'edge-1',
        source: 'node-1',
        sourceHandle: 'out-1',
        target: 'node-2',
        targetHandle: 'in-1',
        dataMapping: [],
      },
    },
    variables: [{ key: 'baseUrl', value: 'https://api.example.com', enabled: true }],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  })

  describe('toSnapshot', () => {
    it('should convert Flow Record to FlowSnapshot arrays', () => {
      const flow = createTestFlow()
      const snapshot = toSnapshot(flow)

      expect(snapshot.id).toBe('flow-1')
      expect(snapshot.name).toBe('Test Flow')
      expect(snapshot.schemaVersion).toBe(1)
      expect(snapshot.nodes).toHaveLength(2)
      expect(snapshot.edges).toHaveLength(1)
      expect(snapshot.variables).toHaveLength(1)
    })

    it('should preserve node data in snapshot', () => {
      const flow = createTestFlow()
      const snapshot = toSnapshot(flow)

      const httpNode = snapshot.nodes.find((n) => n.id === 'node-1')
      expect(httpNode).toBeDefined()
      expect(httpNode!.type).toBe(NodeType.HTTP_REQUEST)
      expect(httpNode!.position).toEqual({ x: 100, y: 200 })
    })

    it('should handle empty nodes and edges', () => {
      const flow = createEmptyFlow('test-id', 'Empty Flow')
      const snapshot = toSnapshot(flow)

      expect(snapshot.nodes).toHaveLength(0)
      expect(snapshot.edges).toHaveLength(0)
    })
  })

  describe('fromSnapshot', () => {
    it('should convert FlowSnapshot arrays back to Flow Record', () => {
      const flow = createTestFlow()
      const snapshot = toSnapshot(flow)
      const restored = fromSnapshot(snapshot)

      expect(restored.id).toBe('flow-1')
      expect(restored.name).toBe('Test Flow')
      expect(Object.keys(restored.nodes)).toHaveLength(2)
      expect(Object.keys(restored.edges)).toHaveLength(1)
    })

    it('should reconstruct nodes as Record keyed by id', () => {
      const flow = createTestFlow()
      const snapshot = toSnapshot(flow)
      const restored = fromSnapshot(snapshot)

      expect(restored.nodes['node-1']).toBeDefined()
      expect(restored.nodes['node-2']).toBeDefined()
      expect(restored.nodes['node-1']!.type).toBe(NodeType.HTTP_REQUEST)
    })

    it('should reconstruct edges as Record keyed by id', () => {
      const flow = createTestFlow()
      const snapshot = toSnapshot(flow)
      const restored = fromSnapshot(snapshot)

      expect(restored.edges['edge-1']).toBeDefined()
      expect(restored.edges['edge-1']!.source).toBe('node-1')
    })
  })

  describe('roundtrip', () => {
    it('should be lossless: Flow -> Snapshot -> Flow', () => {
      const flow = createTestFlow()
      const snapshot = toSnapshot(flow)
      const restored = fromSnapshot(snapshot)

      expect(restored.id).toBe(flow.id)
      expect(restored.name).toBe(flow.name)
      expect(restored.schemaVersion).toBe(flow.schemaVersion)
      expect(restored.createdAt).toBe(flow.createdAt)
      expect(restored.updatedAt).toBe(flow.updatedAt)
      expect(Object.keys(restored.nodes)).toEqual(Object.keys(flow.nodes))
      expect(Object.keys(restored.edges)).toEqual(Object.keys(flow.edges))
    })

    it('should preserve variables through roundtrip', () => {
      const flow = createTestFlow()
      const restored = fromSnapshot(toSnapshot(flow))

      expect(restored.variables).toEqual(flow.variables)
    })
  })
})

describe('createEmptyFlow', () => {
  it('should create a flow with empty nodes and edges', () => {
    const flow = createEmptyFlow('id-1', 'New Flow')

    expect(flow.id).toBe('id-1')
    expect(flow.name).toBe('New Flow')
    expect(flow.schemaVersion).toBe(1)
    expect(Object.keys(flow.nodes)).toHaveLength(0)
    expect(Object.keys(flow.edges)).toHaveLength(0)
    expect(flow.variables).toHaveLength(0)
  })
})