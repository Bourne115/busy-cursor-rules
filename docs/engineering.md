# 工程化指南

## 📋 目录

- [Git提交规范](#git提交规范)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [发版流程](#发版流程)
- [CI/CD流程](#cicd流程)
- [开发工具](#开发工具)

## Git提交规范

### 提交信息格式

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

| 类型       | 描述           | 示例                                         |
| ---------- | -------------- | -------------------------------------------- |
| `feat`     | 新功能         | `feat: add template validation`              |
| `fix`      | 错误修复       | `fix: resolve template parsing issue`        |
| `docs`     | 文档更新       | `docs: update API documentation`             |
| `style`    | 代码格式更改   | `style: fix eslint warnings`                 |
| `refactor` | 重构代码       | `refactor: simplify template generator`      |
| `perf`     | 性能改进       | `perf: optimize file reading speed`          |
| `test`     | 添加或更新测试 | `test: add unit tests for core module`       |
| `build`    | 构建系统更改   | `build: update tsup configuration`           |
| `ci`       | CI配置更改     | `ci: add security audit workflow`            |
| `chore`    | 杂务任务       | `chore: update dependencies`                 |
| `revert`   | 回滚提交       | `revert: undo feat: add template validation` |

### 规范化提交

#### 使用交互式提交工具

```bash
# 使用 commitizen 进行规范化提交
pnpm run commit
```

#### 手动提交示例

```bash
# 新功能
git commit -m "feat: add Vue template support"

# 错误修复
git commit -m "fix: resolve config file parsing error"

# 文档更新
git commit -m "docs: add installation guide"

# 带作用域的提交
git commit -m "feat(cli): add interactive project type selection"

# 带详细描述的提交
git commit -m "feat: add template validation

- Add schema validation for template files
- Improve error messages for invalid templates
- Add unit tests for validation logic

Closes #123"
```

## 代码规范

### 代码格式化

```bash
# 格式化所有代码
pnpm run format

# 检查代码格式
pnpm run format:check
```

### 代码质量检查

```bash
# 运行 ESLint 检查
pnpm run lint

# 自动修复可修复的问题
pnpm run lint:fix

# 类型检查
pnpm run type-check
```

### 预提交检查

项目配置了 `simple-git-hooks` 和 `lint-staged`，在每次提交前会自动：

1. 对暂存的TypeScript文件运行ESLint修复
2. 对暂存的文件运行Prettier格式化
3. 验证提交信息格式

## 测试指南

### 运行测试

```bash
# 运行所有测试
pnpm test

# 观察模式运行测试
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:coverage
```

### 测试文件组织

```
src/
├── __tests__/          # 单元测试
│   ├── cli.test.ts
│   ├── templates.test.ts
│   └── utils.test.ts
└── commands/
    └── __tests__/      # 命令测试
        ├── init.test.ts
        └── add.test.ts
```

### 测试规范

- 测试文件命名：`*.test.ts`
- 每个模块都应有对应的测试文件
- 测试覆盖率应保持在80%以上
- 使用描述性的测试名称

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

## 发版流程

### 自动发版

使用脚本进行自动化发版：

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
pnpm run release:patch

# 小版本 (1.0.0 -> 1.1.0)
pnpm run release:minor

# 大版本 (1.0.0 -> 2.0.0)
pnpm run release:major
```

### 手动发版

1. **确保在主分支**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **运行所有检查**

   ```bash
   pnpm run type-check
   pnpm run lint
   pnpm run test
   pnpm run build
   ```

3. **升级版本**

   ```bash
   npm version patch|minor|major
   ```

4. **生成更新日志**

   ```bash
   pnpm run changelog
   ```

5. **提交更改**

   ```bash
   git add .
   git commit -m "chore: release v1.0.1"
   ```

6. **创建标签和推送**
   ```bash
   git tag v1.0.1
   git push origin main
   git push origin v1.0.1
   ```

### 发版检查清单

- [ ] 所有测试通过
- [ ] 代码质量检查通过
- [ ] 构建成功
- [ ] 更新日志已生成
- [ ] 版本号已更新
- [ ] Git标签已创建
- [ ] 代码已推送到远程仓库

## CI/CD流程

### 持续集成(CI)

每次推送到主分支或创建Pull Request时，会自动触发CI流程：

1. **多Node.js版本测试** (16.x, 18.x, 20.x)
2. **代码质量检查**
   - TypeScript类型检查
   - ESLint代码质量检查
   - Prettier代码格式检查
3. **测试执行** - 运行所有单元测试
4. **构建验证** - 验证项目可以正确构建
5. **安全审计** - 检查依赖包安全性
6. **提交信息检查** - 验证提交信息格式

### 持续部署(CD)

当推送Git标签时，会自动触发发布流程：

1. **构建和测试** - 完整的CI流程
2. **发布到npm** - 自动发布包到npm registry
3. **创建GitHub Release** - 自动创建GitHub发布页面
4. **发布通知** - 在控制台输出发布信息

### GitHub Actions配置

- `.github/workflows/ci.yml` - CI工作流
- `.github/workflows/release.yml` - 发布工作流

## 开发工具

### VSCode任务

按 `Ctrl+Shift+P` (或 `Cmd+Shift+P`)，输入 `Tasks: Run Task`，可以选择以下任务：

- 📦 构建项目
- 🧪 运行测试
- 🧪 运行测试(观察模式)
- 🔍 代码检查
- 🔧 修复代码问题
- 💅 格式化代码
- 🔍 类型检查
- 🚀 开发模式
- 📝 生成CHANGELOG
- 📋 规范化提交
- 🏷️ 发版(补丁/小版本/大版本)

### 推荐的VSCode扩展

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeScript Importer** - 自动导入
- **GitLens** - Git增强工具
- **Conventional Commits** - 提交信息辅助

### 开发环境设置

1. **克隆仓库**

   ```bash
   git clone <repository-url>
   cd cursor-rules-cli
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **设置Git钩子**

   ```bash
   pnpm run prepare
   ```

4. **开始开发**
   ```bash
   pnpm run dev
   ```

### 调试配置

项目包含VSCode调试配置，可以直接在IDE中调试：

1. 按 `F5` 启动调试
2. 在断点处停止
3. 使用调试控制台查看变量

## 常见问题

### Q: 提交被拒绝，提示提交信息格式错误？

A: 请确保提交信息遵循Conventional Commits格式，或使用 `pnpm run commit` 进行交互式提交。

### Q: 预提交检查失败？

A: 运行以下命令修复问题：

```bash
pnpm run lint:fix
pnpm run format
```

### Q: 如何跳过Git钩子？

A: 在特殊情况下可以跳过：

```bash
git commit --no-verify -m "your message"
```

但不建议经常使用。

### Q: 发版脚本执行失败？

A: 检查以下几点：

1. 是否在主分支
2. 工作区是否干净
3. 是否有足够的权限
4. 网络连接是否正常

## 最佳实践

1. **频繁提交** - 保持小而频繁的提交
2. **描述性提交信息** - 清楚说明更改内容
3. **测试驱动开发** - 先写测试，再写代码
4. **代码审查** - 通过Pull Request进行代码审查
5. **文档更新** - 及时更新相关文档
6. **依赖管理** - 定期更新和审计依赖包
7. **性能监控** - 关注构建时间和包大小
