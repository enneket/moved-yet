# GitHub Actions pnpm 迁移总结

## 📋 概述

已将所有 GitHub Actions workflow 从 `npm` 迁移到 `pnpm`，以保持与项目包管理器的一致性。

## ✅ 已更新的文件

### 1. CI Workflow (`.github/workflows/ci.yml`)
- ✅ 添加 pnpm setup 步骤
- ✅ 更新缓存配置为 `pnpm`
- ✅ 将所有 `npm` 命令替换为 `pnpm`
- ✅ 使用 `pnpm install --frozen-lockfile` 替代 `npm ci`
- ✅ 更新测试命令使用 `xvfb-run -a pnpm test`

### 2. Release Workflow (`.github/workflows/release.yml`)
- ✅ 添加 pnpm setup 步骤
- ✅ 更新全局包安装方式为 `pnpm add -g`
- ✅ 更新所有构建和测试命令

### 3. Beta Release Workflow (`.github/workflows/beta-release.yml`)
- ✅ 添加 pnpm setup 步骤
- ✅ 更新版本管理命令为 `pnpm version`
- ✅ 更新所有构建和测试命令

### 4. Dependency Update Workflow (`.github/workflows/dependency-update.yml`)
- ✅ 添加 pnpm setup 步骤
- ✅ 更新依赖检查命令为 `pnpm outdated`
- ✅ 更新依赖更新命令为 `pnpm update`
- ✅ 更新锁文件检查为 `pnpm-lock.yaml`

## 🔧 关键变更

### pnpm Setup
所有 workflow 都添加了以下步骤：

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v3
  with:
    version: 8
```

### Node.js Setup
更新缓存配置：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'pnpm'  # 从 'npm' 改为 'pnpm'
```

### 依赖安装
```yaml
# 之前
- run: npm ci

# 现在
- run: pnpm install --frozen-lockfile
```

### 全局包安装
```yaml
# 之前
- run: npm install -g @vscode/vsce

# 现在
- run: pnpm add -g @vscode/vsce
```

### 测试命令
```yaml
# 之前
- run: xvfb-run -a npm test

# 现在
- run: xvfb-run -a pnpm test
```

## 🎯 优势

1. **一致性**: 与本地开发环境保持一致
2. **性能**: pnpm 的依赖安装速度更快
3. **磁盘空间**: pnpm 使用硬链接节省磁盘空间
4. **可靠性**: 使用 `--frozen-lockfile` 确保依赖版本一致

## 📝 注意事项

1. 所有 workflow 都使用 `pnpm@8`
2. 使用 `--frozen-lockfile` 标志确保依赖版本锁定
3. 全局包安装使用 `pnpm add -g` 而不是 `pnpm install -g`
4. 依赖更新 PR 现在检查 `pnpm-lock.yaml` 而不是 `package-lock.json`

## ✨ 测试建议

在推送到 GitHub 之前，建议：

1. 确保 `pnpm-lock.yaml` 已提交
2. 本地运行 `pnpm install` 验证依赖
3. 本地运行 `pnpm test` 确保测试通过
4. 检查 `.gitignore` 不包含 `pnpm-lock.yaml`

## 🔗 相关文档

- [pnpm 官方文档](https://pnpm.io/)
- [pnpm GitHub Action](https://github.com/pnpm/action-setup)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
