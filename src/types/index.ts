export interface TodoItem {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed' | 'archived'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  dueDate?: Date
}

export interface Inspiration {
  id: string
  content: string
  plainText: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  source: 'quick' | 'manual'
}

export interface Reminder {
  id: string
  title: string
  description?: string
  time: string
  repeat: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
  cronExpression?: string
  enabled: boolean
  preNotify: number
  createdAt: Date
}

export interface PomodoroSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
}

export interface PomodoroSession {
  type: 'focus' | 'short-break' | 'long-break'
  remaining: number
  completed: number
  isRunning: boolean
  isPaused: boolean
}

export type ThemeMode = 'light' | 'dark' | 'eye-care'

export interface AppSettings {
  theme: ThemeMode
  soundEnabled: boolean
  notificationsEnabled: boolean
  showInDock: boolean
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama' | 'custom'

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  apiKey?: string
  baseUrl?: string
  modelName: string
  maxTokens?: number
  temperature?: number
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  attachments?: AIAttachment[]
}

export interface AIAttachment {
  id: string
  type: 'image' | 'file'
  name: string
  size: number
  url: string
  mimeType: string
}

export interface AIConversation {
  id: string
  title: string
  modelId: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface AIStreamChunk {
  content: string
  done: boolean
}
