# Cursor Rules CLI

> Cursor Rules 智能管理工具 - 一键生成、管理和优化 Cursor IDE AI 协作规范

[![npm version](https://img.shields.io/npm/v/cursor-rules-cli.svg)](https://www.npmjs.com/package/cursor-rules-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/cursor-rules-cli.svg)](https://nodejs.org/)

## ✨ 特性

- 🚀 **一键初始化** - 自动检测项目类型，生成最适合的规则配置
- 🎯 **智能推荐** - 基于项目依赖和技术栈推荐最佳实践规则
- 📦 **模板丰富** - 内置 React、Vue、TypeScript、Node.js 等主流技术栈模板
- 🔧 **高度可配置** - 支持自定义模板和全局配置
- 🌍 **多语言支持** - 支持中文和英文界面
- 📋 **标准化** - 遵循最新的 Cursor Rules 规范和最佳实践

## 🚀 快速开始

### 安装

```bash
# 使用 npm
npm install -g cursor-rules-cli

# 使用 yarn
yarn global add cursor-rules-cli

# 使用 pnpm
pnpm add -g cursor-rules-cli
```

### 初始化项目规则

```bash
# 在项目根目录运行
cursor-rules init
```

CLI 会自动：
1. 检测你的项目类型（React、Vue、Node.js 等）
2. 推荐合适的规则模板
3. 交互式选择需要的规则
4. 生成标准化的 `.cursor/rules` 目录结构

## 📖 使用指南

### 基础命令

```bash
# 初始化项目规则
cursor-rules init

# 使用指定模板初始化
cursor-rules init --template=react

# 非交互模式（使用推荐模板）
cursor-rules init --no-interactive

# 强制覆盖已存在的规则
cursor-rules init --force
```

### 管理规则

```bash
# 查看所有可用规则
cursor-rules list

# 添加特定规则
cursor-rules add typescript
cursor-rules add react

# 强制覆盖已存在的规则
cursor-rules add typescript --force
```

### 配置管理

```bash
# 查看当前配置
cursor-rules config

# 设置配置项
cursor-rules config --set language=zh
cursor-rules config --set autoUpdate=false

# 获取配置项
cursor-rules config --get language

# 重置为默认配置
cursor-rules config --reset
```

## 📁 生成的文件结构

```
.cursor/
└── rules/
    ├── basic/              # 基础规则（必须调用）
    │   ├── general.mdc     # 通用编程规范
    │   └── typescript.mdc  # TypeScript 规范
    ├── modules/            # 模块规则（按需调用）
    │   ├── react.mdc       # React 开发规范
    │   └── testing.mdc     # 测试规范
    ├── workflow/           # 流程规则（按需调用）
    │   └── crud.mdc        # CRUD 操作规范
    └── ai.mdc             # AI 协作执行规则
```

## 🎯 支持的模板

### 基础模板
- **basic** - 通用编程基础规范
- **typescript** - TypeScript 开发规范

### 前端框架
- **react** - React 开发最佳实践
- **vue** - Vue.js 开发规范
- **angular** - Angular 开发指南
- **next** - Next.js 项目规范
- **nuxt** - Nuxt.js 项目规范

### 后端框架
- **node** - Node.js 开发规范
- **express** - Express.js 最佳实践

### 工具和测试
- **testing** - 测试框架规范
- **eslint** - ESLint 配置规范
- **prettier** - 代码格式化规范

## ⚙️ 配置选项

### 全局配置

```json
{
  "preferredTemplates": ["basic", "typescript"],
  "autoUpdate": true,
  "language": "zh",
  "registryUrl": "https://api.cursor-rules.com",
  "customTemplatePath": "/path/to/custom/templates"
}
```

### 项目配置

在项目根目录创建 `.cursor-rules.json`:

```json
{
  "templates": ["basic", "react", "typescript"],
  "customRules": {
    "react": {
      "strictMode": true,
      "hooksLinting": true
    }
  }
}
```

## 🛠️ 开发

### 本地开发

```bash
# 克隆项目
git clone https://github.com/cursor-rules/cursor-rules-cli.git
cd cursor-rules-cli

# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test
```

### 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解更多信息。

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新记录。

## 🤝 社区

- [GitHub Discussions](https://github.com/cursor-rules/cursor-rules-cli/discussions) - 讨论和问答
- [Issues](https://github.com/cursor-rules/cursor-rules-cli/issues) - 报告 Bug 和功能请求
- [Wiki](https://github.com/cursor-rules/cursor-rules-cli/wiki) - 详细文档和教程

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 [Cursor](https://cursor.sh/) 团队提供优秀的 AI 编程工具
- 感谢社区贡献者提供的规则模板和反馈
- 参考了 [awesome-cursor-rules](https://github.com/PatrickJS/awesome-cursorrules) 项目

## 🔗 相关链接

- [Cursor 官网](https://cursor.sh/)
- [Cursor Rules 文档](https://docs.cursor.sh/rules)
- [最佳实践指南](https://github.com/cursor-rules/cursor-rules-cli/wiki/Best-Practices)

---

<div align="center">
Made with ❤️ by the Cursor Rules CLI Team
</div> 