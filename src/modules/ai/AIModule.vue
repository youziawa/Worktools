<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useAIStore } from '@/stores/ai'
import type { AIModel, AIProvider, AIConversation } from '@/types'

const aiStore = useAIStore()

const showSettings = ref(false)
const showAddModel = ref(false)
const editingModel = ref<AIModel | null>(null)

const newModel = ref({
  name: '',
  provider: 'openai' as AIProvider,
  apiKey: '',
  baseUrl: '',
  modelName: '',
  maxTokens: 2000,
  temperature: 0.7,
  enabled: true
})

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const attachments = ref<Array<{ file: File; preview: string }>>([])
const fileInput = ref<HTMLInputElement | null>(null)

const providerOptions = [
  { value: 'openai', label: 'OpenAI', placeholder: 'sk-...', baseUrl: 'https://api.openai.com' },
  { value: 'anthropic', label: 'Claude (Anthropic)', placeholder: 'sk-ant-...', baseUrl: 'https://api.anthropic.com' },
  { value: 'ollama', label: 'Ollama (本地)', placeholder: '本地模型', baseUrl: 'http://localhost:11434' },
  { value: 'custom', label: '自定义 API', placeholder: 'API Key', baseUrl: '' }
]

const modelOptions = {
  openai: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  ollama: ['llama2', 'mistral', 'codellama'],
  custom: []
}

const selectedProviderModels = computed(() => {
  return modelOptions[newModel.value.provider as keyof typeof modelOptions] || []
})

watch(() => newModel.value.provider, (newProvider) => {
  const provider = providerOptions.find(p => p.value === newProvider)
  if (provider) {
    if (!newModel.value.baseUrl || providerOptions.some(p => p.baseUrl === newModel.value.baseUrl)) {
      newModel.value.baseUrl = provider.baseUrl
    }
    if (newProvider !== 'custom' && selectedProviderModels.value.length > 0) {
      newModel.value.modelName = selectedProviderModels.value[0]
    }
  }
})

const canSend = computed(() => {
  return messageInput.value.trim() && aiStore.activeModel && !aiStore.isStreaming
})

async function sendMessage() {
  if (!canSend.value) return

  let conversation = aiStore.activeConversation

  if (!conversation) {
    if (!aiStore.activeModel) {
      aiStore.currentError = '请先选择一个AI模型'
      return
    }
    conversation = aiStore.createConversation(aiStore.activeModel.id)
  }

  const content = messageInput.value.trim()
  messageInput.value = ''

  let attachmentInfo = ''
  if (attachments.value.length > 0) {
    attachmentInfo = attachments.value.map(a => `[附件: ${a.file.name}]`).join(' ')
  }
  const fullContent = attachmentInfo ? `${attachmentInfo}\n\n${content}` : content

  await aiStore.sendMessage(conversation.id, fullContent)

  attachments.value = []

  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function openAddModel() {
  editingModel.value = null
  newModel.value = {
    name: '',
    provider: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com',
    modelName: 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.7,
    enabled: true
  }
  showAddModel.value = true
}

function openEditModel(model: AIModel) {
  editingModel.value = model
  newModel.value = {
    name: model.name,
    provider: model.provider,
    apiKey: model.apiKey || '',
    baseUrl: model.baseUrl || '',
    modelName: model.modelName,
    maxTokens: model.maxTokens || 2000,
    temperature: model.temperature || 0.7,
    enabled: model.enabled
  }
  showAddModel.value = true
}

async function saveModel() {
  if (!newModel.value.name || !newModel.value.modelName) return

  if (editingModel.value) {
    aiStore.updateModel(editingModel.value.id, {
      name: newModel.value.name,
      provider: newModel.value.provider,
      apiKey: newModel.value.apiKey || undefined,
      baseUrl: newModel.value.baseUrl || undefined,
      modelName: newModel.value.modelName,
      maxTokens: newModel.value.maxTokens,
      temperature: newModel.value.temperature,
      enabled: newModel.value.enabled
    })
  } else {
    aiStore.addModel({
      name: newModel.value.name,
      provider: newModel.value.provider,
      apiKey: newModel.value.apiKey || undefined,
      baseUrl: newModel.value.baseUrl || undefined,
      modelName: newModel.value.modelName,
      maxTokens: newModel.value.maxTokens,
      temperature: newModel.value.temperature,
      enabled: newModel.value.enabled
    })
  }

  showAddModel.value = false
}

async function testModel() {
  if (!newModel.value.modelName) return

  const tempModel: AIModel = {
    id: 'test',
    name: newModel.value.name,
    provider: newModel.value.provider,
    apiKey: newModel.value.apiKey || undefined,
    baseUrl: newModel.value.baseUrl || undefined,
    modelName: newModel.value.modelName,
    maxTokens: newModel.value.maxTokens,
    temperature: newModel.value.temperature,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const result = await aiStore.testConnection(tempModel)
  alert(result.message)
}

function deleteModelConfirm(id: string) {
  if (confirm('确定要删除这个模型吗？')) {
    aiStore.deleteModel(id)
  }
}

function startNewConversation() {
  if (aiStore.activeModel) {
    aiStore.createConversation(aiStore.activeModel.id)
  }
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  Array.from(input.files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      attachments.value.push({
        file,
        preview: e.target?.result as string
      })
    }
    reader.readAsDataURL(file)
  })

  input.value = ''
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1)
}

