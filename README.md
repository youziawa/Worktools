# WorkTools - 办公学习聚合工具

> 🔧 一站式办公学习工具集，提升你的工作效率

![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ 功能特性

WorkTools 是一款功能强大的办公学习聚合工具，集成以下核心功能：

### 🍅 番茄时钟
- 标准番茄工作法（25分钟专注 + 5分钟休息）
- 自定义时长设置
- 长休息机制（每4个番茄后触发）
- 音效提醒与统计功能

### 📋 Todo清单
- 任务创建与管理
- 优先级标记（高/中/低）
- 多种视图模式（列表/看板/日历）
- 标签分类与筛选

### ⏰ 自定义定时提醒
- 一次性/重复提醒
- 多种重复模式（每天/每周/每月）
- 桌面通知推送

### 💡 灵感速记
- Markdown 支持
- 快速记录一闪而过的灵感
- 标签分类与全文搜索

### 🤖 AI助手
- 多模型支持（OpenAI、Claude、Ollama等）
- 自定义模型配置
- 对话历史管理
- 文件上传功能（图片、文档）

## 🎨 设计特点

- **现代简约风格**：低饱和度配色，大量留白
- **三套主题**：浅色 / 深色 / 护眼模式
- **响应式设计**：适配桌面和移动端
- **流畅动画**：微妙的过渡效果，提升用户体验

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🛠️ 技术栈

- **框架**：Vue 3 (Composition API)
- **类型系统**：TypeScript
- **状态管理**：Pinia
- **构建工具**：Vite
- **样式**：CSS Variables + Scoped CSS

## 📦 项目结构

```
workTools/
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── modules/          # 功能模块
│   │   ├── pomodoro/     # 番茄时钟
│   │   ├── todo/         # 待办清单
│   │   ├── reminder/      # 定时提醒
│   │   ├── inspiration/   # 灵感速记
│   │   └── ai/           # AI助手
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   └── App.vue           # 根组件
├── public/               # 公共资源
├── index.html
├── package.json
└── vite.config.ts
```

## 🔧 AI助手配置

1. 点击侧边栏的 **⚙️ 设置** 按钮
2. 点击 **➕ 添加模型**
3. 填写模型信息：
   - **模型名称**：如 "我的 GPT-4"
   - **提供商**：OpenAI / Claude / Ollama / 自定义
   - **API Key**：从相应平台获取
   - **模型名称**：如 gpt-4、claude-3-sonnet 等
4. 点击 **🔗 测试连接** 验证配置
5. 保存后即可开始对话

## 🌐 部署

本项目已配置好 GitHub Pages 部署。推送到 main 分支后，自动部署到：

```
https://[username].github.io/[repository]/
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

Made with ❤️ using Vue 3 + TypeScript
