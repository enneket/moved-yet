# Makefile 使用指南

## 概述

项目已使用 Makefile 替代原有的 shell 脚本，提供更简洁、统一的命令接口。

## 快速开始

### 查看所有可用命令

```bash
make help
```

或直接运行：

```bash
make
```

## 常用命令

### 开发相关

```bash
# 编译项目
make compile

# 代码检查
make lint

# 开发模式（监听文件变化）
make dev

# 清理构建产物
make clean
```

### 测试相关

```bash
# 快速测试（编译 + 代码检查）
make test

# 完整测试套件
make full-test

# 集成测试
make integration-test

# 系统测试
make system-test

# CI 测试
make ci-test
```

### 打包相关

```bash
# 构建 VSIX 包
make package

# 安装到本地 VS Code
make install

# 预发布检查
make pre-release
```

### 发布相关

```bash
# 发布新版本
make release VERSION=0.0.2

# 发布到 Open VSX
make publish-openvsx OVSX_PAT=your_token
```

### 维护相关

```bash
# 验证项目结构
make validate

# 显示项目信息
make info

# 检查依赖更新
make check-updates

# 更新依赖
make update-deps

# 安全审计
make audit

# 清理所有（包括 node_modules）
make clean-all

# 重新安装依赖
make reinstall
```

## 详细说明

### 1. 编译和开发

#### 编译项目
```bash
make compile
```
- 编译 TypeScript 代码到 `out/` 目录
- 等同于 `pnpm run compile`

#### 开发模式
```bash
make dev
```
- 启动 TypeScript 监听模式
- 文件变化时自动重新编译
- 等同于 `pnpm run watch`

#### 代码检查
```bash
make lint
```
- 运行 ESLint 检查代码质量
- 等同于 `pnpm run lint`

### 2. 测试

#### 快速测试
```bash
make test
# 或
make quick-test
```
- 编译项目
- 运行代码检查
- 适合日常开发使用

#### 完整测试套件
```bash
make full-test
```
执行顺序：
1. 验证项目结构
2. 快速测试（编译 + 代码检查）
3. 集成测试
4. 系统测试

#### 集成测试
```bash
make integration-test
```
- 检查模块间的依赖关系
- 验证服务集成

#### 系统测试
```bash
make system-test
```
- 检查系统环境
- 验证编译输出
- 显示系统信息

### 3. 打包和安装

#### 构建 VSIX 包
```bash
make package
```
执行步骤：
1. 清理旧的构建产物
2. 编译项目
3. 运行代码检查
4. 构建 VSIX 包
5. 显示包大小

输出：`moved-yet-{version}.vsix`

#### 安装到本地
```bash
make install
```
- 先构建 VSIX 包
- 然后安装到本地 VS Code
- 等同于 `code --install-extension moved-yet-{version}.vsix --force`

### 4. 发布

#### 发布新版本
```bash
make release VERSION=0.0.2
```

执行步骤：
1. 检查工作目录是否干净
2. 更新 package.json 版本号
3. 运行完整测试套件
4. 构建 VSIX 包
5. 提交版本更新
6. 创建 Git 标签
7. 推送到远程仓库

**注意**：
- 必须指定 VERSION 参数
- 工作目录必须干净（无未提交的更改）
- 会自动创建 Git 标签并推送

#### 发布到 Open VSX
```bash
make publish-openvsx OVSX_PAT=your_token
```

**获取 Access Token**：
1. 访问 https://open-vsx.org
2. 使用 GitHub 账户登录
3. 进入用户设置 → Access Tokens
4. 生成新的访问令牌

### 5. 维护

#### 验证项目结构
```bash
make validate
```
检查项：
- docs 目录
- src 目录
- package.json
- README.md
- src/extension.ts

#### 显示项目信息
```bash
make info
```
显示：
- 项目名称、版本、描述
- 源码文件数量
- 文档文件数量
- 测试文件数量

#### 检查依赖更新
```bash
make check-updates
```
- 显示可更新的依赖包
- 不会实际更新

#### 更新依赖
```bash
make update-deps
```
- 更新所有依赖到最新版本
- 等同于 `pnpm update`