function triggerFileInput() {
  fileInput.value?.click()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

watch(() => aiStore.activeConversation?.messages.length, () => {
  nextTick(() => scrollToBottom())
})
</script>

<template>
  <div class="ai-module">
    <div class="ai-container">
      <aside class="ai-sidebar">
        <div class="sidebar-header">
          <h3>AI 助手</h3>
          <button class="btn btn-icon" @click="showSettings = !showSettings" title="设置">
            ⚙️
          </button>
        </div>

        <div class="sidebar-content">
          <div v-if="!showSettings">
            <button class="btn btn-primary new-chat-btn" @click="startNewConversation">
              ➕ 新对话
            </button>

            <div class="conversations-list">
              <div
                v-for="conv in aiStore.conversations"
                :key="conv.id"
                class="conversation-item"
                :class="{ active: conv.id === aiStore.activeConversationId }"
                @click="aiStore.selectConversation(conv.id)"
              >
                <div class="conversation-info">
                  <span class="conversation-title">{{ conv.title }}</span>
                  <span class="conversation-meta">{{ conv.messages.length}} 条消息</span>
                </div>
                <button class="btn btn-icon delete-btn" @click.stop="aiStore.deleteConversation(conv.id)">
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <div v-else class="settings-panel">
            <div class="settings-header">
              <button class="btn btn-ghost" @click="showSettings = false">← 返回</button>
              <h3>模型设置</h3>
            </div>

            <div class="models-list">
              <div
                v-for="model in aiStore.models"
                :key="model.id"
                class="model-item"
                :class="{ enabled: model.enabled }"
              >
                <div class="model-info">
                  <div class="model-header">
                    <span class="model-name">{{ model.name }}</span>
                    <span class="model-badge">{{ model.provider }}</span>
                  </div>
                  <span class="model-detail">{{ model.modelName }}</span>
                </div>
                <div class="model-actions">
                  <button class="btn btn-icon" @click="aiStore.toggleModel(model.id)" :title="model.enabled ? '禁用' : '启用'">
                    {{ model.enabled ? '🔵' : '⚪' }}
                  </button>
                  <button class="btn btn-icon" @click="openEditModel(model)" title="编辑">✏️</button>
                  <button class="btn btn-icon" @click="deleteModelConfirm(model.id)" title="删除">🗑️</button>
                </div>
              </div>

              <button class="btn btn-secondary add-model-btn" @click="openAddModel">
                ➕ 添加模型
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main class="ai-main">
        <div v-if="!aiStore.activeModel" class="empty-state">
          <div class="empty-icon">🤖</div>
          <h3>开始使用 AI 助手</h3>
          <p>请先在设置中添加并启用一个 AI 模型</p>
          <button class="btn btn-primary" @click="showSettings = true; showAddModel = true">
            添加模型
          </button>
        </div>

        <template v-else>
          <div class="chat-header">
            <div class="current-model">
              <span class="model-label">当前模型:</span>
              <span class="model-name">{{ aiStore.activeModel.name }}</span>
            </div>
            <button class="btn btn-ghost" @click="startNewConversation">新对话</button>
          </div>

          <div ref="messagesContainer" class="messages-container">
            <div v-if="!aiStore.activeConversation?.messages.length" class="welcome-message">
              <div class="welcome-icon">👋</div>
              <h3>你好！我是 AI 助手</h3>
              <p>使用 {{ aiStore.activeModel.name }} 模型为您服务</p>
              <p class="welcome-hint">发送消息开始对话</p>
            </div>

            <div
              v-for="message in aiStore.activeConversation?.messages"
              :key="message.id"
              class="message"
              :class="message.role"
            >
              <div class="message-avatar">
                {{ message.role === 'user' ? '👤' : '🤖' }}
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>

            <div v-if="aiStore.isStreaming" class="message assistant streaming">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="message-text typing">
                  <span class="typing-dot">●</span>
                  <span class="typing-dot">●</span>
                  <span class="typing-dot">●</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="aiStore.currentError" class="error-banner">
            <span>⚠️ {{ aiStore.currentError }}</span>
            <button class="btn btn-icon" @click="aiStore.clearError">✕</button>
          </div>

          <div class="input-container">
            <div v-if="attachments.length > 0" class="attachments-preview">
              <div v-for="(att, index) in attachments" :key="index" class="attachment-item">
                <img v-if="att.file.type.startsWith('image/')" :src="att.preview" :alt="att.file.name" />
                <div v-else class="file-icon">📄</div>
                <div class="attachment-info">
                  <span class="attachment-name">{{ att.file.name }}</span>
                  <span class="attachment-size">{{ formatFileSize(att.file.size) }}</span>
                </div>
                <button class="btn btn-icon remove-attachment" @click="removeAttachment(index)">✕</button>
              </div>
            </div>

            <div class="input-wrapper">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                @change="handleFileSelect"
                style="display: none"
              />
              <button class="btn btn-icon attach-btn" @click="triggerFileInput" title="添加附件">
                📎
              </button>
              <textarea
                v-model="messageInput"
                placeholder="输入消息... (Shift+Enter 换行)"
                rows="1"
                @keydown="handleKeyDown"
                :disabled="aiStore.isStreaming"
              ></textarea>
              <button
                class="btn btn-primary send-btn"
                @click="sendMessage"
                :disabled="!canSend"
              >
                {{ aiStore.isStreaming ? '⏳' : '➤' }}
              </button>
            </div>
            <div class="input-hint">
              按 Enter 发送，Shift + Enter 换行 | 支持图片、PDF、Word、TXT
            </div>
          </div>
        </template>
      </main>
    </div>

    <div v-if="showAddModel" class="modal-overlay" @click.self="showAddModel = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingModel ? '编辑模型' : '添加模型' }}</h3>
          <button class="btn btn-icon" @click="showAddModel = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>模型名称</label>
            <input v-model="newModel.name" type="text" placeholder="例如: 我的 GPT-4" />
          </div>

          <div class="form-group">
            <label>提供商</label>
            <select v-model="newModel.provider">
              <option v-for="opt in providerOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>API Key</label>
            <input
              v-model="newModel.apiKey"
              type="password"
              :placeholder="providerOptions.find(p => p.value === newModel.provider)?.placeholder"
            />
          </div>

          <div v-if="newModel.provider === 'custom'" class="form-group">
            <label>API 地址</label>
            <input v-model="newModel.baseUrl" type="text" placeholder="https://api.example.com" />
          </div>

          <div class="form-group">
            <label>模型名称</label>
            <input
              v-if="selectedProviderModels.length === 0"
              v-model="newModel.modelName"
              type="text"
              placeholder="例如: gpt-4"
            />
            <select v-else v-model="newModel.modelName">
              <option v-for="model in selectedProviderModels" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>最大 Token 数</label>
              <input v-model.number="newModel.maxTokens" type="number" min="100" max="100000" />
            </div>

            <div class="form-group">
              <label>Temperature</label>
              <input v-model.number="newModel.temperature" type="number" min="0" max="2" step="0.1" />
            </div>
          </div>

          <div class="form-group checkbox">
            <label>
              <input type="checkbox" v-model="newModel.enabled" />
              启用此模型
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="testModel">🔗 测试连接</button>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showAddModel = false">取消</button>
            <button class="btn btn-primary" @click="saveModel">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-module {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.ai-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.ai-sidebar {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.new-chat-btn {
  width: 100%;
  margin-bottom: 1rem;
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conversation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.conversation-item:hover {
  background: var(--bg-hover);
}

.conversation-item.active {
  background: var(--accent-color);
  color: white;
}

.conversation-item.active .conversation-meta {
  color: rgba(255, 255, 255, 0.8);
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.conversation-item .delete-btn {
  opacity: 0;
  padding: 0.25rem;
  font-size: 0.875rem;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.settings-header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.models-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.model-item {
  padding: 0.75rem;
  background: var(--bg-hover);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.model-item.enabled {
  border-color: var(--accent-color);
  background: rgba(59, 130, 246, 0.05);
}

.model-info {
  margin-bottom: 0.5rem;
}

.model-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.model-name {
  font-size: 0.875rem;
  font-weight: 600;
}

.model-badge {
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg-card);
  border-radius: 9999px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.model-detail {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.model-actions {
  display: flex;
  gap: 0.25rem;
}

.model-actions .btn-icon {
  padding: 0.25rem;
  font-size: 0.875rem;
}

.add-model-btn {
  width: 100%;
}

.ai-main {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-state .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-model {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.model-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.current-model .model-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-color);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.welcome-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.welcome-message h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.welcome-message p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.welcome-hint {
  margin-top: 0.5rem;
  color: var(--accent-color) !important;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.assistant {
  align-self: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: var(--accent-color);
  color: white;
}

.message-content {
  flex: 1;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: var(--bg-hover);
  font-size: 0.9375rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message.user .message-text {
  background: var(--accent-color);
  color: white;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  padding: 0 0.5rem;
}

.message.user .message-time {
  text-align: right;
}

.message.typing .message-text {
  display: flex;
  gap: 0.25rem;
}

.typing-dot {
  animation: typing 1s infinite;
  color: var(--text-secondary);
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.error-banner {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.input-container {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.attachments-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-hover);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.attachment-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 4px;
  font-size: 1.5rem;
}

.attachment-info {
  display: flex;
  flex-direction: column;
  max-width: 150px;
}

.attachment-name {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-size {
  font-size: 0.625rem;
  color: var(--text-secondary);
}

.remove-attachment {
  padding: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.remove-attachment:hover {
  color: var(--error-color);
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.input-wrapper textarea {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  line-height: 1.5;
  resize: none;
  min-height: 44px;
  max-height: 200px;
  font-family: inherit;
}

.input-wrapper textarea:focus {
  border-color: var(--accent-color);
  outline: none;
}

.attach-btn {
  padding: 0.5rem;
  font-size: 1.25rem;
  border-radius: 8px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  transition: all 0.2s;
}

.attach-btn:hover {
  background: var(--accent-color);
  color: white;
}

.input-wrapper textarea:disabled {
  opacity: 0.6;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 1.25rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  text-align: center;
}

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
  padding: 1rem;
}

.modal {
  background: var(--bg-card);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
}

.form-group.checkbox input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-ghost {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .ai-container {
    grid-template-columns: 1fr;
  }

  .ai-sidebar {
    display: none;
  }

  .message {
    max-width: 95%;
  }
}
</style>
