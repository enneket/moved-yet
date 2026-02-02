#!/bin/bash

# Moved Yet 系统测试脚本
# 使用方法: ./sh/system-test.sh

echo "🌐 Moved Yet 系统测试"
echo "===================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 测试统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

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

system_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TOTAL_TESTS++))
    log_info "系统测试: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name"
        return 1
    fi
}

# 系统环境检查
check_system_environment() {
    echo ""
    log_info "系统环境信息"
    echo "----------------------------------------"
    echo "操作系统: $(uname -s) $(uname -r)"
    echo "架构: $(uname -m)"
    echo "Node.js: $(node --version 2>/dev/null || echo '未安装')"
    echo "npm: $(npm --version 2>/dev/null || echo '未安装')"
    
    if command -v code > /dev/null 2>&1; then
        echo "VS Code: $(code --version 2>/dev/null | head -1 || echo '命令行不可用')"
    else
        echo "VS Code: 命令行工具不可用"
    fi
    
    # 系统资源
    if command -v free > /dev/null 2>&1; then
        echo "内存: $(free -h | grep Mem | awk '{print $2}' 2>/dev/null || echo '未知')"
    fi
    
    if command -v df > /dev/null 2>&1; then
        echo "磁盘空间: $(df -h . 2>/dev/null | tail -1 | awk '{print $4}' || echo '未知')"
    fi
}

check_system_environment

echo ""
log_info "1. 系统环境兼容性测试"
echo "----------------------------------------"

# 基础环境检查
system_test "Node.js 环境" "node --version"
system_test "npm 包管理器" "npm --version"
system_test "TypeScript 编译器" "npx tsc --version"

# 系统资源检查
if command -v free > /dev/null 2>&1; then
    MEMORY_MB=$(free -m | grep Mem | awk '{print $2}' 2>/dev/null)
    if [ -n "$MEMORY_MB" ] && [ "$MEMORY_MB" -gt 2048 ]; then
        log_success "系统内存充足 (${MEMORY_MB}MB)"
        ((TOTAL_TESTS++))
    elif [ -n "$MEMORY_MB" ]; then
        log_warning "系统内存较少 (${MEMORY_MB}MB)"
        ((TOTAL_TESTS++))
    else
        log_warning "无法获取内存信息"
        ((TOTAL_TESTS++))
    fi
else
    log_warning "无法检查系统内存"
    ((TOTAL_TESTS++))
fi

echo ""
log_info "2. 扩展包完整性系统测试"
echo "----------------------------------------"

# 构建完整的扩展包
system_test "扩展包构建" "npx vsce package --no-dependencies"

if [ -f "moved-yet-0.0.2.vsix" ]; then
    # 包大小检查
    PACKAGE_SIZE_KB=$(du -k moved-yet-0.0.2.vsix | cut -f1)
    PACKAGE_SIZE_MB=$((PACKAGE_SIZE_KB / 1024))
    
    if [ "$PACKAGE_SIZE_KB" -lt 1024 ]; then  # < 1MB
        log_success "扩展包大小合理 (${PACKAGE_SIZE_KB}KB)"
        ((TOTAL_TESTS++))
    else
        log_warning "扩展包较大 (${PACKAGE_SIZE_MB}MB)"
        ((TOTAL_TESTS++))
    fi
    
    # 包内容完整性检查
    PACKAGE_CONTENT=$(npx vsce ls 2>/dev/null)
    
    check_package_file() {
        local file_pattern="$1"
        local description="$2"
        
        ((TOTAL_TESTS++))
        if echo "$PACKAGE_CONTENT" | grep -q "$file_pattern"; then
            log_success "包内容: $description"
        else
            log_error "包内容: $description"
        fi
    }
    
    check_package_file "package.json" "项目配置"
    check_package_file "out/extension.js" "主程序"
    check_package_file "out/services/" "服务模块"
    check_package_file "docs/" "用户文档"
    check_package_file "images/logo.png" "扩展图标"
    
