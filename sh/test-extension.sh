#!/bin/bash

# Moved Yet 扩展自动化测试脚本
# 使用方法: ./sh/test-extension.sh

# 不使用 set -e，允许测试失败继续执行

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TOTAL_TESTS++))
    log_info "测试: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name"
        return 1
    fi
}

# 开始测试
echo "🧪 开始 Moved Yet 扩展自动化测试..."
echo "=================================================="

# 1. 环境检查
echo ""
log_info "1. 环境检查"
echo "----------------------------------------"

run_test "Node.js 版本检查" "node --version"
run_test "npm 版本检查" "npm --version"
run_test "VS Code 命令行工具" "code --version"

# 2. 项目结构检查
echo ""
log_info "2. 项目结构检查"
echo "----------------------------------------"

run_test "package.json 存在" "test -f package.json"
run_test "src 目录存在" "test -d src"
run_test "docs 目录存在" "test -d docs"
run_test "sh 目录存在" "test -d sh"
run_test "主入口文件存在" "test -f src/extension.ts"

# 3. 编译测试
echo ""
log_info "3. 编译测试"
echo "----------------------------------------"

run_test "TypeScript 编译" "npm run compile"
run_test "编译输出目录存在" "test -d out"
run_test "主入口编译文件存在" "test -f out/extension.js"

# 4. 代码质量检查
echo ""
log_info "4. 代码质量检查"
echo "----------------------------------------"

# ESLint 检查（允许警告，但不允许错误）
if npm run lint 2>&1 | grep -q "error"; then
    log_error "ESLint 检查 - 存在错误"
    ((TOTAL_TESTS++))
else
    log_success "ESLint 检查 - 无错误"
    ((TOTAL_TESTS++))
fi

# 5. 包构建测试
echo ""
log_info "5. 包构建测试"
echo "----------------------------------------"

# 清理旧包
rm -f moved-yet-*.vsix

run_test "VSIX 包构建" "npx vsce package --no-dependencies"
run_test "VSIX 包文件存在" "test -f moved-yet-0.0.1.vsix"

# 检查包大小（应该小于 500KB）
if [ -f "moved-yet-0.0.1.vsix" ]; then
    PACKAGE_SIZE=$(du -k moved-yet-0.0.1.vsix | cut -f1)
    if [ "$PACKAGE_SIZE" -lt 500 ]; then
        log_success "包大小检查 (${PACKAGE_SIZE}KB < 500KB)"
        ((TOTAL_TESTS++))
    else
        log_error "包大小检查 (${PACKAGE_SIZE}KB >= 500KB)"
        ((TOTAL_TESTS++))
    fi
fi

# 6. 包内容验证
echo ""
log_info "6. 包内容验证"
echo "----------------------------------------"

# 检查包内容
PACKAGE_CONTENT=$(npx vsce ls 2>/dev/null || echo "")

check_package_content() {
    local file_pattern="$1"
    local description="$2"
    
    ((TOTAL_TESTS++))
    if echo "$PACKAGE_CONTENT" | grep -q "$file_pattern"; then
        log_success "包内容检查: $description"
    else
        log_error "包内容检查: $description"
    fi
}

check_package_content "package.json" "项目配置文件"
check_package_content "README.md" "说明文档"
check_package_content "out/extension.js" "编译后的主文件"
check_package_content "images/logo.png" "扩展图标"
check_package_content "docs/" "用户文档"

# 检查不应该包含的文件
check_package_exclusion() {
    local file_pattern="$1"
    local description="$2"
    
    ((TOTAL_TESTS++))
    if echo "$PACKAGE_CONTENT" | grep -q "$file_pattern"; then
        log_error "包排除检查: $description (不应包含)"
    else
        log_success "包排除检查: $description (正确排除)"
    fi
}

check_package_exclusion "sh/" "脚本目录"
check_package_exclusion "src/" "源代码目录"
check_package_exclusion "tsconfig.json" "TypeScript配置"

# 7. 功能配置检查
echo ""
log_info "7. 功能配置检查"
echo "----------------------------------------"

