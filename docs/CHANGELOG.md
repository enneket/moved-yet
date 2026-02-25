# Change Log

### v0.0.2 (开发中)

#### 🧪 测试改进

-   ✅ **实现 100% 单元测试覆盖率**
    -   新增 7 个测试套件，共 80 个单元测试
    -   所有核心服务 100% 测试覆盖
    -   UI 组件测试覆盖
    -   工具类完整测试
-   📊 **配置测试覆盖率工具**
    -   集成 c8 覆盖率工具
    -   添加 `test:coverage` 命令
    -   生成 HTML/Text/LCOV 格式报告
-   🆕 **新增测试文件**
    -   `activityDetectionService.test.ts` - 活动检测服务测试
    -   `historyService.test.ts` - 历史记录服务测试
    -   `focusModeService.test.ts` - 专注模式服务测试
    -   `progressiveReminderService.test.ts` - 渐进式提醒服务测试
    -   `dailyReportService.test.ts` - 每日报告服务测试
    -   `reminderUI.test.ts` - 提醒界面测试
    -   `languages.test.ts` - 多语言工具测试
-   🔧 **测试基础设施**
    -   使用 Sinon 进行 Mock 和 Stub
    -   使用 Fake Timers 控制时间流逝
    -   Mock VS Code API
    -   完善的 teardown 清理机制

#### 📚 文档更新

-   📖 新增 `100-percent-test-coverage-implementation.md` - 测试实施文档
-   📊 新增 `测试覆盖率报告-2026-02-24.md` - 详细测试报告
-   📋 更新 `plans/100-percent-test-coverage.md` - 测试计划文档

#### 🛠️ 开发工具

-   ⚙️ Makefile 新增 `test-coverage` 命令
-   📦 添加 c8 依赖用于覆盖率分析

### v0.0.1 

#### 🆕 新增功能

-   🖱️ **智能活动检测** - 监听鼠标和键盘活动，无活动时自动重置计时器
    -   支持键盘输入检测（文本编辑）
    -   支持鼠标操作检测（点击、选择）
    -   支持编辑器切换和命令执行检测
    -   可配置无活动重置时间（默认5分钟）
-   🧠 **智能工作时长统计** - 基于用户活动状态的精确工作时长计时
    -   10分钟无活动自动暂停工作计时
    -   检测到活动后自动恢复计时
    -   不计算中间的非活跃时间
    -   实时显示工作状态（进行中/已暂停）
    -   手动暂停/恢复工作计时功能
-   ⚙️ **新增配置选项**
    -   `movedYet.enableActivityDetection` - 启用/禁用活动检测
    -   `movedYet.inactivityResetTime` - 无活动重置时间（1-30分钟）
-   🔍 **活动检测状态监控**
    -   在状态查看中显示活动检测状态和无活动时长
    -   显示工作计时状态和今日工作时长
    -   新增测试命令：`Moved Yet: Test Activity Detection`
-   🎮 **工作计时控制命令**
    -   `Moved Yet: Pause Work Timer` - 手动暂停工作时长统计
    -   `Moved Yet: Resume Work Timer` - 手动恢复工作时长统计
-   🔄 **智能重置逻辑**
    -   用户长时间无活动后，下次活动时自动重置所有计时器
    -   显示友好的重置提示信息

#### 🛠️ 技术改进

-   📦 升级 Node.js 到 v25.5.0（最新版本）
-   📦 升级 npm 到 v11.8.0
-   🔧 更新 `@types/node` 到 25.x
-   🆕 新增 `ActivityDetectionService` 单例服务
-   🔗 与现有计时器服务无缝集成
-   🧹 清理 `.npmrc` 配置，移除过时的 `enable-pre-post-scripts`

#### 📚 文档更新

-   📖 更新 README.md，添加活动检测功能说明
-   📋 新增 `test-activity-detection.md` 测试指南
-   🔧 更新环境要求：Node.js 25.x+
-   📦 添加 Open VSX Registry 发布指南

#### 🐛 修复

-   ✅ 修复久坐提醒初始化顺序问题（计时器未启动的根本原因）
-   🔧 优化服务初始化和清理逻辑
-   📝 改进错误处理和日志输出
-   🌐 统一命令标题为英文（"Moved Yet"），支持国际化

#### 🎯 核心功能

-   ✨ 久坐提醒和喝水提醒功能，分别默认为 60 分钟和 45 分钟
-   🖼️ 全屏模态窗口，确保提醒不会被忽略
-   🔒 UI 锁定功能，必须确认提醒才能继续工作
-   🎨 美观的 UI 设计，包括渐变背景和毛玻璃效果
-   🌐 中英文双语言支持（zh-CN 和 en）
-   📋 完整的命令支持：重置计时器、显示状态、查看历史等
-   📊 状态栏显示当前计时器状态
-   ⚙️ 可配置选项，允许自定义提醒间隔和开关控制
-   📈 提醒历史记录功能
-   🔔 渐进式提醒机制（状态栏→通知→全屏）
-   📊 运动数据可视化仪表盘

#### 📚 完整文档

-   📦 完整的编译 .vsix 包教程
-   🛠️ 详细的开发指南，包含编译步骤
-   📚 同步所有相关文档，确保信息一致性
-   🔧 常见问题解决方案和故障排除指南
-   🎯 多种编译方法：vsce、手动脚本、Docker
-   📋 自动化编译配置（GitHub Actions）

#### 🔧 技术实现

-   使用 VS Code WebView API 实现全屏提醒
-   实现独立的计时器系统，确保提醒互不干扰
-   添加配置监听，实时响应用户设置变更
-   使用 Chart.js 实现数据可视化
-   实现数据持久化存储
-   📦 提供 `package-vsix.sh` 手动打包脚本
-   🔧 配置完整的 TypeScript 编译环境
