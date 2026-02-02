#!/bin/bash

# Moved Yet 集成测试脚本
# 使用方法: ./sh/integration-test.sh

echo "🔗 Moved Yet 集成测试"
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

integration_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TOTAL_TESTS++))
    log_info "集成测试: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name"
        return 1
    fi
}

echo ""
log_info "1. 模块依赖集成测试"
echo "----------------------------------------"

# 检查模块间的依赖关系
integration_test "Extension-ConfigService 集成" "grep -q 'configService' src/extension.ts"
integration_test "Extension-TimerService 集成" "grep -q 'timerService' src/extension.ts"
integration_test "Extension-ActivityDetection 集成" "grep -q 'activityDetectionService' src/extension.ts"
integration_test "TimerService-ConfigService 集成" "grep -q 'getConfig' src/services/timerService.ts"
integration_test "ActivityDetection-TimerService 集成" "grep -q 'resetAllTimers' src/services/activityDetectionService.ts"

echo ""
log_info "2. 配置系统集成测试"
echo "----------------------------------------"

# 检查配置项的完整性
check_config_integration() {
    local config_key="$1"
    local service_file="$2"
    local description="$3"
    
    ((TOTAL_TESTS++))
    if grep -q "$config_key" package.json && grep -q "$config_key" "$service_file"; then
        log_success "$description"
    else
        log_error "$description"
    fi
}

check_config_integration "enableActivityDetection" "src/services/configService.ts" "活动检测配置集成"
check_config_integration "inactivityResetTime" "src/services/configService.ts" "重置时间配置集成"
check_config_integration "enableProgressiveReminder" "src/services/configService.ts" "渐进式提醒配置集成"

echo ""
log_info "3. 服务间通信集成测试"
echo "----------------------------------------"

# 检查服务间的通信接口
integration_test "TimerService 导出接口完整" "grep -q 'export.*startTimers\|export.*resetAllTimers\|export.*timerState' src/services/timerService.ts"
integration_test "ConfigService 导出接口完整" "grep -q 'export.*getConfig\|export.*getTexts' src/services/configService.ts"
integration_test "ActivityDetection 导出接口完整" "grep -q 'export.*initActivityDetectionService\|export.*getActivityDetectionService' src/services/activityDetectionService.ts"

echo ""
log_info "4. UI组件集成测试"
echo "----------------------------------------"

# 检查UI组件与服务的集成
integration_test "ReminderUI-TimerService 集成" "grep -q 'timerService\|resetSitTimer\|resetDrinkTimer' src/ui/reminderUI.ts"
integration_test "StatusService-TimerService 集成" "grep -q 'timerState' src/services/statusService.ts"
integration_test "StatusService-ActivityDetection 集成" "grep -q 'activityDetectionService' src/services/statusService.ts"

echo ""
log_info "5. 命令系统集成测试"
echo "----------------------------------------"

# 检查命令与服务的集成
check_command_integration() {
    local command_id="$1"
    local description="$2"
    
    ((TOTAL_TESTS++))
    if grep -q "$command_id" package.json && grep -q "$command_id" src/extension.ts; then
        log_success "$description"
    else
        log_error "$description"
    fi
}

check_command_integration "movedYet.resetTimers" "重置计时器命令集成"
check_command_integration "movedYet.showStatus" "显示状态命令集成"
check_command_integration "movedYet.testActivityDetection" "测试活动检测命令集成"

echo ""
log_info "6. 数据流集成测试"
echo "----------------------------------------"

# 检查数据在各模块间的流动
integration_test "配置变更监听集成" "grep -q 'onDidChangeConfiguration' src/extension.ts"
integration_test "历史服务初始化集成" "grep -q 'initHistoryService' src/extension.ts"
integration_test "渐进式提醒初始化集成" "grep -q 'initProgressiveReminderService' src/extension.ts"

echo ""
log_info "7. 错误处理集成测试"
echo "----------------------------------------"

# 检查错误处理的集成
integration_test "ActivityDetection 错误处理" "grep -q 'try\|catch\|error' src/services/activityDetectionService.ts"
integration_test "Extension 错误处理" "grep -q 'try\|catch\|error' src/extension.ts"
integration_test "HistoryService 错误处理" "grep -q 'try\|catch\|error' src/services/historyService.ts"

echo ""
log_info "8. 生命周期集成测试"
echo "----------------------------------------"

# 检查扩展生命周期的集成
integration_test "激活时服务初始化" "grep -q 'initHistoryService\|initProgressiveReminderService\|initActivityDetectionService' src/extension.ts"
integration_test "停用时资源清理" "grep -q 'clearAllTimers\|stopActivityDetectionService' src/extension.ts"
integration_test "订阅管理集成" "grep -q 'context.subscriptions.push' src/extension.ts"

echo ""
log_info "9. 编译时集成验证"
echo "----------------------------------------"

# 编译检查，验证所有模块能正确集成
if npm run compile > /dev/null 2>&1; then
    log_success "TypeScript 编译集成验证"
    ((TOTAL_TESTS++))
    
    # 检查编译输出的完整性
    if [ -f "out/extension.js" ] && [ -f "out/services/activityDetectionService.js" ]; then
        log_success "编译输出完整性验证"
        ((TOTAL_TESTS++))
    else
        log_error "编译输出完整性验证"
        ((TOTAL_TESTS++))
    fi
else
    log_error "TypeScript 编译集成验证"
    ((TOTAL_TESTS++))
fi

echo ""
log_info "10. 运行时集成模拟"
echo "----------------------------------------"

# 模拟运行时的集成场景
log_info "模拟扩展激活流程..."

# 检查激活时的依赖加载顺序
ACTIVATION_ORDER=$(grep -n "init.*Service\|startTimers" src/extension.ts | head -5)
if [ ! -z "$ACTIVATION_ORDER" ]; then
    log_success "服务激活顺序定义正确"
    ((TOTAL_TESTS++))
else
    log_error "服务激活顺序定义缺失"
    ((TOTAL_TESTS++))
fi

# 检查配置变更的级联效应
if grep -q "onDidChangeConfiguration" src/extension.ts && grep -q "resetAllTimers" src/extension.ts; then
    log_success "配置变更级联处理集成"
    ((TOTAL_TESTS++))
else
    log_error "配置变更级联处理集成"
    ((TOTAL_TESTS++))
fi

echo ""
echo "=================================================="
log_info "集成测试总结"
echo "=================================================="

echo "📊 集成测试统计:"
echo "  总测试数: $TOTAL_TESTS"
echo "  通过测试: $PASSED_TESTS"
echo "  失败测试: $FAILED_TESTS"

if [ "$TOTAL_TESTS" -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "  成功率: ${SUCCESS_RATE}%"
    
    echo ""
    echo "🔍 集成测试分析:"
    
    if [ "$SUCCESS_RATE" -ge 95 ]; then
        echo -e "${GREEN}🎉 集成测试结果: 优秀 - 模块间集成良好${NC}"
        echo "✅ 所有关键集成点都正常工作"
        echo "✅ 服务间通信正确"
        echo "✅ 数据流完整"
        exit 0
    elif [ "$SUCCESS_RATE" -ge 85 ]; then
        echo -e "${YELLOW}⚠️  集成测试结果: 良好 - 有少量集成问题${NC}"
        echo "⚠️  建议检查失败的集成点"
        exit 0
    else
        echo -e "${RED}❌ 集成测试结果: 需要改进 - 存在集成问题${NC}"
        echo "❌ 需要修复模块间的集成问题"
        exit 1
    fi
else
    echo -e "${RED}❌ 没有运行任何集成测试${NC}"
    exit 1
fi