<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { FlowNode, TransformNodeData, Port } from '@/types'
import { NodeType } from '@/types'
import type { NodeProps } from '@vue-flow/core'

interface ExtendedFlowNode extends FlowNode {
  status?: 'pending' | 'running' | 'success' | 'error'
}

const props = defineProps<NodeProps<ExtendedFlowNode>>()

const data = props.data.data as TransformNodeData
const inputs = props.data.inputs as Port[]
const outputs = props.data.outputs as Port[]

const inputCount = data.inputMapping?.length ?? 0
const outputCount = data.outputMapping?.length ?? 0
</script>

<template>
  <BaseNode
    :id="props.id"
    :type="NodeType.DATA_TRANSFORM"
    :data="data"
    :inputs="inputs"
    :outputs="outputs"
    :selected="props.selected"
    :status="props.data.status"
  >
    <div class="transform-node-content">
      <span class="transform-count">{{ inputCount }} inputs → {{ outputCount }} outputs</span>
    </div>
  </BaseNode>
</template>

<style scoped>
.transform-node-content {
  display: flex;
  align-items: center;
}

.transform-count {
  color: var(--text-color-secondary);
}
</style>
