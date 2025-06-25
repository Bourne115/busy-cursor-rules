#!/bin/bash

# 快速发布脚本
# 用法: ./scripts/quick-release.sh [patch|minor|major]

set -e

VERSION_TYPE=${1:-patch}

echo "🚀 准备发布新版本..."

# 检查工作目录是否干净
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ 工作目录不干净，请先提交所有更改"
  exit 1
fi

# 确保在主分支
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
  echo "❌ 请在主分支上发布"
  exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin $CURRENT_BRANCH

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 当前版本: $CURRENT_VERSION"

# 计算新版本号
case $VERSION_TYPE in
  patch)
    NEW_VERSION=$(npx semver -i patch $CURRENT_VERSION)
    ;;
  minor)
    NEW_VERSION=$(npx semver -i minor $CURRENT_VERSION)
    ;;
  major)
    NEW_VERSION=$(npx semver -i major $CURRENT_VERSION)
    ;;
  *)
    echo "❌ 无效的版本类型: $VERSION_TYPE"
    echo "用法: $0 [patch|minor|major]"
    exit 1
    ;;
esac

echo "🎯 新版本: $NEW_VERSION"

# 确认发布
read -p "确认发布版本 $NEW_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 已取消发布"
  exit 1
fi

# 运行发布前检查和构建
echo "🔍 运行发布前检查..."
pnpm run type-check
pnpm run lint
pnpm run format:check

echo "📦 构建项目..."
pnpm run build

# 运行测试（如果存在）
echo "🧪 运行测试..."
if [ -d "tests" ] && [ "$(ls -A tests 2>/dev/null)" ]; then
  pnpm run test
else
  echo "⚠️  测试目录为空，跳过测试"
fi

# 更新版本号
echo "📝 更新版本号..."
npm version $NEW_VERSION --no-git-tag-version

# 生成 changelog
echo "📋 生成 changelog..."
pnpm run changelog

# 提交版本更新和 changelog
echo "💾 提交版本更新..."
git add package.json CHANGELOG.md
git commit -m "chore: release v$NEW_VERSION

- Bump version to v$NEW_VERSION
- Update CHANGELOG.md"

# 创建并推送标签
echo "🏷️  创建标签..."
git tag "v$NEW_VERSION"

echo "📤 推送到远程..."
git push origin $CURRENT_BRANCH
git push origin "v$NEW_VERSION"

echo ""
echo "✅ 发布已触发！"
echo "📊 查看发布进度: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "📦 发布后安装: npm install -g @qile-c/cursor-rules-cli"
echo "🔗 npm 地址: https://www.npmjs.com/package/@qile-c/cursor-rules-cli"