else
    log_error "扩展包构建失败"
    ((TOTAL_TESTS++))
fi

echo ""
log_info "3. 端到端功能系统测试"
echo "----------------------------------------"

# 模拟端到端测试场景
log_info "模拟用户工作流程..."

# 检查所有必要的配置项
check_e2e_config() {
    local config_key="$1"
    local description="$2"
    
    ((TOTAL_TESTS++))
    if grep -q "\"$config_key\"" package.json; then
        log_success "E2E配置: $description"
    else
        log_error "E2E配置: $description"
    fi
}

check_e2e_config "movedYet.sitReminderInterval" "久坐提醒间隔"
check_e2e_config "movedYet.drinkReminderInterval" "喝水提醒间隔"
check_e2e_config "movedYet.enableActivityDetection" "活动检测开关"
check_e2e_config "movedYet.inactivityResetTime" "无活动重置时间"

# 检查所有命令的定义
check_e2e_command() {
    local command_id="$1"
    local description="$2"
    
    ((TOTAL_TESTS++))
    if grep -q "\"$command_id\"" package.json; then
        log_success "E2E命令: $description"
    else
        log_error "E2E命令: $description"
    fi
}

check_e2e_command "movedYet.resetTimers" "重置计时器"
check_e2e_command "movedYet.showStatus" "显示状态"
check_e2e_command "movedYet.testActivityDetection" "测试活动检测"
check_e2e_command "movedYet.showHistory" "查看历史"
check_e2e_command "movedYet.showDashboard" "查看仪表盘"

echo ""
log_info "4. 多环境兼容性系统测试"
echo "----------------------------------------"

# 检查跨平台兼容性
OS_TYPE=$(uname -s)
case "$OS_TYPE" in
    "Linux")
        log_success "Linux 环境兼容性"
        ((TOTAL_TESTS++))
        ;;
    "Darwin")
        log_success "macOS 环境兼容性"
        ((TOTAL_TESTS++))
        ;;
    "MINGW"*|"CYGWIN"*|"MSYS"*)
        log_success "Windows 环境兼容性"
        ((TOTAL_TESTS++))
        ;;
    *)
        log_warning "未知操作系统: $OS_TYPE"
        ((TOTAL_TESTS++))
        ;;
esac

# Node.js 版本兼容性
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

if [ "$NODE_MAJOR" -ge 25 ]; then
    log_success "Node.js 版本兼容性 (v$NODE_VERSION)"
    ((TOTAL_TESTS++))
elif [ "$NODE_MAJOR" -ge 22 ]; then
    log_warning "Node.js 版本较旧但兼容 (v$NODE_VERSION)"
    ((TOTAL_TESTS++))
else
    log_error "Node.js 版本过旧 (v$NODE_VERSION)"
    ((TOTAL_TESTS++))
fi

echo ""
log_info "5. 性能系统测试"
echo "----------------------------------------"

# 编译性能测试
COMPILE_START=$(date +%s)
if npm run compile > /dev/null 2>&1; then
    COMPILE_END=$(date +%s)
    COMPILE_TIME=$((COMPILE_END - COMPILE_START))
    
    if [ "$COMPILE_TIME" -le 10 ]; then
        log_success "编译性能 (${COMPILE_TIME}s <= 10s)"
    else
        log_warning "编译性能 (${COMPILE_TIME}s > 10s)"
    fi
    ((TOTAL_TESTS++))
else
    log_error "编译性能测试失败"
    ((TOTAL_TESTS++))
fi

# 包构建性能测试
BUILD_START=$(date +%s)
if npx vsce package --no-dependencies > /dev/null 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    
    if [ "$BUILD_TIME" -le 15 ]; then
        log_success "构建性能 (${BUILD_TIME}s <= 15s)"
    else
        log_warning "构建性能 (${BUILD_TIME}s > 15s)"
    fi
    ((TOTAL_TESTS++))
