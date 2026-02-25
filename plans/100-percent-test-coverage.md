# 计划：实现 100% 单元测试覆盖率

## 目标

将单元测试覆盖率从当前的部分覆盖提升到 100%，确保所有代码路径都经过测试。

## 当前状态

- ✅ 16 个测试通过
- ⏸️ 4 个测试待实现（pending）
- 部分服务未完全覆盖

## 需要补充的测试

### 1. Extension 测试 (src/test/suite/extension.test.ts)

待实现的测试：
- ⏸️ activate 应注册命令并启动计时器
- ⏸️ resetTimers 命令应重置计时器并显示消息
- ⏸️ showStatus 命令应显示状态
- ⏸️ 配置更改监听器应被注册

### 2. 未覆盖的服务

需要添加测试的服务：
- ActivityDetectionService (src/services/activityDetectionService.ts)
- DailyReportService (src/services/dailyReportService.ts)
- FocusModeService (src/services/focusModeService.ts)
- HistoryService (src/services/historyService.ts)
- ProgressiveReminderService (src/services/progressiveReminderService.ts)

### 3. UI 组件测试

需要添加测试的 UI 组件：
- DashboardUI (src/ui/dashboardUI.ts)
- ReminderUI (src/ui/reminderUI.ts)

### 4. 工具类测试

需要添加测试的工具类：
- Languages (src/utils/languages.ts)

## 实施步骤

### 阶段 1: 完成 Extension 测试
1. 实现 activate 测试
2. 实现命令测试
3. 实现配置监听器测试

### 阶段 2: 添加服务测试
1. ActivityDetectionService 测试
2. HistoryService 测试
3. FocusModeService 测试
4. ProgressiveReminderService 测试
5. DailyReportService 测试

### 阶段 3: 添加 UI 测试
1. ReminderUI 测试
2. DashboardUI 测试

### 阶段 4: 添加工具类测试
1. Languages 测试

### 阶段 5: 配置覆盖率工具
1. 安装 nyc/c8 覆盖率工具
2. 配置覆盖率报告
3. 添加覆盖率命令到 Makefile

## 测试策略

- 使用 Mocha + Sinon 进行单元测试
- Mock VS Code API
- 测试所有公共方法
- 测试边界条件和错误处理
- 测试配置变更场景

## 预期结果

- ✅ 所有服务 100% 覆盖
- ✅ 所有 UI 组件 100% 覆盖
- ✅ 所有工具类 100% 覆盖
- ✅ Extension 主文件 100% 覆盖
- ✅ 覆盖率报告可视化

## 验收标准

1. 所有测试通过
2. 覆盖率报告显示 100%
3. 无待实现的测试（pending）
4. 所有代码路径都有测试
