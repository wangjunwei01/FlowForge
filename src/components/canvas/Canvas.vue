<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, markRaw } from 'vue'
import { VueFlow, useVueFlow, type Connection, ConnectionMode, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { FlowNode, FlowEdge } from '@/types'
import { NodeType } from '@/types'
import { useFlowStore } from '@/stores/flow'
import { useDragDropStore } from '@/stores/dragDrop'
import HTTPNode from '@/components/nodes/HTTPNode.vue'
import GRPCNode from '@/components/nodes/GRPCNode.vue'
import WebSocketNode from '@/components/nodes/WebSocketNode.vue'
import SSENode from '@/components/nodes/SSENode.vue'
import ScriptNode from '@/components/nodes/ScriptNode.vue'
import TransformNode from '@/components/nodes/TransformNode.vue'
import MockNode from '@/components/nodes/MockNode.vue'

const flowStore = useFlowStore()
const dragDropStore = useDragDropStore()

// Node types for Vue Flow — markRaw prevents Vue from making components reactive
const nodeTypes = {
  HTTP_REQUEST: markRaw(HTTPNode),
  GRPC_REQUEST: markRaw(GRPCNode),
  WEBSOCKET: markRaw(WebSocketNode),
  SSE: markRaw(SSENode),
  SCRIPT: markRaw(ScriptNode),
  DATA_TRANSFORM: markRaw(TransformNode),
  MOCK: markRaw(MockNode),
}

// Local reactive state for Vue Flow
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const canvasRef = ref<HTMLElement | null>(null)

const currentFlowId = computed(() => flowStore.currentFlowId)
const currentFlow = computed(() => currentFlowId.value ? flowStore.flows[currentFlowId.value!] : null)

// Vue Flow composable
const { onConnect, project, fitView, onPaneReady } = useVueFlow()

// Initialize nodes from flow store
watch(currentFlow, (f) => {
  if (f) {
    nodes.value = Object.values(f.nodes).map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { ...node, inputs: node.inputs, outputs: node.outputs },
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

// Click-to-place: when in placement mode, clicking on the pane places a node
function onPaneClick(event: MouseEvent) {
  if (!dragDropStore.isDragging || !dragDropStore.draggedNodeType) return

  console.log('Pane click, placing node:', dragDropStore.draggedNodeType)

  const bounds = canvasRef.value?.getBoundingClientRect()
  if (!bounds) return

  const x = event.clientX - bounds.left
  const y = event.clientY - bounds.top
  const position = project({ x, y })

  addNodeToCanvas(dragDropStore.draggedNodeType, position)
  dragDropStore.endDrag()
}

// Keyboard handler for canceling placement
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && dragDropStore.isDragging) {
    console.log('Placement canceled via Escape key')
    dragDropStore.endDrag()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function addNodeToCanvas(nodeType: NodeType, position: { x: number; y: number }) {
  const node = createNode(nodeType, position)

  nodes.value.push({
    id: node.id,
    type: node.type,
    position: node.position,
    data: { ...node, inputs: node.inputs, outputs: node.outputs },
  })

  const f = currentFlowId.value ? flowStore.flows[currentFlowId.value] : undefined
  if (f) {
    f.nodes[node.id] = node
  }

  console.log('Node added, total nodes:', nodes.value.length)
}

function createNode(type: NodeType, position: { x: number; y: number }): FlowNode {
  const id = `node-${Date.now()}`
  const inputs = [{ id: 'input', name: 'Input', type: 'input' as const, dataType: 'any' as const, required: false }]
  const outputs = [{ id: 'output', name: 'Output', type: 'output' as const, dataType: 'any' as const, required: false }]
  return {
    id,
    type,
    position,
    data: getDefaultNodeData(type),
    inputs,
    outputs,
  }
}

function getDefaultNodeData(type: NodeType): any {
  const base = { label: getDefaultLabel(type) }
  switch (type) {
    case NodeType.HTTP_REQUEST: return { ...base, method: 'GET', url: '', headers: {}, params: {} }
    case NodeType.GRPC_REQUEST: return { ...base, protoFile: '', serviceName: '', methodName: '', address: '', useTLS: false, requestMessage: '' }
    case NodeType.WEBSOCKET: return { ...base, url: '', protocols: [], messages: [] }
    case NodeType.SSE: return { ...base, url: '', headers: {} }
    case NodeType.SCRIPT: return { ...base, language: 'javascript', code: '' }
    case NodeType.DATA_TRANSFORM: return { ...base, inputMapping: [], outputMapping: [] }
    case NodeType.MOCK: return { ...base, port: 3000, routes: [], autoStart: false }
    default: return base
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

defineExpose({ fitView, project })
</script>

<template>
  <div
    ref="canvasRef"
    class="canvas-wrapper"
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
      @pane-click="onPaneClick"
    >
      <Background :gap="16" :size="1" pattern-color="#e5e7eb" />
    </VueFlow>
    <!-- Placement mode overlay -->
    <div v-if="dragDropStore.isDragging" class="placement-overlay">
      <span class="placement-hint">Click to place {{ dragDropStore.draggedNodeType }}</span>
      <span class="placement-cancel">Press Escape to cancel</span>
    </div>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@/assets/styles/canvas.css';

.canvas-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.vue-flow {
  width: 100%;
  height: 100%;
  background: var(--canvas-bg);
}

.placement-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(66, 184, 131, 0.08);
  border: 2px dashed var(--color-primary);
  z-index: 10;
}

.placement-hint {
  padding: 12px 24px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.placement-cancel {
  font-size: 12px;
  color: var(--text-color-secondary);
  background: var(--bg-color-secondary);
  padding: 4px 12px;
  border-radius: 4px;
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

.dark .placement-overlay {
  background: rgba(66, 211, 146, 0.08);
}
</style>