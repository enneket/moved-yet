#!/bin/bash

# Moved Yet - 手动打包脚本
# 适用于 Node 版本 < 20 的环境

set -e

echo "🚀 开始打包 Moved Yet..."

# 1. 检查编译输出
if [ ! -d "out" ]; then
    echo "❌ 错误：out 目录不存在，请先运行 pnpm run compile"
    exit 1
fi

# 2. 清理旧的打包文件
rm -rf vsix-temp
rm -f moved-yet-*.vsix

# 3. 创建临时目录结构
echo "📁 创建打包目录..."
mkdir -p vsix-temp/extension

# 4. 复制必要文件
echo "📋 复制文件..."
cp -r out vsix-temp/extension/
cp -r images vsix-temp/extension/
cp package.json vsix-temp/extension/
cp README.md vsix-temp/extension/
cp LICENSE vsix-temp/extension/
if [ -f "CHANGELOG.md" ]; then
    cp CHANGELOG.md vsix-temp/extension/
fi
if [ -f "docs/CHANGELOG.md" ]; then
    cp docs/CHANGELOG.md vsix-temp/extension/
fi

# 5. 创建 [Content_Types].xml
echo "📝 创建 Content_Types.xml..."
cat > vsix-temp/'[Content_Types].xml' << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".vsixmanifest" ContentType="text/xml"/>
  <Default Extension=".js" ContentType="application/javascript"/>
  <Default Extension=".png" ContentType="image/png"/>
  <Default Extension=".md" ContentType="text/markdown"/>
</Types>
EOF

# 6. 创建 extension.vsixmanifest
echo "📝 创建 extension.vsixmanifest..."
cat > vsix-temp/extension.vsixmanifest << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="moved-yet" Version="0.0.1" Publisher="enneket"/>
    <DisplayName>Moved Yet</DisplayName>
    <Description xml:space="preserve">动了么？—久坐和喝水强制提醒插件</Description>
    <Tags>health,reminder,break,water,productivity,movement</Tags>
    <Categories>Other</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <License>extension/LICENSE</License>
    <Icon>extension/images/logo.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true"/>
  </Assets>
</PackageManifest>
EOF

# 7. 打包成 zip（.vsix 本质上是 zip 文件）
echo "📦 打包中..."
cd vsix-temp
zip -r ../moved-yet-0.0.1.vsix * -q
cd ..

# 8. 清理临时文件
echo "🧹 清理临时文件..."
rm -rf vsix-temp

# 9. 验证打包结果
if [ -f "moved-yet-0.0.1.vsix" ]; then
    FILE_SIZE=$(ls -lh moved-yet-0.0.1.vsix | awk '{print $5}')
    echo ""
    echo "✅ 打包成功！"
    echo "📦 文件：moved-yet-0.0.1.vsix"
    echo "📏 大小：$FILE_SIZE"
    echo ""
    echo "🎯 下一步："
    echo "   1. 测试安装：code --install-extension moved-yet-0.0.1.vsix"
    echo "   2. 或在 VS Code 中：扩展面板 → ... → 从 VSIX 安装"
    echo ""
else
    echo "❌ 打包失败！"
    exit 1
fi
