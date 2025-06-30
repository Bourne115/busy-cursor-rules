# Cursor Rules CLI 项目上下文 Prompt

## 📋 项目概述

**项目名称**: `@qile-c/cursor-rules-cli`
**项目描述**: Cursor Rules 智能管理工具 - 一键生成、管理和优化 Cursor IDE AI 协作规范
**当前版本**: v1.0.2
**仓库地址**: https://github.com/Bourne115/busy-cursor-rules
**npm地址**: https://www.npmjs.com/package/@qile-c/cursor-rules-cli

## 🔧 开发环境

**Node.js**: v20.12.2 (使用 fnm 管理)
**包管理**: npm (当前环境) / pnpm (推荐)
**开发状态**: 核心功能完整，模板系统稳定

## 🏗️ 技术栈和工具链

### 核心技术栈

- **语言**: TypeScript (ES2022 target)
- **运行时**: Node.js >= 16.0.0 (当前使用 v20.12.2)
- **包管理**: pnpm >= 9.0.0 (推荐) / npm (兼容)
- **模块系统**: ESNext with Node.js resolution
- **CLI框架**: Commander.js
- **用户交互**: Inquirer.js
- **输出美化**: Chalk, Ora

### 构建和开发工具

- **构建工具**: tsup (TypeScript bundler)
- **开发运行**: tsx (TypeScript executor)
- **测试框架**: Jest
- **代码质量**: ESLint + Prettier
- **Git规范**: simple-git-hooks + lint-staged + commitizen
- **CI/CD**: GitHub Actions

### 路径别名配置

```typescript
// 使用 @/ 作为 src/ 的别名
import { something } from '@/utils/helper';
import { RuleTemplate } from '@/types/index';
```

## 📁 项目架构

### 当前目录结构

```
src/
├── cli.ts                    # CLI 主入口
├── commands/                 # 命令实现
│   ├── init.ts              # 初始化命令（包含简化推荐逻辑）
│   ├── add.ts               # 添加规则命令
│   ├── list.ts              # 列表命令
│   ├── config.ts            # 配置命令
│   ├── update.ts            # 更新命令
│   └── share.ts             # 分享命令
├── core/                     # 核心功能模块
│   ├── detector/            # 项目检测器
│   └── generator/           # 规则生成器
├── templates/               # 模板系统
│   ├── index.ts            # 模板入口
│   ├── adapter.ts          # 模板适配器
│   ├── loader.ts           # 模板加载器
│   ├── rules/              # 内置规则文件
│   └── static/             # 静态模板资源
├── types/                   # TypeScript 类型定义
│   └── index.ts            # 核心类型定义
├── utils/                   # 工具函数
└── __tests__/              # 单元测试
```

### 核心模块说明

#### CLI 命令层 (`src/commands/`)

- **init.ts**: 项目初始化，基于依赖分析的智能推荐
- **add.ts**: 添加特定规则到现有项目
- **list.ts**: 列出所有可用的规则模板
- **config.ts**: 全局和项目配置管理

#### 核心业务层 (`src/core/`)

