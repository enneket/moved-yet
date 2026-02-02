#!/bin/bash

# Moved Yet v0.0.1 发布脚本
# 使用方法: ./sh/release-v0.0.1.sh

set -e

echo "🚀 开始发布 Moved Yet v0.0.1..."

# 1. 检查环境
echo "📋 检查开发环境..."
node --version
npm --version

# 2. 清理和编译
echo "🧹 清理项目..."
rm -rf out/
rm -f moved-yet-*.vsix

echo "📦 编译项目..."
npm run compile

# 3. 运行代码检查
echo "🔍 运行代码检查..."
npm run lint

# 4. 创建 VSIX 包
echo "📦 创建 VSIX 包..."
npx vsce package

# 5. 验证包内容
echo "🔍 验证包内容..."
npx vsce ls --tree

# 6. 显示包信息
VSIX_FILE="moved-yet-0.0.1.vsix"
if [ -f "$VSIX_FILE" ]; then
    echo "✅ VSIX 包创建成功: $VSIX_FILE"
    echo "📊 包大小: $(du -h $VSIX_FILE | cut -f1)"
else
    echo "❌ VSIX 包创建失败"
    exit 1
fi

echo ""
echo "🎉 v0.0.1 发布准备完成！"
echo ""
echo "📋 发布清单："
echo "  ✅ 版本号已更新到 0.0.1"
echo "  ✅ 添加了智能活动检测功能"
echo "  ✅ 升级了 Node.js 到 v25.5.0"
echo "  ✅ 更新了所有文档"
echo "  ✅ 创建了 VSIX 包"
echo ""
echo "🚀 下一步操作："
echo "  1. 测试安装: code --install-extension $VSIX_FILE"
echo "  2. 发布到 VS Code Marketplace: npx vsce publish"
echo "  3. 发布到 Open VSX: ./sh/publish-openvsx.sh <TOKEN>"
echo "  4. 创建 Git 标签: git tag v0.0.1 && git push origin v0.0.1"
echo ""
echo "📚 新功能测试："
echo "  - 运行命令: '动了么？: 测试活动检测'"
echo "  - 检查配置: movedYet.enableActivityDetection"
echo "  - 验证自动重置: 等待无活动后重新编辑"