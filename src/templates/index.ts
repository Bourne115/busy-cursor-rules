import type { ProjectInfo, TemplateProcessResult } from '@/types/index';
import { RuleTemplate } from '@/types/index';
import {
  getAllTemplateConfigs,
  loadTemplateConfig,
  processTemplate,
  type TemplateConfiguration,
} from './loader';
import {
  templateAdapter,
  getTemplate as getAdaptedTemplate,
  getAllTemplates as getAllAdaptedTemplates,
  hasTemplate as hasAdaptedTemplate,
  getTemplateList as getAdaptedTemplateList,
} from './adapter';

/**
 * 获取模板
 */
export async function getTemplate(
  templateId: string,
  projectInfo?: ProjectInfo
): Promise<RuleTemplate> {
  try {
    return await getAdaptedTemplate(templateId, projectInfo);
  } catch (error) {
    throw new Error(`Template not found: ${templateId}`);
  }
}

/**
 * 获取所有模板
 */
export async function getAllTemplates(
  projectInfo?: ProjectInfo
): Promise<RuleTemplate[]> {
  try {
    return await getAllAdaptedTemplates(projectInfo);
  } catch (error) {
    console.warn('Failed to load templates:', error);
    return [];
  }
}

/**
 * 检查模板是否存在
 */
export async function hasTemplate(
  templateId: string,
  projectInfo?: ProjectInfo
): Promise<boolean> {
  try {
    return await hasAdaptedTemplate(templateId, projectInfo);
  } catch {
    return false;
  }
}

/**
 * 获取模板列表（简化信息）
 */
export async function getTemplateList(): Promise<
  Array<{ id: string; name: string; description: string }>
> {
  try {
    return await getAdaptedTemplateList();
  } catch (error) {
    console.warn('获取模板列表失败:', error);
    return [];
  }
}

/**
 * 处理模板并生成规则文件
 */
export async function generateRulesFromTemplate(
  templateId: string,
  projectInfo: ProjectInfo,
  variables?: Record<string, any>
): Promise<TemplateProcessResult> {
  return await processTemplate(templateId, projectInfo, variables);
}

/**
 * 获取模板配置
 */
export async function getTemplateConfiguration(
  templateId: string
): Promise<TemplateConfiguration> {
  return await loadTemplateConfig(templateId);
}

/**
 * 获取所有可用的模板配置
 */
export async function getAllTemplateConfigurations(): Promise<
  TemplateConfiguration[]
> {
  return await getAllTemplateConfigs();
}

/**
 * 清理所有缓存
 */
export function clearAllCaches(): void {
  templateAdapter.clearCache();
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): {
  adapter: { entries: number; keys: string[] };
  loader: { templates: number; files: number };
} {
  return {
    adapter: templateAdapter.getCacheStats(),
    loader: { templates: 0, files: 0 },
  };
}

// 导出适配器实例
export { templateAdapter };

// 默认导出
export default {
  getTemplate,
  getAllTemplates,
  hasTemplate,
  getTemplateList,
  generateRulesFromTemplate,
  getTemplateConfiguration,
  getAllTemplateConfigurations,
};
