# Release v0.0.1

## 发布信息

- **版本号**: v0.0.1
- **发布日期**: 2026-02-02
- **Git Tag**: v0.0.1
- **VSIX 文件**: moved-yet-0.0.1.vsix (375.12 KB)

## 发布内容

这是 Moved Yet 插件的首个正式版本。

### 核心功能

1. **久坐提醒**
   - 可配置提醒间隔（5-180分钟）
   - 支持启用/禁用
   - 全屏提醒界面

2. **喝水提醒**
   - 可配置提醒间隔（5-120分钟）
   - 支持启用/禁用
   - 全屏提醒界面

3. **智能活动检测**
   - 自动检测鼠标和键盘活动
   - 无活动时自动暂停计时器
   - 可配置无活动重置时间（1-30分钟）

4. **渐进式提醒**
   - 状态栏提醒 → 通知提醒 → 全屏提醒
   - 可配置每级提醒持续时间
   - 支持启用/禁用

5. **历史记录**
   - 记录所有提醒响应
   - 统计工作时长
   - 可视化健康仪表板

6. **多语言支持**
   - 中文简体
   - English

### 技术特性

- ✅ 20个单元测试全部通过
- ✅ TypeScript 类型检查
- ✅ ESLint 代码规范检查
- ✅ GitHub Actions CI/CD 自动化
- ✅ 使用 pnpm v10 包管理器

## 发布流程

1. ✅ 所有测试通过（20/20）
2. ✅ 代码编译成功
3. ✅ Lint 检查通过
4. ✅ 打包 VSIX 文件
5. ✅ 创建 Git Tag v0.0.1
6. ✅ 推送 Tag 到 GitHub
7. 🔄 GitHub Actions 自动发布流程已触发

## GitHub Actions 工作流

推送 tag 后，GitHub Actions 将自动执行以下步骤：

1. 检出代码
2. 安装依赖（pnpm）
3. 编译 TypeScript
4. 运行测试
5. 打包 VSIX
6. 创建 GitHub Release
7. 上传 VSIX 文件到 Release
8. 发布到 VS Code Marketplace（需要 VSCE_PAT）
9. 发布到 Open VSX Registry（需要 OVSX_PAT）

## 验证步骤

查看 GitHub Actions 运行状态：
```
https://github.com/enneket/moved-yet/actions
```

查看 GitHub Release：
```
https://github.com/enneket/moved-yet/releases/tag/v0.0.1
```

## 注意事项

- 如果需要发布到 VS Code Marketplace，需要在 GitHub Secrets 中配置 `VSCE_PAT`
- 如果需要发布到 Open VSX Registry，需要在 GitHub Secrets 中配置 `OVSX_PAT`
- 如果没有配置这些 token，GitHub Release 仍会成功创建，但不会发布到市场

## 下一步

1. 监控 GitHub Actions 工作流执行情况
2. 验证 GitHub Release 是否成功创建
3. 如需发布到市场，配置相应的 PAT token
4. 测试从 GitHub Release 下载的 VSIX 文件

## 相关文档

- [CHANGELOG.md](./CHANGELOG.md) - 详细更新日志
- [GitHub-Actions-pnpm-迁移.md](./GitHub-Actions-pnpm-迁移.md) - CI/CD 配置说明
- [开发指南.md](./开发指南.md) - 开发文档
- [测试指南.md](./测试指南.md) - 测试文档
