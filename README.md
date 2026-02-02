# Moved Yet - 动了么？

[![CI](https://github.com/enneket/moved-yet/workflows/CI/badge.svg)](https://github.com/enneket/moved-yet/actions/workflows/ci.yml)
[![Release](https://github.com/enneket/moved-yet/workflows/Release/badge.svg)](https://github.com/enneket/moved-yet/actions/workflows/release.yml)
[![CodeQL](https://github.com/enneket/moved-yet/workflows/CodeQL/badge.svg)](https://github.com/enneket/moved-yet/actions/workflows/codeql.yml)
[![Version](https://img.shields.io/github/v/release/enneket/moved-yet)](https://github.com/enneket/moved-yet/releases)
[![Downloads](https://img.shields.io/github/downloads/enneket/moved-yet/total)](https://github.com/enneket/moved-yet/releases)

> 🤔 还在椅子上坐了3小时？💧 上次喝水是什么时候？  
> 💻 专注编码的你，别忘了关爱自己  

**动了么？** 是一个贴心的 VS Code 健康助手，用温和而坚持的方式守护你的编程时光。

## ✨ 核心特色

- 🪑 **久坐提醒** - 默认60分钟，温柔提醒起身活动
- 💧 **喝水提醒** - 默认45分钟，贴心提醒补充水分  
- 🔔 **渐进式提醒** - 状态栏 → 通知 → 全屏，给你缓冲时间
- 🖱️ **智能检测** - 监听鼠标键盘活动，无活动时自动重置计时器
- 📊 **数据追踪** - 记录健康习惯，可视化仪表盘
- 🌍 **多语言** - 中英文双语支持
- 🎨 **美观界面** - 现代化设计，毛玻璃效果

## ⚡ 快速开始

### 安装插件

#### 方法一：Open VSX Registry（推荐）
1. **VS Code 用户**：
   ```bash
   # 使用命令行安装
   code --install-extension enneket.moved-yet
   ```
   
2. **VSCodium 用户**：
   - 打开扩展面板 (`Ctrl+Shift+X`)
   - 搜索 "moved-yet" 或 "动了么"
   - 点击安装

3. **手动下载**：
   - 访问 [Open VSX Registry](https://open-vsx.org/extension/enneket/moved-yet)
   - 下载 `.vsix` 文件
   - VS Code 中运行：`Extensions: Install from VSIX...`

#### 方法二：VS Code Marketplace
~~暂未发布到官方市场~~

#### 方法三：从源码安装


### 基础配置
```json
{
    "movedYet.sitReminderInterval": 60,    // 久坐提醒：60分钟
    "movedYet.drinkReminderInterval": 45,  // 喝水提醒：45分钟
    "movedYet.enableProgressiveReminder": true  // 启用渐进式提醒
}
```

### 开始使用
安装后插件自动激活，开始守护你的健康！

> 📖 **详细使用说明** → [功能指南](docs/功能指南.md)

## 🎮 主要命令

按 `Ctrl+Shift+P` 打开命令面板：

| 命令关键词 | 功能 |
|-----------|------|
| `动了么` | 显示所有相关命令 |
| `重置` | 重置所有计时器 |
| `状态` | 查看当前提醒状态 |
| `历史` | 查看统计数据 |
| `仪表盘` | 打开可视化面板 |
| `测试活动检测` | 查看活动检测状态 |

> 📖 **详细命令说明** → [功能指南](docs/功能指南.md#-命令使用)

## ⚙️ 配置选项

### 基础配置
```json
{
    "movedYet.sitReminderInterval": 60,           // 久坐提醒间隔（分钟）
    "movedYet.drinkReminderInterval": 45,         // 喝水提醒间隔（分钟）
    "movedYet.enableSitReminder": true,           // 启用久坐提醒
    "movedYet.enableDrinkReminder": true,         // 启用喝水提醒
    "movedYet.language": "zh-CN"                  // 界面语言
}
```

### 渐进式提醒
```json
{
    "movedYet.enableProgressiveReminder": true,   // 启用渐进式提醒
    "movedYet.progressiveReminderLevel1Duration": 5,  // 第一级持续时间
    "movedYet.progressiveReminderLevel2Duration": 5   // 第二级持续时间
}
```

### 活动检测
```json
{
    "movedYet.enableActivityDetection": true,     // 启用鼠标键盘活动检测
    "movedYet.inactivityResetTime": 5            // 无活动重置时间（分钟）
}
```

> ⚙️ **详细配置说明** → [功能指南](docs/功能指南.md#️-配置详解)

## 🛠️ 开发相关

### 📦 自动化发布

本项目配置了完整的 GitHub Actions CI/CD 工作流：

- **持续集成**: 自动测试、代码检查、安全扫描
- **自动发布**: 推送标签自动发布到 GitHub Releases、VS Code Marketplace、Open VSX
- **Beta 版本**: develop 分支自动构建测试版本

#### 发布新版本
```bash
# 使用发布脚本（推荐）
./sh/create-release.sh 0.0.3

# 或手动创建标签
git tag v0.0.3 && git push origin v0.0.3
```

> 📚 **详细说明** → [GitHub CI/CD 配置指南](docs/GitHub-CICD配置指南.md)

### 从源码安装
```bash
git clone <项目地址>
cd moved-yet

# 确保使用 Node.js 25.x 或更高版本
node --version  # 应该显示 v25.x.x

npm install && npm run compile
```

### 环境要求
- **Node.js**: 25.x 或更高版本
- **VS Code**: 1.100.0 或更高版本
- **npm**: 11.x 或更高版本

### 编译 .vsix 包
```bash
# 方法一：使用 vsce
npm install -g @vscode/vsce
vsce package

# 方法二：使用项目脚本
./sh/package-vsix.sh
```

> 🛠️ **完整开发指南** → [开发指南](docs/开发指南.md)  
> 📦 **详细编译教程** → [编译指南](docs/编译指南.md)

## 📚 文档导航

- 📖 [功能指南](docs/功能指南.md) - 详细功能说明和使用技巧
- 🛠️ [开发指南](docs/开发指南.md) - 开发、测试、打包指南  
- 📦 [编译指南](docs/编译指南.md) - 详细的编译步骤和故障排除
- 📝 [更新日志](docs/CHANGELOG.md) - 版本更新记录

## 🌍 多语言支持

- 🇨🇳 **中文简体** (`zh-CN`) - 默认
- 🇺🇸 **English** (`en`)

## 💡 使用建议

### 🎯 最佳实践
- **久坐提醒**: 45-60分钟，给肌肉放松的机会
- **喝水提醒**: 30-45分钟，保持身体水分平衡
- **渐进式提醒**: 专注工作时启用，避免突然打断

### 🔧 推荐配置
```json
// 专注编码模式
{
    "movedYet.sitReminderInterval": 90,
    "movedYet.enableProgressiveReminder": true,
    "movedYet.progressiveReminderLevel1Duration": 10
}

// 轻松办公模式
{
    "movedYet.sitReminderInterval": 45,
    "movedYet.enableProgressiveReminder": false
}
```

## 🎨 特色亮点

- ✨ **极简设计** - 专注核心功能，不添加复杂特性
- 🎯 **强制关怀** - 用坚持的温柔守护你的健康
- 🎨 **美观界面** - 现代化UI，毛玻璃效果，动画过渡
- 📊 **数据驱动** - 通过数据了解和改进健康习惯
- 🌍 **国际化** - 中英文双语，贴心本土化

## 📦 安装方式对比

| 安装方式 | 适用编辑器 | 自动更新 | 推荐度 |
|---------|-----------|---------|--------|
| **Open VSX Registry** | VS Code, VSCodium, Code-OSS | ✅ | ⭐⭐⭐⭐⭐ |
| **VS Code Marketplace** | 仅 VS Code | ✅ | ⭐⭐⭐⭐ |
| **手动 VSIX 安装** | 所有编辑器 | ❌ | ⭐⭐⭐ |
| **源码编译** | 所有编辑器 | ❌ | ⭐⭐ |

> 💡 **推荐使用 Open VSX Registry**，支持更多开源编辑器，更新及时

## 🤝 支持与反馈

遇到问题或有建议？欢迎：
- 🐛 [提交 Issue](https://github.com/your-repo/issues)
- 💡 [功能建议](https://github.com/your-repo/discussions)
- 🔧 [贡献代码](https://github.com/your-repo/pulls)

---

<div align="center">

**💪 先保持健康，再高效工作！**

*让每一次「动了么？」都成为对自己的关爱*

</div>