import type {
  ProjectInfo,
  TemplateConfiguration,
  TemplateProcessResult,
  VariableContext,
  LoadOptions,
  ConditionContext,
  ValidationResult,
  CacheEntry,
  GeneratedFile,
  ProcessMetadata,

  VariableDefinition,
} from '@/types/index';
import {
  TemplateError,
  CompatibilityError,
  TemplateValidationError,
} from '@/types/index';
import { promises as fs } from 'fs';
import * as fsExtra from 'fs-extra';
import { glob } from 'glob';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 重新导出类型以便其他模块使用
export type { TemplateConfiguration } from '@/types/index';

// 模板目录路径 - 修复ES模块中的__dirname问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用相对于dist目录的路径，因为tsup已经将静态文件复制到了dist目录
const RULES_DIR = path.join(__dirname, 'rules');
const CONFIGS_DIR = path.join(__dirname, 'configs');

// 缓存管理
class TemplateCache {
  private cache = new Map<string, CacheEntry<TemplateConfiguration>>();
  private fileCache = new Map<string, CacheEntry<string>>();
  private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10分钟

  get<T>(key: string, cache: Map<string, CacheEntry<T>>): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, cache: Map<string, CacheEntry<T>>, ttl = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    cache.set(key, entry);
  }

  getTemplate(templateId: string): TemplateConfiguration | null {
    return this.get(templateId, this.cache);
  }

  setTemplate(templateId: string, config: TemplateConfiguration): void {
    this.set(templateId, config, this.cache);
  }

  getFile(filePath: string): string | null {
    return this.get(filePath, this.fileCache);
  }

  setFile(filePath: string, content: string): void {
    this.set(filePath, content, this.fileCache);
  }

  clear(): void {
    this.cache.clear();
    this.fileCache.clear();
  }

  size(): { templates: number; files: number } {
    return {
      templates: this.cache.size,
      files: this.fileCache.size,
    };
  }
}

const templateCache = new TemplateCache();

/**
 * 验证模板配置
 */
