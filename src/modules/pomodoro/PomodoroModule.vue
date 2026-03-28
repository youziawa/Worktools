<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { PomodoroSettings, PomodoroSession } from '@/types'

const settings = ref<PomodoroSettings>({
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true
})

const session = ref<PomodoroSession>({
  type: 'focus',
  remaining: settings.value.focusDuration * 60,
  completed: 0,
  isRunning: false,
  isPaused: false
})

const timer = ref<number | null>(null)

const progress = computed(() => {
  const total = session.value.type === 'focus'
    ? settings.value.focusDuration * 60
    : session.value.type === 'short-break'
    ? settings.value.shortBreakDuration * 60
    : settings.value.longBreakDuration * 60
  return ((total - session.value.remaining) / total) * 100
})

const formattedTime = computed(() => {
  const minutes = Math.floor(session.value.remaining / 60)
  const seconds = session.value.remaining % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const sessionLabel = computed(() => {
  switch (session.value.type) {
    case 'focus': return '专注时间'
    case 'short-break': return '短休息'
    case 'long-break': return '长休息'
  }
})

const sessionColor = computed(() => {
  switch (session.value.type) {
    case 'focus': return 'var(--accent-color)'
    case 'short-break': return 'var(--success-color)'
    case 'long-break': return 'var(--warning-color)'
  }
})

function startTimer() {
  if (session.value.isRunning) return
  session.value.isRunning = true
  session.value.isPaused = false

  timer.value = window.setInterval(() => {
    if (session.value.remaining > 0) {
      session.value.remaining--
    } else {
      completeSession()
    }
  }, 1000)
}

function pauseTimer() {
  session.value.isRunning = false
  session.value.isPaused = true
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

function resetTimer() {
  pauseTimer()
  session.value.remaining = session.value.type === 'focus'
    ? settings.value.focusDuration * 60
    : session.value.type === 'short-break'
    ? settings.value.shortBreakDuration * 60
    : settings.value.longBreakDuration * 60
}

function completeSession() {
  pauseTimer()

  if (session.value.type === 'focus') {
    session.value.completed++
    if (settings.value.soundEnabled) {
      playSound()
    }

    if (session.value.completed % settings.value.longBreakInterval === 0) {
      session.value.type = 'long-break'
      session.value.remaining = settings.value.longBreakDuration * 60
    } else {
      session.value.type = 'short-break'
      session.value.remaining = settings.value.shortBreakDuration * 60
    }

    if (settings.value.autoStartBreaks) {
      startTimer()
    }
  } else {
    session.value.type = 'focus'
    session.value.remaining = settings.value.focusDuration * 60

    if (settings.value.autoStartFocus) {
      startTimer()
    }
  }
}

function playSound() {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVcQNpHW+NueZVQ1Wq/w/5xkPjxbs/P/oG1TOTCm3f+kbFE5QqPW/6VsTjo0odf/qm1PPDCg1v+nbVA7OJ/S/6hvTkA3ntT/q3BWQjmZ0P+peVhFOJXP/6l6WkY8l8v/qHpaSD2Uyf+ne1tJPJPH/6Z8XEpAk8X/pn1dS0GUxP+lfV5LQpTD/6V/XktClML/pX9eS0KTwf+kf19LQ5PB/6R/X0xDlMH/pH5gTUOTwf+jfmFNQ5TB/6N9Yk1ElMH/o31iTUWUwf+jfWNNRpTB/6N8Y01GlMH/o3xjTUeUwf+jfGNNR5TB/6N8Y01IlMH/onxjTUiUwf+ifGNNTZTB/6J8Y01OlMH/onxjTU+Uwf+ifGNNUJTB/6J8Y01QlMH/onxjTVGUwf+ifGNNUpTB/6J8Y01TlMH/onxjTVOUwf+ifGNNVJTB/6J8Y01UlMH/onxjTVWUwf+ifGNNVpTB/6J8Y01XlMH/onxjTViUwf+ifGNNWJTB/6J8Y01ZlMH/onxjTVmUwf+ifGNNWZTB/6J8Y01blMH/onxjTVuUwf+ifGNNXJTB/6J8Y01clMH/onxjTV2Uwf+ifGNNXpTB/6J8Y01flMH/onxjTWGUwf+ifGNNYZTB/6J8Y01ilMH/onxjTWOUwf+ifGNNZJTB/6J8Y01llMH/onxjTWaUwf+ifGNNZ5TB/6J8Y01olMH/onxjTWmUwf+ifGNNapTB/6J8Y01rlMH/onxjTWuUwf+ifGNNbJTB/6J8Y01slMH/onxjTW2Uwf+ifGNNbpTB/6J8Y01vlMH/onxjTYGUwf+ifGNNgZTB/6J8Y02BlMH/onxjTYKUwf+ifGNNgpTB/6J8Y02DlMH/onxjTYOUwf+ifGNNhJTB/6J8Y02FlMH/onxjTYWUwf+ifGNNhpTB/6J8Y02HlMH/onxjTYqUwf+ifGNNiZTB/6J8Y02KlMH/onxjTYqUwf+ifGNNi5TB/6J8Y02LlMH/onxjTYyUwf+ifGNNjJTB/6J8Y02NlMH/onxjTY6Uwf+ifGNNjpTB/6J8Y02PlMH/onxjTY+Uwf+ifGNNkJTB/6J8Y02RlMH/onxjTZKUwf+ifGNNkpTB/6J8Y02TlMH/onxjTZWUwf+ifGNNlpTB/6J8Y02XlMH/onxjTZKUwf+ifGNNl5TB/6J8Y02XlMH/onxjTZqUwf+ifGNNmpTB/6J8Y02alMH/onxjTZqUwf+ifGNNm5TB/6J8Y02blMH/onxjTZ2Uwf+ifGNNnZTB/6J8Y02flMH/onxjTZ+Uwf+ifGNNn5TB/6J8Y02glMH/onxjTaCUwf+ifGNNn5TB/6J8Y02hlMH/onxjTaGUwf+ifGNNopTB/6J8Y02ilMH/onxjTaOUwf+ifGNNpJTB/6J8Y02llMH/onxjTaWUwf+ifGNNppTB/6J8Y02nlMH/onxjTaeUwf+ifGNNqJTB/6J8Y02olMH/onxjTaeUwf+ifGNNq5TB/6J8Y02rlMH/onxjTayUwf+ifGNNrJTB/6J8Y02tlMH/onxjTa2Uwf+ifGNNrpTB/6J8Y02vlMH/onxjTa+Uwf+ifGNNr5TB/6J8Y02wlMH/onxjTbCUwf+ifGNNr5TB/6J8Y02xlMH/onxjTbGUwf+ifGNNspTB/6J8Y02ylMH/onxjTbOUwf+ifGNNtJTB/6J8Y021lMH/onxjTbWUwf+ifGNNtpTB/6J8Y021lMH/onxjTbeUwf+ifGNNuJTB/6J8Y024lMH/onxjTbiUwf+ifGNNuZTB/6J8Y025lMH/onxjTbmUwf+ifGNNupTB/6J8Y025lMH/onxjTbuUwf+ifGNNu5TB/6J8Y028lMH/onxjTbyUwf+ifGNNvJTB/6J8Y029lMH/onxjTb2Uwf+ifGNNvZTB/6J8Y02+lMH/onxjTb6Uwf+ifGNNv5TB/6J8Y02/lMH/onxjTcCUwf+ifGNNv5TB/6J8Y03AlMH/onxjTcCUwf+ifGNNwZTB/6J8Y03BlMH/onxjTcKUwf+ifGNNwpTB/6J8Y03DlMH/onxjTcOUwf+ifGNNxJTB/6J8Y03FlMH/onxjTcWUwf+ifGNNxpTB/6J8Y03HlMH/onxjTcaUwf+ifGNNxpTB/6J8Y03HlMH/onxjTcmUwf+ifGNNyZTB/6J8Y03KlMH/onxjTcqUwf+ifGNNy5TB/6J8Y03LlMH/onxjTcyUwf+ifGNNzJTB/6J8Y03NlMH/onxjTc2Uwf+ifGNNzpTB/6J8Y03PlMH/onxjTc+Uwf+ifGNN0JTB/6J8Y03RlMH/onxjTdKUwf+ifGNN0pTB/6J8Y03TlMH/onxjTdOUwf+ifGNN1JTB/6J8Y03VlMH/onxjTdWUwf+ifGNN1pTB/6J8Y03XlMH/onxjTdeUwf+ifGNN15TB/6J8Y03XlMH/onxjTdmUwf+ifGNN2ZTB/6J8Y03alMH/onxjTdqUwf+ifGNN25TB/6J8Y03blMH/onxjTd2Uwf+ifGNN3ZTB/6J8Y03flMH/onxjTd+Uwf+ifGNN35TB/6J8Y03glMH/onxjTeCUwf+ifGNN35TB/6J8Y03hlMH/onxjTeGUwf+ifGNN4pTB/6J8Y03ilMH/onxjTeOUwf+ifGNN5JTB/6J8Y03llMH/onxjTeWUwf+ifGNN5pTB/6J8Y03nlMH/onxjTeeUwf+ifGNN55TB/6J8Y035lMH/onxjTfmUwf+ifGNN+pTB/6J8Y036lMH/onxjTfqUwf+ifGNN+5TB/6J8Y037lMH/onxjTfyUwf+ifGNN/JTB/6J8Y039lMH/onxjTf2Uwf+ifGNN/pTB/6J8Y0wAA==')
  audio.play()
}

function skipToBreak() {
  pauseTimer()
  session.value.type = 'short-break'
  session.value.remaining = settings.value.shortBreakDuration * 60
}

function skipToFocus() {
  pauseTimer()
  session.value.type = 'focus'
  session.value.remaining = settings.value.focusDuration * 60
}

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<template>
  <div class="pomodoro-module">
    <div class="timer-container">
      <div class="timer-display" :style="{ '--progress': progress + '%', '--session-color': sessionColor }">
        <div class="timer-circle">
          <div class="timer-inner">
            <span class="session-label">{{ sessionLabel }}</span>
            <span class="timer-time">{{ formattedTime }}</span>
            <span class="completed-count">已完成的番茄: {{ session.completed }}</span>
          </div>
        </div>
      </div>

      <div class="timer-controls">
        <button v-if="!session.isRunning" class="btn btn-primary btn-start" @click="startTimer">
          {{ session.isPaused ? '▶ 继续' : '▶ 开始' }}
        </button>
        <button v-else class="btn btn-warning btn-pause" @click="pauseTimer">
          ⏸ 暂停
        </button>
      </div>

      <div class="secondary-controls">
        <button class="btn btn-ghost" @click="resetTimer">
          ↺ 重置
        </button>
        <span class="control-divider"></span>
        <button class="btn btn-ghost" @click="skipToBreak">☕ 开始休息</button>
        <button class="btn btn-ghost" @click="skipToFocus">🎯 开始专注</button>
      </div>
    </div>

    <div class="settings-panel">
      <h3 class="settings-title">设置</h3>

      <div class="setting-item">
        <label>专注时长 (分钟)</label>
        <input type="number" v-model.number="settings.focusDuration" min="1" max="120" />
      </div>

      <div class="setting-item">
        <label>短休息 (分钟)</label>
        <input type="number" v-model.number="settings.shortBreakDuration" min="1" max="30" />
      </div>

      <div class="setting-item">
        <label>长休息 (分钟)</label>
        <input type="number" v-model.number="settings.longBreakDuration" min="1" max="60" />
      </div>

      <div class="setting-item">
        <label>长休息间隔 (个番茄)</label>
        <input type="number" v-model.number="settings.longBreakInterval" min="1" max="10" />
      </div>

      <div class="setting-item checkbox">
        <label>
          <input type="checkbox" v-model="settings.autoStartBreaks" />
          自动开始休息
        </label>
      </div>

      <div class="setting-item checkbox">
        <label>
          <input type="checkbox" v-model="settings.soundEnabled" />
          启用声音提醒
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pomodoro-module {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.timer-display {
  width: 300px;
  height: 300px;
  position: relative;
  margin-bottom: 1rem;
}

.timer-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--bg-card);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.timer-circle::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border-radius: 50%;
  background: conic-gradient(
    var(--session-color) var(--progress),
    var(--border-color) var(--progress)
  );
  mask: radial-gradient(farthest-side, transparent calc(100% - 8px), white calc(100% - 8px));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 8px), white calc(100% - 8px));
  transition: background 0.3s ease;
}

