import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIModel, AIConversation, AIMessage } from '@/types'

const STORAGE_KEY_MODELS = 'worktools_ai_models'
const STORAGE_KEY_CONVERSATIONS = 'worktools_ai_conversations'
const STORAGE_KEY_ACTIVE_CONVERSATION = 'worktools_ai_active_conversation'

export const useAIStore = defineStore('ai', () => {
  const models = ref<AIModel[]>(loadModels())
  const conversations = ref<AIConversation[]>(loadConversations())
  const activeConversationId = ref<string | null>(loadActiveConversation())
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const currentError = ref<string | null>(null)

  function loadModels(): AIModel[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODELS)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load models:', e)
    }
    return []
  }

  function saveModels() {
    try {
      localStorage.setItem(STORAGE_KEY_MODELS, JSON.stringify(models.value))
    } catch (e) {
      console.error('Failed to save models:', e)
    }
  }

  function loadConversations(): AIConversation[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVERSATIONS)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
    return []
  }

  function saveConversations() {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations.value))
    } catch (e) {
      console.error('Failed to save conversations:', e)
    }
  }

  function loadActiveConversation(): string | null {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_CONVERSATION)
  }

  function saveActiveConversation() {
    if (activeConversationId.value) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_CONVERSATION, activeConversationId.value)
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_CONVERSATION)
    }
  }

  const activeModel = computed(() => {
    return models.value.find(m => m.enabled)
  })

  const activeConversation = computed(() => {
    return conversations.value.find(c => c.id === activeConversationId.value)
  })

  const enabledModels = computed(() => {
    return models.value.filter(m => m.enabled)
  })

  function addModel(model: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>) {
    const newModel: AIModel = {
      ...model,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    models.value.push(newModel)
    saveModels()
    return newModel
  }

  function updateModel(id: string, updates: Partial<AIModel>) {
    const index = models.value.findIndex(m => m.id === id)
    if (index > -1) {
      models.value[index] = {
        ...models.value[index],
        ...updates,
        updatedAt: new Date()
      }
      saveModels()
    }
  }

  function deleteModel(id: string) {
    const index = models.value.findIndex(m => m.id === id)
    if (index > -1) {
      models.value.splice(index, 1)
      saveModels()
    }
  }

  function toggleModel(id: string) {
    const model = models.value.find(m => m.id === id)
    if (model) {
      updateModel(id, { enabled: !model.enabled })
    }
  }

  async function testConnection(model: AIModel): Promise<{ success: boolean; message: string }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (model.apiKey) {
        if (model.provider === 'openai') {
          headers['Authorization'] = `Bearer ${model.apiKey}`
        } else if (model.provider === 'anthropic') {
          headers['x-api-key'] = model.apiKey
          headers['anthropic-version'] = '2023-06-01'
        }
      }

      const testMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      }

      let endpoint = ''
      let body = {}

      if (model.provider === 'openai') {
        endpoint = `${model.baseUrl || 'https://api.openai.com'}/v1/chat/completions`
        body = {
          model: model.modelName,
          messages: [testMessage],
          max_tokens: 5
        }
      } else if (model.provider === 'anthropic') {
        endpoint = `${model.baseUrl || 'https://api.anthropic.com'}/v1/messages`
        body = {
          model: model.modelName,
          messages: [testMessage],
          max_tokens: 5
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return { success: true, message: '连接成功！' }
      } else {
        const error = await response.json().catch(() => ({}))
        return { success: false, message: `连接失败: ${error.error?.message || response.statusText}` }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, message: '连接超时，请检查网络或API地址' }
      }
      return { success: false, message: `连接失败: ${error.message}` }
    }
  }

  function createConversation(modelId: string): AIConversation {
    const conversation: AIConversation = {
      id: Date.now().toString(),
      title: '新对话',
      modelId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversations.value.unshift(conversation)
    activeConversationId.value = conversation.id
    saveConversations()
    saveActiveConversation()
    return conversation
  }

  function selectConversation(id: string) {
    activeConversationId.value = id
    saveActiveConversation()
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index > -1) {
      conversations.value.splice(index, 1)
      if (activeConversationId.value === id) {
        activeConversationId.value = conversations.value[0]?.id || null
        saveActiveConversation()
      }
      saveConversations()
    }
  }

  function addMessage(conversationId: string, message: Omit<AIMessage, 'id' | 'timestamp'>) {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      const newMessage: AIMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date()
      }
      conversation.messages.push(newMessage)
      conversation.updatedAt = new Date()

      if (conversation.messages.length === 1) {
        conversation.title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
      }

      saveConversations()
      return newMessage
    }
    return null
  }

  function updateMessage(conversationId: string, messageId: string, content: string) {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      const message = conversation.messages.find(m => m.id === messageId)
      if (message) {
        message.content = content
        conversation.updatedAt = new Date()
        saveConversations()
      }
    }
  }

  async function sendMessage(conversationId: string, content: string, attachments?: any[]) {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (!conversation) return

    const model = models.value.find(m => m.id === conversation.modelId)
    if (!model) {
      currentError.value = '请先配置并选择一个AI模型'
      return
    }

    addMessage(conversationId, {
      role: 'user',
      content,
      attachments
    })

    const assistantMessage = addMessage(conversationId, {
      role: 'assistant',
      content: ''
    })

    if (!assistantMessage) return

    isStreaming.value = true
    currentError.value = null

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (model.apiKey) {
        if (model.provider === 'openai') {
          headers['Authorization'] = `Bearer ${model.apiKey}`
        } else if (model.provider === 'anthropic') {
          headers['x-api-key'] = model.apiKey
          headers['anthropic-version'] = '2023-06-01'
        }
      }

      let endpoint = ''
      let body = {}

      if (model.provider === 'openai') {
        endpoint = `${model.baseUrl || 'https://api.openai.com'}/v1/chat/completions`
        const messages = conversation.messages.slice(0, -1).map(m => ({
          role: m.role,
          content: m.content
        }))
        messages.push({ role: 'user', content })
        body = {
          model: model.modelName,
          messages,
          max_tokens: model.maxTokens || 2000,
          temperature: model.temperature || 0.7,
          stream: true
        }
      } else if (model.provider === 'anthropic') {
        endpoint = `${model.baseUrl || 'https://api.anthropic.com'}/v1/messages`
        const messages = conversation.messages.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
        messages.push({ role: 'user', content })
        body = {
          model: model.modelName,
          messages,
          max_tokens: model.maxTokens || 4096,
          temperature: model.temperature || 0.7,
          stream: true
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error?.message || response.statusText)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('无法读取响应')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              if (model.provider === 'openai') {
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  assistantMessage.content += content
                  updateMessage(conversationId, assistantMessage.id, assistantMessage.content)
                }
              } else if (model.provider === 'anthropic') {
                const content = parsed.delta?.text
                if (content) {
                  assistantMessage.content += content
                  updateMessage(conversationId, assistantMessage.id, assistantMessage.content)
                }
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error: any) {
      currentError.value = error.message
      updateMessage(conversationId, assistantMessage.id, `错误: ${error.message}`)
    } finally {
      isStreaming.value = false
    }
  }

  function clearError() {
    currentError.value = null
  }

  return {
    models,
    conversations,
    activeConversationId,
    activeConversation,
    activeModel,
    enabledModels,
    isLoading,
    isStreaming,
    currentError,
    addModel,
    updateModel,
    deleteModel,
    toggleModel,
    testConnection,
    createConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    updateMessage,
    sendMessage,
    clearError
  }
})
