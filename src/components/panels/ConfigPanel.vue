<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCanvasStore } from '@/stores/canvas'
import { useFlowStore } from '@/stores/flow'
import { useTabStore } from '@/stores/tabs'
import { useEnvironmentStore } from '@/stores/environment'
import { NodeType, resolveVariables } from '@/types'
import type { HTTPNodeData, GRPCNodeData, WebSocketNodeData, SSENodeData, ScriptNodeData, TransformNodeData, MockNodeData } from '@/types'
import { executeHttpRequest, cancelHttpRequest, type HttpRequestOptions, type HttpResponse as HttpResp, toCurlCommand, parseCurlCommand } from '@/services/http.service'
import ResponsePanel from './ResponsePanel.vue'

const { t } = useI18n()
const canvasStore = useCanvasStore()
const flowStore = useFlowStore()
const tabStore = useTabStore()
const environmentStore = useEnvironmentStore()

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
    tabStore.markDirty(tabStore.activeTabId ?? '')
  }
}

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const scriptLanguages = ['javascript', 'python', 'typescript']
const bodyTypes = ['none', 'json', 'form', 'raw', 'binary'] as const
type BodyType = typeof bodyTypes[number]

// HTTP request state
const requestBodyType = ref<BodyType>('none')
const requestBody = ref('')
const authType = ref<'none' | 'basic' | 'bearer' | 'apikey'>('none')
const authBasic = ref({ username: '', password: '' })
const authBearer = ref({ token: '' })
const authApiKey = ref({ key: '', value: '', addTo: 'header' as 'header' | 'query' })

// Error strategy configuration
const errorStrategy = ref<'abort' | 'skip' | 'retry'>('abort')
const retryCount = ref(3)
const retryDelay = ref(1000)

const response = ref<HttpResp | null>(null)
const responseError = ref<string | null>(null)
const requestLoading = ref(false)
const currentCancelTokenId = ref<string | null>(null)

// Curl import modal
const showCurlImport = ref(false)
const curlInput = ref('')

// Get current HTTP node data
const httpData = computed(() => {
  if (selectedNode.value?.type !== NodeType.HTTP_REQUEST) return null
  return selectedNode.value.data as HTTPNodeData
})

// Generate unique cancel token ID
function generateCancelTokenId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// Send HTTP request
async function sendRequest() {
  if (!httpData.value) return

  response.value = null
  responseError.value = null
  requestLoading.value = true

  // Generate cancel token ID
  const cancelTokenId = generateCancelTokenId()
  currentCancelTokenId.value = cancelTokenId

  try {
    const vars = environmentStore.activeVariables

    // Resolve variables in all string fields
    const resolvedUrl = resolveVariables(httpData.value.url, vars)
    const resolvedHeaders: Record<string, string> = {}
    for (const [key, value] of Object.entries(httpData.value.headers)) {
      resolvedHeaders[resolveVariables(key, vars)] = resolveVariables(value, vars)
    }
    const resolvedParams: Record<string, string> = {}
    for (const [key, value] of Object.entries(httpData.value.params)) {
      resolvedParams[resolveVariables(key, vars)] = resolveVariables(value, vars)
    }

    const options: HttpRequestOptions = {
      method: httpData.value.method,
      url: resolvedUrl,
      headers: resolvedHeaders,
      params: resolvedParams,
    }

    // Add body for non-GET requests
    if (httpData.value.method !== 'GET' && requestBodyType.value !== 'none') {
      options.body = {
        type: requestBodyType.value,
        content: resolveVariables(requestBody.value, vars),
      }
    }

    // Add auth
    if (authType.value === 'basic') {
      options.auth = { type: 'basic', basic: authBasic.value }
    } else if (authType.value === 'bearer') {
      options.auth = { type: 'bearer', bearer: authBearer.value }
    } else if (authType.value === 'apikey') {
      options.auth = { type: 'apikey', apikey: authApiKey.value }
    }

    response.value = await executeHttpRequest(options, cancelTokenId)
  } catch (err) {
    responseError.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    requestLoading.value = false
    currentCancelTokenId.value = null
  }
}

