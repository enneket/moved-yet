# v1.0.0 发布指令

## 当前状态

✅ 所有准备工作已完成：
- 版本号已更新到 1.0.0
- CHANGELOG 已完善
- 测试全部通过
- VSIX 包已构建
- Git 标签已创建
- 发布文档已完成

## 立即执行

由于网络问题，请手动执行以下命令完成发布：

```bash
# 1. 推送代码到 GitHub
git push origin main

# 2. 推送标签触发自动发布
git push origin v1.0.0
```

## 自动发布流程

推送标签后，GitHub Actions 会自动：
1. ✅ 运行 CI 测试
2. ✅ 构建 VSIX 包
3. ✅ 创建 GitHub Release
4. ✅ 发布到 Open VSX Registry
5. ✅ 发布到 VS Code Marketplace（如已配置）

## 发布后验证

```bash
# 查看 GitHub Release
open https://github.com/enneket/moved-yet/releases

# 查看 Open VSX
open https://open-vsx.org/extension/enneket/moved-yet
```

## 本地文件

- 📦 VSIX 包：`moved-yet-1.0.0.vsix` (1.9 MB)
- 📋 发布计划：`plans/release-1.0.0.md`
- 📝 发布总结：`docs/release-1.0.0-summary.md`
- 📖 更新日志：`CHANGELOG.md`

---

**准备就绪，执行上述命令即可完成发布！** 🚀
