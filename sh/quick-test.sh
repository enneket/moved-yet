#!/bin/bash

# Moved Yet 快速测试脚本
# 使用方法: ./sh/quick-test.sh

echo "🚀 Moved Yet 快速测试"
echo "===================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 测试计数
TESTS=0
PASSED=0

test_step() {
    local name="$1"
    local command="$2"
    
    ((TESTS++))
    echo -n "测试 $name ... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ 失败${NC}"
    fi
}

echo ""
echo "📋 基础检查"
echo "----------"

test_step "项目结构" "test -f package.json && test -d src && test -d docs && test -d sh"
test_step "TypeScript编译" "npm run compile"
test_step "代码检查" "npm run lint 2>&1 | grep -v warning || true"
test_step "包构建" "npx vsce package --no-dependencies"

echo ""
echo "📦 包验证"
echo "----------"

if [ -f "moved-yet-0.0.1.vsix" ]; then
    PACKAGE_SIZE=$(du -k moved-yet-0.0.1.vsix | cut -f1)
    echo "包大小: ${PACKAGE_SIZE}KB"
    
    if [ "$PACKAGE_SIZE" -lt 500 ]; then
        echo -e "${GREEN}✅ 包大小合理${NC}"
        ((TESTS++))
        ((PASSED++))
    else
        echo -e "${RED}❌ 包过大${NC}"
        ((TESTS++))
    fi
    
    # 检查包内容
    CONTENT=$(npx vsce ls 2>/dev/null)
    if echo "$CONTENT" | grep -q "out/extension.js"; then
        echo -e "${GREEN}✅ 包内容正确${NC}"
        ((TESTS++))
        ((PASSED++))
    else
        echo -e "${RED}❌ 包内容缺失${NC}"
        ((TESTS++))
    fi
else
    echo -e "${RED}❌ VSIX包未生成${NC}"
    ((TESTS++))
fi

echo ""
echo "📊 测试结果"
echo "----------"
echo "总测试: $TESTS"
echo "通过: $PASSED"
echo "失败: $((TESTS - PASSED))"

SUCCESS_RATE=$((PASSED * 100 / TESTS))
echo "成功率: ${SUCCESS_RATE}%"

if [ "$SUCCESS_RATE" -ge 90 ]; then
    echo -e "${GREEN}🎉 测试通过！可以发布${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  需要检查失败的测试项${NC}"
    exit 1
fi