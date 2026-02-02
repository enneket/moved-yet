#!/bin/bash

# Open VSX 发布脚本
# 使用方法: ./publish-openvsx.sh <ACCESS_TOKEN>

set -e

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 错误: 请提供 Open VSX 访问令牌"
    echo "使用方法: ./publish-openvsx.sh <ACCESS_TOKEN>"
    echo ""
    echo "📝 获取访问令牌步骤:"
    echo "1. 访问 https://open-vsx.org"
    echo "2. 使用 GitHub 账户登录"
    echo "3. 进入用户设置 -> Access Tokens"
    echo "4. 生成新的访问令牌"
    exit 1
fi

ACCESS_TOKEN=$1

echo "🚀 开始发布到 Open VSX Registry..."

# 1. 编译项目
echo "📦 编译项目..."
npm run compile

# 2. 创建 VSIX 包
echo "📦 创建 VSIX 包..."
npx vsce package

# 3. 发布到 Open VSX
echo "🌐 发布到 Open VSX..."
npx ovsx publish -p $ACCESS_TOKEN

echo "✅ 发布完成!"
echo "🔗 查看扩展: https://open-vsx.org/extension/enneket/moved-yet"