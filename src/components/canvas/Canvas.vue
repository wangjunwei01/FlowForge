<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VueFlow, useVueFlow, type Connection, ConnectionMode } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { FlowNode, FlowEdge } from '@/types'
import { NodeType } from '@/types'
import { useCanvasStore } from '@/stores/canvas'
import { useFlowStore } from '@/stores/flow'
import { nodeComponents } from '@/components/nodes'

const canvasStore = useCanvasStore()
const flowStore = useFlowStore()

// Local reactive nodes/edges for Vue Flow
const localNodes = ref<any[]>([])
const localEdges = ref<any[]>([])

const {
  onConnect,
  addNodes,
  project,
  fitView,
  onPaneReady,
} = useVueFlow()

const flowId = computed(() => flowStore.currentFlowId)
const flow = computed(() => flowId.value ? flowStore.flows[flowId.value!] : null)

// Sync canvas store nodes with local nodes for Vue Flow
watch(() => canvasStore.nodes, (nodes) => {
  localNodes.value = Object.values(nodes).map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node,
      inputs: node.inputs,
      outputs: node.outputs,
    },
  }))
}, { immediate: true, deep: true })

// Sync canvas store edges with local edges for Vue Flow
watch(() => canvasStore.edges, (edges) => {
  localEdges.value = Object.values(edges).map((edge) => ({
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
    targetHandle: edge.targetHandle,
    type: 'smoothstep',
    animated: true,
  }))
}, { immediate: true, deep: true })

// Initialize from flow store if canvas is empty
watch(flow, (f) => {
  if (f && Object.keys(canvasStore.nodes).length === 0) {
    // Load nodes from flow into canvas store
    Object.values(f.nodes).forEach(node => canvasStore.addNode(node))
    Object.values(f.edges).forEach(edge => canvasStore.addEdge(edge))
  }
}, { immediate: true })

onPaneReady(() => {
  fitView({ padding: 0.2 })
})

onConnect((params: Connection) => {
  const edge: FlowEdge = {
    id: `e-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
    source: params.source,
    sourceHandle: params.sourceHandle!,
    target: params.target,
    targetHandle: params.targetHandle!,
    dataMapping: [],
  }
  canvasStore.addEdge(edge)

  // Also update flow store
  const f = flowId.value ? flowStore.flows[flowId.value] : undefined
  if (f) {
    f.edges[edge.id] = edge
  }
})

const emit = defineEmits<{
  (e: 'node-contextmenu', event: MouseEvent, nodeId: string): void
  (e: 'edge-contextmenu', event: MouseEvent, edgeId: string): void
  (e: 'pane-contextmenu', event: MouseEvent): void
}>()

function onNodeContextMenu(event: MouseEvent, node: { id: string }) {
  event.preventDefault()
  emit('node-contextmenu', event, node.id)
}

function onEdgeContextMenu(event: MouseEvent, edge: { id: string }) {
  event.preventDefault()
  emit('edge-contextmenu', event, edge.id)
}

function onPaneContextMenu(event: MouseEvent) {
  event.preventDefault()
  emit('pane-contextmenu', event)
}

function onDrop(event: DragEvent) {
  const rawData = event.dataTransfer?.getData('application/flowforge-node')
  if (!rawData) return

  const { nodeType } = JSON.parse(rawData) as { nodeType: NodeType }
  const bounds = (event.target as HTMLElement).getBoundingClientRect()
  const position = project({
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  })

  const node = createNode(nodeType, position)
  canvasStore.addNode(node)

  // Also update flow store
  const f = flowId.value ? flowStore.flows[flowId.value] : undefined
  if (f) {
    f.nodes[node.id] = node
  }

  // Add to Vue Flow directly
  addNodes([{
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node,
      inputs: node.inputs,
      outputs: node.outputs,
    },
  }])
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function createNode(type: NodeType, position: { x: number; y: number }): FlowNode {
  const id = `node-${Date.now()}`
  const defaultInputs = [{ id: 'input', name: 'Input', type: 'input' as const, dataType: 'any' as const, required: false }]
  const defaultOutputs = [{ id: 'output', name: 'Output', type: 'output' as const, dataType: 'any' as const, required: false }]

  const defaultData = getDefaultNodeData(type)

  return {
    id,
    type,
    position,
    data: defaultData,
    inputs: defaultInputs,
    outputs: defaultOutputs,
  }
}

function getDefaultNodeData(type: NodeType): any {
  const baseData = { label: getDefaultLabel(type) }

  switch (type) {
    case NodeType.HTTP_REQUEST:
      return { ...baseData, method: 'GET', url: '', headers: {}, params: {} }
    case NodeType.GRPC_REQUEST:
      return { ...baseData, protoFile: '', serviceName: '', methodName: '', address: '', useTLS: false, requestMessage: '' }
    case NodeType.WEBSOCKET:
      return { ...baseData, url: '', protocols: [], messages: [] }
    case NodeType.SSE:
      return { ...baseData, url: '', headers: {} }
    case NodeType.SCRIPT:
      return { ...baseData, language: 'javascript', code: '' }
    case NodeType.DATA_TRANSFORM:
      return { ...baseData, inputMapping: [], outputMapping: [] }
    case NodeType.MOCK:
      return { ...baseData, port: 3000, routes: [], autoStart: false }
    default:
      return baseData
  }
}

function getDefaultLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    [NodeType.HTTP_REQUEST]: 'HTTP Request',
    [NodeType.GRPC_REQUEST]: 'gRPC Request',
    [NodeType.WEBSOCKET]: 'WebSocket',
    [NodeType.SSE]: 'SSE',
    [NodeType.SCRIPT]: 'Script',
    [NodeType.DATA_TRANSFORM]: 'Transform',
    [NodeType.MOCK]: 'Mock Server',
  }
  return labels[type] ?? 'Node'
}

defineExpose({
  fitView,
  project,
})
</script>

<template>
  <div
    class="canvas-container"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <VueFlow
      v-model:nodes="localNodes"
      v-model:edges="localEdges"
      :node-types="nodeComponents"
      :snap-to-grid="true"
      :snap-grid="[16, 16]"
      :connection-mode="ConnectionMode.Loose"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :min-zoom="0.2"
      :max-zoom="4"
      fit-view-on-init
      @node-contextmenu="onNodeContextMenu"
      @edge-contextmenu="onEdgeContextMenu"
      @pane-contextmenu="onPaneContextMenu"
    >
      <Background :gap="16" :size="1" pattern-color="#e5e7eb" />
    </VueFlow>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@/assets/styles/canvas.css';

.canvas-container {
  width: 100%;
  height: 100%;
}

.vue-flow {
  background: var(--canvas-bg);
}

.dark .vue-flow__background {
  background: var(--canvas-bg);
}

.dark .vue-flow__edge-path {
  stroke: #748db3;
}

.dark .vue-flow__handle {
  border-color: #1f2937;
}
</style>