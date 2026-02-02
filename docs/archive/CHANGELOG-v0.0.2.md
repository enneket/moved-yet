# Moved Yet v0.0.2 更新日志

## 🎉 新增功能

### 📊 每日健康报告
- **自动显示**: 每天首次启动 VS Code 时自动显示（延迟5秒）
- **健康评分**: 0-100分的综合健康评分系统
  - 起身次数评分（40分）
  - 喝水次数评分（40分）
  - 工作时长评分（20分）
- **智能评级**: 优秀/良好/一般/需改进四个等级
- **个性化建议**: 根据数据自动生成健康建议
- **数据总结**: 完整的每日健康数据汇总
- **手动查看**: 新增命令 `Moved Yet: View Daily Health Report`
- **可配置**: 通过 `movedYet.enableDailyReport` 控制开关

### 🌙 深色模式适配
- **全面支持**: 所有 UI 界面完美适配深色主题
- **自动切换**: 跟随 VS Code 主题自动切换
- **适配范围**:
  - ✅ 健康仪表盘
  - ✅ 提醒窗口
  - ✅ 每日健康报告
  - ✅ 所有统计界面
- **优化体验**: 
  - 使用 VS Code 原生主题变量
  - 优化颜色对比度
  - 统一视觉风格
  - 舒适的视觉效果

## 🎨 界面改进

### 健康仪表盘
- 移除固定渐变背景，改用主题背景色
- 卡片样式适配深色模式
- 按钮样式使用 VS Code 原生样式
- 图表颜色优化，提升可读性

### 提醒窗口
- 背景色自动适配主题
- 文字对比度优化
- 边框和阴影适配深色模式
- 按钮样式统一

### 每日健康报告
- 圆形进度条颜色动态适配
- 统计卡片完美支持深色模式
- 建议区域样式优化
- 整体视觉效果提升

## 📝 配置更新

### 新增配置项
```json
{
    "movedYet.enableDailyReport": {
        "type": "boolean",
        "default": true,
        "description": "启用每日健康报告（每天首次启动时显示）"
    }
}
```

## 🔧 技术改进

### 代码优化
- 新增 `dailyReportService.ts` 服务
- 优化 CSS 使用 VS Code 主题变量
- 改进类型定义
- 增强代码可维护性

### 主题变量使用
```css
/* 使用的 VS Code 主题变量 */
--vscode-editor-background
--vscode-editor-foreground
--vscode-editor-inactiveSelectionBackground
--vscode-descriptionForeground
--vscode-button-background
--vscode-button-foreground
--vscode-button-hoverBackground
--vscode-panel-border
--vscode-textLink-foreground
--vscode-input-background
--vscode-errorForeground
```

## 📚 文档更新

### 新增文档
- `docs/每日健康报告和深色模式.md` - 详细功能说明

### 更新文档
- `docs/功能指南.md` - 添加新功能说明
- `README.md` - 更新特性列表和配置说明

## 🎯 使用建议

### 每日健康报告
1. 每天开始工作时查看前一天的报告
2. 关注健康评分，目标保持在75分以上
3. 根据建议调整今天的工作习惯
4. 结合仪表盘查看长期趋势

### 深色模式
1. 夜间工作时使用深色主题保护眼睛
2. OLED 屏幕使用深色主题更省电
3. 根据环境光线选择合适的主题
4. 所有界面自动适配，无需配置

## 🔄 兼容性

- ✅ 完全向后兼容 v0.0.1
- ✅ 现有配置无需修改
- ✅ 自动迁移历史数据
- ✅ 支持所有 VS Code 主题

## 📦 安装方式

### 从扩展市场安装
```bash
code --install-extension enneket.moved-yet
```

### 从 VSIX 安装
```bash
code --install-extension moved-yet-0.0.2.vsix
```

## 🐛 已知问题

无

## 🔮 下一步计划

- 眼睛休息提醒（20-20-20法则）
- 番茄工作法集成
- 伸展运动指导
- 专注模式
- 健康目标设定

---

**💪 通过每日报告了解自己的健康习惯，在舒适的深色模式下保护眼睛！**

发布日期: 2024-01-XX
版本: v0.0.2