// Cancel in-progress request
async function cancelRequest() {
  if (!currentCancelTokenId.value) return

  try {
    await cancelHttpRequest(currentCancelTokenId.value)
    responseError.value = 'Request cancelled'
    requestLoading.value = false
    currentCancelTokenId.value = null
  } catch (err) {
    console.error('Failed to cancel request:', err)
  }
}

// Export as cURL
function exportAsCurl() {
  if (!httpData.value) return

  const options: HttpRequestOptions = {
    method: httpData.value.method,
    url: httpData.value.url,
    headers: httpData.value.headers,
    params: httpData.value.params,
  }

  if (requestBodyType.value !== 'none' && requestBody.value) {
    options.body = { type: requestBodyType.value, content: requestBody.value }
  }

  if (authType.value === 'basic') {
    options.auth = { type: 'basic', basic: authBasic.value }
  } else if (authType.value === 'bearer') {
    options.auth = { type: 'bearer', bearer: authBearer.value }
  }

  const curl = toCurlCommand(options)
  navigator.clipboard.writeText(curl)
}

// Import from cURL
function importFromCurl() {
  const parsed = parseCurlCommand(curlInput.value)
  if (!parsed) {
    alert('Could not parse cURL command')
    return
  }

  if (httpData.value) {
    httpData.value.method = parsed.method as HTTPNodeData['method']
    httpData.value.url = parsed.url ?? ''
    httpData.value.headers = parsed.headers ?? {}
    httpData.value.params = parsed.params ?? {}
    if (parsed.body) {
      requestBodyType.value = parsed.body.type as BodyType
      requestBody.value = parsed.body.content
    }
  }

  showCurlImport.value = false
  curlInput.value = ''
}
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
          <!-- Method and URL row -->
          <div class="field-row">
            <div class="field field-shrink">
              <label>{{ t('nodeEditor.http.method') }}</label>
              <select
                :value="(selectedNode.data as HTTPNodeData).method"
                class="field-select"
                @change="updateNodeData('method', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="m in httpMethods" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="field field-grow">
              <label>{{ t('nodeEditor.http.url') }}</label>
              <input
                :value="(selectedNode.data as HTTPNodeData).url"
                class="field-input"
                placeholder="https://api.example.com"
                @input="updateNodeData('url', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>

          <!-- Headers -->
          <div class="field field-vertical">
            <label>{{ t('nodeEditor.http.headers') }}</label>
            <textarea
              :value="JSON.stringify((selectedNode.data as HTTPNodeData).headers, null, 2)"
              class="field-textarea"
              rows="3"
              placeholder='{"Content-Type": "application/json"}'
              @input="updateNodeData('headers', JSON.parse(($event.target as HTMLTextAreaElement).value || '{}'))"
            />
          </div>

          <!-- Params -->
          <div class="field field-vertical">
            <label>{{ t('nodeEditor.http.params') }}</label>
            <textarea
              :value="JSON.stringify((selectedNode.data as HTTPNodeData).params, null, 2)"
              class="field-textarea"
              rows="2"
              placeholder='{"key": "value"}'
              @input="updateNodeData('params', JSON.parse(($event.target as HTMLTextAreaElement).value || '{}'))"
            />
          </div>

          <!-- Body -->
          <div class="field field-vertical">
            <label>Body</label>
            <select v-model="requestBodyType" class="field-select">
              <option v-for="bt in bodyTypes" :key="bt" :value="bt">{{ bt.toUpperCase() }}</option>
            </select>
            <textarea
              v-if="requestBodyType !== 'none'"
              v-model="requestBody"
              class="field-textarea"
              rows="4"
              placeholder='{"key": "value"}'
            />
          </div>

          <!-- Auth -->
          <div class="field field-vertical">
            <label>Authentication</label>
            <select v-model="authType" class="field-select">
              <option value="none">None</option>
              <option value="basic">Basic Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="apikey">API Key</option>
            </select>

            <!-- Basic Auth inputs -->
            <div v-if="authType === 'basic'" class="auth-inputs">
              <input v-model="authBasic.username" class="field-input" placeholder="Username" />
              <input v-model="authBasic.password" class="field-input" type="password" placeholder="Password" />
            </div>

            <!-- Bearer Token input -->
            <div v-if="authType === 'bearer'" class="auth-inputs">
              <input v-model="authBearer.token" class="field-input" placeholder="Token" />
            </div>

            <!-- API Key inputs -->
            <div v-if="authType === 'apikey'" class="auth-inputs">
              <input v-model="authApiKey.key" class="field-input" placeholder="Key name" />
              <input v-model="authApiKey.value" class="field-input" placeholder="Key value" />
              <select v-model="authApiKey.addTo" class="field-select">
                <option value="header">Add to Header</option>
                <option value="query">Add to Query Params</option>
              </select>
            </div>
          </div>

          <!-- Error Strategy -->
          <div class="field field-vertical">
            <label>Error Strategy</label>
            <select v-model="errorStrategy" class="field-select">
              <option value="abort">Abort on Error</option>
              <option value="skip">Skip on Error</option>
              <option value="retry">Retry on Error</option>
            </select>

            <!-- Retry options -->
            <div v-if="errorStrategy === 'retry'" class="retry-inputs">
              <div class="field-row">
                <div class="field field-shrink">
                  <label>Retry Count</label>
                  <input v-model.number="retryCount" type="number" min="1" max="10" class="field-input" />
                </div>
                <div class="field field-shrink">
                  <label>Retry Delay (ms)</label>
                  <input v-model.number="retryDelay" type="number" min="100" step="100" class="field-input" />
                </div>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="action-buttons">
            <button class="btn btn-primary" :disabled="requestLoading" @click="sendRequest">
              {{ requestLoading ? 'Sending...' : 'Send Request' }}
            </button>
            <button v-if="requestLoading" class="btn btn-danger" @click="cancelRequest">
              Cancel
            </button>
            <button class="btn btn-secondary" @click="showCurlImport = true">Import cURL</button>
            <button class="btn btn-secondary" @click="exportAsCurl">Copy cURL</button>
          </div>

          <!-- Response -->
          <div class="response-section">
            <h4>Response</h4>
            <ResponsePanel
              :response="response"
              :error="responseError"
              :loading="requestLoading"
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
          <div class="field field-vertical">
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
          <div class="field field-vertical">
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

    <!-- cURL Import Modal -->
    <Teleport to="body">
      <div v-if="showCurlImport" class="modal-overlay" @click.self="showCurlImport = false">
        <div class="modal-content">
          <h3>Import cURL Command</h3>
          <textarea
            v-model="curlInput"
            class="field-textarea"
            rows="8"
            placeholder="Paste your cURL command here..."
          />
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showCurlImport = false">Cancel</button>
            <button class="btn btn-primary" @click="importFromCurl">Import</button>
          </div>
        </div>
      </div>
    </Teleport>
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

