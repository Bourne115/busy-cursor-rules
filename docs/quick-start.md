# 快速开始指南

欢迎加入 Cursor Rules CLI 项目！这份指南将帮助你快速设置开发环境并开始贡献。

## 🚀 一分钟快速开始

```bash
# 1. 克隆项目
git clone https://github.com/cursor-rules/cursor-rules-cli.git
cd cursor-rules-cli

# 2. 使用 Makefile 一键设置
make setup

# 3. 开始开发
make dev
```

## 📋 详细步骤

### 1. 环境要求

- **Node.js**: >= 16.0.0 (推荐 18.x 或 20.x)
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
git clone https://github.com/cursor-rules/cursor-rules-cli.git
cd cursor-rules-cli
```

### 3. 安装依赖

```bash
# 推荐使用 Makefile
make install

# 或直接使用 pnpm
pnpm install
```

### 4. 设置 Git 钩子

```bash
# 推荐使用 Makefile
make setup-hooks

# 或直接使用 pnpm
pnpm run prepare
```

这会设置：

- 预提交检查（代码格式化和质量检查）
- 提交信息格式验证

### 5. 验证设置

```bash
# 运行所有检查
make check-all

# 或分别运行
make type-check  # TypeScript 类型检查
make format-check # 代码格式检查
make lint        # 代码质量检查
make test        # 运行测试
make build       # 构建项目
```

## 🛠️ 开发工作流

### 日常开发

```bash
# 开发模式运行（推荐）
make dev

# 或使用 pnpm
pnpm run dev
```

### 运行测试

```bash
# 运行所有测试
make test

# 观察模式（文件变化时自动运行）
make test-watch

# 生成覆盖率报告
make test-coverage
```

### 代码质量

```bash
# 自动修复可修复的问题
make lint-fix

# 格式化代码
make format

# 检查代码格式
make format-check

# TypeScript 类型检查
make type-check
```

### 提交代码

```bash
# 规范化提交（推荐）
make commit

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

### 开发者发版

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
make release-patch

# 小版本 (1.0.0 -> 1.1.0)
make release-minor

# 大版本 (1.0.0 -> 2.0.0)
make release-major
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

```bash
# 清理缓存重新安装
make clean-all
make install
```

#### Q: Git 钩子不工作？

```bash
# 重新设置钩子
make setup-hooks
```

#### Q: 提交被拒绝？

```bash
# 检查提交信息格式
make commit  # 使用交互式提交

# 或修复代码问题
make lint-fix
make format
```

#### Q: 测试失败？

```bash
# 查看详细错误信息
make test-coverage

# 观察模式调试
make test-watch
```

### 获取帮助

```bash
# 查看所有可用命令
make help

# 或查看 pnpm 脚本
pnpm run
```

## 📚 进阶指南

- [工程化指南](engineering.md) - 详细的工程化配置说明
- [贡献指南](../CONTRIBUTING.md) - 贡献流程和规范
- [架构文档](architecture.md) - 项目架构说明

## 🤝 加入社区

- [GitHub Discussions](https://github.com/cursor-rules/cursor-rules-cli/discussions)
- [Issues](https://github.com/cursor-rules/cursor-rules-cli/issues)
- [Wiki](https://github.com/cursor-rules/cursor-rules-cli/wiki)

---

## ✅ 检查清单

完成设置后，确保以下项目都能正常工作：

- [ ] `make dev` - 开发模式运行
- [ ] `make test` - 测试通过
- [ ] `make lint` - 代码检查通过
- [ ] `make format` - 代码格式化正常
- [ ] `make build` - 构建成功
- [ ] `make commit` - 规范化提交工具可用

如果所有项目都✅，恭喜你！开发环境已配置完成。

现在你可以开始贡献代码了！🎉
