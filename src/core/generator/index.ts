import {
  generateRulesFromTemplate,
  getTemplateConfiguration,
} from '@/templates/index';
import { ProjectInfo, RuleContext } from '@/types/index';
import { ensureDir, writeFile } from '@/utils/file';
import { existsSync } from 'fs';
import path from 'path';

/**
 * 生成规则文件
 */
export async function generateRules(
  context: RuleContext,
  templates: string[]
): Promise<{ successfulTemplates: string[]; failedTemplates: string[] }> {
  const { rulesDir } = context;
  const successfulTemplates: string[] = [];
  const failedTemplates: string[] = [];

  // 确保规则目录存在
  await ensureDir(rulesDir);
  await ensureDir(path.join(rulesDir, 'basic'));
  await ensureDir(path.join(rulesDir, 'module'));
  await ensureDir(path.join(rulesDir, 'workflow'));

  // 生成模板规则
  for (const templateName of templates) {
    try {
      await generateRulesFromTemplateNew(context, templateName);
      successfulTemplates.push(templateName);
    } catch (error) {
      console.error(`Failed to generate template ${templateName}:`, error);
      failedTemplates.push(templateName);
    }
  }

  // 生成 AI 协作协议文件
  await generateAIProtocol(context);

  return { successfulTemplates, failedTemplates };
}

/**
 * 使用模板系统生成规则
 */
async function generateRulesFromTemplateNew(
  context: RuleContext,
  templateId: string
): Promise<void> {
  const { rulesDir, projectInfo, config } = context;

  // 使用模板处理API
  const result = await generateRulesFromTemplate(templateId, projectInfo, {
    // 传入全局配置变量
    PACKAGE_MANAGER: projectInfo.packageManager,
    TARGET_VERSION: projectInfo.hasTypeScript ? 'ES2022' : 'ES2020',
    RUNTIME: projectInfo.type === 'node' ? 'Node.js' : 'Browser',
    ...(config.customTemplatePath
      ? { CUSTOM_PATH: config.customTemplatePath }
      : {}),
  });

  if (!result.success) {
    throw new Error(`Template processing failed: ${result.errors?.join(', ')}`);
  }

  // 写入生成的文件
  for (const file of result.files) {
    const filePath = path.join(rulesDir, file.path);
    await writeFile(filePath, file.content);
  }
}

/**
 * 生成 AI 协作协议
 */
async function generateAIProtocol(context: RuleContext): Promise<void> {
  const { rulesDir, projectInfo } = context;

  const protocol = `# AI协作执行规则

## 项目理解和上下文

### 项目核心信息
- **项目类型**: ${projectInfo.type}
- **开发框架**: ${projectInfo.framework || '无特定框架'}
- **编程语言**: ${projectInfo.language}
- **TypeScript**: ${projectInfo.hasTypeScript ? '✅ 启用' : '❌ 未启用'}
- **测试支持**: ${projectInfo.hasTests ? '✅ 配置' : '❌ 未配置'}
- **包管理器**: ${projectInfo.packageManager}

### 技术栈分析
**依赖关系**:
${
  projectInfo.dependencies.length > 0
    ? projectInfo.dependencies.map(dep => `- ${dep}`).join('\n')
    : '- 无主要依赖'
}

**开发依赖**:
${
  projectInfo.devDependencies.length > 0
    ? projectInfo.devDependencies.map(dep => `- ${dep}`).join('\n')
    : '- 无开发依赖'
}

## 规则分类说明

### 📁 目录结构
- **basic/**: 基础编程规范，所有项目必须遵循
- **module/**: 技术栈特定规范，根据项目技术选择应用
- **workflow/**: 开发流程规范，团队协作和部署相关

### 🎯 规则优先级
1. **项目特定规则** (workflow/) - 最高优先级
2. **技术栈规则** (module/) - 中等优先级
3. **基础通用规则** (basic/) - 基础要求

## 代码生成和修改指导

### ✅ 强制执行的行为
- 严格遵循类型安全原则${projectInfo.hasTypeScript ? '（TypeScript严格模式）' : ''}
- 使用明确的错误处理机制
- 保持代码简洁和可读性
- 添加必要的文档注释

### ❌ 禁止的行为
- 避免使用 any 类型${projectInfo.hasTypeScript ? '（TypeScript项目）' : ''}
- 禁止硬编码配置信息
- 避免深层嵌套和复杂的条件判断
- 禁止跳过错误处理

### 🔧 代码风格要求
- 函数命名使用动词开头的驼峰命名
- 组件/类名使用PascalCase
- 常量使用UPPER_SNAKE_CASE
- 文件名使用kebab-case

## 开发工作流程

### 1. 代码理解阶段
- 分析现有代码结构和模式
- 识别项目的架构设计原则
- 理解业务逻辑和数据流

### 2. 代码生成阶段
- 遵循项目现有的代码风格
- 使用相同的设计模式和架构
- 保持与现有代码的一致性

### 3. 质量保证阶段
- 确保类型安全和错误处理
- 验证代码的可读性和维护性
- 检查是否符合项目规范

## 特殊注意事项

${
  projectInfo.hasTypeScript
    ? `
### TypeScript 特殊要求
- 启用严格模式进行类型检查
- 为所有函数参数和返回值定义类型
- 使用接口定义数据结构
- 避免使用 any，优先使用 unknown
`
    : ''
}

${
  projectInfo.hasTests
    ? `
### 测试相关要求
- 为新增功能编写对应测试
- 保持测试覆盖率
- 使用描述性的测试用例名称
- 遵循AAA模式（Arrange-Act-Assert）
`
    : ''
}

---
**生成时间**: ${new Date().toISOString()}
**规则版本**: 2.0.0
**配置来源**: 基于文件系统的模板配置
`;

  await writeFile(path.join(rulesDir, 'ai.mdc'), protocol);
}

/**
 * 添加单个规则
 */
export async function addRule(
  context: RuleContext,
  ruleName: string,
  force: boolean = false
): Promise<void> {
  const config = await getTemplateConfiguration(ruleName);

  // 检查文件是否已存在
  if (!force) {
    for (const rule of config.rules) {
      const outputPath = `${rule.category}/${path.basename(rule.file)}`;
      const filePath = path.join(context.rulesDir, outputPath);
      if (existsSync(filePath)) {
        throw new Error(`规则文件已存在: ${outputPath}`);
      }
    }
  }

  await generateRulesFromTemplateNew(context, ruleName);
}

/**
 * 验证规则文件
 */
export async function validateRules(rulesDir: string): Promise<boolean> {
  try {
    // 检查基本目录结构
    const requiredDirs = ['basic', 'module', 'workflow'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(rulesDir, dir);
      if (!existsSync(dirPath)) {
        return false;
      }
    }

    const aiProtocolPath = path.join(rulesDir, 'ai.mdc');
    if (!existsSync(aiProtocolPath)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Rule validation failed:', error);
    return false;
  }
}

/**
 * 获取推荐的规则模板
 */
export async function getRecommendedRules(
  projectInfo: ProjectInfo
): Promise<string[]> {
  const templates: string[] = [];

  // 根据项目类型推荐
  switch (projectInfo.type) {
    case 'react':
      templates.push('react');
      break;
    case 'vue':
      templates.push('vue');
      break;
    case 'node':
      templates.push('node');
      break;
  }

  // 根据项目特征推荐
  if (projectInfo.hasTypeScript) {
    templates.push('typescript');
  }

  if (projectInfo.hasTests) {
    templates.push('testing');
  }

  // 工作流规范对所有项目都推荐
  templates.push('workflow');

  return templates;
}