.timer-circle::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  bottom: 16px;
  border-radius: 50%;
  background: var(--bg-card);
  z-index: 0;
}

.timer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  z-index: 1;
  position: relative;
  padding: 2rem;
}

.session-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 500;
}

.timer-time {
  font-size: 4.5rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}

.completed-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.timer-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn-start {
  padding: 1.25rem 3.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 50px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-start:active {
  transform: translateY(0);
}

.btn-pause {
  padding: 1.25rem 3.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 50px;
  background: linear-gradient(135deg, var(--warning-color), #e67e22);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-pause:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.btn-pause:active {
  transform: translateY(0);
}

.secondary-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-ghost {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 25px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-ghost:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-ghost:active {
  transform: translateY(0);
}

.control-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 0.5rem;
}

.settings-panel {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  height: fit-content;
}

.settings-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.setting-item input[type="number"] {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.125rem;
  font-family: var(--font-numbers);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.setting-item input[type="number"]:hover {
  border-color: var(--accent-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.setting-item input[type="number"]:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.setting-item.checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.setting-item.checkbox input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent-color);
}

@media (max-width: 768px) {
  .pomodoro-module {
    grid-template-columns: 1fr;
  }

  .timer-display {
    width: 280px;
    height: 280px;
  }

  .timer-time {
    font-size: 3.5rem;
  }

  .timer-inner {
    padding: 1.5rem;
  }

  .btn-start,
  .btn-pause {
    padding: 1rem 2.5rem;
    font-size: 1.125rem;
  }

  .secondary-controls {
    gap: 0.5rem;
  }

  .btn-ghost {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
  }

  .control-divider {
    height: 20px;
    margin: 0 0.25rem;
  }
}
</style>
