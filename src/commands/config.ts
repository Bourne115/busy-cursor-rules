import chalk from 'chalk';
import { ConfigOptions } from '@/types/index';
import { getGlobalConfig, saveGlobalConfig, resetConfig } from '@/utils/config';

/**
 * 配置管理命令
 */
export async function configCommand(
  options: ConfigOptions & { set?: string; get?: string }
): Promise<void> {
  try {
    if (options.reset) {
      await resetConfig();
      console.log(chalk.green('配置已重置为默认值'));
      return;
    }

    if (options.set) {
      const [key, value] = options.set.split('=');
      if (!key || value === undefined) {
        console.error(chalk.red('格式错误，请使用: --set key=value'));
        return;
      }

      const config = await getGlobalConfig();
      (config as any)[key] =
        value === 'true' ? true : value === 'false' ? false : value;
      await saveGlobalConfig(config);
      console.log(chalk.green(`配置已保存: ${key} = ${value}`));
      return;
    }

    if (options.get) {
      const config = await getGlobalConfig();
      const value = (config as any)[options.get];
      console.log(chalk.blue(`${options.get}: ${value}`));
      return;
    }

    // 显示所有配置
    const config = await getGlobalConfig();
    console.log(chalk.cyan('⚙️ 当前配置:\n'));

    Object.entries(config).forEach(([key, value]) => {
      console.log(`${chalk.blue(key)}: ${chalk.white(JSON.stringify(value))}`);
    });

    console.log(chalk.cyan('\n💡 配置管理:'));
    console.log(
      `  ${chalk.green('cursor-rules config --set key=value')} 设置配置`
    );
    console.log(`  ${chalk.green('cursor-rules config --get key')} 获取配置`);
    console.log(`  ${chalk.green('cursor-rules config --reset')} 重置配置`);
  } catch (error) {
    console.error(
      chalk.red('配置操作失败:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
