#!/bin/bash

# 发版脚本 - 自动化版本管理和发布流程
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在主分支
check_main_branch() {
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        print_error "请在主分支(main/master)上执行发版操作，当前分支: $current_branch"
        exit 1
    fi
}

# 检查工作区是否干净
check_clean_workspace() {
    if [ -n "$(git status --porcelain)" ]; then
        print_error "工作区不干净，请先提交或储藏所有更改"
        exit 1
    fi
}

# 更新到最新代码
pull_latest() {
    print_info "拉取最新代码..."
    git pull origin $(git branch --show-current)
}

# 运行测试和检查
run_checks() {
    print_info "运行代码检查..."
    
    print_info "类型检查..."
    pnpm run type-check
    
    print_info "代码格式检查..."
    pnpm run format:check
    
    print_info "代码质量检查..."
    pnpm run lint
    
    print_info "运行测试..."
    pnpm run test
    
    print_success "所有检查通过"
}

# 构建项目
build_project() {
    print_info "构建项目..."
    pnpm run build
    print_success "构建完成"
}

# 版本升级
bump_version() {
    local version_type=$1
    
    if [ -z "$version_type" ]; then
        echo "请选择版本类型:"
        echo "1) patch (1.0.0 -> 1.0.1) - 修复bug"
        echo "2) minor (1.0.0 -> 1.1.0) - 新功能"
        echo "3) major (1.0.0 -> 2.0.0) - 破坏性更改"
        read -p "请输入选择 (1-3): " choice
        
        case $choice in
            1) version_type="patch" ;;
            2) version_type="minor" ;;
            3) version_type="major" ;;
            *) print_error "无效选择"; exit 1 ;;
        esac
    fi
    
    print_info "升级版本类型: $version_type"
    
    # 使用npm version升级版本（即使用pnpm也兼容）
    new_version=$(npm version $version_type --no-git-tag-version)
    print_success "版本已升级到: $new_version"
    
    echo $new_version
}

# 生成changelog
generate_changelog() {
    print_info "生成更新日志..."
    pnpm run changelog
    print_success "更新日志已生成"
}

# 提交更改
commit_changes() {
    local version=$1
    print_info "提交版本更改..."
    
    git add package.json CHANGELOG.md
    git commit -m "chore: release $version"
    
    print_success "版本更改已提交"
}

# 创建标签
create_tag() {
    local version=$1
    print_info "创建Git标签: $version"
    
    git tag -a "$version" -m "Release $version"
    print_success "标签 $version 已创建"
}

# 推送到远程
push_to_remote() {
    local version=$1
    print_info "推送到远程仓库..."
    
    git push origin $(git branch --show-current)
    git push origin "$version"
    
    print_success "已推送到远程仓库"
}

# 发布到npm
publish_to_npm() {
    print_warning "准备发布到npm..."
    read -p "确认发布到npm? (y/N): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        print_info "发布到npm..."
        pnpm publish --access public
        print_success "已成功发布到npm"
    else
        print_info "跳过npm发布"
    fi
}

# 主函数
main() {
    print_info "开始发版流程..."
    
    # 检查环境
    check_main_branch
    check_clean_workspace
    
    # 更新代码
    pull_latest
    
    # 运行检查
    run_checks
    
    # 构建项目
    build_project
    
    # 版本升级
    new_version=$(bump_version $1)
    
    # 生成changelog
    generate_changelog
    
    # 提交更改
    commit_changes $new_version
    
    # 创建标签
    create_tag $new_version
    
    # 推送到远程
    push_to_remote $new_version
    
    # 发布到npm
    publish_to_npm
    
    print_success "发版完成! 版本: $new_version"
}

# 脚本入口
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "使用方法: $0 [version_type]"
    echo ""
    echo "version_type:"
    echo "  patch  - 修复bug (1.0.0 -> 1.0.1)"
    echo "  minor  - 新功能 (1.0.0 -> 1.1.0)"
    echo "  major  - 破坏性更改 (1.0.0 -> 2.0.0)"
    echo ""
    echo "如果不指定version_type，脚本会提示选择"
    exit 0
fi

main $1 