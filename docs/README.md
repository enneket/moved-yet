# 文档导航

本目录包含 Moved Yet 项目的所有文档，已按类别整理。

## 📚 文档结构

```
docs/
├── README.md                    # 本文件 - 文档导航
├── 功能指南.md                  # 用户功能说明（包含专注模式）
├── CHANGELOG.md                 # 版本更新日志
├── dev-guide/                   # 开发文档
└── archive/                     # 历史归档
```

## 👥 用户文档

适合插件使用者阅读的文档：

### 核心文档
- **[功能指南](功能指南.md)** - 完整的功能说明和使用技巧（包含专注模式）
- **[CHANGELOG](CHANGELOG.md)** - 版本更新记录

### 快速开始
1. 阅读 [功能指南](功能指南.md) 了解所有功能
2. 参考 [CHANGELOG](CHANGELOG.md) 了解最新更新

## 🛠️ 开发文档

适合开发者和贡献者阅读的文档，位于 `dev-guide/` 目录：

### 入门指南
- **[开发指南](dev-guide/开发指南.md)** - 开发环境搭建和开发流程
- **[编译指南](dev-guide/编译指南.md)** - 详细的编译步骤和故障排除

### 工具使用
- **[Makefile 使用指南](dev-guide/Makefile使用指南.md)** - Makefile 命令详解
- **[Makefile 快速参考](dev-guide/Makefile快速参考.md)** - 常用命令速查
- **[脚本迁移到 Makefile](dev-guide/脚本迁移到Makefile.md)** - 迁移说明

### 测试文档
- **[测试指南](dev-guide/测试指南.md)** - 测试流程和方法
- **[集成测试指南](dev-guide/集成测试指南.md)** - 集成测试说明
- **[系统测试指南](dev-guide/系统测试指南.md)** - 系统测试说明
- **[完整测试体系](dev-guide/完整测试体系.md)** - 测试体系概览

### 发布和配置
- **[GitHub CI/CD 配置指南](dev-guide/GitHub-CICD配置指南.md)** - CI/CD 配置
- **[发布者配置指南](dev-guide/发布者配置指南.md)** - 发布配置
- **[Open VSX 配置说明](dev-guide/Open-VSX配置说明.md)** - Open VSX 发布

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

## 📦 历史归档

历史文档、调试记录、实现总结等，位于 `archive/` 目录：

### 归档内容
- 调试记录和问题修复文档
- 功能实现总结
- 测试报告和验证记录
- 临时文档和草稿
- 历史版本文档

### 归档说明
这些文档保留用于：
- 历史参考
- 问题追溯
- 经验总结
- 开发记录

**注意**：归档文档可能已过时，仅供参考。

## 🔍 快速查找

### 我想...

#### 使用插件
→ 阅读 [功能指南](功能指南.md)

#### 了解专注模式
→ 阅读 [功能指南 - 专注模式章节](功能指南.md#4-专注模式使用指南新功能)

#### 开发和贡献
→ 阅读 [开发指南](dev-guide/开发指南.md)

#### 编译项目
→ 阅读 [编译指南](dev-guide/编译指南.md)

#### 使用 Makefile
→ 阅读 [Makefile 使用指南](dev-guide/Makefile使用指南.md)

#### 运行测试
→ 阅读 [测试指南](dev-guide/测试指南.md)

#### 发布新版本
→ 阅读 [GitHub CI/CD 配置指南](dev-guide/GitHub-CICD配置指南.md)

#### 查看更新历史
→ 阅读 [CHANGELOG](CHANGELOG.md)

## 📝 文档维护

### 文档分类原则

1. **用户文档**（根目录）
   - 面向最终用户
   - 功能说明和使用指南
   - 保持简洁，易于查找

2. **开发文档**（dev-guide/）
   - 面向开发者和贡献者
   - 技术细节和开发流程
   - 工具使用和配置说明

3. **历史归档**（archive/）
   - 历史记录和调试文档
   - 实现总结和临时文档
   - 不再活跃维护的文档

### 添加新文档

根据文档类型放置到相应目录：

```bash
# 用户文档
docs/新功能使用指南.md

# 开发文档
docs/dev-guide/新工具使用指南.md

# 归档文档
docs/archive/旧功能实现总结.md
```

### 文档命名规范

- 使用中文或英文，保持一致
- 使用描述性名称
- 避免使用日期或版本号（除非是历史文档）

**好的命名**：
- `功能指南.md`
- `开发指南.md`
- `Makefile使用指南.md`

**不好的命名**：
- `doc1.md`
- `2024-01-01-guide.md`
- `temp.md`

## 🔗 相关链接

- [项目主页](https://github.com/enneket/moved-yet)
- [问题反馈](https://github.com/enneket/moved-yet/issues)
- [贡献指南](https://github.com/enneket/moved-yet/blob/main/CONTRIBUTING.md)

## 💡 提示

- 📖 新用户从 [功能指南](功能指南.md) 开始
- 🛠️ 开发者从 [开发指南](dev-guide/开发指南.md) 开始
- 🔍 使用 Ctrl+F 在本页面快速查找
- 📚 所有文档都支持 Markdown 格式

---

**文档版本**: 2024  
**最后更新**: 文档整理完成  
**维护者**: Moved Yet Team
