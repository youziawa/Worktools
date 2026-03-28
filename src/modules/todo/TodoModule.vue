<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TodoItem } from '@/types'

const todos = ref<TodoItem[]>([
  {
    id: '1',
    title: '完成项目企划书',
    description: '整理并完善项目功能需求和设计方案',
    priority: 'high',
    status: 'completed',
    tags: ['工作'],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date()
  },
  {
    id: '2',
    title: '搭建Vue项目基础结构',
    description: '初始化项目，安装依赖，配置路由和状态管理',
    priority: 'high',
    status: 'in-progress',
    tags: ['开发'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

const newTodo = ref({ title: '', description: '', priority: 'medium' as const })
const filter = ref<'all' | 'pending' | 'in-progress' | 'completed'>('all')

const filteredTodos = computed(() => {
  if (filter.value === 'all') return todos.value
  return todos.value.filter(t => t.status === filter.value)
})

const stats = computed(() => ({
  total: todos.value.length,
  pending: todos.value.filter(t => t.status === 'pending').length,
  inProgress: todos.value.filter(t => t.status === 'in-progress').length,
  completed: todos.value.filter(t => t.status === 'completed').length
}))

function addTodo() {
  if (!newTodo.value.title.trim()) return

  const todo: TodoItem = {
    id: Date.now().toString(),
    title: newTodo.value.title,
    description: newTodo.value.description,
    priority: newTodo.value.priority,
    status: 'pending',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  todos.value.unshift(todo)
  newTodo.value = { title: '', description: '', priority: 'medium' }
}

function toggleStatus(id: string) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    if (todo.status === 'completed') {
      todo.status = 'pending'
      todo.completedAt = undefined
    } else {
      todo.status = 'completed'
      todo.completedAt = new Date()
    }
    todo.updatedAt = new Date()
  }
}

function deleteTodo(id: string) {
  const index = todos.value.findIndex(t => t.id === id)
  if (index > -1) {
    todos.value.splice(index, 1)
  }
}

function getPriorityClass(priority: string) {
  return {
    'badge-error': priority === 'high',
    'badge-warning': priority === 'medium',
    'badge-info': priority === 'low'
  }
}
</script>

<template>
  <div class="todo-module">
    <div class="todo-header">
      <h2>待办清单</h2>
      <div class="stats">
        <span class="stat-item">总计: {{ stats.total }}</span>
        <span class="stat-item pending">待办: {{ stats.pending }}</span>
        <span class="stat-item in-progress">进行中: {{ stats.inProgress }}</span>
        <span class="stat-item completed">已完成: {{ stats.completed }}</span>
      </div>
    </div>

    <div class="add-todo-form card">
      <input
        v-model="newTodo.title"
        type="text"
        placeholder="添加新任务..."
        @keyup.enter="addTodo"
      />
      <input
        v-model="newTodo.description"
        type="text"
        placeholder="描述 (可选)"
      />
      <select v-model="newTodo.priority">
        <option value="high">高优先级</option>
        <option value="medium">中优先级</option>
        <option value="low">低优先级</option>
      </select>
      <button class="btn btn-primary" @click="addTodo">添加</button>
    </div>

    <div class="filter-bar">
      <button
        v-for="f in ['all', 'pending', 'in-progress', 'completed'] as const"
        :key="f"
        class="filter-btn"
        :class="{ active: filter === f }"
        @click="filter = f"
      >
        {{ f === 'all' ? '全部' : f === 'pending' ? '待办' : f === 'in-progress' ? '进行中' : '已完成' }}
      </button>
    </div>

    <div class="todo-list">
      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="todo-item card"
        :class="{ completed: todo.status === 'completed' }"
      >
        <div class="todo-checkbox" @click="toggleStatus(todo.id)">
          <span v-if="todo.status === 'completed'" class="check-icon">✓</span>
        </div>
        <div class="todo-content">
          <h3 class="todo-title">{{ todo.title }}</h3>
          <p v-if="todo.description" class="todo-description">{{ todo.description }}</p>
          <div class="todo-meta">
            <span class="badge" :class="getPriorityClass(todo.priority)">
              {{ todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低' }}
            </span>
            <span class="todo-date">{{ new Date(todo.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
        <button class="btn btn-icon delete-btn" @click="deleteTodo(todo.id)">🗑️</button>
      </div>

      <div v-if="filteredTodos.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <p>暂无任务</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-module {
  max-width: 800px;
  margin: 0 auto;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.todo-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.stat-item {
  color: var(--text-secondary);
}

.stat-item.pending { color: var(--accent-color); }
.stat-item.in-progress { color: var(--warning-color); }
.stat-item.completed { color: var(--success-color); }

.add-todo-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: stretch;
}

.add-todo-form input,
.add-todo-form select {
  width: 100%;
}

.add-todo-form select {
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.add-todo-form select:hover {
  border-color: var(--accent-color);
  background-color: var(--bg-hover);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-todo-form select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.filter-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-btn:hover,
.filter-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  transition: all 0.2s;
}

.todo-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.todo-item.completed {
  opacity: 0.7;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
}

.todo-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.todo-checkbox:hover {
  border-color: var(--accent-color);
  background: var(--bg-hover);
}

.check-icon {
  color: var(--success-color);
  font-weight: bold;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.todo-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.todo-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.delete-btn {
  opacity: 0;
  transition: all 0.2s ease;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid transparent;
  cursor: pointer;
}

.todo-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.delete-btn:active {
  transform: scale(1);
  box-shadow: none;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .add-todo-form {
    grid-template-columns: 1fr;
  }

  .todo-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats {
    flex-wrap: wrap;
  }
}
</style>
