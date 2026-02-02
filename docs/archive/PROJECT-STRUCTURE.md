# Moved Yet 项目结构规范

## 📁 目录组织规则

### 1. 文档管理 (`docs/`)
**规则**: 所有文档文件必须放在 `docs/` 目录下

```
docs/
├── CHANGELOG.md              # 版本更新记录
├── PROJECT-STRUCTURE.md      # 项目结构规范（本文档）
├── RELEASE-v0.0.2.md        # 版本发布说明
├── VERSION-COMPARISON.md     # 版本对比
├── 功能指南.md               # 功能使用指南
├── 功能测试报告.md           # 测试报告
├── 开发指南.md               # 开发环境指南
└── 编译指南.md               # 编译打包指南
```

**文档类型**:
- 📋 **规范文档**: 项目结构、编码规范
- 📖 **用户文档**: 功能指南、使用说明
- 🛠️ **开发文档**: 开发指南、API 文档
- 📝 **版本文档**: 更新日志、发布说明
- 🧪 **测试文档**: 测试报告、测试指南

### 2. 脚本管理 (`sh/`)
**规则**: 所有 shell 脚本必须放在 `sh/` 目录下

```
sh/
├── package-vsix.sh           # VSIX 包构建脚本
├── publish-openvsx.sh        # Open VSX 发布脚本
└── release-v0.0.2.sh        # 版本发布脚本
```

**脚本类型**:
- 🏗️ **构建脚本**: 编译、打包相关
- 🚀 **发布脚本**: 版本发布、市场上传
- 🧪 **测试脚本**: 自动化测试、验证
- 🔧 **工具脚本**: 开发辅助工具

### 3. 源代码 (`src/`)
**规则**: 所有 TypeScript 源代码放在 `src/` 目录下

```
src/
├── extension.ts              # 主入口文件
├── models/                   # 类型定义
│   └── types.ts
├── services/                 # 业务服务
│   ├── activityDetectionService.ts
│   ├── configService.ts
│   ├── historyService.ts
│   ├── progressiveReminderService.ts
│   ├── statusService.ts
│   └── timerService.ts
├── test/                     # 测试文件
│   ├── extension.test.ts
│   ├── runTest.ts
│   └── suite/
├── ui/                       # 用户界面
│   ├── dashboardUI.ts
│   └── reminderUI.ts
└── utils/                    # 工具函数
    └── languages.ts
```

### 4. 配置文件 (根目录)
**规则**: 项目配置文件放在根目录

```
./
├── package.json              # 项目配置
├── tsconfig.json            # TypeScript 配置
├── eslint.config.mjs        # ESLint 配置
├── .gitignore               # Git 忽略规则
├── .vscodeignore           # VSIX 打包忽略规则
├── .nvmrc                  # Node.js 版本锁定
└── README.md               # 项目主文档
```

## 🔧 文件命名规范

### 文档命名
- **中文文档**: 使用中文名称，如 `功能指南.md`
- **英文文档**: 使用大写字母和连字符，如 `PROJECT-STRUCTURE.md`
- **版本文档**: 包含版本号，如 `RELEASE-v0.0.2.md`

### 脚本命名
- **功能描述**: 使用连字符分隔，如 `package-vsix.sh`
- **版本脚本**: 包含版本号，如 `release-v0.0.2.sh`
- **可执行权限**: 所有脚本必须有执行权限

### 代码命名
- **服务文件**: 以 `Service.ts` 结尾
- **UI 文件**: 以 `UI.ts` 结尾
- **测试文件**: 以 `.test.ts` 结尾
- **类型文件**: 使用 `types.ts`

## 📦 打包规则

### 包含文件
```
moved-yet-x.x.x.vsix
├── README.md                 # 项目主文档
├── LICENSE                   # 许可证
├── package.json             # 项目配置
├── docs/                    # 用户文档（部分）
│   ├── CHANGELOG.md
│   ├── 功能指南.md
│   ├── 功能测试报告.md
│   ├── 开发指南.md
│   └── 编译指南.md
├── images/                  # 图片资源
└── out/                     # 编译输出
```

### 排除文件
```
# 开发文件
src/                         # 源代码
sh/                          # 脚本文件
docs/PROJECT-STRUCTURE.md   # 项目结构文档
docs/RELEASE-*.md           # 发布说明
docs/VERSION-COMPARISON.md  # 版本对比

# 配置文件
tsconfig.json
eslint.config.mjs
.nvmrc
```

## 🚀 工作流程

### 1. 开发阶段
```bash
# 编辑源代码
vim src/services/newService.ts

# 编译测试
npm run compile
npm run lint
```

### 2. 文档更新
```bash
# 更新功能文档
vim docs/功能指南.md

# 更新版本记录
vim docs/CHANGELOG.md
```

### 3. 脚本执行
```bash
# 构建包
./sh/package-vsix.sh

# 发布版本
./sh/release-v0.0.2.sh
```

### 4. 版本发布
```bash
# 发布到市场
./sh/publish-openvsx.sh <TOKEN>

# 创建 Git 标签
git tag v0.0.2
git push origin v0.0.2
```

## 📋 检查清单

### 新功能开发
- [ ] 源代码放在 `src/` 对应子目录
- [ ] 更新 `docs/功能指南.md`
- [ ] 更新 `docs/CHANGELOG.md`
- [ ] 创建或更新测试文件

### 脚本添加
- [ ] 脚本放在 `sh/` 目录
- [ ] 添加执行权限 `chmod +x`
- [ ] 更新 `.vscodeignore` 排除规则
- [ ] 在文档中说明用法

### 版本发布
- [ ] 更新版本号
- [ ] 创建发布说明文档
- [ ] 运行发布脚本
- [ ] 验证包内容

## 🔄 维护规则

### 定期清理
- 移除过时的文档
- 清理无用的脚本
- 更新依赖版本

### 结构检查
- 确保文件在正确目录
- 验证命名规范
- 检查打包规则

---

**遵循这些规则，保持项目结构清晰有序！** 📁✨