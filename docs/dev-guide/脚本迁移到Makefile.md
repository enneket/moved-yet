# 脚本迁移到 Makefile 说明

## 迁移概述

项目已将原有的 shell 脚本迁移到 Makefile，提供更简洁、统一、跨平台的命令接口。

## 迁移完成情况

### ✅ 已迁移的脚本

| 原脚本 | Makefile 命令 | 状态 |
|--------|---------------|------|
| `sh/quick-test.sh` | `make test` | ✅ 完成 |
| `sh/integration-test.sh` | `make integration-test` | ✅ 完成 |
| `sh/system-test.sh` | `make system-test` | ✅ 完成 |
| `sh/full-test-suite.sh` | `make full-test` | ✅ 完成 |
| `sh/package-vsix.sh` | `make package` | ✅ 完成 |
| `sh/publish-openvsx.sh` | `make publish-openvsx` | ✅ 完成 |
| `sh/create-release.sh` | `make release` | ✅ 完成 |
| `sh/validate-structure.sh` | `make validate` | ✅ 完成 |
| `sh/test-extension.sh` | `make full-test` | ✅ 完成 |

### 📝 保留的脚本

以下脚本暂时保留，以便向后兼容：

- `sh/release-v0.0.1.sh` - 特定版本的发布脚本（历史记录）

## 命令对照表

### 测试相关

```bash
# 快速测试
./sh/quick-test.sh          →  make test
./sh/quick-test.sh          →  make quick-test

# 集成测试
./sh/integration-test.sh    →  make integration-test

# 系统测试
./sh/system-test.sh         →  make system-test

# 完整测试
./sh/full-test-suite.sh     →  make full-test
./sh/test-extension.sh      →  make full-test

# CI 测试
./sh/test-extension.sh      →  make ci-test
```

### 构建和打包

```bash
# 编译
pnpm run compile            →  make compile

# 代码检查
pnpm run lint               →  make lint

# 构建包
./sh/package-vsix.sh        →  make package

# 验证结构
./sh/validate-structure.sh  →  make validate
```

### 发布相关

```bash
# 创建发布
./sh/create-release.sh 0.0.2    →  make release VERSION=0.0.2

# 发布到 Open VSX
./sh/publish-openvsx.sh TOKEN   →  make publish-openvsx OVSX_PAT=TOKEN
```

### 开发相关

```bash
# 开发模式
pnpm run watch              →  make dev

# 清理
rm -rf out/ *.vsix          →  make clean

# 项目信息
# (新功能)                  →  make info
```

## 使用示例

### 日常开发

```bash
# 原来的方式
pnpm run compile
pnpm run lint
./sh/quick-test.sh

# 现在的方式
make test
```

### 构建和测试

```bash
# 原来的方式
./sh/full-test-suite.sh
./sh/package-vsix.sh

# 现在的方式
make full-test
make package
```

### 发布新版本

```bash
# 原来的方式
./sh/create-release.sh 0.0.2

# 现在的方式
make release VERSION=0.0.2
```

## 优势对比

### 1. 命令更简洁

```bash
# 原来
./sh/quick-test.sh

# 现在
make test
```

### 2. 自动依赖管理

```bash
# 原来需要手动执行多个命令
pnpm run compile
pnpm run lint
./sh/package-vsix.sh

# 现在一个命令搞定
make package
```

### 3. 统一的帮助系统

```bash
# 查看所有可用命令
make help
```

### 4. 跨平台兼容

- Linux: ✅ 原生支持
- macOS: ✅ 原生支持
- Windows: ✅ Git Bash / WSL 支持

### 5. 更好的错误处理

Makefile 会在命令失败时自动停止，避免连锁错误。

## 迁移指南

### 对于开发者

1. **学习新命令**
   ```bash
   make help
   ```

2. **更新习惯**
   - 用 `make test` 替代 `./sh/quick-test.sh`
   - 用 `make package` 替代 `./sh/package-vsix.sh`

3. **查看文档**
   - 阅读 `docs/Makefile使用指南.md`

### 对于 CI/CD

更新 GitHub Actions 配置：

```yaml
# 原来
- name: Test
  run: ./sh/full-test-suite.sh

- name: Build
  run: ./sh/package-vsix.sh

# 现在
- name: Test
  run: make ci-test

- name: Build
  run: make package
```

### 对于文档

更新文档中的命令示例：

```markdown
# 原来
运行测试：`./sh/quick-test.sh`

# 现在
运行测试：`make test`
```

## 向后兼容

### Shell 脚本保留

原有的 shell 脚本暂时保留在 `sh/` 目录中，以便：

1. 向后兼容
2. 参考实现
3. 特殊场景使用

### 逐步迁移

建议逐步迁移到 Makefile：

1. **第一阶段**（当前）
   - Makefile 和 shell 脚本并存
   - 鼓励使用 Makefile

2. **第二阶段**（1-2 个月后）
   - 主要使用 Makefile
   - shell 脚本标记为废弃

3. **第三阶段**（3-6 个月后）
   - 移除 shell 脚本
   - 只保留 Makefile

## 新增功能

Makefile 提供了一些原脚本没有的功能：

### 1. 项目信息

```bash
make info
```

显示项目名称、版本、统计信息等。

### 2. 依赖管理

```bash
# 检查依赖更新
make check-updates

# 更新依赖
make update-deps
```

### 3. 安全审计

```bash
make audit
```

### 4. 预发布检查

```bash
make pre-release
```

### 5. 完整清理

```bash
# 清理构建产物
make clean

# 清理所有（包括 node_modules）
make clean-all

# 重新安装
make reinstall
```

## 常见问题

### Q: 为什么要迁移到 Makefile？

A: 主要原因：
1. 更简洁的命令
2. 更好的跨平台兼容性
3. 自动依赖管理
4. 统一的接口

### Q: 原来的脚本还能用吗？

A: 可以，但建议使用 Makefile 命令。

### Q: 如何在 Windows 上使用 Makefile？

A: 使用 Git Bash 或 WSL。

### Q: Makefile 会影响性能吗？

A: 不会，Makefile 只是命令的封装，实际执行的还是相同的命令。

### Q: 如何添加自定义命令？

A: 编辑 Makefile，参考现有命令的格式添加新命令。

## 测试验证

### 验证 Makefile 工作正常

```bash
# 1. 查看帮助
make help

# 2. 验证项目结构
make validate

# 3. 运行测试
make test

# 4. 查看项目信息
make info
```

### 验证所有命令

```bash
# 测试相关
make test
make integration-test
make system-test
make full-test

# 构建相关
make compile
make lint
make package

# 维护相关
make validate
make info
make check-updates
```

## 迁移时间线

- **2024-XX-XX**: 创建 Makefile
- **2024-XX-XX**: 完成所有脚本迁移
- **2024-XX-XX**: 更新文档
- **2024-XX-XX**: 更新 CI/CD 配置
- **未来**: 逐步废弃 shell 脚本

## 反馈和改进

如果在使用 Makefile 过程中遇到问题或有改进建议，请：

1. 查看 `docs/Makefile使用指南.md`
2. 运行 `make help` 查看可用命令
3. 提交 Issue 或 PR

## 总结

Makefile 迁移已完成，提供了更简洁、统一、跨平台的命令接口。建议在日常开发中使用 Makefile 命令，原有的 shell 脚本暂时保留以便向后兼容。

---

**快速开始**: 运行 `make help` 查看所有可用命令！
