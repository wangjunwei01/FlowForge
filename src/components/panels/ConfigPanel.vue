<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCanvasStore } from '@/stores/canvas'
import { useFlowStore } from '@/stores/flow'
import { NodeType } from '@/types'
import type { HTTPNodeData, GRPCNodeData, WebSocketNodeData, SSENodeData, ScriptNodeData, TransformNodeData, MockNodeData } from '@/types'

const { t } = useI18n()
const canvasStore = useCanvasStore()
const flowStore = useFlowStore()

const selectedNode = computed(() => {
  const ids = canvasStore.selectedNodeIds
  if (ids.size !== 1) return null
  const id = Array.from(ids)[0]!
  const f = flowStore.flows[flowStore.currentFlowId ?? '']
  return f?.nodes[id] ?? null
})

const selectedEdge = computed(() => {
  const ids = canvasStore.selectedEdgeIds
  if (ids.size !== 1) return null
  const id = Array.from(ids)[0]!
  const f = flowStore.flows[flowStore.currentFlowId ?? '']
  return f?.edges[id] ?? null
})

function updateNodeData(key: string, value: unknown) {
  if (!selectedNode.value) return
  const f = flowStore.flows[flowStore.currentFlowId ?? '']
  if (!f) return
  const node = f.nodes[selectedNode.value.id]
  if (node) {
    ;(node.data as unknown as Record<string, unknown>)[key] = value
  }
}

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const scriptLanguages = ['javascript', 'python', 'typescript']
</script>

