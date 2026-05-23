import { ref } from 'vue'
import type { FlowNode, FlowEdge } from '@/types'
import { useCanvasStore } from '@/stores/canvas'
import { useFlowStore } from '@/stores/flow'
import { useHistoryStore } from '@/stores/history'
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

  function undo(): void {
    // TODO: Implement undo by popping from history and reversing actions
    console.log('Undo - not yet fully implemented')
  }

  function redo(): void {
    // TODO: Implement redo by popping from redo stack and replaying actions
    console.log('Redo - not yet fully implemented')
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