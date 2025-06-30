import type { RuleTemplate, ProjectInfo, LoadOptions } from '@/types/index';
import {
  loadTemplateConfig,
  processTemplate,
  getAllTemplateConfigs,
} from './loader';

/**
 * 模板适配器类
 */
export class TemplateAdapter {
  private cache = new Map<string, RuleTemplate>();

  /**
   * 将 TemplateConfiguration 转换为 RuleTemplate 格式
   */
  async adaptToLegacyFormat(
    templateId: string,
    projectInfo: ProjectInfo,
    options: LoadOptions = {}
  ): Promise<RuleTemplate> {
    // 检查缓存
    const cacheKey = `${templateId}_${projectInfo.type}_${projectInfo.language}`;
    if (options.useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // 加载配置
      const config = await loadTemplateConfig(templateId, options);

      // 处理模板生成实际内容
      const result = await processTemplate(
        templateId,
        projectInfo,
        {},
        options
      );

      if (!result.success) {
        throw new Error(`模板处理失败: ${result.errors?.join(', ')}`);
      }

      // 转换为旧格式
      const legacyTemplate: RuleTemplate = {
        id: config.id,
        name: config.name,
        description: config.description,
        version: config.version,
        category: config.category,
        tags: config.tags,
        author: config.author,
        files: result.files.map(file => ({
          path: file.path,
          content: file.content,
          template: true,
          variables: result.variables,
        })),
        dependencies: config.dependencies,
        config: {
          framework: config.compatibility.frameworks?.[0],
          language: config.compatibility.languages[0],
          features: config.tags,
          customOptions: result.variables,
        },
      };

      // 缓存结果
      if (options.useCache) {
        this.cache.set(cacheKey, legacyTemplate);
      }

      return legacyTemplate;
    } catch (error) {
      console.error(`适配模板失败 ${templateId}:`, error);

      // 返回一个基本的适配版本
      const fallbackConfig = await loadTemplateConfig(templateId, {
        ...options,
        validateSchema: false,
      });

      return {
        id: fallbackConfig.id,
        name: fallbackConfig.name,
        description: fallbackConfig.description,
        version: fallbackConfig.version,
        category: fallbackConfig.category,
        tags: fallbackConfig.tags,
        author: fallbackConfig.author,
        files: [],
        dependencies: fallbackConfig.dependencies,
        config: {
          framework: fallbackConfig.compatibility.frameworks?.[0],
          language: fallbackConfig.compatibility.languages[0],
          features: fallbackConfig.tags,
        },
      };
    }
  }

  /**
   * 批量适配多个模板
   */
  async adaptMultipleTemplates(
    templateIds: string[],
    projectInfo: ProjectInfo,
    options: LoadOptions = {}
  ): Promise<RuleTemplate[]> {
    const adaptPromises = templateIds.map(id =>
      this.adaptToLegacyFormat(id, projectInfo, options)
    );

    const results = await Promise.allSettled(adaptPromises);
    const adaptedTemplates: RuleTemplate[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        adaptedTemplates.push(result.value);
      } else {
        console.warn(`适配模板失败 ${templateIds[index]}:`, result.reason);
      }
    });

    return adaptedTemplates;
  }

  /**
   * 获取所有可用模板
   */
  async getAllLegacyTemplates(
    projectInfo?: ProjectInfo,
    options: LoadOptions = {}
  ): Promise<RuleTemplate[]> {
    try {
      const configs = await getAllTemplateConfigs(options);

      if (!projectInfo) {
        // 创建一个通用的项目信息用于适配
        projectInfo = {
          type: 'generic',
          language: 'javascript',
          packageManager: 'npm',
          dependencies: [],
          devDependencies: [],
          hasTypeScript: false,
          hasTests: false,
        };
      }

      return await this.adaptMultipleTemplates(
        configs.map(c => c.id),
        projectInfo,
        options
      );
    } catch (error) {
      console.error('获取模板列表失败:', error);
      return [];
    }
  }

  /**
   * 检查模板是否存在
   */
  async isTemplateAvailable(
    templateId: string,
    projectInfo?: ProjectInfo,
    options: LoadOptions = {}
  ): Promise<boolean> {
    try {
      await loadTemplateConfig(templateId, options);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 清理适配器缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { entries: number; keys: string[] } {
    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 创建全局适配器实例
const templateAdapter = new TemplateAdapter();

/**
 * 便捷函数：获取模板
 */
export async function getTemplate(
  templateId: string,
  projectInfo?: ProjectInfo,
  options: LoadOptions = {}
): Promise<RuleTemplate> {
  const defaultProjectInfo: ProjectInfo = projectInfo || {
    type: 'generic',
    language: 'javascript',
    packageManager: 'npm',
    dependencies: [],
    devDependencies: [],
    hasTypeScript: false,
    hasTests: false,
  };

  return await templateAdapter.adaptToLegacyFormat(
    templateId,
    defaultProjectInfo,
    options
  );
}

/**
 * 便捷函数：获取所有模板
 */
export async function getAllTemplates(
  projectInfo?: ProjectInfo,
  options: LoadOptions = {}
): Promise<RuleTemplate[]> {
  return await templateAdapter.getAllLegacyTemplates(projectInfo, options);
}

/**
 * 便捷函数：检查模板是否存在
 */
export async function hasTemplate(
  templateId: string,
  projectInfo?: ProjectInfo,
  options: LoadOptions = {}
): Promise<boolean> {
  return await templateAdapter.isTemplateAvailable(
    templateId,
    projectInfo,
    options
  );
}

/**
 * 便捷函数：获取模板列表（简化信息）
 */
export async function getTemplateList(
  options: LoadOptions = {}
): Promise<Array<{ id: string; name: string; description: string }>> {
  try {
    const configs = await getAllTemplateConfigs(options);
    return configs.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
    }));
  } catch (error) {
    console.error('获取模板列表失败:', error);
    return [];
  }
}

// 导出适配器实例
export { templateAdapter };
export default templateAdapter;
