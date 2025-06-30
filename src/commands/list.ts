import chalk from 'chalk';
import { getTemplateList } from '@/templates/index';
import { detectProject } from '@/core/detector/index';

interface ListOptions {
  installed?: boolean;
  category?: string;
  detailed?: boolean;
}

/**
 * 列出规则命令
 */
export async function listCommand(options: ListOptions): Promise<void> {
  try {
    console.log(chalk.cyan('📋 可用的规则模板:\n'));

    const templates = await getTemplateList();

    // 按分类筛选
    const filteredTemplates = options.category
      ? templates.filter(t => t.id.includes(options.category!))
      : templates;

    if (filteredTemplates.length === 0) {
      console.log(chalk.yellow('没有找到匹配的规则模板'));
      return;
    }

    // 尝试检测项目信息用于显示
    let projectInfo: any = null;
    try {
      projectInfo = await detectProject(process.cwd());
      console.log(chalk.blue(`📁 当前项目: ${projectInfo.type} (${projectInfo.language})\n`));
    } catch (error) {
      console.log(chalk.gray('💡 在项目目录中运行可显示项目信息\n'));
    }

    // 按类别分组显示
    const groupedTemplates = groupTemplatesByCategory(filteredTemplates);

    if (groupedTemplates.basic.length > 0) {
      console.log(chalk.green('📚 基础规范:'));
      groupedTemplates.basic.forEach(template => displayTemplate(template, projectInfo));
      console.log();
    }

    if (groupedTemplates.module.length > 0) {
      console.log(chalk.blue('🔧 技术栈规范:'));
      groupedTemplates.module.forEach(template => displayTemplate(template, projectInfo));
      console.log();
    }

    if (groupedTemplates.workflow.length > 0) {
      console.log(chalk.magenta('⚡ 工作流规范:'));
      groupedTemplates.workflow.forEach(template => displayTemplate(template, projectInfo));
      console.log();
    }

    console.log(chalk.cyan('💡 使用方法:'));
    console.log(`  ${chalk.green('cursor-rules add <rule-id>')} 添加单个规则`);
    console.log(`  ${chalk.green('cursor-rules init')} 初始化项目规则`);
    console.log(`  ${chalk.green('cursor-rules list --category=<type>')} 按分类筛选`);

    console.log(chalk.cyan(`\n📊 统计: 共 ${filteredTemplates.length} 个可用模板`));
  } catch (error) {
    console.error(
      chalk.red('获取规则列表失败:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * 按类别分组模板
 */
function groupTemplatesByCategory(templates: Array<{ id: string; name: string; description: string; category?: string }>) {
  const grouped = {
    basic: [] as typeof templates,
    module: [] as typeof templates,
    workflow: [] as typeof templates,
  };

  templates.forEach(template => {
    // 根据模板ID或category字段判断类别
    if (template.id === 'typescript' || template.category === 'basic') {
      grouped.basic.push(template);
    } else if (['react', 'vue', 'node'].includes(template.id) || template.category === 'module') {
      grouped.module.push(template);
    } else if (['workflow', 'testing'].includes(template.id) || template.category === 'workflow') {
      grouped.workflow.push(template);
    } else {
      // 默认归类到module
      grouped.module.push(template);
    }
  });

  return grouped;
}

/**
 * 显示单个模板信息
 */
function displayTemplate(
  template: { id: string; name: string; description: string },
  projectInfo: any
): void {
  let prefix = chalk.gray('•');
  let suffix = '';

  // 如果有项目信息，显示相关性
  if (projectInfo) {
    if (isTemplateRelevantForProject(template.id, projectInfo)) {
      prefix = chalk.green('✓');
      suffix = chalk.dim(' (适用)');
    }
  }

  console.log(`${prefix} ${chalk.bold(template.name)} ${chalk.gray(`(${template.id})`)}${suffix}`);
  console.log(`  ${chalk.gray(template.description)}`);
}

/**
 * 判断模板是否与当前项目相关
 */
function isTemplateRelevantForProject(templateId: string, projectInfo: any): boolean {
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
