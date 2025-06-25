import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from '@/commands/init';
import { addCommand } from '@/commands/add';
import { listCommand } from '@/commands/list';
import { configCommand } from '@/commands/config';

const program = new Command();

// 设置CLI基本信息
program
  .name('cursor-rules')
  .description('Cursor Rules 智能管理工具 - 生成、管理和优化 Cursor IDE AI 协作规范')
  .version('1.0.0')
  .addHelpText('after', `
${chalk.cyan('示例用法:')}
  ${chalk.green('cursor-rules init')}           初始化项目规则
  ${chalk.green('cursor-rules init --template=react')}  使用指定模板初始化
  ${chalk.green('cursor-rules add typescript')}  添加TypeScript规则
  ${chalk.green('cursor-rules list')}           查看所有可用规则
  ${chalk.green('cursor-rules config')}         配置管理

${chalk.cyan('更多信息:')}
  文档: https://github.com/cursor-rules/cursor-rules-cli
  问题反馈: https://github.com/cursor-rules/cursor-rules-cli/issues
`);

// 初始化命令
program
  .command('init')
  .description('为当前项目初始化 Cursor Rules')
  .option('-t, --template <template>', '指定模板类型 (react, vue, node, typescript)')
  .option('-f, --force', '强制覆盖已存在的规则文件')
  .option('--no-interactive', '非交互模式，使用默认选项')
  .action(initCommand);

// 添加规则命令
program
  .command('add')
  .description('添加特定规则到项目')
  .argument('<rule-name>', '要添加的规则名称')
  .option('-f, --force', '强制覆盖已存在的规则')
  .option('-c, --category <category>', '指定规则分类')
  .action(addCommand);

// 列出规则命令
program
  .command('list')
  .description('列出所有可用的规则模板')
  .option('-i, --installed', '只显示已安装的规则')
  .option('-c, --category <category>', '按分类筛选')
  .action(listCommand);

// 配置管理命令
program
  .command('config')
  .description('配置管理')
  .option('-g, --global', '管理全局配置')
  .option('-s, --set <key=value>', '设置配置项')
  .option('-g, --get <key>', '获取配置项')
  .option('--reset', '重置为默认配置')
  .action(configCommand);

// 更新命令
program
  .command('update')
  .description('更新规则到最新版本')
  .option('-a, --all', '更新所有规则')
  .action(async (options) => {
    console.log(chalk.yellow('更新功能即将推出...'));
  });

// 分享命令
program
  .command('share')
  .description('分享当前项目的规则配置')
  .action(async () => {
    console.log(chalk.yellow('分享功能即将推出...'));
  });

// 错误处理
program.configureOutput({
  writeErr: (str) => console.error(chalk.red(str)),
  outputError: (str, write) => write(chalk.red(str))
});

// 添加全局错误处理
process.on('uncaughtException', (error) => {
  console.error(chalk.red('发生了未预期的错误:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('未处理的Promise拒绝:'), reason);
  process.exit(1);
});

// 解析命令行参数
program.parse(); 