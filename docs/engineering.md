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
# 或
./scripts/quick-release.sh patch

# 小版本 (1.0.0 -> 1.1.0)
pnpm run release:minor
# 或
./scripts/quick-release.sh minor

# 大版本 (1.0.0 -> 2.0.0)
pnpm run release:major
# 或
./scripts/quick-release.sh major
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

### GitHub Actions 配置

项目包含两个主要的工作流：

- **`.github/workflows/ci.yml`** - 持续集成
- **`.github/workflows/release.yml`** - 自动发布

## 开发工具

### VSCode 配置

项目已预配置VSCode开发环境：

- **设置文件** - `.vscode/settings.json`
- **任务配置** - `.vscode/tasks.json`
- **调试配置** - `.vscode/launch.json`
- **扩展推荐** - `.vscode/extensions.json`

### 代码质量工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查
- **Jest** - 单元测试框架

### Git 工具

- **simple-git-hooks** - Git钩子管理
- **lint-staged** - 预提交检查
- **commitlint** - 提交信息验证
- **commitizen** - 交互式提交

### 构建工具

- **tsup** - TypeScript构建工具
- **tsx** - TypeScript执行器
- **conventional-changelog** - 更新日志生成

## 常用命令速查

### 开发命令

```bash
# 开发模式
pnpm run dev

# 构建项目
pnpm run build

# 清理构建产物
pnpm run clean
```

### 代码质量

```bash
# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint

# 自动修复
pnpm run lint:fix

# 格式化代码
pnpm run format

# 检查格式
pnpm run format:check
```

### 测试命令

```bash
# 运行测试
pnpm test

# 观察模式
pnpm run test:watch

# 覆盖率报告
pnpm run test:coverage
```

### 版本管理

```bash
# 规范化提交
pnpm run commit

# 生成更新日志
pnpm run changelog

# 发布版本
pnpm run release:patch
pnpm run release:minor
pnpm run release:major
```

### Git 钩子

```bash
# 设置钩子
pnpm run prepare
```

## 故障排除

### 常见问题

1. **钩子不工作**

   ```bash
   rm -rf .git/hooks
   pnpm run prepare
   ```

2. **依赖安装失败**

   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **TypeScript 错误**

   ```bash
   pnpm run type-check
   ```

4. **ESLint 错误**
   ```bash
   pnpm run lint:fix
   ```

---

📚 **更多信息**：查看[快速开始指南](./quick-start.md)了解详细的设置步骤。
