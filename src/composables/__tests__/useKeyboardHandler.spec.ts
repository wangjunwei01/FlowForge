import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useKeyboardHandler } from '@/composables/useKeyboardHandler'
import { useCanvasStore } from '@/stores/canvas'
import { useFlowStore } from '@/stores/flow'
import { NodeType } from '@/types'

// Mock clipboard API
Object.defineProperty(navigator, 'platform', {
  value: 'Win32',
  writable: true,
})

describe('useKeyboardHandler', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('handleKeyDown', () => {
    it('should return false for unhandled keys', () => {
      const handler = useKeyboardHandler()
      const event = new KeyboardEvent('keydown', { key: 'a' })
      const result = handler.handleKeyDown(event)
      expect(result).toBe(false)
    })

    it('should handle Delete key', () => {
      const canvasStore = useCanvasStore()
      const flowStore = useFlowStore()

      // Setup: create a flow with a node
      flowStore.flows['test-flow'] = {
        id: 'test-flow',
        name: 'Test Flow',
        nodes: {
          'node-1': {
            id: 'node-1',
            type: NodeType.HTTP_REQUEST,
            position: { x: 0, y: 0 },
            data: { label: 'Test', method: 'GET', url: '', headers: {}, params: {} },
            inputs: [],
            outputs: [],
          },
        },
        edges: {},
        variables: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schemaVersion: 1,
      }
      flowStore.currentFlowId = 'test-flow'
      canvasStore.selectedNodeIds.add('node-1')

      const handler = useKeyboardHandler()
      const event = new KeyboardEvent('keydown', { key: 'Delete' })
      const result = handler.handleKeyDown(event)

      expect(result).toBe(true)
      expect(canvasStore.selectedNodeIds.size).toBe(0)
    })

    it('should handle Ctrl+A for select all', () => {
      const canvasStore = useCanvasStore()
      const flowStore = useFlowStore()

      // Setup
      flowStore.flows['test-flow'] = {
        id: 'test-flow',
        name: 'Test Flow',
        nodes: {
          'node-1': {
            id: 'node-1',
            type: NodeType.HTTP_REQUEST,
            position: { x: 0, y: 0 },
            data: { label: 'Test', method: 'GET', url: '', headers: {}, params: {} },
            inputs: [],
            outputs: [],
          },
          'node-2': {
            id: 'node-2',
            type: NodeType.HTTP_REQUEST,
            position: { x: 100, y: 100 },
            data: { label: 'Test 2', method: 'GET', url: '', headers: {}, params: {} },
            inputs: [],
            outputs: [],
          },
        },
        edges: {},
        variables: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schemaVersion: 1,
      }
      flowStore.currentFlowId = 'test-flow'

      const handler = useKeyboardHandler()
      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true })
      const result = handler.handleKeyDown(event)

      expect(result).toBe(true)
      expect(canvasStore.selectedNodeIds.size).toBe(2)
    })

    it('should ignore shortcuts when typing in input field', () => {
      const handler = useKeyboardHandler()

      // Simulate typing in input
      const input = document.createElement('input')
      const event = new KeyboardEvent('keydown', { key: 'Delete' })
      Object.defineProperty(event, 'target', { value: input })

      const result = handler.handleKeyDown(event)
      expect(result).toBe(false)
    })
  })
})
