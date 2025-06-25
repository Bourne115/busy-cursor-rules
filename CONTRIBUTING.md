# 贡献指南

感谢您对 Cursor Rules CLI 项目的关注！我们欢迎任何形式的贡献。

## 🚀 如何贡献

### 报告 Bug

如果您发现了 bug，请：

1. 检查 [现有 issues](https://github.com/Bourne115/busy-cursor-rules/issues) 确认问题尚未被报告
2. 创建一个新的 issue，包含：
   - 详细的问题描述
   - 重现步骤
   - 期望的行为
   - 实际的行为
   - 系统环境信息（操作系统、Node.js 版本等）
   - 相关的错误日志

### 建议新功能

我们欢迎新功能建议！请：

1. 检查 [现有 issues](https://github.com/Bourne115/busy-cursor-rules/issues) 确认功能尚未被建议
2. 创建一个 feature request issue，描述：
   - 功能的详细说明
   - 使用场景
   - 预期收益
   - 可能的实现方案

### 提交代码

#### 开发环境设置

1. Fork 项目到您的账号
2. 克隆您的 fork：

```bash
git clone https://github.com/YOUR_USERNAME/cursor-rules-cli.git
cd cursor-rules-cli
```

3. 安装依赖：

```bash
pnpm install
```

4. 创建开发分支：

```bash
git checkout -b feature/your-feature-name
```

#### 开发流程

1. **编写代码**：
   - 遵循现有的代码风格
   - 确保 TypeScript 类型安全
   - 添加必要的注释

2. **测试**：

```bash
# 运行所有测试
pnpm test

# 运行类型检查
pnpm type-check

# 运行代码检查
pnpm lint
```

3. **提交代码**：

```bash
git add .
git commit -m "feat: add new feature description"
```

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式化
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建工具或辅助工具的变动

4. **推送到您的 fork**：

```bash
git push origin feature/your-feature-name
```

5. **创建 Pull Request**：
   - 提供清晰的 PR 标题和描述
   - 引用相关的 issues
   - 确保所有检查通过

## 📋 代码规范

### TypeScript

- 使用严格模式
- 为所有公共 API 提供类型定义
- 避免使用 `any`，优先使用 `unknown`
- 合理使用泛型

### 代码风格

- 使用 ESLint 配置
- 遵循 Prettier 格式化规则
- 使用有意义的变量和函数名
- 保持函数简洁，单一职责

### 提交信息

- 使用英文编写提交信息
- 遵循 Conventional Commits 规范
- 提交信息要清晰描述变更内容

## 🧪 测试

- 为新功能添加相应的测试
- 确保测试覆盖率不下降
- 测试应该清晰易懂
- 使用描述性的测试名称

## 📚 文档

- 更新相关的 README 文档
- 为新功能添加使用示例
- 更新 CHANGELOG.md
- 添加必要的代码注释

## 🎯 模板贡献

### 添加新模板

1. 在 `src/templates/index.ts` 中添加新的模板定义
2. 确保模板包含：
   - 清晰的规则描述
   - 实用的代码示例
   - 合适的文件路径
   - 正确的分类标签

3. 为模板添加测试
4. 更新文档

### 模板质量标准

- 规则应该实用且具体
- 避免过于宽泛的建议
- 包含具体的代码示例
- 遵循最新的最佳实践

## 🔍 Code Review

我们的 Code Review 将关注：

- 代码质量和可维护性
- 性能影响
- 安全性考虑
- API 设计的一致性
- 测试覆盖率
- 文档的完整性

## 🤝 社区

- 保持友好和专业的态度
- 尊重不同的观点和建议
- 积极参与讨论和 code review
- 帮助其他贡献者

## 📞 联系方式

如果您有任何问题，可以通过以下方式联系我们：

- [GitHub Issues](https://github.com/Bourne115/busy-cursor-rules/issues)
- [GitHub Discussions](https://github.com/Bourne115/busy-cursor-rules/discussions)

再次感谢您的贡献！🎉
