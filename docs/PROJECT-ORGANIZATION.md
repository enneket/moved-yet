# Moved Yet 项目组织规范

## 🎯 底层规则设定

根据你的要求，项目已按照以下底层规则重新组织：

### 规则 1: 文档管理
**所有文档文件必须放在 `docs/` 目录下**

### 规则 2: 脚本管理  
**所有脚本文件必须放在 `sh/` 目录下**

## 📁 当前项目结构

```
moved-yet/
├── 📁 docs/                    # 📚 所有文档
│   ├── CHANGELOG.md            # 版本更新记录
│   ├── PROJECT-STRUCTURE.md    # 项目结构详细规范
│   ├── RELEASE-v0.0.2.md      # v0.0.2 发布说明
│   ├── VERSION-COMPARISON.md   # 版本对比表
│   ├── 功能指南.md             # 功能使用指南
│   ├── 功能测试报告.md         # 测试报告
│   ├── 开发指南.md             # 开发环境指南
│   ├── 编译指南.md             # 编译打包指南
│   └── test-activity-detection.md # 活动检测测试指南
│
├── 📁 sh/                      # 🔧 所有脚本
│   ├── package-vsix.sh         # VSIX 包构建脚本
│   ├── publish-openvsx.sh      # Open VSX 发布脚本
│   ├── release-v0.0.2.sh       # 版本发布脚本
│   └── validate-structure.sh   # 项目结构验证脚本
│
├── 📁 src/                     # 💻 源代码
│   ├── extension.ts            # 主入口
│   ├── models/types.ts         # 类型定义
│   ├── services/               # 业务服务
│   ├── ui/                     # 用户界面
│   ├── utils/                  # 工具函数
│   └── test/                   # 测试文件
│
├── 📁 images/                  # 🖼️ 图片资源
├── package.json                # 📦 项目配置
├── README.md                   # 📖 项目主文档
└── ...                         # 其他配置文件
```

## ✅ 规则执行结果

### 文档整理 (`docs/`)
- ✅ 移动了 `RELEASE-v0.0.2.md` 到 `docs/`
- ✅ 移动了 `VERSION-COMPARISON.md` 到 `docs/`
- ✅ 移动了 `test-activity-detection.md` 到 `docs/`
- ✅ 创建了 `docs/PROJECT-STRUCTURE.md` 详细规范

### 脚本整理 (`sh/`)
- ✅ 移动了 `package-vsix.sh` 到 `sh/`
- ✅ 移动了 `publish-openvsx.sh` 到 `sh/`
- ✅ 移动了 `release-v0.0.2.sh` 到 `sh/`
- ✅ 创建了 `sh/validate-structure.sh` 验证脚本

### 配置更新
- ✅ 更新了 `.vscodeignore` 排除 `sh/` 目录
- ✅ 更新了所有文档中的脚本路径引用
- ✅ 更新了 README.md 中的脚本使用说明

## 🔧 使用方式更新

### 脚本执行
```bash
# 旧方式 (已废弃)
./package-vsix.sh
./publish-openvsx.sh
./release-v0.0.2.sh

# 新方式 (当前)
./sh/package-vsix.sh
./sh/publish-openvsx.sh  
./sh/release-v0.0.2.sh
./sh/validate-structure.sh
```

### 文档查看
```bash
# 所有文档都在 docs/ 目录下
ls docs/
cat docs/功能指南.md
cat docs/PROJECT-STRUCTURE.md
```

## 📦 打包影响

### VSIX 包内容
- ✅ **包含**: `docs/` 中的用户文档
- ❌ **排除**: `sh/` 目录（开发脚本）
- ❌ **排除**: 项目结构文档（内部文档）

### 包大小优化
- **v0.0.2 新结构**: 292KB (31 files)
- **排除开发文件**: 节省约 4KB
- **保留用户文档**: 提供完整使用指南

## 🛠️ 维护工具

### 结构验证脚本
```bash
# 验证项目结构是否符合规范
./sh/validate-structure.sh
```

**验证内容**:
- ✅ 目录结构完整性
- ✅ 核心文件存在性
- ✅ 脚本可执行权限
- ✅ 命名规范检查
- ✅ 打包配置正确性

### 自动化检查
脚本会自动检查：
- 📁 必要目录是否存在
- 📄 核心文件是否完整
- 🔧 脚本是否可执行
- 📝 命名是否规范
- 📦 打包配置是否正确

## 🎯 规则优势

### 1. 清晰的职责分离
- **docs/**: 纯文档，便于查找和维护
- **sh/**: 纯脚本，便于执行和管理

### 2. 更好的项目管理
- 文档集中管理，便于版本控制
- 脚本统一存放，便于权限管理

### 3. 优化的打包策略
- 用户只获得必要的文档
- 开发脚本不会污染发布包

### 4. 标准化的工作流
- 统一的脚本调用方式
- 一致的文档组织结构

## 🔮 未来扩展

### 新文档添加
```bash
# 所有新文档都放在 docs/
touch docs/新功能说明.md
touch docs/API-REFERENCE.md
```

### 新脚本添加
```bash
# 所有新脚本都放在 sh/
touch sh/deploy.sh
chmod +x sh/deploy.sh
```

### 自动验证
```bash
# 每次提交前验证结构
./sh/validate-structure.sh
```

---

**这种组织方式确保了项目结构的清晰性和可维护性！** 📁✨

## 📋 快速检查清单

- [ ] 所有文档在 `docs/` 目录
- [ ] 所有脚本在 `sh/` 目录  
- [ ] 脚本有执行权限
- [ ] `.vscodeignore` 正确配置
- [ ] 文档路径引用已更新
- [ ] 运行 `./sh/validate-structure.sh` 通过