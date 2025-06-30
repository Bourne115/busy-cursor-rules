import { addRule } from '@/core/generator/index';
import { detectProject } from '@/core/detector/index';
import { getTemplateList } from '@/templates/index';
import { RuleContext } from '@/types/index';
import { getGlobalConfig } from '@/utils/config';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';

interface AddOptions {
  force?: boolean;
}

/**
 * 添加规则命令
 */
export async function addCommand(
  ruleName: string,
  options: AddOptions
): Promise<void> {
  const spinner = ora(`添加规则 "${ruleName}"...`).start();

  try {
    const projectRoot = process.cwd();
    const rulesDir = path.join(projectRoot, '.cursor', 'rules');

    // 检测项目信息
    const projectInfo = await detectProject(projectRoot);
    const config = await getGlobalConfig();

    // 创建规则上下文
    const context: RuleContext = {
      projectRoot,
      projectInfo,
      rulesDir,
      config,
    };

    // 验证规则是否存在
    const availableTemplates = await getTemplateList();
    const template = availableTemplates.find(t => t.id === ruleName);

    if (!template) {
      spinner.fail(chalk.red(`规则 "${ruleName}" 不存在`));

      console.log(chalk.yellow('\n📋 可用的规则:'));
      availableTemplates.forEach(t => {
        console.log(`  • ${chalk.blue(t.id)} - ${t.name}`);
      });

      process.exit(1);
    }

    // 添加规则
    await addRule(context, ruleName, options.force || false);

    spinner.succeed(chalk.green(`规则 "${ruleName}" 添加成功！`));

    // 显示规则信息
    displayRuleInfo(template, projectInfo);

    // 显示相关建议
    displayRelatedSuggestions(template, projectInfo, availableTemplates);
  } catch (error) {
    spinner.fail(chalk.red('添加规则失败'));
    console.error(
      chalk.red('错误详情:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * 显示规则信息
 */
function displayRuleInfo(template: any, projectInfo: any): void {
  console.log(chalk.cyan(`\n📋 规则信息: ${template.id}`));
  console.log(`  名称: ${chalk.bold(template.name)}`);
  console.log(`  描述: ${template.description}`);

  // 显示项目兼容性
  const isRelevant = isTemplateRelevantForProject(template.id, projectInfo);
  console.log(
    `  兼容性: ${isRelevant ? chalk.green('✓ 适用') : chalk.yellow('? 通用')}`
  );
}

/**
 * 显示相关建议
 */
function displayRelatedSuggestions(
  addedTemplate: any,
  projectInfo: any,
  availableTemplates: any[]
): void {
  const suggestions = getRelatedTemplates(
    addedTemplate.id,
    projectInfo,
    availableTemplates
  );

  if (suggestions.length > 0) {
    console.log(chalk.cyan('\n💡 您可能还需要这些规则:'));
    suggestions.slice(0, 3).forEach(template => {
      const relevance = isTemplateRelevantForProject(template.id, projectInfo)
        ? '适用'
        : '通用';
      console.log(
        `  • ${chalk.blue(template.id)} - ${template.name} ${chalk.gray(`(${relevance})`)}`
      );
    });
  }

  console.log(
    chalk.gray('\n提示: 使用 cursor-rules add <rule-name> 添加更多规则')
  );
}

/**
 * 获取相关模板建议
 */
function getRelatedTemplates(
  addedTemplateId: string,
  projectInfo: any,
  availableTemplates: any[]
): any[] {
  const related: any[] = [];

  // 根据添加的模板推荐相关模板
  switch (addedTemplateId) {
    case 'react':
      related.push(
        ...availableTemplates.filter(t =>
          ['typescript', 'testing'].includes(t.id)
        )
      );
      break;
    case 'vue':
      related.push(
        ...availableTemplates.filter(t =>
          ['typescript', 'testing'].includes(t.id)
        )
      );
      break;
    case 'node':
      related.push(
        ...availableTemplates.filter(t =>
          ['typescript', 'testing'].includes(t.id)
        )
      );
      break;
    case 'typescript':
      related.push(
        ...availableTemplates.filter(t =>
          ['testing', 'workflow'].includes(t.id)
        )
      );
      break;
    default:
      // 为其他模板推荐工作流规范
      related.push(...availableTemplates.filter(t => t.id === 'workflow'));
      break;
  }

  // 根据项目特征推荐
  if (projectInfo.hasTypeScript && !related.some(t => t.id === 'typescript')) {
    const tsTemplate = availableTemplates.find(t => t.id === 'typescript');
    if (tsTemplate) related.unshift(tsTemplate);
  }

  if (projectInfo.hasTests && !related.some(t => t.id === 'testing')) {
    const testTemplate = availableTemplates.find(t => t.id === 'testing');
    if (testTemplate) related.push(testTemplate);
  }

  // 排除已添加的模板
  return related.filter(t => t.id !== addedTemplateId);
}

/**
 * 判断模板是否与当前项目相关
 */
function isTemplateRelevantForProject(
  templateId: string,
  projectInfo: any
): boolean {
  switch (templateId) {
    case 'react':
      return projectInfo.type === 'react';
    case 'vue':
      return projectInfo.type === 'vue';
    case 'node':
      return projectInfo.type === 'node';
    case 'typescript':
      return projectInfo.hasTypeScript;
    case 'testing':
      return projectInfo.hasTests;
    case 'workflow':
      return true; // 工作流对所有项目都适用
    default:
      return false;
  }
}
