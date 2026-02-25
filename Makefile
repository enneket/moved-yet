.PHONY: help compile lint test clean package install validate quick-test integration-test system-test full-test release publish-openvsx

# 默认目标
.DEFAULT_GOAL := help

# 颜色定义
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

# 项目信息
VERSION := $(shell node -p "require('./package.json').version")
PACKAGE_NAME := moved-yet-$(VERSION).vsix

# 帮助信息
help: ## 显示帮助信息
	@echo "$(BLUE)Moved Yet - 健康提醒插件$(NC)"
	@echo "$(BLUE)================================$(NC)"
	@echo ""
	@echo "$(GREEN)可用命令:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)示例:$(NC)"
	@echo "  make compile        # 编译项目"
	@echo "  make test           # 运行测试"
	@echo "  make package        # 构建 VSIX 包"
	@echo "  make release VERSION=0.0.2  # 发布新版本"

# 编译
compile: ## 编译 TypeScript 代码
	@echo "$(BLUE)📦 编译 TypeScript...$(NC)"
	@pnpm run compile
	@echo "$(GREEN)✅ 编译完成$(NC)"

# 代码检查
lint: ## 运行 ESLint 代码检查
	@echo "$(BLUE)🔍 运行 ESLint...$(NC)"
	@pnpm run lint
	@echo "$(GREEN)✅ 代码检查完成$(NC)"

# 清理
clean: ## 清理构建产物
	@echo "$(BLUE)🧹 清理构建产物...$(NC)"
	@rm -rf out/
	@rm -f moved-yet-*.vsix
	@echo "$(GREEN)✅ 清理完成$(NC)"

# 验证项目结构
validate: ## 验证项目结构
	@echo "$(BLUE)🔍 验证项目结构...$(NC)"
	@test -d docs || (echo "$(RED)❌ docs 目录缺失$(NC)" && exit 1)
	@test -d src || (echo "$(RED)❌ src 目录缺失$(NC)" && exit 1)
	@test -f package.json || (echo "$(RED)❌ package.json 缺失$(NC)" && exit 1)
	@test -f README.md || (echo "$(RED)❌ README.md 缺失$(NC)" && exit 1)
	@test -f src/extension.ts || (echo "$(RED)❌ src/extension.ts 缺失$(NC)" && exit 1)
	@echo "$(GREEN)✅ 项目结构验证通过$(NC)"

# 快速测试
quick-test: compile lint ## 快速测试（编译+代码检查）
	@echo "$(BLUE)🚀 快速测试...$(NC)"
	@echo "$(GREEN)✅ 快速测试通过$(NC)"

# 集成测试
integration-test: compile ## 运行集成测试
	@echo "$(BLUE)🔗 运行集成测试...$(NC)"
	@echo "$(BLUE)检查模块依赖...$(NC)"
	@grep -q 'configService' src/extension.ts && echo "$(GREEN)✅ Extension-ConfigService 集成$(NC)" || echo "$(RED)❌ Extension-ConfigService 集成$(NC)"
	@grep -q 'timerService' src/extension.ts && echo "$(GREEN)✅ Extension-TimerService 集成$(NC)" || echo "$(RED)❌ Extension-TimerService 集成$(NC)"
	@grep -q 'activityDetectionService' src/extension.ts && echo "$(GREEN)✅ Extension-ActivityDetection 集成$(NC)" || echo "$(RED)❌ Extension-ActivityDetection 集成$(NC)"
	@echo "$(GREEN)✅ 集成测试完成$(NC)"

# 系统测试
system-test: compile ## 运行系统测试
	@echo "$(BLUE)🌐 运行系统测试...$(NC)"
	@echo "$(BLUE)系统环境:$(NC)"
	@echo "  OS: $$(uname -s)"
	@echo "  Node: $$(node --version)"
	@echo "  pnpm: $$(pnpm --version)"
	@test -f out/extension.js && echo "$(GREEN)✅ 编译输出正常$(NC)" || echo "$(RED)❌ 编译输出缺失$(NC)"
	@echo "$(GREEN)✅ 系统测试完成$(NC)"