# 检查 package.json 中的配置
check_package_config() {
    local config_path="$1"
    local description="$2"
    
    ((TOTAL_TESTS++))
    if jq -e "$config_path" package.json > /dev/null 2>&1; then
        log_success "配置检查: $description"
    else
        log_error "配置检查: $description"
    fi
}

# 检查是否安装了 jq
if command -v jq > /dev/null 2>&1; then
    check_package_config '.contributes.configuration.properties."movedYet.enableActivityDetection"' "活动检测配置"
    check_package_config '.contributes.configuration.properties."movedYet.inactivityResetTime"' "无活动重置时间配置"
    check_package_config '.contributes.commands[] | select(.command == "movedYet.testActivityDetection")' "测试活动检测命令"
    check_package_config '.version' "版本号"
else
    log_warning "跳过配置检查 (需要安装 jq)"
fi

# 8. 扩展安装测试（可选）
echo ""
log_info "8. 扩展安装测试"
echo "----------------------------------------"

if [ -f "moved-yet-0.0.1.vsix" ]; then
    log_info "尝试安装扩展进行测试..."
    
    # 检查是否已安装
    if code --list-extensions | grep -q "Immerse.moved-yet"; then
        log_warning "扩展已安装，跳过安装测试"
    else
        # 尝试安装
        if code --install-extension moved-yet-0.0.1.vsix --force > /dev/null 2>&1; then
            log_success "扩展安装测试"
            ((TOTAL_TESTS++))
            
            # 验证安装
            if code --list-extensions | grep -q "Immerse.moved-yet"; then
                log_success "扩展安装验证"
                ((TOTAL_TESTS++))
            else
                log_error "扩展安装验证"
                ((TOTAL_TESTS++))
            fi
        else
            log_error "扩展安装测试"
            ((TOTAL_TESTS++))
        fi
    fi
else
    log_warning "跳过安装测试 (VSIX 文件不存在)"
fi

# 9. 性能基准测试
echo ""
log_info "9. 性能基准测试"
echo "----------------------------------------"

# 检查包大小
if [ -f "moved-yet-0.0.1.vsix" ]; then
    PACKAGE_SIZE_MB=$(du -m moved-yet-0.0.1.vsix | cut -f1)
    if [ "$PACKAGE_SIZE_MB" -le 1 ]; then
        log_success "包大小性能 (${PACKAGE_SIZE_MB}MB <= 1MB)"
    else
        log_warning "包大小性能 (${PACKAGE_SIZE_MB}MB > 1MB)"
    fi
    ((TOTAL_TESTS++))
fi

# 检查编译时间
COMPILE_START=$(date +%s)
npm run compile > /dev/null 2>&1
COMPILE_END=$(date +%s)
COMPILE_TIME=$((COMPILE_END - COMPILE_START))

if [ "$COMPILE_TIME" -le 10 ]; then
    log_success "编译性能 (${COMPILE_TIME}s <= 10s)"
else
    log_warning "编译性能 (${COMPILE_TIME}s > 10s)"
fi
((TOTAL_TESTS++))

# 10. 测试总结
echo ""
echo "=================================================="
log_info "测试总结"
echo "=================================================="

echo "📊 测试统计:"
echo "  总测试数: $TOTAL_TESTS"
echo "  通过测试: $PASSED_TESTS"
echo "  失败测试: $FAILED_TESTS"

# 计算成功率
if [ "$TOTAL_TESTS" -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "  成功率: ${SUCCESS_RATE}%"
    
    if [ "$SUCCESS_RATE" -ge 90 ]; then
        echo -e "${GREEN}🎉 测试结果: 优秀${NC}"
        exit 0
    elif [ "$SUCCESS_RATE" -ge 80 ]; then
        echo -e "${YELLOW}⚠️  测试结果: 良好${NC}"
        exit 0
    else
        echo -e "${RED}❌ 测试结果: 需要改进${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 没有运行任何测试${NC}"
    exit 1
fi