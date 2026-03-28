<script setup lang="ts">
import { ref } from 'vue'

const reminders = ref([
  { id: '1', title: '喝水提醒', time: '09:00', repeat: 'daily', enabled: true },
  { id: '2', title: '眼保健操', time: '11:00', repeat: 'weekly', enabled: true },
  { id: '3', title: '午休时间', time: '12:30', repeat: 'daily', enabled: false }
])

const newReminder = ref({ title: '', time: '12:00', repeat: 'once' as const })

function addReminder() {
  if (!newReminder.value.title.trim()) return
  reminders.value.push({
    id: Date.now().toString(),
    ...newReminder.value,
    enabled: true
  })
  newReminder.value = { title: '', time: '12:00', repeat: 'once' }
}

function toggleReminder(id: string) {
  const reminder = reminders.value.find(r => r.id === id)
  if (reminder) {
    reminder.enabled = !reminder.enabled
  }
}

function deleteReminder(id: string) {
  const index = reminders.value.findIndex(r => r.id === id)
  if (index > -1) {
    reminders.value.splice(index, 1)
  }
}

function getRepeatLabel(repeat: string) {
  const labels: Record<string, string> = {
    once: '仅一次',
    daily: '每天',
    weekly: '每周',
    monthly: '每月'
  }
  return labels[repeat] || repeat
}
</script>

<template>
  <div class="reminder-module">
    <div class="module-header">
      <h2>定时提醒</h2>
      <p class="module-desc">设置重要事项提醒，不错过任何重要时刻</p>
    </div>

    <div class="add-reminder card">
      <input v-model="newReminder.title" type="text" placeholder="提醒标题" />
      <input v-model="newReminder.time" type="time" />
      <select v-model="newReminder.repeat">
        <option value="once">仅一次</option>
        <option value="daily">每天</option>
        <option value="weekly">每周</option>
        <option value="monthly">每月</option>
      </select>
      <button class="btn btn-primary" @click="addReminder">添加提醒</button>
    </div>

    <div class="reminder-list">
      <div
        v-for="reminder in reminders"
        :key="reminder.id"
        class="reminder-item card"
        :class="{ disabled: !reminder.enabled }"
      >
        <div class="reminder-toggle" @click="toggleReminder(reminder.id)">
          <span class="toggle-switch" :class="{ active: reminder.enabled }"></span>
        </div>
        <div class="reminder-info">
          <h3>{{ reminder.title }}</h3>
          <div class="reminder-meta">
            <span class="reminder-time">{{ reminder.time }}</span>
            <span class="badge badge-info">{{ getRepeatLabel(reminder.repeat) }}</span>
          </div>
        </div>
        <button class="btn btn-icon" @click="deleteReminder(reminder.id)">🗑️</button>
      </div>

      <div v-if="reminders.length === 0" class="empty-state">
        <span class="empty-icon">⏰</span>
        <p>暂无提醒</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reminder-module {
  max-width: 800px;
  margin: 0 auto;
}

.module-header {
  margin-bottom: 1.5rem;
}

.module-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.module-desc {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.add-reminder {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: stretch;
}

.add-reminder select {
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
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  min-width: 120px;
}

.add-reminder select:hover {
  border-color: var(--accent-color);
  background-color: var(--bg-hover);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-reminder select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.reminder-time {
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.reminder-item.disabled {
  opacity: 0.5;
}

.reminder-toggle {
  cursor: pointer;
}

.toggle-switch {
  display: block;
  width: 48px;
  height: 24px;
  background: var(--border-color);
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch.active {
  background: var(--success-color);
}

.toggle-switch.active::after {
  transform: translateX(24px);
}

.reminder-info {
  flex: 1;
}

.reminder-info h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.reminder-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reminder-time {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent-color);
  font-family: 'SF Mono', monospace;
}

.reminder-item .btn-icon {
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

.reminder-item:hover .btn-icon {
  opacity: 1;
}

.reminder-item .btn-icon:hover {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.reminder-item .btn-icon:active {
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
  .add-reminder {
    grid-template-columns: 1fr;
  }
}
</style>