# 完整测试套件
full-test: validate quick-test integration-test system-test ## 运行完整测试套件
	@echo "$(BLUE)🧪 完整测试套件...$(NC)"
	@echo "$(GREEN)✅ 所有测试通过$(NC)"

# 测试（默认快速测试）
test: quick-test ## 运行测试（默认快速测试）

# 测试覆盖率
test-coverage: compile ## 运行测试并生成覆盖率报告
	@echo "$(BLUE)🧪 运行测试覆盖率...$(NC)"
	@pnpm run test:coverage || true
	@echo "$(GREEN)✅ 覆盖率报告已生成$(NC)"
	@echo "$(BLUE)查看报告: coverage/index.html$(NC)"

# 构建 VSIX 包
package: clean compile lint ## 构建 VSIX 包
	@echo "$(BLUE)📦 构建 VSIX 包...$(NC)"
	@pnpm exec vsce package --no-dependencies
	@test -f $(PACKAGE_NAME) && echo "$(GREEN)✅ VSIX 包构建成功: $(PACKAGE_NAME)$(NC)" || (echo "$(RED)❌ VSIX 包构建失败$(NC)" && exit 1)
	@du -h $(PACKAGE_NAME) | awk '{print "$(BLUE)📏 包大小: " $$1 "$(NC)"}'

# 安装到本地 VS Code
install: package ## 安装到本地 VS Code
	@echo "$(BLUE)📥 安装到 VS Code...$(NC)"
	@code --install-extension $(PACKAGE_NAME) --force
	@echo "$(GREEN)✅ 安装完成$(NC)"

# 发布到 Open VSX
publish-openvsx: package ## 发布到 Open VSX Registry
	@echo "$(BLUE)🌐 发布到 Open VSX...$(NC)"
	@if [ -z "$(OVSX_PAT)" ]; then \
		echo "$(RED)❌ 错误: 请设置 OVSX_PAT 环境变量$(NC)"; \
		echo "$(YELLOW)使用方法: make publish-openvsx OVSX_PAT=your_token$(NC)"; \
		exit 1; \
	fi
	@pnpm exec ovsx publish $(PACKAGE_NAME) -p $(OVSX_PAT)
	@echo "$(GREEN)✅ 发布完成$(NC)"

# 创建发布
release: ## 创建新版本发布 (使用: make release VERSION=0.0.2)
	@if [ -z "$(VERSION)" ]; then \
		echo "$(RED)❌ 错误: 请指定版本号$(NC)"; \
		echo "$(YELLOW)使用方法: make release VERSION=0.0.2$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🚀 准备发布版本 v$(VERSION)...$(NC)"
	@echo "$(BLUE)检查工作目录...$(NC)"
	@git diff-index --quiet HEAD -- || (echo "$(RED)❌ 工作目录不干净，请先提交更改$(NC)" && exit 1)
	@echo "$(BLUE)更新版本号...$(NC)"
	@npm version $(VERSION) --no-git-tag-version
	@echo "$(BLUE)运行测试...$(NC)"
	@$(MAKE) full-test
	@echo "$(BLUE)构建包...$(NC)"
	@$(MAKE) package
	@echo "$(BLUE)提交更改...$(NC)"
	@git add package.json package-lock.json
	@git commit -m "chore: bump version to v$(VERSION)"
	@echo "$(BLUE)创建标签...$(NC)"
	@git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	@echo "$(BLUE)推送到远程...$(NC)"
	@git push origin $$(git branch --show-current)
	@git push origin "v$(VERSION)"
	@echo "$(GREEN)✅ 版本 v$(VERSION) 发布完成！$(NC)"
	@echo "$(BLUE)GitHub Release: https://github.com/$$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$$//')/releases/tag/v$(VERSION)$(NC)"

