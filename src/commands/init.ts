import { detectProject } from '@/core/detector/index';
import { generateRules } from '@/core/generator/index';
import { getTemplateList } from '@/templates/index';
import { InitOptions, RuleContext } from '@/types/index';
import { getGlobalConfig } from '@/utils/config';
import { exists } from '@/utils/file';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';

/**
 * 初始化命令处理函数
 */
export async function initCommand(options: InitOptions): Promise<void> {
  const spinner = ora('分析项目...').start();

  try {
    const projectRoot = process.cwd();
    const rulesDir = path.join(projectRoot, '.cursor', 'rules');

    // 检查是否已经存在规则
    if (!options.force && (await exists(rulesDir))) {
      spinner.stop();
      const shouldOverwrite = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: '检测到已存在 Cursor Rules，是否覆盖？',
          default: false,
        },
      ]);

      if (!shouldOverwrite.overwrite) {
        console.log(chalk.yellow('操作已取消。'));
        return;
      }
    }

    // 检测项目信息
    spinner.text = '检测项目类型...';
    const projectInfo = await detectProject(projectRoot);

    // 获取全局配置
    const config = await getGlobalConfig();

    spinner.succeed(
      chalk.green(`项目检测完成: ${projectInfo.type} (${projectInfo.language})`)
    );

    // 显示项目分析结果
    displayProjectAnalysis(projectInfo);

    // 选择模板
    let selectedTemplates: string[];

    if (options.template) {
      // 使用指定的模板，支持逗号分隔的多个模板
      selectedTemplates = options.template.split(',').map(t => t.trim());
      console.log(chalk.blue(`使用指定模板: ${selectedTemplates.join(', ')}`));
    } else if (options.interactive === false) {
      // 非交互模式，使用基于项目类型的默认模板
      selectedTemplates = getDefaultTemplatesForProject(projectInfo);
      console.log(chalk.blue(`使用默认模板: ${selectedTemplates.join(', ')}`));
    } else {
      // 交互式选择模板
      selectedTemplates = await selectTemplates(projectInfo);
    }

    // 创建规则上下文
    const context: RuleContext = {
      projectRoot,
      projectInfo,
      rulesDir,
      config,
    };

    // 生成规则
    const generateSpinner = ora('生成规则文件...').start();
    let actualAppliedTemplates: string[] = [];

    try {
      const result = await generateRules(context, selectedTemplates);
      actualAppliedTemplates = result.successfulTemplates;

      if (result.failedTemplates.length > 0) {
        generateSpinner.warn(chalk.yellow('部分规则生成失败'));
        console.warn(
          chalk.yellow(`失败的模板: ${result.failedTemplates.join(', ')}`)
        );
        console.warn(chalk.yellow('成功的规则仍可正常使用'));
      } else {
        generateSpinner.succeed(chalk.green('规则文件生成完成！'));
      }
    } catch (generateError) {
      generateSpinner.fail(chalk.red('规则生成过程中遇到问题'));
      console.warn(
        chalk.yellow('部分规则可能未能成功生成，但基础功能仍可使用')
      );
      console.error(
        chalk.gray(
          '详细错误:',
          generateError instanceof Error ? generateError.message : generateError
        )
      );
      // 如果完全失败，至少显示预期的模板
      actualAppliedTemplates = selectedTemplates;
    }

    // 显示完成信息
    displayCompletionInfo(projectInfo, actualAppliedTemplates, rulesDir);
  } catch (error) {
    spinner.fail(chalk.red('初始化失败'));
    console.error(
      chalk.red('错误详情:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * 显示项目分析结果
 */
function displayProjectAnalysis(projectInfo: any): void {
  console.log(chalk.cyan('\n📊 项目分析结果:'));
  console.log(`  类型: ${chalk.green(projectInfo.type)}`);
  console.log(`  语言: ${chalk.green(projectInfo.language)}`);
  console.log(`  框架: ${chalk.green(projectInfo.framework || '无特定框架')}`);
  console.log(
    `  TypeScript: ${projectInfo.hasTypeScript ? chalk.green('✅') : chalk.gray('❌')}`
  );
  console.log(
    `  测试支持: ${projectInfo.hasTests ? chalk.green('✅') : chalk.gray('❌')}`
  );
  console.log(`  包管理器: ${chalk.green(projectInfo.packageManager)}`);
}

/**
 * 基于项目依赖分析获取推荐模板
 */
function getDefaultTemplatesForProject(projectInfo: any): string[] {
  const templates: string[] = [];
  const allDependencies = [
    ...projectInfo.dependencies,
    ...projectInfo.devDependencies,
  ].map((dep: string) => dep.toLowerCase());

  // 基于依赖分析推荐技术栈模板
  if (
    allDependencies.some(
      dep =>
        dep.includes('react') || dep.includes('next') || dep.includes('gatsby')
    )
  ) {
    templates.push('react');
  }

  if (
    allDependencies.some(
      dep =>
        dep.includes('vue') || dep.includes('nuxt') || dep.includes('quasar')
    )
  ) {
    templates.push('vue');
  }

  if (
    allDependencies.some(
      dep =>
        dep.includes('express') ||
        dep.includes('koa') ||
        dep.includes('fastify') ||
        dep.includes('nestjs') ||
        dep.includes('@nestjs') ||
        dep.includes('hapi')
    ) ||
    projectInfo.type === 'node'
  ) {
    templates.push('node');
  }

  // 基于项目特征和依赖推荐通用模板
  if (
    projectInfo.hasTypeScript ||
    allDependencies.some(
      dep => dep.includes('typescript') || dep.includes('@types/')
    )
  ) {
    templates.push('typescript');
  }

  if (
    projectInfo.hasTests ||
    allDependencies.some(
      dep =>
        dep.includes('jest') ||
        dep.includes('vitest') ||
        dep.includes('cypress') ||
        dep.includes('playwright') ||
        dep.includes('mocha') ||
        dep.includes('jasmine') ||
        dep.includes('@testing-library')
    )
  ) {
    templates.push('testing');
  }

  // 工作流规范对所有项目都有价值
  templates.push('workflow');

  return templates.length > 0 ? templates : ['workflow']; // 至少包含工作流规范
}

/**
 * 交互式模板选择
 */
async function selectTemplates(projectInfo: any): Promise<string[]> {
  const availableTemplates = await getTemplateList();

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'templates',
      message: '选择要使用的规则模板 (✓ 标记的是基于项目依赖的建议):',
      choices: availableTemplates.map((template: any) => {
        const isRecommended = isTemplateRecommendedForProject(
          template.id,
          projectInfo
        );

        return {
          name: isRecommended
            ? `${chalk.green('✓')} ${template.name} - ${template.description} ${chalk.gray('(建议)')}`
            : `  ${template.name} - ${template.description}`,
          value: template.id,
          checked: isRecommended,
        };
      }),
      validate: (input: string[]) => {
        return input.length > 0 ? true : '请至少选择一个模板';
      },
    },
  ]);

  return answers.templates;
}

