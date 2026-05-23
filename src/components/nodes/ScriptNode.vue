<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { FlowNode, ScriptNodeData, Port } from '@/types'
import { NodeType } from '@/types'
import type { NodeProps } from '@vue-flow/core'

interface ExtendedFlowNode extends FlowNode {
  status?: 'pending' | 'running' | 'success' | 'error'
}

const props = defineProps<NodeProps<ExtendedFlowNode>>()

const data = props.data.data as ScriptNodeData
const inputs = props.data.inputs as Port[]
const outputs = props.data.outputs as Port[]

const codePreview = data.code?.slice(0, 50) ?? 'No code'
</script>

<template>
  <BaseNode
    :id="props.id"
    :type="NodeType.SCRIPT"
    :data="data"
    :inputs="inputs"
    :outputs="outputs"
    :selected="props.selected"
    :status="props.data.status"
  >
    <div class="script-node-content">
      <span class="script-lang">{{ data.language }}</span>
      <pre class="script-preview">{{ codePreview }}...</pre>
    </div>
  </BaseNode>
</template>

<style scoped>
.script-node-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.script-lang {
  font-size: 10px;
  color: var(--text-color-secondary);
  text-transform: uppercase;
}

.script-preview {
  font-family: monospace;
  font-size: 10px;
  color: var(--text-color-primary);
  background: var(--bg-color-tertiary);
  padding: 4px;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  max-height: 40px;
}
</style>