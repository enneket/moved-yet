# 开发文档

本目录包含 Moved Yet 项目的开发相关文档，适合开发者和贡献者阅读。

## 🚀 快速开始

### 新手入门
1. 阅读 [开发指南](开发指南.md) 了解开发流程
2. 参考 [编译指南](编译指南.md) 搭建开发环境
3. 查看 [Makefile 使用指南](Makefile使用指南.md) 学习常用命令

### 开发流程
```bash
# 1. 克隆项目
git clone <repo-url>
cd moved-yet

# 2. 安装依赖
pnpm install

# 3. 开发
make dev          # 启动开发模式
make test         # 运行测试

# 4. 构建
make package      # 构建 VSIX 包

# 5. 发布
make release VERSION=x.y.z
```

## 📚 文档列表

### 入门指南
- **[开发指南](开发指南.md)** - 开发环境搭建和开发流程
- **[编译指南](编译指南.md)** - 详细的编译步骤和故障排除

### 工具使用
- **[Makefile 使用指南](Makefile使用指南.md)** - Makefile 命令详解
- **[Makefile 快速参考](Makefile快速参考.md)** - 常用命令速查
- **[脚本迁移到 Makefile](脚本迁移到Makefile.md)** - 从 shell 脚本迁移说明

### 测试文档
- **[测试指南](测试指南.md)** - 测试流程和方法
- **[集成测试指南](集成测试指南.md)** - 集成测试说明
- **[系统测试指南](系统测试指南.md)** - 系统测试说明
- **[完整测试体系](完整测试体系.md)** - 测试体系概览

### 发布和配置
- **[GitHub CI/CD 配置指南](GitHub-CICD配置指南.md)** - CI/CD 配置
- **[发布者配置指南](发布者配置指南.md)** - 发布配置
- **[Open VSX 配置说明](Open-VSX配置说明.md)** - Open VSX 发布

## 🛠️ 常用命令

### 开发命令
```bash
make compile    # 编译 TypeScript
make lint       # 代码检查
make dev        # 开发模式（监听文件变化）
make clean      # 清理构建产物
```

### 测试命令
```bash
make test           # 快速测试
make full-test      # 完整测试套件
make integration-test  # 集成测试
make system-test    # 系统测试
```

### 构建命令
```bash
make package        # 构建 VSIX 包
make install        # 安装到本地 VS Code
make pre-release    # 发布前检查
```

### 发布命令
```bash
make release VERSION=0.0.3              # 发布新版本
make publish-openvsx OVSX_PAT=token     # 发布到 Open VSX
```

### 维护命令
```bash
make validate       # 验证项目结构
make info           # 显示项目信息
make check-updates  # 检查依赖更新
make audit          # 安全审计
```

> 💡 运行 `make help` 查看所有可用命令

## 📖 开发指南

### 环境要求
- **Node.js**: 25.x 或更高版本
- **pnpm**: 推荐使用（或 npm 11.x+）
- **VS Code**: 1.100.0 或更高版本
- **make**: 用于运行 Makefile 命令

### 项目结构
```
moved-yet/
├── src/                    # 源代码
│   ├── extension.ts        # 主入口
│   ├── models/             # 类型定义
│   ├── services/           # 服务层
│   ├── ui/                 # UI 组件
│   └── utils/              # 工具函数
├── docs/                   # 文档
├── sh/                     # Shell 脚本（已废弃）
├── Makefile                # 构建脚本
└── package.json            # 项目配置
```

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 添加 JSDoc 注释
- 编写单元测试

### 提交规范
```bash
# 格式
<type>(<scope>): <subject>

# 类型
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式
refactor: 重构
test:     测试相关
chore:    构建/工具相关

# 示例
feat(focus-mode): 添加专注模式功能
fix(timer): 修复计时器重置问题
docs(readme): 更新安装说明
```

## 🧪 测试指南

### 测试类型
1. **单元测试** - 测试单个函数/模块
2. **集成测试** - 测试模块间集成
3. **系统测试** - 测试整体功能
4. **端到端测试** - 模拟用户操作

### 运行测试
```bash
# 快速测试（编译 + 代码检查）
make test

# 完整测试套件
make full-test

# 特定测试
make integration-test
make system-test
```

### 测试覆盖
- 核心功能必须有测试
- 新功能需要添加测试
- Bug 修复需要添加回归测试

## 🚀 发布流程

### 准备发布
1. 更新 CHANGELOG.md
2. 运行完整测试
3. 更新版本号

### 发布步骤
```bash
# 1. 预发布检查
make pre-release

# 2. 发布新版本
make release VERSION=0.0.3

# 3. 验证发布
# 检查 GitHub Release
# 检查 VS Code Marketplace
# 检查 Open VSX Registry
```

### 发布检查清单
- [ ] 所有测试通过
- [ ] CHANGELOG 已更新
- [ ] 版本号正确
- [ ] 文档已更新
- [ ] 无未提交的更改

## 🐛 调试技巧

### VS Code 调试
1. 按 F5 启动调试
2. 在扩展开发主机中测试
3. 查看调试控制台输出

### 日志调试
```typescript
console.log('调试信息');
console.error('错误信息');
```

### 常见问题
- 编译错误 → 检查 TypeScript 配置
- 测试失败 → 查看测试输出
- 打包失败 → 检查 .vscodeignore

## 📚 学习资源

### VS Code 扩展开发
- [官方文档](https://code.visualstudio.com/api)
- [扩展示例](https://github.com/microsoft/vscode-extension-samples)
- [API 参考](https://code.visualstudio.com/api/references/vscode-api)

### TypeScript
- [官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/intro.html)

### 测试
- [Mocha 文档](https://mochajs.org/)
- [VS Code 测试](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

## 🤝 贡献指南

### 贡献流程
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 代码审查
- 遵循代码规范
- 添加必要的测试
- 更新相关文档
- 通过所有检查

### 问题反馈
- 使用 Issue 模板
- 提供详细信息
- 附上错误日志
- 说明复现步骤

## 🔗 相关链接

- [主文档导航](../README.md)
- [用户文档](../)
- [历史归档](../archive/)
- [项目主页](https://github.com/enneket/moved-yet)

## 💡 提示

- 📖 新开发者从 [开发指南](开发指南.md) 开始
- 🔧 使用 `make help` 查看所有命令
- 🧪 提交前运行 `make full-test`
- 📝 遵循提交规范
- 🤝 欢迎贡献代码

---

**文档版本**: 2024  
**维护状态**: 活跃维护  
**更新频率**: 随项目更新