.field-row {
  display: flex;
  gap: 8px;
}

.field-shrink {
  flex: 0 0 auto;
  min-width: 100px;
}

.field-grow {
  flex: 1;
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

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.btn {
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-color-secondary);
  color: var(--text-color-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-color-tertiary);
}

.btn-danger {
  background: var(--color-danger, #ef4444);
  color: #fff;
  border: none;
}

.btn-danger:hover {
  background: var(--color-danger-dark, #dc2626);
}

/* Response section */
.response-section {
  margin-top: 12px;
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.response-section h4 {
  margin: 0 0 8px 0;
  font-size: var(--font-size-sm);
  color: var(--text-color-primary);
}

/* Auth inputs */
.auth-inputs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.retry-inputs {
  margin-top: 4px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-color);
  padding: 20px;
  border-radius: var(--border-radius-md);
  min-width: 400px;
  max-width: 600px;
}

.modal-content h3 {
  margin: 0 0 12px 0;
  color: var(--text-color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* Dark mode */
:global(.dark) .field-input,
:global(.dark) .field-select,
:global(.dark) .field-textarea {
  background: var(--bg-color-tertiary);
  border-color: var(--border-color);
}

:global(.dark) .btn-secondary {
  background: var(--bg-color-tertiary);
  border-color: var(--border-color);
}

:global(.dark) .modal-content {
  background: var(--bg-color-secondary);
}
</style>
