import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FlowNode, FlowEdge } from '@/types'
import { NodeType } from '@/types'

export const useCanvasStore = defineStore('canvas', () => {
  const nodes = ref<Record<string, FlowNode>>({})
  const edges = ref<Record<string, FlowEdge>>({})
  const selectedNodeIds = ref<Set<string>>(new Set())
  const selectedEdgeIds = ref<Set<string>>(new Set())

  function addNode(node: FlowNode): void {
    nodes.value[node.id] = node
  }

  function removeNode(id: string): void {
    delete nodes.value[id]
    selectedNodeIds.value.delete(id)
  }

  function updateNode(id: string, data: Partial<FlowNode>): void {
    if (nodes.value[id]) {
      nodes.value[id] = { ...nodes.value[id], ...data }
    }
  }

  function addEdge(edge: FlowEdge): void {
    edges.value[edge.id] = edge
  }

  function removeEdge(id: string): void {
    delete edges.value[id]
    selectedEdgeIds.value.delete(id)
  }

  function clearSelection(): void {
    selectedNodeIds.value.clear()
    selectedEdgeIds.value.clear()
  }

  return {
    nodes,
    edges,
    selectedNodeIds,
    selectedEdgeIds,
    addNode,
    removeNode,
    updateNode,
    addEdge,
    removeEdge,
    clearSelection,
  }
})

export { NodeType }