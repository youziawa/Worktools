@echo off
echo ========================================
echo   WorkTools 部署脚本
echo ========================================
echo.

:: 检查 Git
git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未安装 Git！
    echo 请先安装 Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: 检查 GitHub CLI
gh --version >nul 2>&1
if errorlevel 1 (
    echo [提示] 未安装 GitHub CLI
    echo 将打开浏览器，请手动创建仓库
    echo.
    start https://github.com/new
    echo.
    echo 创建仓库后，请运行以下命令：
    echo   git remote add origin https://github.com/youziawa/worktools.git
    echo   git branch -M main
    echo   git push -u origin main
    echo.
    pause
    exit /b 1
)

:: 创建仓库
echo [1/4] 创建 GitHub 仓库...
gh repo create worktools --public --source=. --push
if errorlevel 1 (
    echo [错误] 创建仓库失败！
    pause
    exit /b 1
)

:: 启用 GitHub Pages
echo [2/4] 配置 GitHub Pages...
gh pages enable --source main
if errorlevel 1 (
    echo [提示] GitHub Pages 配置可能需要手动完成
)

:: 等待部署
echo [3/4] 等待部署...
echo 请访问以下网址查看你的网站：
echo   https://youziawa.github.io/worktools/
echo.
echo [4/4] 部署完成！

pause