<template>
  <div class="config-panel">
    <!-- Node Editor -->
    <template v-if="selectedNode">
      <div class="panel-header">
        <h3>{{ t('nodeEditor.title') }}</h3>
        <span class="node-type-badge">{{ selectedNode.type }}</span>
      </div>
      <div class="panel-content">
        <!-- Common: Label -->
        <div class="field">
          <label>Label</label>
          <input
            :value="selectedNode.data.label"
            class="field-input"
            @input="updateNodeData('label', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- HTTP Request -->
        <template v-if="selectedNode.type === NodeType.HTTP_REQUEST">
          <div class="field">
            <label>{{ t('nodeEditor.http.method') }}</label>
            <select
              :value="(selectedNode.data as HTTPNodeData).method"
              class="field-select"
              @change="updateNodeData('method', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="m in httpMethods" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.http.url') }}</label>
            <input
              :value="(selectedNode.data as HTTPNodeData).url"
              class="field-input"
              placeholder="https://api.example.com"
              @input="updateNodeData('url', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.http.headers') }}</label>
            <textarea
              :value="JSON.stringify((selectedNode.data as HTTPNodeData).headers, null, 2)"
              class="field-textarea"
              rows="4"
              placeholder='{"Content-Type": "application/json"}'
              @input="updateNodeData('headers', JSON.parse(($event.target as HTMLTextAreaElement).value || '{}'))"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.http.params') }}</label>
            <textarea
              :value="JSON.stringify((selectedNode.data as HTTPNodeData).params, null, 2)"
              class="field-textarea"
              rows="3"
              placeholder='{"key": "value"}'
              @input="updateNodeData('params', JSON.parse(($event.target as HTMLTextAreaElement).value || '{}'))"
            />
          </div>
        </template>

        <!-- gRPC Request -->
        <template v-if="selectedNode.type === NodeType.GRPC_REQUEST">
          <div class="field">
            <label>{{ t('nodeEditor.grpc.address') }}</label>
            <input
              :value="(selectedNode.data as GRPCNodeData).address"
              class="field-input"
              placeholder="localhost:50051"
              @input="updateNodeData('address', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.grpc.protoFile') }}</label>
            <input
              :value="(selectedNode.data as GRPCNodeData).protoFile"
              class="field-input"
              placeholder="path/to/service.proto"
              @input="updateNodeData('protoFile', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.grpc.serviceName') }}</label>
            <input
              :value="(selectedNode.data as GRPCNodeData).serviceName"
              class="field-input"
              @input="updateNodeData('serviceName', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.grpc.methodName') }}</label>
            <input
              :value="(selectedNode.data as GRPCNodeData).methodName"
              class="field-input"
              @input="updateNodeData('methodName', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.grpc.useTLS') }}</label>
            <input
              type="checkbox"
              :checked="(selectedNode.data as GRPCNodeData).useTLS"
              @change="updateNodeData('useTLS', ($event.target as HTMLInputElement).checked)"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.grpc.requestMessage') }}</label>
            <textarea
              :value="(selectedNode.data as GRPCNodeData).requestMessage"
              class="field-textarea"
              rows="4"
              placeholder="{}"
              @input="updateNodeData('requestMessage', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </template>

        <!-- WebSocket -->
        <template v-if="selectedNode.type === NodeType.WEBSOCKET">
          <div class="field">
            <label>{{ t('nodeEditor.websocket.url') }}</label>
            <input
              :value="(selectedNode.data as WebSocketNodeData).url"
              class="field-input"
              placeholder="ws://localhost:8080/ws"
              @input="updateNodeData('url', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.websocket.protocols') }}</label>
            <input
              :value="(selectedNode.data as WebSocketNodeData).protocols?.join(', ')"
              class="field-input"
              placeholder="protocol1, protocol2"
              @input="updateNodeData('protocols', ($event.target as HTMLInputElement).value.split(',').map((s: string) => s.trim()).filter(Boolean))"
            />
          </div>
        </template>

        <!-- SSE -->
        <template v-if="selectedNode.type === NodeType.SSE">
          <div class="field">
            <label>{{ t('nodeEditor.sse.url') }}</label>
            <input
              :value="(selectedNode.data as SSENodeData).url"
              class="field-input"
              placeholder="https://api.example.com/events"
              @input="updateNodeData('url', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.sse.headers') }}</label>
            <textarea
              :value="JSON.stringify((selectedNode.data as SSENodeData).headers, null, 2)"
              class="field-textarea"
              rows="4"
              placeholder='{"Authorization": "Bearer ..."}'
              @input="updateNodeData('headers', JSON.parse(($event.target as HTMLTextAreaElement).value || '{}'))"
            />
          </div>
        </template>

        <!-- Script -->
        <template v-if="selectedNode.type === NodeType.SCRIPT">
          <div class="field">
            <label>{{ t('nodeEditor.script.language') }}</label>
            <select
              :value="(selectedNode.data as ScriptNodeData).language"
              class="field-select"
              @change="updateNodeData('language', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="lang in scriptLanguages" :key="lang" :value="lang">{{ lang }}</option>
            </select>
          </div>
          <div class="field field-vertical">
            <label>{{ t('nodeEditor.script.code') }}</label>
            <textarea
              :value="(selectedNode.data as ScriptNodeData).code"
              class="field-textarea code-editor"
              rows="8"
              placeholder="// Write your script here"
              @input="updateNodeData('code', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </template>

        <!-- Data Transform -->
        <template v-if="selectedNode.type === NodeType.DATA_TRANSFORM">
          <div class="field field-vertical">
            <label>{{ t('nodeEditor.transform.inputMapping') }}</label>
            <textarea
              :value="JSON.stringify((selectedNode.data as TransformNodeData).inputMapping, null, 2)"
              class="field-textarea"
              rows="4"
              @input="updateNodeData('inputMapping', JSON.parse(($event.target as HTMLTextAreaElement).value || '[]'))"
            />
          </div>
          <div class="field field-vertical">
            <label>{{ t('nodeEditor.transform.outputMapping') }}</label>
            <textarea
              :value="JSON.stringify((selectedNode.data as TransformNodeData).outputMapping, null, 2)"
              class="field-textarea"
              rows="4"
              @input="updateNodeData('outputMapping', JSON.parse(($event.target as HTMLTextAreaElement).value || '[]'))"
            />
          </div>
        </template>

        <!-- Mock Server -->
        <template v-if="selectedNode.type === NodeType.MOCK">
          <div class="field">
            <label>{{ t('nodeEditor.mock.port') }}</label>
            <input
              type="number"
              :value="(selectedNode.data as MockNodeData).port"
              class="field-input"
              min="1"
              max="65535"
              @input="updateNodeData('port', Number(($event.target as HTMLInputElement).value))"
            />
          </div>
          <div class="field">
            <label>{{ t('nodeEditor.mock.autoStart') }}</label>
            <input
              type="checkbox"
              :checked="(selectedNode.data as MockNodeData).autoStart"
              @change="updateNodeData('autoStart', ($event.target as HTMLInputElement).checked)"
            />
          </div>
          <div class="field field-vertical">
            <label>{{ t('nodeEditor.mock.routes') }}</label>
            <textarea
              :value="JSON.stringify((selectedNode.data as MockNodeData).routes, null, 2)"
              class="field-textarea"
              rows="6"
              placeholder='[{"method":"GET","path":"/api/data","status":200,"response":{}}]'
              @input="updateNodeData('routes', JSON.parse(($event.target as HTMLTextAreaElement).value || '[]'))"
            />
          </div>
        </template>

        <!-- Node Position (read-only info) -->
        <div class="field-group">
          <div class="field">
            <label>X</label>
            <span class="field-value">{{ selectedNode.position.x.toFixed(0) }}</span>
          </div>
          <div class="field">
            <label>Y</label>
            <span class="field-value">{{ selectedNode.position.y.toFixed(0) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Edge Editor -->
    <template v-else-if="selectedEdge">
      <div class="panel-header">
        <h3>Edge Config</h3>
      </div>
      <div class="panel-content">
        <div class="field">
          <label>Source</label>
          <span class="field-value">{{ selectedEdge.source }}</span>
        </div>
        <div class="field">
          <label>Target</label>
          <span class="field-value">{{ selectedEdge.target }}</span>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <template v-else>
      <div class="panel-header">
        <h3>Config</h3>
      </div>
      <div class="panel-empty">
        <p>Select a node or edge to configure</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.config-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-color-primary);
}

.node-type-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--border-radius-sm);
}

.panel-content {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  gap: 8px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.field-vertical {
  flex-direction: column;
  align-items: stretch;
}

.field label {
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
  min-width: 60px;
}

.field-value {
  color: var(--text-color-primary);
  font-size: var(--font-size-sm);
}

.field-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-color);
  color: var(--text-color-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.field-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-color);
  color: var(--text-color-primary);
  font-size: var(--font-size-sm);
}

.field-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.field-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-color);
  color: var(--text-color-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-mono);
  resize: vertical;
}

.field-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.code-editor {
  tab-size: 2;
}

.field-group {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.field-group .field {
  flex: 1;
  border-bottom: none;
  padding: 4px 0;
}

.panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}
</style>