#### 安全审计
```bash
make audit
```
- 检查依赖包的安全漏洞
- 只报告高风险问题

#### 清理
```bash
# 清理构建产物
make clean

# 清理所有（包括 node_modules）
make clean-all
```

#### 重新安装
```bash
make reinstall
```
- 清理所有文件
- 重新安装依赖

## 与原脚本的对应关系

| 原脚本 | Makefile 命令 | 说明 |
|--------|---------------|------|
| `sh/quick-test.sh` | `make test` | 快速测试 |
| `sh/integration-test.sh` | `make integration-test` | 集成测试 |
| `sh/system-test.sh` | `make system-test` | 系统测试 |
| `sh/full-test-suite.sh` | `make full-test` | 完整测试 |
| `sh/package-vsix.sh` | `make package` | 构建包 |
| `sh/publish-openvsx.sh` | `make publish-openvsx` | 发布到 Open VSX |
| `sh/create-release.sh` | `make release` | 创建发布 |
| `sh/validate-structure.sh` | `make validate` | 验证结构 |
| `sh/test-extension.sh` | `make full-test` | 完整测试 |

## 优势

### 相比 Shell 脚本的优势

1. **跨平台兼容性**
   - Makefile 在 Linux、macOS、Windows (WSL/Git Bash) 上都能运行
   - 不需要担心 shell 脚本的兼容性问题

2. **简洁的命令**
   - `make test` vs `./sh/quick-test.sh`
   - 更短、更易记

3. **依赖管理**
   - 自动处理命令间的依赖关系
   - 例如：`make package` 会自动先执行 `clean`、`compile`、`lint`

4. **统一接口**
   - 所有命令都通过 `make` 执行
   - 一致的使用体验

5. **帮助系统**
   - `make help` 显示所有可用命令
   - 每个命令都有说明

6. **颜色输出**
   - 使用颜色区分不同类型的消息
   - 更易读

## 常见问题

### Q: 如何查看某个命令的详细输出？
A: Makefile 默认会显示详细输出。如果需要更详细的日志，可以查看具体的命令实现。

### Q: 可以同时运行多个命令吗？
A: 可以，例如：
```bash
make clean compile lint
```

### Q: 如何在 Windows 上使用？
A: 需要安装 make 工具：
- 使用 Git Bash（推荐）
- 使用 WSL
- 使用 Chocolatey 安装 make

### Q: 原来的 shell 脚本还能用吗？
A: 可以，但建议使用 Makefile 命令，因为它们更简洁且跨平台。

### Q: 如何添加新命令？
A: 编辑 Makefile，添加新的目标：
```makefile
my-command: ## 我的命令说明
	@echo "执行我的命令"
	@# 你的命令
```

## 最佳实践

### 日常开发流程

```bash
# 1. 开始开发
make dev

# 2. 修改代码...

# 3. 测试
make test

# 4. 提交前检查
make full-test
```

### 发布流程

```bash
# 1. 完整测试
make full-test

# 2. 预发布检查
make pre-release

# 3. 发布新版本
make release VERSION=0.0.3

# 4. 发布到 Open VSX（可选）
make publish-openvsx OVSX_PAT=your_token
```

### CI/CD 流程

```bash
# CI 环境使用
make ci-test
make package
```

## 迁移指南

### 从 shell 脚本迁移

如果你习惯使用原来的 shell 脚本，可以这样迁移：

```bash
# 原来
./sh/quick-test.sh
# 现在
make test

# 原来
./sh/package-vsix.sh
# 现在
make package

# 原来
./sh/create-release.sh 0.0.2
# 现在
make release VERSION=0.0.2
```

### 更新 CI/CD 配置

如果你的 CI/CD 使用了 shell 脚本，更新为：

```yaml
# GitHub Actions 示例
- name: Test
  run: make ci-test

- name: Build
  run: make package
```

## 总结

Makefile 提供了更简洁、统一、跨平台的命令接口，建议在日常开发中使用。原有的 shell 脚本仍然保留，但推荐逐步迁移到 Makefile 命令。

---

**提示**：运行 `make help` 查看所有可用命令！