export function validateTemplateConfig(config: any): ValidationResult {
  const errors: any[] = [];
  const warnings: any[] = [];

  // 必需字段检查
  const requiredFields = ['id', 'name', 'description', 'version', 'category', 'author', 'compatibility', 'rules'];
  for (const field of requiredFields) {
    if (!config[field]) {
      errors.push({
        field,
        message: `缺少必需字段: ${field}`,
        code: 'MISSING_REQUIRED_FIELD',
      });
    }
  }

  // 验证 category
  if (config.category && !['basic', 'module', 'workflow'].includes(config.category)) {
    errors.push({
      field: 'category',
      message: `无效的分类: ${config.category}`,
      code: 'INVALID_CATEGORY',
    });
  }

  // 验证 compatibility
  if (config.compatibility) {
    if (!Array.isArray(config.compatibility.projectTypes)) {
      errors.push({
        field: 'compatibility.projectTypes',
        message: '项目类型必须是数组',
        code: 'INVALID_PROJECT_TYPES',
      });
    }
    if (!Array.isArray(config.compatibility.languages)) {
      errors.push({
        field: 'compatibility.languages',
        message: '语言列表必须是数组',
        code: 'INVALID_LANGUAGES',
      });
    }
  }

  // 验证 rules
  if (config.rules && Array.isArray(config.rules)) {
    config.rules.forEach((rule: any, index: number) => {
      if (!rule.name || !rule.file) {
        errors.push({
          field: `rules[${index}]`,
          message: '规则必须包含 name 和 file 字段',
          code: 'INVALID_RULE',
        });
      }
    });
  }

  // 验证变量定义
  if (config.variables) {
    Object.entries(config.variables).forEach(([key, variable]: [string, any]) => {
      if (typeof variable === 'object' && variable.type) {
        if (!['string', 'boolean', 'number', 'enum'].includes(variable.type)) {
          errors.push({
            field: `variables.${key}.type`,
            message: `无效的变量类型: ${variable.type}`,
            code: 'INVALID_VARIABLE_TYPE',
          });
        }
        if (variable.type === 'enum' && !Array.isArray(variable.enum)) {
          errors.push({
            field: `variables.${key}.enum`,
            message: '枚举类型必须提供 enum 数组',
            code: 'MISSING_ENUM_VALUES',
          });
        }
      }
    });
  }

  // 版本格式警告
  if (config.version && !/^\d+\.\d+\.\d+/.test(config.version)) {
    warnings.push({
      field: 'version',
      message: '建议使用语义化版本号 (x.y.z)',
      suggestion: '例如: 1.0.0',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 加载模板配置文件
 */
export async function loadTemplateConfig(
  templateId: string,
  options: LoadOptions = {}
): Promise<TemplateConfiguration> {
  const { useCache = true, validateSchema = true } = options;

  // 检查缓存
  if (useCache) {
    const cached = templateCache.getTemplate(templateId);
    if (cached) return cached;
  }

  const configPath = path.join(CONFIGS_DIR, `${templateId}.json`);

  if (!(await fsExtra.pathExists(configPath))) {
    throw new TemplateError(`模板配置文件不存在: ${templateId}`, templateId);
  }

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent) as TemplateConfiguration;

    // 验证配置
    if (validateSchema) {
      const validation = validateTemplateConfig(config);
      if (!validation.isValid) {
        throw new TemplateValidationError(
          `模板配置验证失败: ${validation.errors.map(e => e.message).join(', ')}`,
          'config',
          'VALIDATION_FAILED'
        );
      }
    }

    // 缓存配置
    if (useCache) {
      templateCache.setTemplate(templateId, config);
    }

    return config;
  } catch (error) {
    if (error instanceof TemplateError || error instanceof TemplateValidationError) {
      throw error;
    }
    throw new TemplateError(`解析模板配置失败: ${templateId} - ${error}`, templateId, error as Error);
  }
}

/**
 * 获取所有可用的模板配置
 */
export async function getAllTemplateConfigs(
  options: LoadOptions = {}
): Promise<TemplateConfiguration[]> {
  try {
    const configFiles = await glob('*.json', { cwd: CONFIGS_DIR });
    const configs: TemplateConfiguration[] = [];
    const errors: string[] = [];

    // 并发加载配置文件
    const loadPromises = configFiles.map(async (file) => {
      const templateId = path.basename(file, '.json');
      try {
        const config = await loadTemplateConfig(templateId, options);
        return config;
      } catch (error) {
        const errorMsg = `跳过无效的模板配置: ${file} - ${error}`;
        errors.push(errorMsg);
        console.warn(errorMsg);
        return null;
      }
    });

    const results = await Promise.allSettled(loadPromises);
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        configs.push(result.value);
      }
    });

    if (errors.length > 0) {
      console.warn(`加载模板时遇到 ${errors.length} 个错误`);
    }

    return configs;
  } catch (error) {
    console.error('加载模板配置失败:', error);
    return [];
  }
}

/**
 * 加载规则文件内容
 */
export async function loadRuleFile(
  rulePath: string,
  useCache = true
): Promise<string> {
  // 检查缓存
  if (useCache) {
    const cached = templateCache.getFile(rulePath);
    if (cached) return cached;
  }

  const fullPath = path.join(RULES_DIR, rulePath);

  if (!(await fsExtra.pathExists(fullPath))) {
    throw new TemplateError(`规则文件不存在: ${rulePath}`);
  }

  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    
    // 缓存内容
    if (useCache) {
      templateCache.setFile(rulePath, content);
    }
    
    return content;
  } catch (error) {
    throw new TemplateError(`读取规则文件失败: ${rulePath} - ${error}`, undefined, error as Error);
  }
}



