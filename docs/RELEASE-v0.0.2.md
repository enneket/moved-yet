# Moved Yet v0.0.2 发布说明

## 🎉 版本概览

**发布日期**: 2025-01-30  
**版本号**: v0.0.2  
**包大小**: 296KB  
**新增文件**: 1个服务文件，多个文档更新

## 🆕 主要新功能

### 🖱️ 智能活动检测
这是本版本的核心新功能，大幅提升用户体验：

- **自动监听**: 实时检测鼠标和键盘活动
- **智能重置**: 长时间无活动后，下次活动时自动重置计时器
- **多种活动类型支持**:
  - 键盘输入（文本编辑）
  - 鼠标操作（点击、选择）
  - 编辑器切换（切换文件）
  - 命令执行（各种用户操作）
- **可配置阈值**: 默认5分钟，可设置1-30分钟

### ⚙️ 新增配置选项
```json
{
    "movedYet.enableActivityDetection": true,  // 启用活动检测
    "movedYet.inactivityResetTime": 5         // 无活动重置时间（分钟）
}
```

### 🔍 活动检测监控
- 在状态查看中显示活动检测状态和无活动时长
- 新增专门的测试命令：`动了么？: 测试活动检测`
- 实时跟踪用户活动状态

## 🛠️ 技术升级

### Node.js 生态系统升级
- **Node.js**: v18.19.1 → v25.5.0 (最新版本)
- **npm**: v9.2.0 → v11.8.0
- **@types/node**: 20.x → 25.x
- 新增 **fnm** (Fast Node Manager) 支持

### 代码架构改进
- 新增 `ActivityDetectionService` 单例服务
- 与现有计时器服务无缝集成
- 优化服务初始化和清理逻辑
- 改进错误处理和日志输出

## 📚 文档更新

### 更新的文档
- ✅ **CHANGELOG.md** - 添加 v0.0.2 详细更新记录
- ✅ **功能指南.md** - 添加活动检测功能详细说明
- ✅ **开发指南.md** - 更新环境要求和 Node.js 版本管理
- ✅ **README.md** - 更新核心特色和配置说明

### 新增文档
- ✅ **test-activity-detection.md** - 活动检测功能测试指南
- ✅ **publish-openvsx.sh** - Open VSX 发布脚本
- ✅ **release-v0.0.2.sh** - 版本发布脚本

## 🔧 配置迁移

### 从 v0.0.1 升级
现有配置完全兼容，新功能默认启用：

```json
{
    // 现有配置保持不变
    "movedYet.sitReminderInterval": 60,
    "movedYet.drinkReminderInterval": 45,
    
    // 新增配置（可选）
    "movedYet.enableActivityDetection": true,
    "movedYet.inactivityResetTime": 5
}
```

### 推荐配置
**智能检测模式**（推荐新用户）:
```json
{
    "movedYet.enableActivityDetection": true,
    "movedYet.inactivityResetTime": 5,
    "movedYet.enableProgressiveReminder": true
}
```

## 🧪 测试指南

### 基础功能测试
1. **安装测试**:
   ```bash
   code --install-extension moved-yet-0.0.2.vsix
   ```

2. **活动检测测试**:
   - 运行命令: `动了么？: 测试活动检测`
   - 查看当前无活动时长
   - 停止操作超过设定时间，然后重新编辑

3. **配置测试**:
   - 修改 `movedYet.inactivityResetTime` 为 1 分钟
   - 验证重置阈值是否更新

### 兼容性测试
- ✅ VS Code 1.100.0+
- ✅ Windows/macOS/Linux
- ✅ 与现有功能无冲突
- ✅ 配置向后兼容

## 🚀 发布渠道

### 1. VS Code Marketplace
```bash
npx vsce publish
```

### 2. Open VSX Registry
```bash
npx ovsx publish -p <ACCESS_TOKEN>
```

### 3. GitHub Release
```bash
git tag v0.0.2
git push origin v0.0.2
```

## 📊 性能影响

- **内存占用**: 增加约 2MB（活动检测服务）
- **CPU 使用**: 极低，仅在事件触发时处理
- **启动时间**: 无明显影响
- **响应性**: 提升用户体验，减少无效提醒

## 🔮 下一版本预告

v0.0.3 计划功能：
- 🎯 更精细的活动类型检测
- 📊 活动统计和分析
- 🔔 自定义提醒声音
- 🌙 勿扰模式

## 🤝 贡献与反馈

- 🐛 [报告问题](https://github.com/yaolifeng0629/reminder/issues)
- 💡 [功能建议](https://github.com/yaolifeng0629/reminder/discussions)
- 🔧 [贡献代码](https://github.com/yaolifeng0629/reminder/pulls)

---

**感谢使用 Moved Yet！让我们一起保持健康的编程习惯！** 💪