#!/bin/bash

# 项目结构验证脚本
# 使用方法: ./sh/validate-structure.sh

set -e

echo "🔍 验证 Moved Yet 项目结构..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 验证函数
validate_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $description: $dir${NC}"
        return 0
    else
        echo -e "${RED}❌ $description: $dir (缺失)${NC}"
        return 1
    fi
}

validate_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $description: $file${NC}"
        return 0
    else
        echo -e "${RED}❌ $description: $file (缺失)${NC}"
        return 1
    fi
}

validate_executable() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ] && [ -x "$file" ]; then
        echo -e "${GREEN}✅ $description: $file (可执行)${NC}"
        return 0
    elif [ -f "$file" ]; then
        echo -e "${YELLOW}⚠️  $description: $file (不可执行)${NC}"
        return 1
    else
        echo -e "${RED}❌ $description: $file (缺失)${NC}"
        return 1
    fi
}

# 开始验证
echo ""
echo "📁 验证目录结构..."

# 验证主要目录
validate_directory "docs" "文档目录"
validate_directory "sh" "脚本目录"
validate_directory "src" "源代码目录"
validate_directory "src/models" "类型定义目录"
validate_directory "src/services" "服务目录"
validate_directory "src/ui" "UI目录"
validate_directory "src/utils" "工具目录"
validate_directory "images" "图片目录"

echo ""
echo "📄 验证核心文件..."

# 验证核心文件
validate_file "package.json" "项目配置"
validate_file "README.md" "项目说明"
validate_file "LICENSE" "许可证"
validate_file "tsconfig.json" "TypeScript配置"
validate_file ".gitignore" "Git忽略规则"
validate_file ".vscodeignore" "VSIX忽略规则"
validate_file ".nvmrc" "Node版本锁定"

echo ""
echo "📚 验证文档文件..."

# 验证文档文件
validate_file "docs/CHANGELOG.md" "更新日志"
validate_file "docs/PROJECT-STRUCTURE.md" "项目结构规范"
validate_file "docs/功能指南.md" "功能指南"
validate_file "docs/开发指南.md" "开发指南"
validate_file "docs/编译指南.md" "编译指南"
validate_file "docs/每日健康报告和深色模式.md" "新功能文档"

echo ""
echo "🔧 验证脚本文件..."

# 验证脚本文件
validate_executable "sh/package-vsix.sh" "VSIX打包脚本"
validate_executable "sh/publish-openvsx.sh" "OpenVSX发布脚本"
validate_executable "sh/release-v0.0.1.sh" "版本发布脚本"
validate_executable "sh/validate-structure.sh" "结构验证脚本"

echo ""
echo "💻 验证源代码文件..."

# 验证源代码文件
validate_file "src/extension.ts" "主入口文件"
validate_file "src/models/types.ts" "类型定义"
validate_file "src/services/configService.ts" "配置服务"
validate_file "src/services/timerService.ts" "计时器服务"
validate_file "src/services/activityDetectionService.ts" "活动检测服务"
validate_file "src/services/dailyReportService.ts" "每日报告服务"
validate_file "src/ui/reminderUI.ts" "提醒界面"
validate_file "src/ui/dashboardUI.ts" "仪表盘界面"

echo ""
echo "🎯 验证命名规范..."

# 检查文档命名
echo "📋 检查文档命名规范..."
for file in docs/*.md; do
    if [[ -f "$file" ]]; then
        basename_file=$(basename "$file")
        if [[ "$basename_file" =~ ^[A-Z][A-Z0-9_-]*\.md$|^[^A-Za-z].*\.md$ ]]; then
            echo -e "${GREEN}✅ 文档命名规范: $basename_file${NC}"
        else
            echo -e "${YELLOW}⚠️  文档命名建议: $basename_file (建议使用大写字母开头或中文)${NC}"
        fi
    fi
done

# 检查脚本命名
echo "🔧 检查脚本命名规范..."
for file in sh/*.sh; do
    if [[ -f "$file" ]]; then
        basename_file=$(basename "$file")
        if [[ "$basename_file" =~ ^[a-z][a-z0-9-]*\.sh$ ]]; then
            echo -e "${GREEN}✅ 脚本命名规范: $basename_file${NC}"
        else
            echo -e "${YELLOW}⚠️  脚本命名建议: $basename_file (建议使用小写字母和连字符)${NC}"
        fi
    fi
done

echo ""
echo "📦 验证打包配置..."

# 检查 .vscodeignore
if grep -q "sh/" .vscodeignore; then
    echo -e "${GREEN}✅ .vscodeignore 正确排除 sh/ 目录${NC}"
else
    echo -e "${RED}❌ .vscodeignore 未排除 sh/ 目录${NC}"
fi

if grep -q "docs/PROJECT-STRUCTURE.md" .vscodeignore; then
    echo -e "${GREEN}✅ .vscodeignore 正确排除项目结构文档${NC}"
else
    echo -e "${YELLOW}⚠️  建议在 .vscodeignore 中排除 docs/PROJECT-STRUCTURE.md${NC}"
fi

echo ""
echo "🎉 项目结构验证完成！"

# 统计信息
echo ""
echo "📊 项目统计："
echo "  📁 目录数量: $(find . -type d -not -path './node_modules*' -not -path './.git*' -not -path './out*' -not -path './.vscode-test*' | wc -l)"
echo "  📄 文档数量: $(find docs/ -name '*.md' 2>/dev/null | wc -l)"
echo "  🔧 脚本数量: $(find sh/ -name '*.sh' 2>/dev/null | wc -l)"
echo "  💻 源码文件: $(find src/ -name '*.ts' 2>/dev/null | wc -l)"

echo ""
echo "💡 建议："
echo "  - 保持文档在 docs/ 目录下"
echo "  - 保持脚本在 sh/ 目录下"
echo "  - 确保脚本有执行权限"
echo "  - 遵循命名规范"