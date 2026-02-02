# Open VSX Registry 配置说明

## 📋 当前配置

**命名空间**: `enneket`  
**扩展ID**: `enneket.moved-yet`  
**Open VSX URL**: https://open-vsx.org/extension/enneket/moved-yet

## 🔧 配置步骤

### 1. 注册Open VSX账户
1. 访问 [Open VSX Registry](https://open-vsx.org/)
2. 点击右上角 "Log in"
3. 使用GitHub账户登录 (`yaolifeng0629`)

### 2. 创建命名空间
1. 登录后访问 [用户设置](https://open-vsx.org/user-settings)
2. 在 "Namespaces" 部分创建命名空间 `yaolifeng0629`
3. 验证命名空间所有权（通过GitHub验证）

### 3. 生成访问令牌
1. 在用户设置中找到 "Access Tokens"
2. 点击 "Generate New Token"
3. 设置令牌名称：`moved-yet-publish`
4. 选择权限：`publish`
5. 复制生成的令牌（只显示一次）

### 4. 配置GitHub Secrets
在GitHub仓库设置中添加：
```
OVSX_PAT: <你的Open VSX访问令牌>
```

## 📦 发布方法

### 自动发布（推荐）
推送版本标签时自动发布：
```bash
git tag v0.0.3
git push origin v0.0.3
```

### 手动发布
使用发布脚本：
```bash
./sh/publish-openvsx.sh <YOUR_TOKEN>
```

### 使用ovsx CLI
```bash
# 安装ovsx
npm install -g ovsx

# 发布
ovsx publish -p <YOUR_TOKEN>
```

## 🔍 验证发布

### 检查扩展页面
访问：https://open-vsx.org/extension/yaolifeng0629/moved-yet

### 安装测试
```bash
# VS Code
code --install-extension yaolifeng0629.moved-yet

# VSCodium
# 在扩展面板搜索 "moved-yet"
```

## ⚠️ 注意事项

### 命名空间要求
- 必须与GitHub用户名匹配
- 需要验证GitHub账户所有权
- 一旦创建不能更改

### 发布权限
- 只有命名空间所有者可以发布
- 访问令牌需要 `publish` 权限
- 令牌应该安全存储

### 版本管理
- 版本号必须遵循语义化版本
- 不能重复发布相同版本
- 建议使用自动化发布

## 🔄 迁移说明

如果之前使用了不同的命名空间（如 `Immerse`），需要：

### 1. 更新package.json
```json
{
    "publisher": "yaolifeng0629"
}
```

### 2. 重新构建包
```bash
npm run compile
vsce package
```

### 3. 发布到新命名空间
```bash
ovsx publish -p <YOUR_TOKEN>
```

### 4. 更新文档和链接
- README.md 中的安装命令
- 文档中的扩展链接
- CI/CD 配置

## 📊 发布状态检查

### GitHub Actions状态
检查 `.github/workflows/release.yml` 中的发布步骤：
```yaml
- name: Publish to Open VSX Registry
  run: ovsx publish ${{ steps.package.outputs.vsix_file }}
  env:
    OVSX_PAT: ${{ secrets.OVSX_PAT }}
```

### 发布日志
在GitHub Actions的运行日志中查看：
- 包构建状态
- Open VSX发布结果
- 错误信息（如果有）

## 🐛 常见问题

### 问题1: 命名空间不存在
**错误**: `Namespace 'yaolifeng0629' does not exist`
**解决**: 在Open VSX上创建并验证命名空间

### 问题2: 权限不足
**错误**: `Insufficient permissions`
**解决**: 检查访问令牌权限和命名空间所有权

### 问题3: 版本冲突
**错误**: `Version already exists`
**解决**: 更新版本号或删除现有版本

### 问题4: 包格式错误
**错误**: `Invalid package format`
**解决**: 检查package.json配置和VSIX包完整性

## 📚 参考资料

- [Open VSX Registry](https://open-vsx.org/)
- [Open VSX CLI文档](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [VS Code扩展发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

**🎯 目标**: 成功发布到Open VSX Registry，支持更多开源编辑器！