/**
 * 增强的条件评估器
 */
export function evaluateCondition(
  condition: string,
  context: ConditionContext
): boolean {
  const { projectInfo } = context;

  // 基础条件
  switch (condition) {
    case 'hasTypeScript':
      return projectInfo.hasTypeScript;
    case 'hasTests':
      return projectInfo.hasTests;
    case 'isReact':
      return projectInfo.type === 'react' || projectInfo.framework === 'react';
    case 'isVue':
      return projectInfo.type === 'vue' || projectInfo.framework === 'vue';
    case 'isNode':
      return projectInfo.type === 'node';
    case 'isNext':
      return projectInfo.type === 'next' || projectInfo.framework === 'next';
    case 'isPnpm':
      return projectInfo.packageManager === 'pnpm';
    case 'isYarn':
      return projectInfo.packageManager === 'yarn';
    case 'isNpm':
      return projectInfo.packageManager === 'npm';
  }

  // 复杂表达式解析（简化版）
  try {
    // 支持基本的布尔表达式，如 "hasTypeScript && isReact"
    const expr = condition
      .replace(/hasTypeScript/g, String(projectInfo.hasTypeScript))
      .replace(/hasTests/g, String(projectInfo.hasTests))
      .replace(/isReact/g, String(projectInfo.type === 'react'))
      .replace(/isVue/g, String(projectInfo.type === 'vue'))
      .replace(/isNode/g, String(projectInfo.type === 'node'));

    // 安全的表达式评估（仅支持布尔运算）
    if (/^[true|false|&|!|\s()]+$/.test(expr)) {
      return new Function(`return ${expr}`)();
    }
  } catch (error) {
    console.warn(`条件表达式评估失败: ${condition}`, error);
  }

  console.warn(`未知的条件表达式: ${condition}`);
  return false;
}

/**
 * 增强的变量处理器
 */
export function processVariables(
  content: string,
  context: VariableContext
): string {
  let processedContent = content;

  // 创建完整的变量映射
  const variables: Record<string, string> = {
    // 项目信息变量
    PROJECT_TYPE: context.projectInfo.type,
    LANGUAGE: context.projectInfo.language,
    PACKAGE_MANAGER: context.projectInfo.packageManager,
    FRAMEWORK: context.projectInfo.framework || '',
    PROJECT_ROOT: context.projectInfo.rootPath || process.cwd(),

    // 模板变量
    ...Object.fromEntries(
      Object.entries(context.templateVariables).map(([k, v]) => [k, String(v)])
    ),

    // 条件变量
    HAS_TYPESCRIPT: context.projectInfo.hasTypeScript ? 'true' : 'false',
    HAS_TESTS: context.projectInfo.hasTests ? 'true' : 'false',

    // 日期和时间变量
    CURRENT_DATE: new Date().toISOString().split('T')[0],
    CURRENT_YEAR: new Date().getFullYear().toString(),

    // 全局配置变量
    PREFERRED_LANGUAGE: context.globalConfig.language || 'zh',
  };

  // 替换变量（支持多种格式）
  for (const [key, value] of Object.entries(variables)) {
    // {{VAR}} 格式
    const mustacheRegex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    processedContent = processedContent.replace(mustacheRegex, value);

    // ${VAR} 格式
    const dollarRegex = new RegExp(`\\$\\{${key}\\}`, 'g');
    processedContent = processedContent.replace(dollarRegex, value);

    // %VAR% 格式（Windows风格）
    const percentRegex = new RegExp(`%${key}%`, 'g');
    processedContent = processedContent.replace(percentRegex, value);
  }

  return processedContent;
}



/**
 * 处理模板并生成规则文件（增强版）
 */
