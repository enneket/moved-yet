# Makefile 快速参考

## 🚀 最常用命令

```bash
make help       # 查看所有命令
make test       # 快速测试
make package    # 构建 VSIX 包
make install    # 安装到 VS Code
```

## 📋 命令速查表

### 开发
```bash
make compile    # 编译
make lint       # 代码检查
make dev        # 开发模式
make clean      # 清理
```

### 测试
```bash
make test           # 快速测试
make full-test      # 完整测试
make integration-test  # 集成测试
make system-test    # 系统测试
```

### 构建
```bash
make package        # 构建包
make install        # 安装
make pre-release    # 发布前检查
```

### 发布
```bash
make release VERSION=0.0.3              # 发布新版本
make publish-openvsx OVSX_PAT=token     # 发布到 Open VSX
```

### 维护
```bash
make validate       # 验证结构
make info           # 项目信息
make check-updates  # 检查更新
make audit          # 安全审计
```

## 🎯 常见场景

### 日常开发
```bash
make dev            # 启动开发模式
# 修改代码...
make test           # 测试
```

### 提交前检查
```bash
make full-test      # 完整测试
```

### 构建和安装
```bash
make package        # 构建
make install        # 安装测试
```

### 发布新版本
```bash
make pre-release    # 预检查
make release VERSION=0.0.3  # 发布
```

## 💡 提示

- 所有命令都可以用 `make` 前缀
- 使用 `make help` 查看完整列表
- 命令支持自动依赖管理
- 支持颜色输出，更易读

## 🔗 详细文档

- [Makefile 使用指南](./Makefile使用指南.md)
- [脚本迁移说明](./脚本迁移到Makefile.md)
- [实现总结](./Makefile实现总结.md)
