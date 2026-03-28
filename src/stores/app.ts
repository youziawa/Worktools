import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ThemeMode, AppSettings } from '@/types'

const STORAGE_KEY = 'worktools_settings'

export const useAppStore = defineStore('app', () => {
  const settings = ref<AppSettings>(loadSettings())

  function loadSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
    return {
      theme: 'light',
      soundEnabled: true,
      notificationsEnabled: true,
      showInDock: true
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
      applyTheme()
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  function applyTheme() {
    const root = document.documentElement
    root.setAttribute('data-theme', settings.value.theme)
  }

  function setTheme(theme: ThemeMode) {
    settings.value.theme = theme
    saveSettings()
  }

  function toggleTheme() {
    const themes: ThemeMode[] = ['light', 'dark', 'eye-care']
    const currentIndex = themes.indexOf(settings.value.theme)
    settings.value.theme = themes[(currentIndex + 1) % themes.length]
    saveSettings()
  }

  function updateSettings(newSettings: Partial<AppSettings>) {
    Object.assign(settings.value, newSettings)
    saveSettings()
  }

  const currentModule = ref('pomodoro')

  function setCurrentModule(module: string) {
    currentModule.value = module
  }

  watch(() => settings.value.theme, applyTheme, { immediate: true })

  return {
    settings,
    currentModule,
    setTheme,
    toggleTheme,
    updateSettings,
    setCurrentModule
  }
})