export async function processTemplate(
  templateId: string,
  projectInfo: ProjectInfo,
  globalVariables: Record<string, any> = {},
  options: LoadOptions = {}
): Promise<TemplateProcessResult> {
  const startTime = Date.now();
  
  try {
    // 加载模板配置
    const config = await loadTemplateConfig(templateId, options);



    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // 合并变量
    const allVariables = mergeVariables(config.variables || {}, globalVariables);

    const variableContext: VariableContext = {
      projectInfo,
      templateVariables: allVariables,
      globalConfig: {} as any, // 需要从外部传入
      templateConfig: config,
    };

    const conditionContext: ConditionContext = {
      projectInfo,
      variables: allVariables,
      environmentVars: process.env as Record<string, string>,
    };

    // 并发处理规则
    const rulePromises = config.rules.map(async (rule) => {
      try {
        // 检查条件
        if (rule.condition && !evaluateCondition(rule.condition, conditionContext)) {
          warnings.push(`跳过规则 ${rule.name}：不满足条件 ${rule.condition}`);
          return null;
        }

        // 加载规则文件内容
        const ruleContent = await loadRuleFile(rule.file, options.useCache);

        // 处理变量替换
        const processedContent = processVariables(ruleContent, variableContext);

        // 按照文件路径和模板category分类
        const templateCategory = config.category;
        const templateId = config.id;
        
        // 根据规则文件的路径判断分类
        let outputPath: string;
        if (rule.file.startsWith('basic/')) {
          // basic类型的规则保持在basic目录下
          outputPath = rule.file;
        } else if (templateCategory === templateId) {
          // 当分类和模板ID相同时（如workflow），直接使用分类目录避免重复
          const fileName = path.basename(rule.file);
          outputPath = `${templateCategory}/${fileName}`;
        } else {
          // 其他类型的规则按照 templateCategory/templateId/filename 结构
          const fileName = path.basename(rule.file);
          outputPath = `${templateCategory}/${templateId}/${fileName}`;
        }

        return {
          path: outputPath,
          content: processedContent,
          encoding: 'utf-8',
        };
      } catch (error) {
        const errorMsg = `处理规则失败 ${rule.name}: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
        return null;
      }
    });

    const ruleResults = await Promise.allSettled(rulePromises);
    ruleResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        files.push(result.value);
      } else if (result.status === 'rejected') {
        errors.push(`规则处理失败: ${result.reason}`);
      }
    });

    const processTime = Date.now() - startTime;

    const metadata: ProcessMetadata = {
      templateId: config.id,
      templateVersion: config.version,
      processTime,
      filesGenerated: files.length,
      compatibilityScore: 100, // 移除兼容性检查，默认为100
    };

    return {
      success: errors.length === 0,
      files,
      variables: allVariables,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata,
    };
  } catch (error) {
    if (error instanceof CompatibilityError) {
      throw error;
    }
    
    return {
      success: false,
      files: [],
      variables: {},
      errors: [`处理模板失败: ${error}`],
      metadata: {
        templateId,
        templateVersion: '未知',
        processTime: Date.now() - startTime,
        filesGenerated: 0,
        compatibilityScore: 0,
      },
    };
  }
}

/**
 * 合并变量定义
 */
function mergeVariables(
  templateVariables: Record<string, VariableDefinition | any>,
  userVariables: Record<string, any>
): Record<string, any> {
  const merged: Record<string, any> = {};

  // 处理模板变量定义
  for (const [key, definition] of Object.entries(templateVariables)) {
    if (typeof definition === 'object' && definition.type) {
      // 使用用户提供的值或默认值
      merged[key] = userVariables[key] ?? definition.default;
    } else {
      // 直接值
      merged[key] = userVariables[key] ?? definition;
    }
  }

  // 添加用户额外的变量
  for (const [key, value] of Object.entries(userVariables)) {
    if (!(key in merged)) {
      merged[key] = value;
    }
  }

  return merged;
}



/**
 * 清理缓存
 */
export function clearCache(): void {
  templateCache.clear();
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): { templates: number; files: number } {
  return templateCache.size();
}
