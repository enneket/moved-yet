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

# 1. 检查是否已有 VSIX 包
VSIX_FILE=$(ls moved-yet-*.vsix 2>/dev/null | head -1)

if [ -z "$VSIX_FILE" ]; then
    echo "📦 未找到 VSIX 包，开始构建..."
    
    # 编译项目
    echo "📦 编译项目..."
    pnpm run compile
    
    # 创建 VSIX 包
    echo "📦 创建 VSIX 包..."
    pnpm exec vsce package --no-dependencies
    
    # 重新获取 VSIX 文件名
    VSIX_FILE=$(ls moved-yet-*.vsix 2>/dev/null | head -1)
    
    if [ -z "$VSIX_FILE" ]; then
        echo "❌ 错误: VSIX 包构建失败"
        exit 1
    fi
else
    echo "✅ 找到现有 VSIX 包: $VSIX_FILE"
fi

# 2. 确保 ovsx 已安装
echo "📦 检查 ovsx 工具..."
if ! pnpm exec ovsx --version > /dev/null 2>&1; then
    echo "📦 安装 ovsx..."
    pnpm add -g ovsx
fi

# 3. 发布到 Open VSX
echo "🌐 发布 $VSIX_FILE 到 Open VSX..."
pnpm exec ovsx publish "$VSIX_FILE" -p "$ACCESS_TOKEN"

echo "✅ 发布完成!"
echo "🔗 查看扩展: https://open-vsx.org/extension/enneket/moved-yet"