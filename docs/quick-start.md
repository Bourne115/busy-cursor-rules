# 快速开始指南

欢迎加入 Cursor Rules CLI 项目！这份指南将帮助你快速设置开发环境并开始贡献。

## 🚀 一分钟快速开始

```bash
# 1. 克隆项目
git clone https://github.com/Bourne115/busy-cursor-rules.git
cd busy-cursor-rules

# 2. 安装依赖
pnpm install

# 3. 设置 Git 钩子
pnpm run prepare

# 4. 开始开发
pnpm run dev
```

## 📋 详细步骤

### 1. 环境要求

- **Node.js**: >= 16.0.0 (推荐 20.x)
- **pnpm**: >= 8.0.0
- **Git**: >= 2.20.0

```bash
# 检查版本
node --version
pnpm --version
git --version
```

### 2. 克隆项目

```bash
git clone https://github.com/Bourne115/busy-cursor-rules.git
cd busy-cursor-rules
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 设置 Git 钩子

```bash
pnpm run prepare
```

这会设置：

- 预提交检查（代码格式化和质量检查）
- 提交信息格式验证

### 5. 验证设置

```bash
# 运行类型检查
pnpm run type-check

# 代码格式检查
pnpm run format:check

# 代码质量检查
pnpm run lint

# 运行测试
pnpm run test

# 构建项目
pnpm run build
```

## 🛠️ 开发工作流

### 日常开发

```bash
# 开发模式运行（推荐）
pnpm run dev
```

### 运行测试

```bash
# 运行所有测试
pnpm run test

# 观察模式（文件变化时自动运行）
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:coverage
```

### 代码质量

```bash
# 自动修复可修复的问题
pnpm run lint:fix

# 格式化代码
pnpm run format

# 检查代码格式
pnpm run format:check

# TypeScript 类型检查
pnpm run type-check
```

### 提交代码

```bash
# 规范化提交（推荐）
pnpm run commit

# 或手动提交（需遵循 Conventional Commits 格式）
git add .
git commit -m "feat: add new feature"
```

## 🎯 VSCode 开发

如果你使用 VSCode，项目已配置好最佳开发体验：

### 1. 推荐扩展

打开项目后，VSCode 会提示安装推荐扩展，包括：

- ESLint - 代码质量检查
- Prettier - 代码格式化
- GitLens - Git 增强工具
- Conventional Commits - 提交信息辅助

### 2. 任务和调试

- 按 `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`)
- 输入 `Tasks: Run Task` 查看所有可用任务
- 按 `F5` 启动调试模式

### 3. 自动格式化

项目已配置保存时自动格式化，无需手动操作。

## 📝 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 新功能
git commit -m "feat: add Vue template support"

# 错误修复
git commit -m "fix: resolve config parsing issue"

# 文档更新
git commit -m "docs: update installation guide"

# 代码重构
git commit -m "refactor: simplify template generator"

# 测试相关
git commit -m "test: add unit tests for core module"
```

### 提交类型

| 类型       | 描述     | 示例                            |
| ---------- | -------- | ------------------------------- |
| `feat`     | 新功能   | `feat: add template validation` |
| `fix`      | 错误修复 | `fix: resolve parsing issue`    |
| `docs`     | 文档更新 | `docs: update API docs`         |
| `style`    | 代码格式 | `style: fix eslint warnings`    |
| `refactor` | 重构代码 | `refactor: simplify logic`      |
| `test`     | 测试相关 | `test: add unit tests`          |
| `chore`    | 杂务任务 | `chore: update dependencies`    |

## 🔄 发版流程

### 快速发版

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
pnpm run release:patch
# 或使用脚本
./scripts/quick-release.sh patch

# 小版本 (1.0.0 -> 1.1.0)
pnpm run release:minor
# 或使用脚本
./scripts/quick-release.sh minor

# 大版本 (1.0.0 -> 2.0.0)
pnpm run release:major
# 或使用脚本
./scripts/quick-release.sh major
```

发版脚本会自动：

1. 运行所有检查
2. 升级版本号
3. 生成 CHANGELOG
4. 创建 Git 标签
5. 推送到远程仓库

## 🧪 测试指南

### 编写测试

```bash
# 测试文件位置
src/__tests__/           # 单元测试
src/commands/__tests__/  # 命令测试
```

### 测试规范

```typescript
describe('Template Generator', () => {
  it('should generate React template with TypeScript', () => {
    // 测试实现
  });

  it('should throw error for invalid template type', () => {
    // 测试实现
  });
});
```

### 运行特定测试

```bash
# 运行特定文件的测试
pnpm test templates.test.ts

# 运行匹配模式的测试
pnpm test --testNamePattern="React"
```

## 🔧 故障排除

### 常见问题

#### Q: 安装依赖失败？

**A**: 确保你使用的是 pnpm：

```bash
# 清理缓存
pnpm store prune

# 重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Q: Git 钩子不工作？

**A**: 重新设置钩子：

```bash
# 删除现有钩子
rm -rf .git/hooks

# 重新设置
pnpm run prepare
```

#### Q: ESLint 报错？

**A**: 检查配置文件：

```bash
# 检查 ESLint 配置
pnpm run lint

# 自动修复
pnpm run lint:fix
```

#### Q: TypeScript 编译错误？

**A**: 检查类型：

```bash
# 运行类型检查
pnpm run type-check

# 清理构建缓存
rm -rf dist
pnpm run build
```

### 获取帮助

- 📖 查看[工程化指南](./engineering.md)
- 🐛 提交 [Issue](https://github.com/Bourne115/busy-cursor-rules/issues)
- 💬 参与 [Discussions](https://github.com/Bourne115/busy-cursor-rules/discussions)

## ✅ 开发检查清单

开始贡献前，请确保：

- [ ] `pnpm run dev` - 开发模式运行
- [ ] `pnpm run test` - 测试通过
- [ ] `pnpm run lint` - 代码检查通过
- [ ] `pnpm run format:check` - 代码格式化正常
- [ ] `pnpm run build` - 构建成功
- [ ] `pnpm run commit` - 规范化提交工具可用

---

🎉 **欢迎加入 Cursor Rules CLI 开发！** 让我们一起打造更好的 AI 协作开发体验。
