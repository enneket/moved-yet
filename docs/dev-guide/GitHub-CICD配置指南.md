# GitHub CI/CD 配置指南

## 🚀 概述

本项目配置了完整的 GitHub Actions CI/CD 工作流，支持自动化测试、构建和发布。

## 📋 工作流说明

### 1. CI 工作流 (`.github/workflows/ci.yml`)

**触发条件**：
- 推送到 `main` 或 `develop` 分支
- 向 `main` 分支提交 Pull Request

**功能**：
- 多 Node.js 版本测试 (18.x, 20.x, 22.x)
- 代码检查 (ESLint)
- TypeScript 编译
- 单元测试
- 安全审计
- 构建 VSIX 包

### 2. 正式发布工作流 (`.github/workflows/release.yml`)

**触发条件**：
- 推送 `v*` 格式的标签 (如 `v0.0.3`)

**功能**：
- 自动构建和测试
- 创建 GitHub Release
- 发布到 VS Code Marketplace
- 发布到 Open VSX Registry
- 上传 VSIX 文件

### 3. Beta 发布工作流 (`.github/workflows/beta-release.yml`)

**触发条件**：
- 推送到 `develop` 分支 (排除文档更改)

**功能**：
- 生成 beta 版本号
- 创建预发布版本
- 自动测试和构建

### 4. 代码安全扫描 (`.github/workflows/codeql.yml`)

**触发条件**：
- 推送到主要分支
- Pull Request
- 每周定时扫描

**功能**：
- CodeQL 安全分析
- 漏洞检测

## ⚙️ 配置要求

### 1. GitHub Secrets 配置

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：

#### VS Code Marketplace 发布 (可选)
```
VSCE_PAT: <你的 VS Code Marketplace Personal Access Token>
```

**获取方法**：
1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 创建 Personal Access Token
3. 权限选择：Marketplace > Manage

#### Open VSX Registry 发布 (可选)
```
OVSX_PAT: <你的 Open VSX Personal Access Token>
```

**获取方法**：
1. 访问 [Open VSX Registry](https://open-vsx.org/)
2. 使用GitHub账户登录 (`enneket`)
3. 创建命名空间 `enneket` 并验证
4. 生成访问令牌，权限选择：`publish`

**命名空间**: `enneket`  
**扩展URL**: https://open-vsx.org/extension/enneket/moved-yet

### 2. 分支保护规则 (推荐)

在 Settings > Branches 中为 `main` 分支设置：
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators

## 🎯 使用方法

### 发布新版本

#### 方法1: 使用发布脚本 (推荐)
```bash
# 发布版本 0.0.3
./sh/create-release.sh 0.0.3
```

#### 方法2: 手动发布
```bash
# 1. 更新版本号
npm version 0.0.3 --no-git-tag-version

# 2. 更新 CHANGELOG.md
# 手动编辑 docs/CHANGELOG.md

# 3. 提交更改
git add .
git commit -m "chore: bump version to v0.0.3"

# 4. 创建标签
git tag -a v0.0.3 -m "Release v0.0.3"

# 5. 推送
git push origin main
git push origin v0.0.3
```

### 发布 Beta 版本
```bash
# 推送到 develop 分支即可自动发布 beta 版本
git push origin develop
```

## 📊 工作流状态

### 状态徽章
在 README.md 中添加状态徽章：

```markdown
[![CI](https://github.com/用户名/仓库名/workflows/CI/badge.svg)](https://github.com/用户名/仓库名/actions/workflows/ci.yml)
[![Release](https://github.com/用户名/仓库名/workflows/Release/badge.svg)](https://github.com/用户名/仓库名/actions/workflows/release.yml)
[![CodeQL](https://github.com/用户名/仓库名/workflows/CodeQL/badge.svg)](https://github.com/用户名/仓库名/actions/workflows/codeql.yml)
```

### 查看工作流状态
- 访问仓库的 Actions 标签页
- 查看各个工作流的执行状态
- 下载构建产物

## 🔧 自定义配置

### 修改 Node.js 版本
编辑 `.github/workflows/ci.yml`：
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # 修改这里
```

### 修改发布条件
编辑 `.github/workflows/release.yml`：
```yaml
on:
  push:
    tags:
      - 'v*'        # 只有 v* 标签触发
      - 'release-*' # 添加其他模式
```

### 跳过某些检查
在提交消息中添加：
- `[skip ci]` - 跳过所有 CI
- `[skip tests]` - 跳过测试 (需要自定义条件)

## 📁 文件结构

```
.github/
├── workflows/
│   ├── ci.yml              # 持续集成
│   ├── release.yml         # 正式发布
│   ├── beta-release.yml    # Beta 发布
│   └── codeql.yml          # 安全扫描
└── ...

sh/
├── create-release.sh       # 发布脚本
└── ...

docs/
├── CHANGELOG.md           # 版本更新日志
├── GitHub-CICD配置指南.md  # 本文档
└── ...
```

## 🐛 故障排除

### 常见问题

#### 1. 发布失败：权限不足
**解决方案**：
- 检查 GITHUB_TOKEN 权限
- 确保 Secrets 配置正确

#### 2. 测试失败：显示相关错误
**解决方案**：
- 在 Linux 环境使用 `xvfb-run`
- 检查测试环境配置

#### 3. 包构建失败
**解决方案**：
- 检查 package.json 配置
- 确保所有依赖已安装

#### 4. Marketplace 发布失败
**解决方案**：
- 验证 VSCE_PAT 有效性
- 检查扩展 ID 和发布者信息

### 调试方法

#### 启用调试日志
在工作流中添加：
```yaml
- name: Debug
  run: |
    echo "Debug information"
    env
  env:
    ACTIONS_STEP_DEBUG: true
```

#### 本地测试
```bash
# 模拟 CI 环境
npm ci
npm run lint
npm run compile
npm test
vsce package
```

## 📚 参考资料

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [VS Code 扩展发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Registry](https://open-vsx.org/)
- [vsce CLI 工具](https://github.com/microsoft/vscode-vsce)

---

**🎯 目标**: 实现完全自动化的 CI/CD 流程，提高开发效率和发布质量！