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

## 📁 项目结构

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
git clone https://github.com/Bourne115/busy-cursor-rules.git
cd cursor-rules-cli

# 安装依赖
pnpm install

# 设置Git钩子
pnpm run prepare

# 开发模式运行
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test
```

### 工程化功能

本项目配备了完整的工程化工具链：

#### 代码规范

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查
- **simple-git-hooks** - Git钩子管理
- **lint-staged** - 提交前检查

```bash
# 代码格式化
pnpm run format

# 代码质量检查
pnpm run lint

# 修复可修复的问题
pnpm run lint:fix

# 类型检查
pnpm run type-check
```

#### Git提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 使用交互式提交工具
pnpm run commit

# 手动提交示例
git commit -m "feat: add new template support"
git commit -m "fix: resolve config parsing issue"
git commit -m "docs: update installation guide"
```

#### 自动化发版

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
pnpm run release:patch

# 小版本 (1.0.0 -> 1.1.0)
pnpm run release:minor

# 大版本 (1.0.0 -> 2.0.0)
pnpm run release:major
```

#### CI/CD流程

- **持续集成** - 自动运行测试、代码检查、构建验证
- **持续部署** - 自动发布到npm、创建GitHub Release
- **多版本测试** - 支持Node.js 16.x、18.x、20.x
- **安全审计** - 依赖包安全检查

详细的工程化指南请查看 [工程化指南](docs/engineering.md)。

### 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解更多信息。

#### 贡献流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 遵循代码规范和提交规范
4. 提交更改 (`pnpm run commit` 或手动规范提交)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 打开 Pull Request

#### 开发规范

- 提交前会自动运行代码检查和格式化
- 所有新功能需要包含测试
- 提交信息必须遵循Conventional Commits规范
- Pull Request会自动触发CI检查

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新记录。

## 🤝 社区

- [GitHub Discussions](https://github.com/Bourne115/busy-cursor-rules/discussions) - 讨论和问答
- [Issues](https://github.com/Bourne115/busy-cursor-rules/issues) - 报告 Bug 和功能请求
- [Wiki](https://github.com/Bourne115/busy-cursor-rules/wiki) - 详细文档和教程

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 [Cursor](https://cursor.sh/) 团队提供优秀的 AI 编程工具
- 感谢社区贡献者提供的规则模板和反馈
- 参考了 [awesome-cursor-rules](https://github.com/PatrickJS/awesome-cursorrules) 项目

## 🔗 相关链接

- [Cursor 官网](https://cursor.sh/)
- [Cursor Rules 文档](https://docs.cursor.sh/rules)
- [最佳实践指南](https://github.com/Bourne115/busy-cursor-rules/wiki/Best-Practices)

---

<div align="center">
Made with ❤️ by the Cursor Rules CLI Team
</div>

## 🗂️ 核心模块说明

### CLI 命令层

- **cli.ts** - 主入口，定义所有可用命令
- **commands/** - 各个命令的具体实现逻辑

### 核心业务层

- **detector/** - 智能检测项目类型、框架、依赖
- **generator/** - 根据模板和配置生成规则文件
- **validator/** - 验证生成的规则文件格式和完整性
- **updater/** - 管理规则版本更新和同步

### 模板系统

- **templates/** - 内置的各种技术栈规则模板
- 支持动态加载和自定义模板扩展

### 工具层

- **utils/** - 配置管理、文件操作等通用工具
- **types/** - 完整的 TypeScript 类型定义

## 🚀 下一步开发规划

### 🎯 Phase 1: 核心功能完善 (当前版本 1.0.0)

#### ✅ 已完成

- [x] 基础 CLI 框架搭建
- [x] 项目初始化命令 (`init`)
- [x] 基础模板系统
- [x] 配置管理功能
- [x] 完整的工程化工具链

#### 🔄 进行中

- [ ] **项目检测器优化** - 提升技术栈识别准确性
- [ ] **模板内容完善** - 补充各框架的最佳实践规则
- [ ] **单元测试覆盖** - 确保代码质量和稳定性

#### 📋 待完成

- [ ] **规则验证器** - 验证生成规则的正确性
- [ ] **错误处理优化** - 提供更友好的错误提示
- [ ] **文档完善** - API文档和使用示例

### 🎯 Phase 2: 用户体验优化 (v1.1.0)

#### 🎨 交互体验

- [ ] **进度指示器** - 显示操作进度和状态
- [ ] **彩色输出** - 更直观的命令行界面
- [ ] **智能提示** - 上下文相关的帮助信息
- [ ] **操作确认** - 重要操作的二次确认机制

#### 🔍 智能推荐

- [ ] **依赖分析** - 基于 package.json 智能推荐规则
- [ ] **代码扫描** - 分析现有代码结构优化建议
- [ ] **使用统计** - 记录和分析规则使用情况

#### 🌐 多语言支持

- [ ] **界面国际化** - 支持中英文界面切换
- [ ] **模板本地化** - 提供中文版本的规则模板

### 🎯 Phase 3: 高级功能 (v1.2.0)

#### 🔄 规则更新系统

- [ ] **版本管理** - 规则模板的版本控制
- [ ] **增量更新** - 智能更新变更的规则
- [ ] **回滚机制** - 支持回滚到之前的规则版本
- [ ] **更新通知** - 自动检查和提醒规则更新

#### 🎛️ 高级配置

- [ ] **自定义模板** - 支持用户创建和管理自定义模板
- [ ] **规则组合** - 灵活组合多个模板规则
- [ ] **条件规则** - 基于项目特征的条件化规则
- [ ] **环境配置** - 开发/测试/生产环境的不同规则

### 🎯 Phase 4: 团队协作 (v1.3.0)

#### 👥 团队功能

- [ ] **规则分享** - 团队间规则配置的分享机制
- [ ] **远程模板** - 支持从远程仓库加载模板
- [ ] **团队同步** - 自动同步团队统一的规则配置
- [ ] **权限管理** - 规则修改的权限控制

#### 🔗 集成支持

- [ ] **Git Hook 集成** - 自动检查规则一致性
- [ ] **CI/CD 支持** - GitHub Actions/GitLab CI 集成
- [ ] **IDE 插件** - VS Code/Cursor 插件支持
- [ ] **API 接口** - 提供程序化访问接口

### 🎯 Phase 5: 生态建设 (v1.4.0)

#### 🏪 规则市场

- [ ] **社区模板** - 开放的模板市场和分享平台
- [ ] **评分系统** - 模板质量评价和推荐
- [ ] **作者认证** - 模板作者的身份认证机制
- [ ] **使用统计** - 模板下载和使用数据分析

#### 📊 数据分析

- [ ] **使用分析** - 规则使用情况的数据统计
- [ ] **效果评估** - 规则对开发效率的影响分析
- [ ] **优化建议** - 基于数据的规则优化建议
- [ ] **趋势报告** - 技术栈和规则的趋势分析

### 🎯 Phase 6: 平台扩展 (v2.0.0)

#### 🔌 多平台支持

- [ ] **跨 IDE 支持** - 支持更多AI编程工具
- [ ] **多语言生态** - 支持 Python、Go、Rust 等更多语言
- [ ] **云端服务** - 提供云端规则管理服务
- [ ] **移动端** - 移动设备的规则管理工具

#### 🤖 AI 增强

- [ ] **智能生成** - AI 驱动的规则自动生成
- [ ] **个性化推荐** - 基于用户习惯的个性化规则
- [ ] **自适应优化** - 根据使用反馈自动优化规则
- [ ] **对话式配置** - 自然语言交互的规则配置

### 📅 开发时间线

| 阶段    | 版本   | 时间计划 | 主要目标     |
| ------- | ------ | -------- | ------------ |
| Phase 1 | v1.0.x | 2024 Q1  | 核心功能稳定 |
| Phase 2 | v1.1.0 | 2024 Q2  | 用户体验优化 |
| Phase 3 | v1.2.0 | 2024 Q3  | 高级功能完善 |
| Phase 4 | v1.3.0 | 2024 Q4  | 团队协作支持 |
| Phase 5 | v1.4.0 | 2025 Q1  | 生态系统建设 |
| Phase 6 | v2.0.0 | 2025 Q2  | 平台全面升级 |

### 🎖️ 里程碑目标

- **1000+ 用户** - Phase 2 完成时
- **10000+ 下载量** - Phase 3 完成时
- **100+ 社区模板** - Phase 5 完成时
- **多平台支持** - Phase 6 完成时

### 🤝 如何参与

我们欢迎社区参与项目开发！您可以通过以下方式参与：

1. **提交 Issue** - 报告 Bug 或提出功能建议
2. **贡献代码** - 提交 Pull Request 参与开发
3. **分享模板** - 贡献高质量的规则模板
4. **文档改进** - 帮助完善项目文档
5. **推广使用** - 在社区中推广和分享

详细的贡献指南请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。
