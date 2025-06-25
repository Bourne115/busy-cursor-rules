import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { InitOptions, RuleContext } from '@/types/index';
import { detectProject, getRecommendedTemplates } from '@/core/detector/index';
import { generateRules } from '@/core/generator/index';
import { getGlobalConfig } from '@/utils/config';
import { getTemplateList } from '@/templates/index';
import { exists } from '@/utils/file';

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

    // 获取推荐模板
    const recommendedTemplates = getRecommendedTemplates(projectInfo);

    spinner.succeed(
      chalk.green(`项目检测完成: ${projectInfo.type} (${projectInfo.language})`)
    );

    // 选择模板
    let selectedTemplates: string[];

    if (options.template) {
      // 使用指定的模板
      selectedTemplates = [options.template];
      console.log(chalk.blue(`使用指定模板: ${options.template}`));
    } else if (options.interactive === false) {
      // 非交互模式，使用推荐模板
      selectedTemplates = recommendedTemplates;
      console.log(
        chalk.blue(`使用推荐模板: ${recommendedTemplates.join(', ')}`)
      );
    } else {
      // 交互式选择模板
      selectedTemplates = await selectTemplates(recommendedTemplates);
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
    await generateRules(context, selectedTemplates);
    generateSpinner.succeed(chalk.green('规则文件生成完成！'));

    // 显示完成信息
    displayCompletionInfo(projectInfo, selectedTemplates, rulesDir);
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
 * 交互式选择模板
 */
async function selectTemplates(
  recommendedTemplates: string[]
): Promise<string[]> {
  const availableTemplates = await getTemplateList();

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'templates',
      message: '选择要使用的规则模板:',
      choices: availableTemplates.map(template => ({
        name: `${template.name} - ${template.description}`,
        value: template.id,
        checked: recommendedTemplates.includes(template.id),
      })),
      validate: (input: string[]) => {
        return input.length > 0 ? true : '请至少选择一个模板';
      },
    },
    {
      type: 'confirm',
      name: 'includeWorkflow',
      message: '是否包含工作流规则？',
      default: true,
    },
  ]);

  const templates = answers.templates;

  // 如果选择包含工作流规则，添加基础工作流模板
  if (answers.includeWorkflow) {
    templates.push('workflow-basic');
  }

  return templates;
}

/**
 * 显示完成信息
 */
function displayCompletionInfo(
  projectInfo: any,
  selectedTemplates: string[],
  rulesDir: string
): void {
  console.log(chalk.green('\n✅ Cursor Rules 初始化完成！'));

  console.log(chalk.cyan('\n📊 项目信息:'));
  console.log(`  类型: ${projectInfo.type}`);
  console.log(`  语言: ${projectInfo.language}`);
  console.log(`  框架: ${projectInfo.framework || '无'}`);
  console.log(`  包管理器: ${projectInfo.packageManager}`);

  console.log(chalk.cyan('\n📋 生成的规则:'));
  selectedTemplates.forEach(template => {
    console.log(`  ✓ ${template}`);
  });

  console.log(chalk.cyan('\n📁 文件位置:'));
  console.log(`  ${rulesDir}`);

  console.log(chalk.cyan('\n🚀 下一步:'));
  console.log('  1. 查看生成的规则文件');
  console.log('  2. 根据项目需求自定义规则');
  console.log('  3. 开始享受 AI 辅助编程！');

  console.log(chalk.cyan('\n💡 提示:'));
  console.log(`  - 运行 ${chalk.green('cursor-rules list')} 查看所有可用规则`);
  console.log(
    `  - 运行 ${chalk.green('cursor-rules add <rule-name>')} 添加更多规则`
  );
  console.log(`  - 运行 ${chalk.green('cursor-rules config')} 管理配置`);
}
