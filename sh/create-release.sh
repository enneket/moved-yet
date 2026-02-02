#!/bin/bash

# Moved Yet 版本发布脚本
# 使用方法: ./sh/create-release.sh [版本号]
# 例如: ./sh/create-release.sh 0.0.3

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查参数
if [ $# -eq 0 ]; then
    print_error "请提供版本号"
    echo "使用方法: $0 <版本号>"
    echo "例如: $0 0.0.3"
    exit 1
fi

NEW_VERSION=$1

# 验证版本号格式
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "版本号格式不正确，应该是 x.y.z 格式"
    exit 1
fi

print_info "准备发布版本 v$NEW_VERSION"

# 检查是否在正确的分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "当前不在 main 分支 (当前: $CURRENT_BRANCH)"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消发布"
        exit 1
    fi
fi

# 检查工作目录是否干净
if ! git diff-index --quiet HEAD --; then
    print_error "工作目录不干净，请先提交或暂存更改"
    git status --porcelain
    exit 1
fi

# 检查是否有未推送的提交
if [ $(git rev-list HEAD...origin/$CURRENT_BRANCH --count) -ne 0 ]; then
    print_warning "有未推送的提交"
    read -p "是否先推送到远程? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin $CURRENT_BRANCH
    fi
fi

# 更新版本号
print_info "更新 package.json 中的版本号..."
pnpm version $NEW_VERSION --no-git-tag-version

# 检查并更新 CHANGELOG
CHANGELOG_FILE="docs/CHANGELOG.md"
if [ -f "$CHANGELOG_FILE" ]; then
    if ! grep -q "### v$NEW_VERSION" "$CHANGELOG_FILE"; then
        print_warning "CHANGELOG.md 中没有找到版本 v$NEW_VERSION 的更新记录"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            # 恢复 package.json
            git checkout -- package.json
            print_info "已取消发布并恢复 package.json"
            exit 1
        fi
    else
        print_success "找到版本 v$NEW_VERSION 的更新记录"
    fi
else
    print_warning "未找到 CHANGELOG.md 文件"
fi

# 运行测试
print_info "运行测试..."
pnpm run compile
pnpm run lint

# 构建包
print_info "构建 VSIX 包..."
if command -v vsce &> /dev/null; then
    vsce package
else
    print_warning "vsce 未安装，使用 pnpm exec"
    pnpm exec vsce package
fi

VSIX_FILE="moved-yet-$NEW_VERSION.vsix"
if [ ! -f "$VSIX_FILE" ]; then
    print_error "VSIX 包构建失败"
    git checkout -- package.json
    exit 1
fi

print_success "VSIX 包构建成功: $VSIX_FILE"

# 提交更改
print_info "提交版本更新..."
git add package.json
git commit -m "chore: bump version to v$NEW_VERSION"

# 创建标签
print_info "创建 Git 标签..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# 推送到远程
print_info "推送到远程仓库..."
git push origin $CURRENT_BRANCH
git push origin "v$NEW_VERSION"

print_success "版本 v$NEW_VERSION 发布完成！"
print_info "GitHub Actions 将自动构建并发布到:"
echo "  - GitHub Releases"
echo "  - VS Code Marketplace (如果配置了 VSCE_PAT)"
echo "  - Open VSX Registry (如果配置了 OVSX_PAT)"

print_info "本地构建的包: $VSIX_FILE"
print_info "GitHub Release: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//')/releases/tag/v$NEW_VERSION"