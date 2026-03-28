# 部署指南

## 方式一：使用 GitHub 网页（推荐新手）

### 步骤 1: 创建 GitHub 仓库

1. 打开浏览器访问 [GitHub](https://github.com)
2. 登录你的账户
3. 点击右上角的 **"+"** 按钮，选择 **"New repository"**
4. 填写仓库信息：
   - **Repository name**: `worktools`
   - **Description**: `办公学习聚合工具 - 番茄时钟、Todo清单、定时提醒、灵感速记、AI助手`
   - **选择 Public**（公开仓库才能使用 GitHub Pages 免费托管）
   - **不要勾选** "Initialize this repository with a README"
5. 点击 **"Create repository"**

### 步骤 2: 推送代码到仓库

在终端中执行以下命令（将 `YOUR_USERNAME` 替换为你的 GitHub 用户名）：

```bash
# 添加远程仓库
git remote add origin https://github.com/youziawa/worktools.git

# 推送代码到 main 分支
git branch -M main
git push -u origin main
```

### 步骤 3: 配置 GitHub Pages

1. 在 GitHub 仓库页面，点击 **Settings**（设置）
2. 滚动到 **Pages** 部分
3. 在 **Source** 下拉菜单中：
   - 选择 **"Deploy from a branch"**
4. 在 **Branch** 下拉菜单中：
   - 选择 **"main"**
   - 选择 **"/ (root)"**
5. 点击 **"Save"**

### 步骤 4: 等待部署

- GitHub Pages 会自动构建和部署你的网站
- 大约等待 **1-3 分钟**
- 部署完成后，访问：`https://youziawa.github.io/worktools/`

## 方式二：使用 GitHub CLI

如果你已安装 GitHub CLI（gh），可以运行：

```bash
# 创建仓库
gh repo create worktools --public --source=. --push

# 配置 GitHub Pages
gh pages enable
```

## 方式三：使用 SSH 密钥

如果你配置了 SSH 密钥，可以使用：

```bash
git remote add origin git@github.com:youziawa/worktools.git
git push -u origin main
```

## 验证部署

1. 打开 `https://youziawa.github.io/worktools/`
2. 如果看到 **"404 Site not found"**，请等待几分钟后重试
3. 如果仍然无法访问，检查 GitHub Pages 设置

## 常见问题

### Q: 显示 404 错误？
A: 等待 3-5 分钟，GitHub 需要时间构建和部署。如果超过 10 分钟仍有问题，检查 Settings > Pages 设置。

### Q: 如何更新网站内容？
A: 修改代码后，推送到 main 分支即可自动部署：
```bash
git add .
git commit -m "Update: 你的修改内容"
git push
```

### Q: 能否使用自定义域名？
A: 可以。在 Settings > Pages > Custom domain 中添加你的域名，并配置 DNS。

### Q: API Key 安全吗？
A: 所有 API Key 仅存储在浏览器本地（localStorage），不会上传到 GitHub。请放心使用！

## 后续维护

- 定期执行 `npm update` 更新依赖
- 关注控制台是否有弃用警告
- 定期备份 `localStorage` 中的数据（对于重要数据）

---

**祝你使用愉快！** 🎉
