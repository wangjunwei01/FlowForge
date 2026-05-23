import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHistoryStore, type HistoryAction } from '@/stores/history'

describe('history store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('pushAction', () => {
    it('should push action to undo stack', () => {
      const store = useHistoryStore()
      const action: HistoryAction = {
        type: 'add_node',
        timestamp: Date.now(),
        data: { node: { id: 'test' } },
      }

      store.pushAction(action)

      expect(store.undoStack).toHaveLength(1)
      expect(store.undoStack[0]).toEqual(action)
    })

    it('should clear redo stack when new action is pushed', () => {
      const store = useHistoryStore()

      // Push one action and simulate it being undone
      store.pushAction({ type: 'add_node', timestamp: 1, data: {} })
      const undoAction = store.popUndo()
      if (undoAction) store.pushRedo(undoAction)

      expect(store.canRedo).toBe(true)

      // Push new action should clear redo
      store.pushAction({ type: 'add_edge', timestamp: 2, data: {} })

      expect(store.canRedo).toBe(false)
    })

    it('should limit undo stack to MAX_HISTORY_SIZE', () => {
      const store = useHistoryStore()

      for (let i = 0; i < 55; i++) {
        store.pushAction({ type: 'add_node', timestamp: i, data: { index: i } })
      }

      expect(store.undoStack.length).toBeLessThanOrEqual(50)
    })
  })

  describe('canUndo/canRedo', () => {
    it('should not be able to undo when stack is empty', () => {
      const store = useHistoryStore()
      expect(store.canUndo).toBe(false)
    })

    it('should be able to undo when stack has actions', () => {
      const store = useHistoryStore()
      store.pushAction({ type: 'add_node', timestamp: 1, data: {} })
      expect(store.canUndo).toBe(true)
    })

    it('should not be able to redo when stack is empty', () => {
      const store = useHistoryStore()
      expect(store.canRedo).toBe(false)
    })

    it('should be able to redo when stack has actions', () => {
      const store = useHistoryStore()
      store.pushAction({ type: 'add_node', timestamp: 1, data: {} })
      const action = store.popUndo()
      if (action) store.pushRedo(action)
      expect(store.canRedo).toBe(true)
    })
  })

  describe('batch operations', () => {
    it('should batch multiple actions', () => {
      const store = useHistoryStore()

      store.startBatch()
      store.pushAction({ type: 'add_node', timestamp: 1, data: { id: 'a' } })
      store.pushAction({ type: 'add_node', timestamp: 2, data: { id: 'b' } })
      store.endBatch()

      expect(store.undoStack).toHaveLength(1)
      expect(store.undoStack[0]?.type).toBe('batch')
      expect(store.undoStack[0]?.actions).toHaveLength(2)
    })

    it('should not push empty batch', () => {
      const store = useHistoryStore()

      store.startBatch()
      store.endBatch()

      expect(store.undoStack).toHaveLength(0)
    })
  })

  describe('popUndo/popRedo', () => {
    it('should return null when undo stack is empty', () => {
      const store = useHistoryStore()
      expect(store.popUndo()).toBeNull()
    })

    it('should return and remove last action from undo stack', () => {
      const store = useHistoryStore()
      store.pushAction({ type: 'add_node', timestamp: 1, data: { id: 'a' } })
      store.pushAction({ type: 'add_edge', timestamp: 2, data: { id: 'b' } })

      const action = store.popUndo()

      expect(action?.type).toBe('add_edge')
      expect(store.undoStack).toHaveLength(1)
    })

    it('should return null when redo stack is empty', () => {
      const store = useHistoryStore()
      expect(store.popRedo()).toBeNull()
    })
  })

  describe('clear', () => {
    it('should clear all stacks', () => {
      const store = useHistoryStore()

      store.pushAction({ type: 'add_node', timestamp: 1, data: {} })
      store.pushAction({ type: 'add_edge', timestamp: 2, data: {} })
      const action = store.popUndo()
      if (action) store.pushRedo(action)

      store.clear()

      expect(store.undoStack).toHaveLength(0)
      expect(store.redoStack).toHaveLength(0)
    })
  })
})
