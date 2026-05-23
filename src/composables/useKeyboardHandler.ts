import { ref } from 'vue'
import type { FlowNode, FlowEdge } from '@/types'
import { useCanvasStore } from '@/stores/canvas'
import { useFlowStore } from '@/stores/flow'
import { useHistoryStore, type HistoryAction } from '@/stores/history'
import { useTabStore } from '@/stores/tabs'

const clipboardNodes = ref<FlowNode[]>([])
const clipboardEdges = ref<FlowEdge[]>([])

export function useKeyboardHandler() {
  const canvasStore = useCanvasStore()
  const flowStore = useFlowStore()
  const historyStore = useHistoryStore()
  const tabStore = useTabStore()

  function copySelected(): void {
    const flow = flowStore.flows[flowStore.currentFlowId ?? '']
    if (!flow) return

    clipboardNodes.value = Array.from(canvasStore.selectedNodeIds)
      .filter(id => flow.nodes[id])
      .map(id => {
        const node = flow.nodes[id]!
        return { ...node, data: { ...node.data }, inputs: [...node.inputs], outputs: [...node.outputs] }
      })

    // Also copy edges that connect selected nodes
    clipboardEdges.value = Object.values(flow.edges)
      .filter(edge =>
        canvasStore.selectedNodeIds.has(edge.source) &&
        canvasStore.selectedNodeIds.has(edge.target)
      )
      .map(edge => ({ ...edge }))

    console.log('Copied', clipboardNodes.value.length, 'nodes and', clipboardEdges.value.length, 'edges')
  }

  function paste(): void {
    const flow = flowStore.flows[flowStore.currentFlowId ?? '']
    if (!flow) return

    if (clipboardNodes.value.length === 0) return

    historyStore.startBatch()

    // Paste nodes with new IDs, offset position
    const offset = { x: 50, y: 50 }
    const idMap: Record<string, string> = {}

    clipboardNodes.value.forEach(node => {
      const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      idMap[node.id] = newId

      const newNode: FlowNode = {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
      }

      flow.nodes[newId] = newNode

      historyStore.pushAction({
        type: 'add_node',
        timestamp: Date.now(),
        data: { node: newNode },
      })
    })

    // Paste edges with updated IDs
    clipboardEdges.value.forEach(edge => {
      const newSourceId = idMap[edge.source]
      const newTargetId = idMap[edge.target]
      if (!newSourceId || !newTargetId) return

      const newId = `e-${newSourceId}-${edge.sourceHandle}-${newTargetId}-${edge.targetHandle}`
      const newEdge: FlowEdge = {
        ...edge,
        id: newId,
        source: newSourceId,
        target: newTargetId,
      }

      flow.edges[newId] = newEdge

      historyStore.pushAction({
        type: 'add_edge',
        timestamp: Date.now(),
        data: { edge: newEdge },
      })
    })

    historyStore.endBatch()

    // Mark tab as dirty
    const activeTab = tabStore.activeTab
    if (activeTab) {
      tabStore.markDirty(activeTab.id)
    }

    console.log('Pasted', Object.keys(idMap).length, 'nodes')
  }

  function deleteSelected(): void {
    const flow = flowStore.flows[flowStore.currentFlowId ?? '']
    if (!flow) return

    const nodeIds = Array.from(canvasStore.selectedNodeIds)
    const edgeIds = Array.from(canvasStore.selectedEdgeIds)

    if (nodeIds.length === 0 && edgeIds.length === 0) return

    historyStore.startBatch()

    // Delete edges first
    edgeIds.forEach(id => {
      const edge = flow.edges[id]
      if (edge) {
        delete flow.edges[id]
        historyStore.pushAction({
          type: 'remove_edge',
          timestamp: Date.now(),
          data: { edge },
        })
      }
    })

    // Also delete edges connected to deleted nodes
    nodeIds.forEach(nodeId => {
      Object.values(flow.edges).forEach(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
          delete flow.edges[edge.id]
          historyStore.pushAction({
            type: 'remove_edge',
            timestamp: Date.now(),
            data: { edge },
          })
        }
      })
    })

    // Delete nodes
    nodeIds.forEach(id => {
      const node = flow.nodes[id]
      if (node) {
        delete flow.nodes[id]
        historyStore.pushAction({
          type: 'remove_node',
          timestamp: Date.now(),
          data: { node },
        })
      }
    })

    historyStore.endBatch()
    canvasStore.clearSelection()

    // Mark tab as dirty
    const activeTab = tabStore.activeTab
    if (activeTab) {
      tabStore.markDirty(activeTab.id)
    }

    console.log('Deleted', nodeIds.length, 'nodes and', edgeIds.length, 'edges')
  }

  function selectAll(): void {
    const flow = flowStore.flows[flowStore.currentFlowId ?? '']
    if (!flow) return

    canvasStore.selectedNodeIds = new Set(Object.keys(flow.nodes))
    canvasStore.selectedEdgeIds = new Set(Object.keys(flow.edges))
  }

  // Execute a single action in reverse (for undo)
  function reverseAction(action: HistoryAction): void {
    const flow = flowStore.flows[flowStore.currentFlowId ?? '']
    if (!flow) return

    switch (action.type) {
      case 'add_node':
        // Reverse: remove the added node
        const addedNode = (action.data as { node: FlowNode }).node
        delete flow.nodes[addedNode.id]
        console.log('Undo: removed node', addedNode.id)
        break

      case 'remove_node':
        // Reverse: restore the removed node
        const removedNode = (action.data as { node: FlowNode }).node
        flow.nodes[removedNode.id] = removedNode
        console.log('Undo: restored node', removedNode.id)
        break

      case 'move_node':
        // Reverse: restore old position
        const moveData = action.data as { nodeId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }
        const movedNode = flow.nodes[moveData.nodeId]
        if (movedNode) {
          movedNode.position = moveData.oldPosition
          console.log('Undo: moved node back', moveData.nodeId)
        }
        break

      case 'add_edge':
        // Reverse: remove the added edge
        const addedEdge = (action.data as { edge: FlowEdge }).edge
        delete flow.edges[addedEdge.id]
        console.log('Undo: removed edge', addedEdge.id)
        break

      case 'remove_edge':
        // Reverse: restore the removed edge
        const removedEdge = (action.data as { edge: FlowEdge }).edge
        flow.edges[removedEdge.id] = removedEdge
        console.log('Undo: restored edge', removedEdge.id)
        break

      case 'batch':
        // Reverse all sub-actions in reverse order
        if (action.actions) {
          for (let i = action.actions.length - 1; i >= 0; i--) {
            reverseAction(action.actions[i]!)
          }
        }
        break
    }
  }

  // Execute a single action forward (for redo)
  function replayAction(action: HistoryAction): void {
    const flow = flowStore.flows[flowStore.currentFlowId ?? '']
    if (!flow) return

    switch (action.type) {
      case 'add_node':
        // Replay: add the node
        const node = (action.data as { node: FlowNode }).node
        flow.nodes[node.id] = node
        console.log('Redo: added node', node.id)
        break

      case 'remove_node':
        // Replay: remove the node
        const nodeToRemove = (action.data as { node: FlowNode }).node
        delete flow.nodes[nodeToRemove.id]
        console.log('Redo: removed node', nodeToRemove.id)
        break

      case 'move_node':
        // Replay: move to new position
        const moveData = action.data as { nodeId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }
        const nodeToMove = flow.nodes[moveData.nodeId]
        if (nodeToMove) {
          nodeToMove.position = moveData.newPosition
          console.log('Redo: moved node', moveData.nodeId)
        }
        break

      case 'add_edge':
        // Replay: add the edge
        const edge = (action.data as { edge: FlowEdge }).edge
        flow.edges[edge.id] = edge
        console.log('Redo: added edge', edge.id)
        break

      case 'remove_edge':
        // Replay: remove the edge
        const edgeToRemove = (action.data as { edge: FlowEdge }).edge
        delete flow.edges[edgeToRemove.id]
        console.log('Redo: removed edge', edgeToRemove.id)
        break

      case 'batch':
        // Replay all sub-actions in original order
        if (action.actions) {
          action.actions.forEach(subAction => replayAction(subAction!))
        }
        break
    }
  }

  function undo(): void {
    if (!historyStore.canUndo) return

    const action = historyStore.popUndo()
    if (!action) return

    // Execute reverse action
    reverseAction(action)

    // Push to redo stack
    historyStore.pushRedo(action)

    // Mark tab as dirty
    const activeTab = tabStore.activeTab
    if (activeTab) {
      tabStore.markDirty(activeTab.id)
    }

    console.log('Undo completed')
  }

  function redo(): void {
    if (!historyStore.canRedo) return

    const action = historyStore.popRedo()
    if (!action) return

    // Execute forward action
    replayAction(action)

    // Push back to undo stack
    historyStore.pushAction(action)

    // Mark tab as dirty
    const activeTab = tabStore.activeTab
    if (activeTab) {
      tabStore.markDirty(activeTab.id)
    }

    console.log('Redo completed')
  }

  function handleKeyDown(event: KeyboardEvent): boolean {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey

    // Ignore if typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return false
    }

    // Copy: Ctrl+C / Cmd+C
    if (ctrlKey && event.key === 'c') {
      copySelected()
      event.preventDefault()
      return true
    }

    // Paste: Ctrl+V / Cmd+V
    if (ctrlKey && event.key === 'v') {
      paste()
      event.preventDefault()
      return true
    }

    // Delete: Delete or Backspace
    if (event.key === 'Delete' || event.key === 'Backspace') {
      deleteSelected()
      event.preventDefault()
      return true
    }

    // Select All: Ctrl+A / Cmd+A
    if (ctrlKey && event.key === 'a') {
      selectAll()
      event.preventDefault()
      return true
    }

    // Undo: Ctrl+Z / Cmd+Z
    if (ctrlKey && event.key === 'z' && !event.shiftKey) {
      undo()
      event.preventDefault()
      return true
    }

    // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y
    if ((ctrlKey && event.shiftKey && event.key === 'z') || (ctrlKey && event.key === 'y')) {
      redo()
      event.preventDefault()
      return true
    }

    return false
  }

  return {
    handleKeyDown,
    copySelected,
    paste,
    deleteSelected,
    selectAll,
    undo,
    redo,
  }
}