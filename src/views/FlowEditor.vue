<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Canvas from '@/components/canvas/Canvas.vue'
import CanvasControls from '@/components/canvas/CanvasControls.vue'
import MiniMap from '@/components/canvas/MiniMap.vue'
import ContextMenu from '@/components/canvas/ContextMenu.vue'
import TabBar from '@/components/common/TabBar.vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useCanvasStore } from '@/stores/canvas'
import { useFlowStore } from '@/stores/flow'
import { useTabStore } from '@/stores/tabs'

const route = useRoute()
const canvasStore = useCanvasStore()
const flowStore = useFlowStore()
const tabStore = useTabStore()

const { menuTarget, visible, show, hide } = useContextMenu()

function onNodeContextmenu(event: MouseEvent, nodeId: string): void {
  show({ type: 'node', id: nodeId, x: event.clientX, y: event.clientY })
}

function onEdgeContextmenu(event: MouseEvent, edgeId: string): void {
  show({ type: 'edge', id: edgeId, x: event.clientX, y: event.clientY })
}

function onPaneContextmenu(event: MouseEvent): void {
  show({ type: 'canvas', x: event.clientX, y: event.clientY })
}

async function onMenuAction(action: string): Promise<void> {
  if (!menuTarget.value) return

  switch (action) {
    case 'delete':
      if (menuTarget.value.type === 'node') {
        canvasStore.removeNode(menuTarget.value.id)
      } else if (menuTarget.value.type === 'edge') {
        canvasStore.removeEdge(menuTarget.value.id)
      }
      break
    case 'fit-view':
      // fitView handled by Canvas
      break
    case 'reset-view':
      break
  }
}

onMounted(() => {
  const flowId = route.params.id as string || flowStore.currentFlowId
  if (flowId) {
    flowStore.setCurrentFlowId(flowId)

    // Open tab if not already open
    const existingTab = tabStore.tabs.find(t => t.flowId === flowId)
    if (!existingTab) {
      tabStore.openTab({
        id: flowId,
        flowId,
        title: flowStore.flows[flowId]?.name || `Flow ${flowId}`,
        isDirty: false,
      })
    }
  }
  console.log('FlowEditor mounted, flowId:', flowId)
})
</script>

<template>
  <div class="flow-editor">
    <TabBar />
    <div class="editor-content">
      <div class="canvas-area">
        <Canvas
          @node-contextmenu="onNodeContextmenu"
          @edge-contextmenu="onEdgeContextmenu"
          @pane-contextmenu="onPaneContextmenu"
        />
        <CanvasControls />
        <MiniMap />
        <ContextMenu
          :target="menuTarget"
          :visible="visible"
          @action="onMenuAction"
          @close="hide"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.flow-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0; /* Important for flex children */
}
</style>