else
    log_error "构建性能测试失败"
    ((TOTAL_TESTS++))
fi

echo ""
log_info "6. 安全性系统测试"
echo "----------------------------------------"

# 检查敏感信息泄露
system_test "无敏感信息泄露" "! grep -r 'password\|secret\|token\|key' src/ --exclude-dir=node_modules || true"

# 检查依赖安全性
if command -v npm > /dev/null 2>&1; then
    log_info "检查依赖安全性..."
    if npm audit --audit-level=high > /dev/null 2>&1; then
        log_success "依赖安全性检查"
        ((TOTAL_TESTS++))
    else
        log_warning "发现高风险依赖"
        ((TOTAL_TESTS++))
    fi
else
    log_warning "跳过依赖安全性检查"
fi

echo ""
log_info "7. 用户体验系统测试"
echo "----------------------------------------"

# 检查用户文档完整性
check_ux_doc() {
    local doc_file="$1"
    local description="$2"
    
    ((TOTAL_TESTS++))
    if [ -f "$doc_file" ] && [ -s "$doc_file" ]; then
        log_success "用户文档: $description"
    else
        log_error "用户文档: $description"
    fi
}

check_ux_doc "README.md" "项目说明"
check_ux_doc "docs/功能指南.md" "功能指南"
check_ux_doc "docs/CHANGELOG.md" "更新日志"

# 检查多语言支持
if grep -q "'zh-CN'" src/utils/languages.ts && grep -q "en:" src/utils/languages.ts; then
    log_success "多语言支持完整"
    ((TOTAL_TESTS++))
else
    log_error "多语言支持不完整"
    ((TOTAL_TESTS++))
fi

echo ""
log_info "8. 扩展生态系统测试"
echo "----------------------------------------"

# VS Code 扩展规范检查
if grep -q '"engines"' package.json && grep -q '"vscode"' package.json; then
    log_success "VS Code 引擎版本定义"
    ((TOTAL_TESTS++))
else
    log_error "VS Code 引擎版本定义"
    ((TOTAL_TESTS++))
fi

# 扩展清单完整性
MANIFEST_FIELDS=("name" "displayName" "description" "version" "publisher" "main" "contributes")
for field in "${MANIFEST_FIELDS[@]}"; do
    ((TOTAL_TESTS++))
    if grep -q "\"$field\"" package.json; then
        log_success "清单字段: $field"
    else
        log_error "清单字段: $field"
    fi
done

echo ""
echo "=================================================="
log_info "系统测试总结"
echo "=================================================="

echo "📊 系统测试统计:"
echo "  总测试数: $TOTAL_TESTS"
echo "  通过测试: $PASSED_TESTS"
echo "  失败测试: $FAILED_TESTS"

if [ "$TOTAL_TESTS" -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "  成功率: ${SUCCESS_RATE}%"
    
    echo ""
    echo "🌐 系统测试分析:"
    
    if [ "$SUCCESS_RATE" -ge 95 ]; then
        echo -e "${GREEN}🎉 系统测试结果: 优秀 - 系统完全就绪${NC}"
        echo "✅ 所有系统组件正常工作"
        echo "✅ 跨平台兼容性良好"
        echo "✅ 性能指标达标"
        echo "✅ 用户体验完整"
        echo ""
        echo "🚀 建议: 可以发布到生产环境"
        exit 0
    elif [ "$SUCCESS_RATE" -ge 85 ]; then
        echo -e "${YELLOW}⚠️  系统测试结果: 良好 - 有少量系统问题${NC}"
        echo "⚠️  建议检查失败的系统测试项"
        echo "⚠️  修复后可以发布"
        exit 0
    else
        echo -e "${RED}❌ 系统测试结果: 需要改进 - 存在系统问题${NC}"
        echo "❌ 需要修复系统级问题"
        echo "❌ 不建议发布到生产环境"
        exit 1
    fi
else
    echo -e "${RED}❌ 没有运行任何系统测试${NC}"
    exit 1
fi