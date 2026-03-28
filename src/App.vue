<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import MainLayout from '@/components/layout/MainLayout.vue'
import PomodoroModule from '@/modules/pomodoro/PomodoroModule.vue'
import TodoModule from '@/modules/todo/TodoModule.vue'
import ReminderModule from '@/modules/reminder/ReminderModule.vue'
import InspirationModule from '@/modules/inspiration/InspirationModule.vue'
import AIModule from '@/modules/ai/AIModule.vue'

const appStore = useAppStore()

const moduleComponents = {
  pomodoro: PomodoroModule,
  todo: TodoModule,
  reminder: ReminderModule,
  inspiration: InspirationModule,
  ai: AIModule
}
</script>

<template>
  <MainLayout>
    <component :is="moduleComponents[appStore.currentModule as keyof typeof moduleComponents]" />
  </MainLayout>
</template>

<style>
@import './assets/styles/main.css';
</style>
