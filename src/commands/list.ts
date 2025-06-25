import chalk from 'chalk';
import { getTemplateList } from '@/templates/index';

interface ListOptions {
  installed?: boolean;
  category?: string;
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
    
    // 显示模板列表
    filteredTemplates.forEach(template => {
      console.log(`${chalk.green('✓')} ${chalk.bold(template.name)}`);
      console.log(`  ${chalk.gray(template.description)}`);
      console.log(`  ${chalk.blue(`ID: ${template.id}`)}\n`);
    });
    
    console.log(chalk.cyan('💡 使用方法:'));
    console.log(`  ${chalk.green('cursor-rules add <rule-id>')} 添加规则`);
    console.log(`  ${chalk.green('cursor-rules init --template=<rule-id>')} 使用模板初始化`);
    
  } catch (error) {
    console.error(chalk.red('获取规则列表失败:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
} 