<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

// Node types for Vue Flow - must use plain object with string keys matching node.type values
const nodeTypes = {
  HTTP_REQUEST: HTTPNode,
  GRPC_REQUEST: GRPCNode,
  WEBSOCKET: WebSocketNode,
  SSE: SSENode,
  SCRIPT: ScriptNode,
  DATA_TRANSFORM: TransformNode,
  MOCK: MockNode,
}

// Local reactive state for Vue Flow
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const currentFlowId = computed(() => flowStore.currentFlowId)
const currentFlow = computed(() => currentFlowId.value ? flowStore.flows[currentFlowId.value!] : null)

// Vue Flow composable - no id needed, we use v-model directly
const {
  onConnect,
  project,
  fitView,
  onPaneReady,
} = useVueFlow()

// Initialize nodes from flow store
watch(currentFlow, (f) => {
  if (f) {
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
    edges.value = Object.values(f.edges).map((edge) => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
      type: 'smoothstep',
      animated: true,
    }))
    console.log('Canvas initialized with', nodes.value.length, 'nodes')
  }
}, { immediate: true })

onPaneReady(() => {
  fitView({ padding: 0.2 })
  console.log('Vue Flow pane ready')
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
  const f = currentFlowId.value ? flowStore.flows[currentFlowId.value] : undefined
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
  console.log('Drop event triggered')

  const rawData = event.dataTransfer?.getData('application/flowforge-node')
  if (!rawData) {
    console.warn('No drag data found')
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

  const target = event.target as HTMLElement
  const bounds = target.getBoundingClientRect()
  const x = event.clientX - bounds.left
  const y = event.clientY - bounds.top
  const position = project({ x, y })

  console.log('Creating node:', nodeType, 'at', position)

  const node = createNode(nodeType, position)

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

  // Update flow store
  const f = currentFlowId.value ? flowStore.flows[currentFlowId.value] : undefined
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

  return {
    id,
    type,
    position,
    data: getDefaultNodeData(type),
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
  <div class="canvas-wrapper">
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
      @drop="onDrop"
      @dragover="onDragOver"
    >
      <Background :gap="16" :size="1" pattern-color="#e5e7eb" />
    </VueFlow>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@/assets/styles/canvas.css';

.canvas-wrapper {
  width: 100%;
  height: 100%;
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