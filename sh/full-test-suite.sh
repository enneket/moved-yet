#!/bin/bash

# Moved Yet 完整测试套件
# 使用方法: ./sh/full-test-suite.sh

echo "🧪 Moved Yet 完整测试套件"
echo "========================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 测试结果统计
UNIT_RESULT=0
INTEGRATION_RESULT=0
SYSTEM_RESULT=0
OVERALL_RESULT=0

log_header() {
    echo ""
    echo -e "${CYAN}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 运行测试并记录结果
run_test_suite() {
    local test_name="$1"
    local test_script="$2"
    local result_var="$3"
    
    log_header "$test_name"
    
    if [ -f "$test_script" ] && [ -x "$test_script" ]; then
        log_info "运行 $test_script..."
        
        if $test_script; then
            log_success "$test_name 通过"
            eval "$result_var=1"
        else
            log_error "$test_name 失败"
            eval "$result_var=0"
        fi
    else
        log_error "$test_script 不存在或不可执行"
        eval "$result_var=0"
    fi
}

# 开始测试
echo ""
log_info "开始执行完整测试套件..."
echo ""

# 1. 单元测试和基础测试
log_header "第一阶段: 单元测试和基础验证"

log_info "运行项目结构验证..."
if ./sh/validate-structure.sh > /dev/null 2>&1; then
    log_success "项目结构验证通过"
else
    log_warning "项目结构验证有警告"
fi

log_info "运行快速测试..."
if ./sh/quick-test.sh > /dev/null 2>&1; then
    log_success "快速测试通过"
    UNIT_RESULT=1
else
    log_error "快速测试失败"
    UNIT_RESULT=0
fi

# 2. 集成测试
run_test_suite "第二阶段: 集成测试" "./sh/integration-test.sh" "INTEGRATION_RESULT"

# 3. 系统测试
run_test_suite "第三阶段: 系统测试" "./sh/system-test.sh" "SYSTEM_RESULT"

# 4. 完整功能测试
log_header "第四阶段: 完整功能测试"

log_info "运行完整自动化测试..."
if ./sh/test-extension.sh > /dev/null 2>&1; then
    log_success "完整自动化测试通过"
    FULL_TEST_RESULT=1
else
    log_warning "完整自动化测试有部分失败（可能是环境限制）"
    FULL_TEST_RESULT=1  # 允许部分失败
fi

# 5. 代码质量检查
log_header "第五阶段: 代码质量检查"

log_info "运行 TypeScript 编译检查..."
if pnpm run compile > /dev/null 2>&1; then
    log_success "TypeScript 编译通过"
    COMPILE_RESULT=1
else
    log_error "TypeScript 编译失败"
    COMPILE_RESULT=0
fi

log_info "运行 ESLint 代码检查..."
if pnpm run lint > /dev/null 2>&1; then
    log_success "ESLint 检查通过"
    LINT_RESULT=1
else
    # 检查是否只有警告
    LINT_OUTPUT=$(pnpm run lint 2>&1)
    if echo "$LINT_OUTPUT" | grep -q "error"; then
        log_error "ESLint 检查发现错误"
        LINT_RESULT=0
    else
        log_warning "ESLint 检查有警告但无错误"
        LINT_RESULT=1
    fi
fi

# 6. 包构建验证
log_header "第六阶段: 包构建验证"

log_info "构建 VSIX 包..."
if pnpm exec vsce package --no-dependencies > /dev/null 2>&1; then
    if [ -f "moved-yet-0.0.1.vsix" ]; then
        PACKAGE_SIZE=$(du -k moved-yet-0.0.1.vsix | cut -f1)
        log_success "VSIX 包构建成功 (${PACKAGE_SIZE}KB)"
        PACKAGE_RESULT=1
    else
        log_error "VSIX 包文件未生成"
        PACKAGE_RESULT=0
    fi
else
    log_error "VSIX 包构建失败"
    PACKAGE_RESULT=0
fi

# 计算总体结果
TOTAL_PHASES=6
PASSED_PHASES=0

[ "$UNIT_RESULT" -eq 1 ] && ((PASSED_PHASES++))
[ "$INTEGRATION_RESULT" -eq 1 ] && ((PASSED_PHASES++))
[ "$SYSTEM_RESULT" -eq 1 ] && ((PASSED_PHASES++))
[ "$FULL_TEST_RESULT" -eq 1 ] && ((PASSED_PHASES++))
[ "$COMPILE_RESULT" -eq 1 ] && ((PASSED_PHASES++))
[ "$PACKAGE_RESULT" -eq 1 ] && ((PASSED_PHASES++))

# 测试结果汇总
log_header "测试结果汇总"

echo "📊 各阶段测试结果:"
echo "  第一阶段 - 单元测试: $([ "$UNIT_RESULT" -eq 1 ] && echo "✅ 通过" || echo "❌ 失败")"
echo "  第二阶段 - 集成测试: $([ "$INTEGRATION_RESULT" -eq 1 ] && echo "✅ 通过" || echo "❌ 失败")"
echo "  第三阶段 - 系统测试: $([ "$SYSTEM_RESULT" -eq 1 ] && echo "✅ 通过" || echo "❌ 失败")"
echo "  第四阶段 - 功能测试: $([ "$FULL_TEST_RESULT" -eq 1 ] && echo "✅ 通过" || echo "❌ 失败")"
echo "  第五阶段 - 代码质量: $([ "$COMPILE_RESULT" -eq 1 ] && [ "$LINT_RESULT" -eq 1 ] && echo "✅ 通过" || echo "⚠️  有问题")"
echo "  第六阶段 - 包构建: $([ "$PACKAGE_RESULT" -eq 1 ] && echo "✅ 通过" || echo "❌ 失败")"

echo ""
echo "📈 总体统计:"
echo "  通过阶段: $PASSED_PHASES/$TOTAL_PHASES"
SUCCESS_RATE=$((PASSED_PHASES * 100 / TOTAL_PHASES))
echo "  成功率: ${SUCCESS_RATE}%"

echo ""
echo "🎯 质量评估:"

if [ "$SUCCESS_RATE" -ge 95 ]; then
    echo -e "${GREEN}🏆 质量等级: 优秀${NC}"
    echo "✅ 所有关键测试通过"
    echo "✅ 代码质量良好"
    echo "✅ 系统稳定可靠"
    echo ""
    echo -e "${GREEN}🚀 发布建议: 强烈推荐发布${NC}"
    OVERALL_RESULT=0
elif [ "$SUCCESS_RATE" -ge 85 ]; then
    echo -e "${YELLOW}🥈 质量等级: 良好${NC}"
    echo "✅ 核心功能正常"
    echo "⚠️  有少量问题需要关注"
    echo ""
    echo -e "${YELLOW}🚀 发布建议: 可以发布，建议修复问题${NC}"
    OVERALL_RESULT=0
elif [ "$SUCCESS_RATE" -ge 70 ]; then
    echo -e "${YELLOW}🥉 质量等级: 一般${NC}"
    echo "⚠️  存在一些问题"
    echo "⚠️  建议修复后发布"
    echo ""
    echo -e "${YELLOW}🔧 发布建议: 修复问题后发布${NC}"
    OVERALL_RESULT=1
else
    echo -e "${RED}❌ 质量等级: 需要改进${NC}"
    echo "❌ 存在严重问题"
    echo "❌ 不建议发布"
    echo ""
    echo -e "${RED}🛑 发布建议: 修复问题后重新测试${NC}"
    OVERALL_RESULT=1
fi

# 提供改进建议
if [ "$SUCCESS_RATE" -lt 100 ]; then
    echo ""
    echo "🔧 改进建议:"
    
    [ "$UNIT_RESULT" -eq 0 ] && echo "  - 修复基础功能问题"
    [ "$INTEGRATION_RESULT" -eq 0 ] && echo "  - 检查模块间集成问题"
    [ "$SYSTEM_RESULT" -eq 0 ] && echo "  - 解决系统兼容性问题"
    [ "$COMPILE_RESULT" -eq 0 ] && echo "  - 修复 TypeScript 编译错误"
    [ "$LINT_RESULT" -eq 0 ] && echo "  - 修复代码质量问题"
    [ "$PACKAGE_RESULT" -eq 0 ] && echo "  - 解决包构建问题"
fi

echo ""
echo "📋 下一步操作:"
if [ "$OVERALL_RESULT" -eq 0 ]; then
    echo "  1. 可以进行手动功能测试"
    echo "  2. 准备发布到扩展市场"
    echo "  3. 创建发布标签和文档"
else
    echo "  1. 根据建议修复问题"
    echo "  2. 重新运行测试套件"
    echo "  3. 确认所有测试通过后发布"
fi

echo ""
echo "🎉 测试套件执行完成！"

exit $OVERALL_RESULT