<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const modules = [
  { id: 'pomodoro', name: '番茄钟', icon: '🍅' },
  { id: 'todo', name: '待办清单', icon: '📋' },
  { id: 'reminder', name: '定时提醒', icon: '⏰' },
  { id: 'inspiration', name: '灵感速记', icon: '💡' },
  { id: 'ai', name: 'AI助手', icon: '🤖' }
]

const themeIcon = computed(() => {
  switch (appStore.settings.theme) {                 
    case 'light': return '☀️'
    case 'dark': return '🌙'
    case 'eye-care': return '🌿'
  }
})

const themeLabel = computed(() => {
  switch (appStore.settings.theme) {
    case 'light': return '浅色'
    case 'dark': return '深色'
    case 'eye-care': return '护眼'
  }
})
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">WorkTools</h1>
        <span class="app-subtitle">办公学习聚合工具</span>
      </div>
      <div class="header-right">
        <button class="theme-toggle" @click="appStore.toggleTheme" :title="`切换主题: ${themeLabel}`">
          <span class="theme-icon">{{ themeIcon }}</span>
          <span class="theme-label">{{ themeLabel }}</span>
        </button>
      </div>
    </header>

    <nav class="app-nav">
      <button
        v-for="mod in modules"
        :key="mod.id"
        class="nav-item"
        :class="{ active: appStore.currentModule === mod.id }"
        @click="appStore.setCurrentModule(mod.id)"
      >
        <span class="nav-icon">{{ mod.icon }}</span>
        <span class="nav-label">{{ mod.name }}</span>
      </button>
    </nav>

    <main class="app-main">
      <slot></slot>
    </main>

    <footer class="app-footer">
      <span>WorkTools v1.0</span>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-color);
  margin: 0;
}

.app-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  gap: 1rem;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.theme-toggle:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.theme-icon {
  font-size: 1rem;
}

.theme-label {
  font-size: 0.75rem;
}

.app-nav {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  min-width: 80px;
}

.nav-item:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.nav-icon {
  font-size: 1.5rem;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.app-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.app-footer {
  padding: 1rem 2rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .app-subtitle {
    display: none;
  }

  .app-nav {
    padding: 1rem;
    gap: 0.25rem;
  }

  .nav-item {
    padding: 0.5rem 1rem;
    min-width: 60px;
  }

  .nav-label {
    font-size: 0.625rem;
  }

  .app-main {
    padding: 1rem;
  }
}
</style>
