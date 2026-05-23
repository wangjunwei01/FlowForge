<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VueFlow, useVueFlow, type Connection, ConnectionMode, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { FlowNode, FlowEdge } from '@/types'
import { NodeType } from '@/types'
import { useFlowStore } from '@/stores/flow'
import HTTPNode from '@/components/nodes/HTTPNode.vue'
import GRPCNode from '@/components/nodes/GRPCNode.vue'
import WebSocketNode from '@/components/nodes/WebSocketNode.vue'
import SSENode from '@/components/nodes/SSENode.vue'
import ScriptNode from '@/components/nodes/ScriptNode.vue'
import TransformNode from '@/components/nodes/TransformNode.vue'
import MockNode from '@/components/nodes/MockNode.vue'

const flowStore = useFlowStore()

// Node types for Vue Flow - must be plain object with string keys
const nodeTypes = {
  HTTP_REQUEST: HTTPNode,
  GRPC_REQUEST: GRPCNode,
  WEBSOCKET: WebSocketNode,
  SSE: SSENode,
  SCRIPT: ScriptNode,
  DATA_TRANSFORM: TransformNode,
  MOCK: MockNode,
}

const flowId = computed(() => flowStore.currentFlowId)
const flow = computed(() => flowId.value ? flowStore.flows[flowId.value!] : null)

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const {
  onConnect,
  project,
  fitView,
  onPaneReady,
} = useVueFlow()

// Initialize from flow store
watch(flow, (f) => {
  if (f) {
    // Load nodes from flow
    nodes.value = Object.values(f.nodes).map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node,
        inputs: node.inputs,
        outputs: node.outputs,
      },
    }))
    // Load edges from flow
    edges.value = Object.values(f.edges).map((edge) => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
      type: 'smoothstep',
      animated: true,
    }))
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

  edges.value.push({
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
    targetHandle: edge.targetHandle,
    type: 'smoothstep',
    animated: true,
  })

  // Update flow store
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
  event.preventDefault()

  const rawData = event.dataTransfer?.getData('application/flowforge-node')
  if (!rawData) {
    console.log('No drag data found')
    return
  }

  let nodeType: NodeType
  try {
    const data = JSON.parse(rawData) as { nodeType: NodeType }
    nodeType = data.nodeType
  } catch (e) {
    console.error('Failed to parse drag data:', e)
    return
  }

  // Get the canvas element bounds
  const canvasEl = (event.currentTarget as HTMLElement)
  const bounds = canvasEl.getBoundingClientRect()

  // Calculate position relative to canvas
  const x = event.clientX - bounds.left
  const y = event.clientY - bounds.top

  // Project screen coordinates to flow coordinates
  const position = project({ x, y })

  console.log('Drop at position:', position, 'nodeType:', nodeType)

  const node = createNode(nodeType, position)

  // Add to Vue Flow nodes array
  nodes.value.push({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node,
      inputs: node.inputs,
      outputs: node.outputs,
    },
  })

  // Also update flow store
  const f = flowId.value ? flowStore.flows[flowId.value] : undefined
  if (f) {
    f.nodes[node.id] = node
  }
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
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
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
  position: relative;
}

.vue-flow {
  width: 100%;
  height: 100%;
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
