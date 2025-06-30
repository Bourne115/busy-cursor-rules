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
- **运行时**: Node.js >= 20.0.0
- **包管理**: pnpm >= 9.0.0 (严格要求)
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

### 目录结构

```
src/
├── cli.ts                    # CLI 主入口
├── commands/                 # 命令实现
│   ├── init.ts              # 初始化命令
│   ├── add.ts               # 添加规则命令
│   ├── list.ts              # 列表命令
│   └── config.ts            # 配置命令
├── core/                     # 核心功能模块
│   ├── detector/            # 项目检测器
│   ├── generator/           # 规则生成器
│   ├── validator/           # 规则验证器
│   └── updater/             # 更新管理器
├── templates/               # 内置模板
│   └── index.ts            # 模板定义和管理
├── types/                   # TypeScript 类型定义
│   └── index.ts            # 核心类型定义
├── utils/                   # 工具函数
└── __tests__/              # 单元测试
```

### 核心模块说明

#### CLI 命令层 (`src/commands/`)

- **init.ts**: 项目初始化，智能检测项目类型并生成相应规则
- **add.ts**: 添加特定规则到现有项目
- **list.ts**: 列出所有可用的规则模板
- **config.ts**: 全局和项目配置管理

#### 核心业务层 (`src/core/`)

- **detector/**: 智能检测项目类型、框架、依赖关系
- **generator/**: 根据模板和配置生成规则文件
- **validator/**: 验证生成的规则文件格式和完整性
- **updater/**: 管理规则版本更新和同步

#### 模板系统 (`src/templates/`)

- 内置各种技术栈的规则模板
- 支持动态加载和自定义模板扩展
- 模板包含: basic, react, vue, typescript, node 等

## 🎯 核心功能和特性

### 主要命令

1. **init**: 为项目初始化 Cursor Rules
   - 自动检测项目类型
   - 智能推荐适合的规则模板
   - 支持交互式和非交互式模式

2. **add**: 添加特定规则到项目
   - 支持按分类添加规则
   - 强制覆盖选项

3. **list**: 查看所有可用规则
   - 支持分类筛选
   - 显示已安装规则

4. **config**: 配置管理
   - 全局和项目级配置
   - 支持语言、模板偏好等设置

### 智能特性

- **项目类型检测**: 基于 package.json 和文件结构自动识别
- **依赖分析**: 分析项目依赖推荐相关规则
- **模板系统**: 灵活的模板系统支持自定义规则

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

### 包管理和脚本

- 使用 `pnpm` 作为包管理器
- 发布脚本: `./scripts/quick-release.sh`
- 支持 patch/minor/major 版本发布

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

1. 在 `src/templates/index.ts` 中定义新的 `RuleTemplate`
2. 在 `TEMPLATE_REGISTRY` 中注册
3. 更新类型定义 (如果需要新的项目类型)
4. 添加相应的测试

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

### 调试和测试

```bash
# 开发模式运行
pnpm run dev

# 运行特定命令测试
pnpm run dev init --template=react

# 运行测试
pnpm test

# 观察模式测试
pnpm run test:watch
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

### 代码生成时要注意

1. **保持类型安全**: 确保所有新代码都有正确的 TypeScript 类型
2. **遵循项目规范**: 使用现有的错误处理模式和代码风格
3. **测试覆盖**: 为新功能编写相应的单元测试
4. **文档更新**: 更新相关的文档和帮助信息

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

**最后更新**: 2025年6月25日
**维护者**: Cursor Rules CLI Team
**联系方式**: https://github.com/Bourne115/busy-cursor-rules/issues