- **detector/**: 检测项目类型、框架、依赖关系
- **generator/**: 根据模板和配置生成规则文件

#### 模板系统 (`src/templates/`)

- **loader.ts**: 模板加载和处理（已修复重复目录问题）
- **adapter.ts**: 模板适配和兼容性处理
- **rules/**: 内置规则模板（basic, react, vue, typescript, node, workflow）
- **static/configs/**: 模板配置文件

## 🎯 核心功能和特性

### 主要命令

1. **init**: 为项目初始化 Cursor Rules
   - 基于 package.json 依赖分析的智能推荐
   - 支持交互式和非交互式模式
   - 自动解决模板依赖关系

2. **add**: 添加特定规则到项目
   - 支持强制覆盖选项
   - 显示规则详情和相关推荐

3. **list**: 查看所有可用规则
   - 支持分类筛选
   - 显示兼容性信息

4. **config**: 配置管理
   - 全局和项目级配置

### 智能推荐系统（简化版）

基于项目依赖分析的推荐逻辑：

- React项目：自动推荐 react + typescript + testing + workflow
- Vue项目：自动推荐 vue + typescript + testing + workflow
- Node.js项目：自动推荐 node + typescript + testing + workflow
- 通用项目：至少推荐 workflow 规范

## 📊 数据结构和类型系统

### 核心类型 (`src/types/index.ts`)

```typescript
// 规则模板结构
interface RuleTemplate {
  id: string; // 模板唯一标识
  name: string; // 显示名称
  description: string; // 描述信息
  version: string; // 版本号
  category: 'basic' | 'module' | 'workflow'; // 分类
  tags: string[]; // 标签
  author: string; // 作者
  files: RuleFile[]; // 规则文件列表
  dependencies?: string[]; // 依赖的其他模板
  config?: TemplateConfig; // 模板配置
}

// 项目检测结果
interface ProjectInfo {
  type: ProjectType; // 项目类型
  framework?: string; // 框架信息
  language: string; // 主要语言
  packageManager: 'npm' | 'yarn' | 'pnpm'; // 包管理器
  dependencies: string[]; // 项目依赖
  devDependencies: string[]; // 开发依赖
  hasTypeScript: boolean; // 是否使用 TypeScript
  hasTests: boolean; // 是否有测试
}
```

### 支持的项目类型

- `react`, `vue`, `angular` (前端框架)
- `node`, `next`, `nuxt` (Node.js 相关)
- `python`, `go`, `rust` (其他语言)
- `generic` (通用项目)

## 🔧 开发规范和最佳实践

### 已知问题和解决方案

1. **重复目录问题** (已修复)
   - 问题：workflow 模板生成 `workflow/workflow/` 重复目录
   - 解决：在 `loader.ts` 中添加 `templateCategory === templateId` 判断

2. **ESLint 配置问题** (已修复)
   - 问题：`tsup.config.ts` 不在 tsconfig.json 包含范围
   - 解决：更新 `tsconfig.json` 的 `include` 添加 `"*.ts"`

3. **Node.js 版本兼容**
   - 要求：Node.js >= 16.0.0
   - 当前：v20.12.2 (使用 fnm 管理)

### 代码规范

- **严格模式**: 启用 TypeScript strict mode
- **ES2022**: 使用现代 JavaScript 特性
- **模块系统**: 使用 ES modules
- **错误处理**: 完善的错误处理和用户友好的错误信息
- **类型安全**: 避免使用 any，优先使用具体类型

### 命令设计原则

- **一致性**: 所有命令遵循相同的参数和选项格式
- **友好性**: 提供详细的帮助信息和示例
- **渐进性**: 支持从简单到复杂的使用场景
- **可扩展性**: 易于添加新的命令和功能

### 错误处理策略

```typescript
// 全局错误处理
process.on('uncaughtException', error => {
  console.error(chalk.red('发生了未预期的错误:'), error.message);
  process.exit(1);
});

// 命令级错误处理
try {
  await executeCommand();
} catch (error) {
  console.error(chalk.red('命令执行失败:'), error.message);
  process.exit(1);
}
```

## 🚀 工程化配置

### 构建和部署

```bash
# 构建项目
npm run build

# 开发模式
npm run dev

# 测试
npm test

# 代码质量检查
npm run lint
npm run type-check
npm run format:check
```

### 模板文件结构

```
.cursor/rules/
├── basic/           # 基础规范（所有项目通用）
├── module/          # 模块规范（技术栈特定）
├── workflow/        # 工作流规范（开发流程）
└── ai.mdc          # AI协作协议文件
```

### 质量保障

- **预提交检查**: ESLint + Prettier + commitlint
- **CI/CD**: GitHub Actions 自动化测试和发布
- **类型检查**: 严格的 TypeScript 编译检查
- **安全审计**: 依赖包安全检查

### 发布流程

1. 运行质量检查 (type-check, lint, format-check)
2. 构建项目
3. 运行测试
4. 版本号升级
5. 生成 CHANGELOG
6. 创建 Git 标签
7. 推送并触发自动发布

## 🎨 用户体验设计

### 命令行界面

- **彩色输出**: 使用 chalk 提供视觉反馈
- **进度指示**: 使用 ora 显示长时间操作的进度
- **交互式问答**: 使用 inquirer.js 提供友好的用户交互

### 错误信息设计

- 提供清晰的错误描述
- 给出具体的解决建议
- 包含相关的帮助信息链接

## 🔮 扩展和维护指南

### 添加新模板

1. 在 `src/templates/static/configs/` 添加配置文件
2. 在 `src/templates/rules/` 添加规则文件
3. 更新类型定义（如需要）
4. 添加相应测试

### 模板文件路径规则

- basic 类型：保持 `basic/filename.mdc`
- 当 `category === id` 时：`category/filename.mdc`（避免重复）
- 其他情况：`category/id/filename.mdc`

### 添加新命令

1. 在 `src/commands/` 中创建命令文件
2. 在 `src/cli.ts` 中注册命令
3. 实现命令逻辑
4. 添加单元测试

### 性能优化考虑

- **懒加载**: 模板和配置的按需加载
- **缓存机制**: 避免重复的文件系统操作
- **异步操作**: 使用 async/await 处理 I/O 操作

## 📝 常见开发场景

### 调试模板生成

```bash
# 在测试目录测试
cd test-cursor-rules
node ../dist/cli.js init --template=workflow --force --no-interactive
```

### 版本切换（使用 fnm）

```bash
fnm list                # 查看可用版本
fnm use 20.12.2        # 切换到指定版本
node --version         # 验证版本
```

### 代码质量检查

```bash
# 类型检查
pnpm run type-check

# 代码检查和自动修复
pnpm run lint:fix

# 格式化代码
pnpm run format
```

### 发布新版本

```bash
# 补丁版本
pnpm run release:patch

# 小版本
pnpm run release:minor

# 大版本
pnpm run release:major
```

## 🎯 AI 协作建议

### 开发时注意事项

1. **模板路径处理**: 注意避免重复目录结构
2. **依赖分析**: 基于 package.json 进行智能推荐
3. **错误处理**: 提供有用的错误信息和恢复建议
4. **类型安全**: 确保所有新代码都有正确的 TypeScript 类型

### 常用开发命令

```bash
npm run build          # 构建项目
node dist/cli.js --help # 测试CLI
npm run lint:fix       # 修复代码质量问题
```

### 问题排查时要检查

1. **依赖版本**: 确保使用正确的 Node.js 和 pnpm 版本
2. **路径别名**: 检查 `@/` 别名是否正确解析
3. **模块导入**: 确保使用 ES modules 语法
4. **TypeScript 配置**: 检查 tsconfig.json 配置是否正确

### 性能和用户体验

1. **响应时间**: 保持命令执行的快速响应
2. **错误处理**: 提供有用的错误信息和恢复建议
3. **进度反馈**: 为长时间操作提供进度指示
4. **文档完整性**: 保持文档与代码的同步

---

**最后更新**: 2024年12月
**当前状态**: 核心功能稳定，模板系统完整
**维护者**: Cursor Rules CLI Team
