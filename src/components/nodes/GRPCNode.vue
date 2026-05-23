<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { FlowNode, GRPCNodeData, Port } from '@/types'
import { NodeType } from '@/types'
import type { NodeProps } from '@vue-flow/core'

interface ExtendedFlowNode extends FlowNode {
  status?: 'pending' | 'running' | 'success' | 'error'
}

const props = defineProps<NodeProps<ExtendedFlowNode>>()

const data = props.data.data as GRPCNodeData
const inputs = props.data.inputs as Port[]
const outputs = props.data.outputs as Port[]
</script>

<template>
  <BaseNode
    :id="props.id"
    :type="NodeType.GRPC_REQUEST"
    :data="data"
    :inputs="inputs"
    :outputs="outputs"
    :selected="props.selected"
    :status="props.data.status"
  >
    <div class="grpc-node-content">
      <span class="grpc-service">{{ data.serviceName || 'No Service' }}</span>
      <span class="grpc-method">/{{ data.methodName || 'No Method' }}</span>
    </div>
  </BaseNode>
</template>

<style scoped>
.grpc-node-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.grpc-service {
  color: var(--text-color-primary);
  font-weight: 500;
}

.grpc-method {
  color: var(--text-color-secondary);
}
</style>
