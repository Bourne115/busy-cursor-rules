import chalk from 'chalk';
import ora from 'ora';
import { AddOptions, RuleContext } from '@/types/index';
import { addRule } from '@/core/generator/index';
import { detectProject } from '@/core/detector/index';
import { getGlobalConfig } from '@/utils/config';
import { hasTemplate } from '@/templates/index';
import path from 'path';

/**
 * 添加规则命令
 */
export async function addCommand(ruleName: string, options: AddOptions): Promise<void> {
  const spinner = ora(`添加规则 ${ruleName}...`).start();
  
  try {
    // 检查规则是否存在
    if (!hasTemplate(ruleName)) {
      spinner.fail(chalk.red(`规则 "${ruleName}" 不存在`));
      console.log(chalk.yellow('运行 cursor-rules list 查看所有可用规则'));
      return;
    }
    
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
      config
    };
    
    // 添加规则
    await addRule(context, ruleName, options.force);
    
    spinner.succeed(chalk.green(`规则 "${ruleName}" 添加成功！`));
    
  } catch (error) {
    spinner.fail(chalk.red(`添加规则失败`));
    console.error(chalk.red('错误详情:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
} 