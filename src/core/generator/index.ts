import { getTemplate } from '@/templates/index';
import { ProjectInfo, RuleContext, RuleTemplate } from '@/types/index';
import { ensureDir, writeFile } from '@/utils/file';
import { existsSync } from 'fs';
import path from 'path';

/**
 * 生成规则文件
 */
export async function generateRules(
  context: RuleContext,
  templates: string[]
): Promise<void> {
  const { rulesDir } = context;

  // 确保规则目录存在
  await ensureDir(rulesDir);
  await ensureDir(path.join(rulesDir, 'basic'));
  await ensureDir(path.join(rulesDir, 'modules'));
  await ensureDir(path.join(rulesDir, 'workflow'));

  // 生成模板规则
  for (const templateName of templates) {
    try {
      const template = await getTemplate(templateName);
      await generateTemplateFiles(context, template);
    } catch (error) {
      console.error(`Failed to generate template ${templateName}:`, error);
    }
  }

  // 生成 AI 协作协议文件
  await generateAIProtocol(context);
}

/**
 * 生成模板文件
 */
async function generateTemplateFiles(
  context: RuleContext,
  template: RuleTemplate
): Promise<void> {
  const { rulesDir, projectInfo } = context;

  for (const file of template.files) {
    const filePath = path.join(rulesDir, file.path);

    // 处理模板变量
    let content = file.content;
    if (file.template && file.variables) {
      content = processTemplate(content, file.variables, projectInfo);
    }

    await writeFile(filePath, content);
  }
}

/**
 * 处理模板变量
 */
function processTemplate(
  content: string,
  variables: Record<string, any>,
  projectInfo: ProjectInfo
): string {
  let processedContent = content;

  // 替换项目相关变量
  const contextVars = {
    PROJECT_TYPE: projectInfo.type,
    FRAMEWORK: projectInfo.framework || '',
    LANGUAGE: projectInfo.language,
    HAS_TYPESCRIPT: projectInfo.hasTypeScript,
    HAS_TESTS: projectInfo.hasTests,
    PACKAGE_MANAGER: projectInfo.packageManager,
    ...variables,
  };

  // 替换所有变量
  for (const [key, value] of Object.entries(contextVars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processedContent = processedContent.replace(regex, String(value));
  }

  return processedContent;
}

/**
 * 生成 AI 协作协议
 */
async function generateAIProtocol(context: RuleContext): Promise<void> {
  const { rulesDir, projectInfo } = context;

  const protocol = `# AI协作执行规则

## 项目信息
- 项目类型: ${projectInfo.type}
- 框架: ${projectInfo.framework || '无'}
- 语言: ${projectInfo.language}
- TypeScript: ${projectInfo.hasTypeScript ? '是' : '否'}
- 测试框架: ${projectInfo.hasTests ? '是' : '否'}
- 包管理器: ${projectInfo.packageManager}

## 规则分类说明
- **basic/**: 通用基础规范，必须调用
- **modules/**: 架构分层规范，按需调用
- **workflow/**: 业务场景规范，按需调用

## 执行流程
1. **识别场景** → 调用相关规则
2. **读取示例代码** → 作为生成参考
3. **执行强制/禁止行为** → 确保代码质量
4. **应用设计原则** → 组件化、单一职责、分层设计

## 质量保障
- 所有规则必须100%执行
- 重点关注强制行为和禁止行为
- 参考示例代码风格
- 遵循项目架构模式

## 规则优先级
1. 项目特定规则 (workflow/)
2. 模块架构规则 (modules/)
3. 基础通用规则 (basic/)

生成时间: ${new Date().toISOString()}
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
  try {
    const template = await getTemplate(ruleName);

    // 检查是否已存在
    if (!force) {
      for (const file of template.files) {
        const filePath = path.join(context.rulesDir, file.path);
        if (existsSync(filePath)) {
          throw new Error(`Rule ${ruleName} already exists: ${filePath}`);
        }
      }
    }

    await generateTemplateFiles(context, template);
  } catch (error) {
    throw new Error(
      `Failed to add rule ${ruleName}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 验证规则文件
 */
export async function validateRules(rulesDir: string): Promise<boolean> {
  try {
    // 检查基本目录结构
    const requiredDirs = ['basic', 'modules', 'workflow'];
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
