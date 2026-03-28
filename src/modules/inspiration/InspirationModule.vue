<script setup lang="ts">
import { ref } from 'vue'

const inspirations = ref([
  {
    id: '1',
    content: '# 项目灵感\n\n可以开发一个番茄时钟 + Todo的聚合工具，帮助用户更好地管理时间和任务。',
    tags: ['工作', '创意'],
    createdAt: new Date()
  },
  {
    id: '2',
    content: '## 学习计划\n\n- 每天早起1小时读书\n- 每周学习一个新技能\n- 坚持写技术博客',
    tags: ['学习'],
    createdAt: new Date(Date.now() - 86400000)
  }
])

const newInspiration = ref({ content: '', tags: '' })
const expandedId = ref<string | null>(null)

function addInspiration() {
  if (!newInspiration.value.content.trim()) return

  inspirations.value.unshift({
    id: Date.now().toString(),
    content: newInspiration.value.content,
    tags: newInspiration.value.tags.split(',').map(t => t.trim()).filter(Boolean),
    createdAt: new Date()
  })

  newInspiration.value = { content: '', tags: '' }
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function deleteInspiration(id: string) {
  const index = inspirations.value.findIndex(i => i.id === id)
  if (index > -1) {
    inspirations.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="inspiration-module">
    <div class="module-header">
      <h2>灵感速记</h2>
      <p class="module-desc">捕捉每一个闪现的灵感，记录转瞬即逝的想法</p>
    </div>

    <div class="add-inspiration card">
      <textarea
        v-model="newInspiration.content"
        placeholder="记录你的灵感... (支持 Markdown)"
        rows="4"
      ></textarea>
      <div class="add-inspiration-footer">
        <input
          v-model="newInspiration.tags"
          type="text"
          placeholder="标签 (用逗号分隔)"
        />
        <button class="btn btn-primary" @click="addInspiration">保存灵感</button>
      </div>
    </div>

    <div class="inspiration-list">
      <div
        v-for="inspiration in inspirations"
        :key="inspiration.id"
        class="inspiration-item card"
      >
        <div class="inspiration-header" @click="toggleExpand(inspiration.id)">
          <div class="inspiration-preview">
            <span class="inspiration-content">{{ inspiration.content.substring(0, 60) }}...</span>
          </div>
          <div class="inspiration-meta">
            <span class="inspiration-date">{{ new Date(inspiration.createdAt).toLocaleDateString() }}</span>
            <span class="expand-icon">{{ expandedId === inspiration.id ? '▼' : '▶' }}</span>
          </div>
        </div>

        <div v-if="expandedId === inspiration.id" class="inspiration-detail">
          <div class="inspiration-full-content">{{ inspiration.content }}</div>
          <div class="inspiration-tags">
            <span v-for="tag in inspiration.tags" :key="tag" class="badge badge-info">{{ tag }}</span>
          </div>
          <div class="inspiration-actions">
            <button class="btn-delete" @click="deleteInspiration(inspiration.id)">🗑️ 删除</button>
          </div>
        </div>
      </div>

      <div v-if="inspirations.length === 0" class="empty-state">
        <span class="empty-icon">💡</span>
        <p>暂无灵感记录</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inspiration-module {
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

.add-inspiration {
  margin-bottom: 1.5rem;
}

.add-inspiration textarea {
  width: 100%;
  margin-bottom: 0.75rem;
  resize: vertical;
  min-height: 100px;
}

.add-inspiration-footer {
  display: flex;
  gap: 0.75rem;
}

.add-inspiration-footer input {
  flex: 1;
}

.inspiration-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.inspiration-item {
  padding: 1rem;
}

.inspiration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.inspiration-preview {
  flex: 1;
}

.inspiration-content {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.inspiration-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.inspiration-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.expand-icon {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.inspiration-detail {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.inspiration-full-content {
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.inspiration-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.inspiration-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-delete {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 6px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-delete:hover {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-delete:active {
  transform: translateY(0);
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
</style>