/**
 * 判断模板是否推荐给当前项目
 */
function isTemplateRecommendedForProject(
  templateId: string,
  projectInfo: any
): boolean {
  const allDependencies = [
    ...projectInfo.dependencies,
    ...projectInfo.devDependencies,
  ].map((dep: string) => dep.toLowerCase());

  // 基于项目依赖进行智能推荐
  switch (templateId) {
    case 'react':
      return allDependencies.some(
        dep =>
          dep.includes('react') ||
          dep.includes('next') ||
          dep.includes('gatsby')
      );

    case 'vue':
      return allDependencies.some(
        dep =>
          dep.includes('vue') || dep.includes('nuxt') || dep.includes('quasar')
      );

    case 'node':
      return (
        allDependencies.some(
          dep =>
            dep.includes('express') ||
            dep.includes('koa') ||
            dep.includes('fastify') ||
            dep.includes('nestjs') ||
            dep.includes('@nestjs') ||
            dep.includes('hapi')
        ) || projectInfo.type === 'node'
      );

    case 'typescript':
      return (
        projectInfo.hasTypeScript ||
        allDependencies.some(
          dep => dep.includes('typescript') || dep.includes('@types/')
        )
      );

    case 'testing':
      return (
        projectInfo.hasTests ||
        allDependencies.some(
          dep =>
            dep.includes('jest') ||
            dep.includes('vitest') ||
            dep.includes('cypress') ||
            dep.includes('playwright') ||
            dep.includes('mocha') ||
            dep.includes('jasmine') ||
            dep.includes('@testing-library')
        )
      );

    case 'workflow':
      return true; // 工作流对所有项目都有价值

    default:
      return false;
  }
}

/**
 * 显示完成信息
 */
function displayCompletionInfo(
  projectInfo: any,
  selectedTemplates: string[],
  rulesDir: string
): void {
  console.log(chalk.green('\n🎉 Cursor Rules 初始化完成！'));

  console.log(chalk.cyan('\n📊 项目配置:'));
  console.log(`  类型: ${chalk.green(projectInfo.type)}`);
  console.log(`  语言: ${chalk.green(projectInfo.language)}`);
  console.log(`  框架: ${chalk.green(projectInfo.framework || '无')}`);
  console.log(`  包管理器: ${chalk.green(projectInfo.packageManager)}`);

  console.log(chalk.cyan('\n📋 已应用的规则:'));
  selectedTemplates.forEach(template => {
    console.log(`  ✅ ${chalk.blue(template)}`);
  });

  console.log(chalk.cyan('\n📁 文件位置:'));
  console.log(`  ${chalk.gray(rulesDir)}`);
  console.log(`  ${chalk.gray('├── basic/')}`);
  console.log(`  ${chalk.gray('├── modules/')}`);
  console.log(`  ${chalk.gray('├── workflow/')}`);
  console.log(`  ${chalk.gray('└── ai.mdc')}`);

  console.log(chalk.cyan('\n🚀 下一步操作:'));
  console.log('  1. 🔍 查看生成的规则文件了解规范');
  console.log('  2. ⚙️  根据团队需求自定义规则内容');
  console.log('  3. 🤖 开始享受智能AI辅助编程体验！');

  console.log(chalk.cyan('\n💡 实用命令:'));
  console.log(`  ${chalk.green('cursor-rules list')}     # 查看所有可用规则`);
  console.log(
    `  ${chalk.green('cursor-rules add <rule>')}  # 添加特定规则到项目`
  );
  console.log(`  ${chalk.green('cursor-rules config')}   # 管理全局配置`);

  console.log(chalk.gray('\n⚡ 提示: 重启 Cursor IDE 以确保新规则生效'));
}
