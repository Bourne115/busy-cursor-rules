import os from 'os';
import path from 'path';
import { GlobalConfig } from '@/types/index';
import { readJson, writeJson, exists } from './file';

const CONFIG_DIR = path.join(os.homedir(), '.cursor-rules');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// 默认配置
const DEFAULT_CONFIG: GlobalConfig = {
  preferredTemplates: [],
  autoUpdate: true,
  language: 'en',
  registryUrl: 'https://api.cursor-rules.com',
  customTemplatePath: undefined,
};

/**
 * 获取全局配置
 */
export async function getGlobalConfig(): Promise<GlobalConfig> {
  try {
    if (await exists(CONFIG_FILE)) {
      const config = await readJson<GlobalConfig>(CONFIG_FILE);
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.warn('Failed to read config file, using defaults');
  }

  return DEFAULT_CONFIG;
}

/**
 * 保存全局配置
 */
export async function saveGlobalConfig(
  config: Partial<GlobalConfig>
): Promise<void> {
  const currentConfig = await getGlobalConfig();
  const newConfig = { ...currentConfig, ...config };
  await writeJson(CONFIG_FILE, newConfig);
}

/**
 * 重置配置为默认值
 */
export async function resetConfig(): Promise<void> {
  await writeJson(CONFIG_FILE, DEFAULT_CONFIG);
}

/**
 * 获取配置目录
 */
export function getConfigDir(): string {
  return CONFIG_DIR;
}

/**
 * 获取项目配置
 */
export async function getProjectConfig(projectRoot: string): Promise<any> {
  const configPath = path.join(projectRoot, '.cursor-rules.json');

  if (await exists(configPath)) {
    return readJson(configPath);
  }

  return {};
}

/**
 * 保存项目配置
 */
export async function saveProjectConfig(
  projectRoot: string,
  config: any
): Promise<void> {
  const configPath = path.join(projectRoot, '.cursor-rules.json');
  await writeJson(configPath, config);
}