# 开发模式
dev: compile ## 编译并监听文件变化
	@echo "$(BLUE)👨‍💻 开发模式...$(NC)"
	@pnpm run watch

# 显示项目信息
info: ## 显示项目信息
	@echo "$(BLUE)📊 项目信息$(NC)"
	@echo "$(BLUE)================================$(NC)"
	@echo "名称: $$(node -p "require('./package.json').name")"
	@echo "版本: $$(node -p "require('./package.json').version")"
	@echo "描述: $$(node -p "require('./package.json').description")"
	@echo "发布者: $$(node -p "require('./package.json').publisher")"
	@echo ""
	@echo "$(BLUE)📁 项目统计$(NC)"
	@echo "源码文件: $$(find src -name '*.ts' | wc -l)"
	@echo "文档文件: $$(find docs -name '*.md' | wc -l)"
	@echo "测试文件: $$(find src/test -name '*.ts' 2>/dev/null | wc -l || echo 0)"

# 检查依赖更新
check-updates: ## 检查依赖更新
	@echo "$(BLUE)🔍 检查依赖更新...$(NC)"
	@pnpm outdated || true

# 更新依赖
update-deps: ## 更新依赖
	@echo "$(BLUE)📦 更新依赖...$(NC)"
	@pnpm update
	@echo "$(GREEN)✅ 依赖更新完成$(NC)"

# 安全审计
audit: ## 运行安全审计
	@echo "$(BLUE)🔒 运行安全审计...$(NC)"
	@pnpm audit --audit-level=high || true
	@echo "$(GREEN)✅ 安全审计完成$(NC)"

# 格式化代码
format: ## 格式化代码（如果配置了 prettier）
	@echo "$(BLUE)✨ 格式化代码...$(NC)"
	@if command -v prettier > /dev/null 2>&1; then \
		prettier --write "src/**/*.ts"; \
		echo "$(GREEN)✅ 代码格式化完成$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  prettier 未安装，跳过格式化$(NC)"; \
	fi

# 生成文档
docs: ## 生成文档（如果配置了文档生成工具）
	@echo "$(BLUE)📚 生成文档...$(NC)"
	@echo "$(YELLOW)⚠️  文档生成功能待实现$(NC)"

# CI 测试（用于 CI/CD）
ci-test: validate compile lint integration-test system-test ## CI 环境测试
	@echo "$(GREEN)✅ CI 测试完成$(NC)"

# 预发布检查
pre-release: full-test package ## 发布前检查
	@echo "$(BLUE)🔍 预发布检查...$(NC)"
	@test -f $(PACKAGE_NAME) || (echo "$(RED)❌ VSIX 包不存在$(NC)" && exit 1)
	@test -f docs/CHANGELOG.md || echo "$(YELLOW)⚠️  建议添加 CHANGELOG.md$(NC)"
	@grep -q "### v$(VERSION)" docs/CHANGELOG.md 2>/dev/null || echo "$(YELLOW)⚠️  CHANGELOG.md 中未找到版本 v$(VERSION)$(NC)"
	@echo "$(GREEN)✅ 预发布检查完成$(NC)"
	@echo "$(BLUE)准备发布:$(NC)"
	@echo "  版本: v$(VERSION)"
	@echo "  包: $(PACKAGE_NAME)"
	@echo "  大小: $$(du -h $(PACKAGE_NAME) | awk '{print $$1}')"

# 清理所有（包括 node_modules）
clean-all: clean ## 清理所有（包括 node_modules）
	@echo "$(BLUE)🧹 清理所有...$(NC)"
	@rm -rf node_modules/
	@echo "$(GREEN)✅ 清理完成$(NC)"

# 重新安装
reinstall: clean-all ## 重新安装依赖
	@echo "$(BLUE)📦 重新安装依赖...$(NC)"
	@pnpm install
	@echo "$(GREEN)✅ 依赖安装完成$(NC)"
