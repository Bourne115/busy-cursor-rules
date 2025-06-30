// 新的模板配置结构（基于文件系统）
export interface TemplateConfiguration {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'basic' | 'module' | 'workflow';
  tags: string[];
  author: string;
  compatibility: {
    projectTypes: ProjectType[];
    languages: string[];
    frameworks?: string[];
  };
  rules: TemplateRule[];
  dependencies?: string[];
  variables?: Record<string, VariableDefinition>;
}

// 变量定义（新增）
export interface VariableDefinition {
  type: 'string' | 'boolean' | 'number' | 'enum';
  description: string;
  default?: any;
  enum?: string[]; // 用于枚举类型
  required?: boolean;
}

// 模板规则定义
export interface TemplateRule {
  name: string;
  file: string;
  category: 'basic' | 'module' | 'workflow';
  required: boolean;
  condition?: string; // 条件表达式，如 "hasTypeScript"
  variables?: Record<string, any>;
}

// 规则文件内容（从文件系统读取）
export interface RuleFileContent {
  path: string;
  content: string;
  variables?: Record<string, any>;
}

// 生成的文件结构（新增）
export interface GeneratedFile {
  path: string;
  content: string;
  encoding?: string;
  executable?: boolean;
}

// 兼容性：保留原有的 RuleTemplate 接口
export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'basic' | 'module' | 'workflow';
  tags: string[];
  author: string;
  files: RuleFile[];
  dependencies?: string[];
  config?: TemplateConfig;
}

// 规则文件结构
export interface RuleFile {
  path: string;
  content: string;
  template?: boolean;
  variables?: Record<string, any>;
}

// 模板配置
export interface TemplateConfig {
  framework?: string;
  language?: string;
  features?: string[];
  customOptions?: Record<string, any>;
}

// 模板处理结果（扩展）
export interface TemplateProcessResult {
  success: boolean;
  files: GeneratedFile[];
  variables: Record<string, any>;
  errors?: string[];
  warnings?: string[];
  metadata?: ProcessMetadata;
}

// 处理元数据（新增）
export interface ProcessMetadata {
  templateId: string;
  templateVersion: string;
  processTime: number;
  filesGenerated: number;
  compatibilityScore: number;
}

// 变量替换上下文
export interface VariableContext {
  projectInfo: ProjectInfo;
  templateVariables: Record<string, any>;
  globalConfig: GlobalConfig;
  templateConfig?: TemplateConfiguration;
}

// 项目检测结果（扩展）
export interface ProjectInfo {
  type: ProjectType;
  framework?: string;
  language: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  dependencies: string[];
  devDependencies: string[];
  hasTypeScript: boolean;
  hasTests: boolean;
  scripts?: Record<string, string>;
  rootPath?: string;
  gitRepository?: string;
}

// 项目类型
export type ProjectType =
  | 'react'
  | 'vue'
  | 'angular'
  | 'node'
  | 'next'
  | 'nuxt'
  | 'python'
  | 'go'
  | 'rust'
  | 'generic';

// 模板类别
export type TemplateCategory = 'basic' | 'module' | 'workflow';

// CLI命令选项（扩展）
export interface InitOptions {
  template?: string;
  force?: boolean;
  interactive?: boolean;
  dryRun?: boolean;
  variables?: Record<string, any>;
}

export interface AddOptions {
  force?: boolean;
  category?: string;
  interactive?: boolean;
}

export interface ConfigOptions {
  global?: boolean;
  reset?: boolean;
  key?: string;
  value?: any;
}

// 推荐结果（新增）
export interface RecommendationResult {
  templates: TemplateConfiguration[];
  scores: Record<string, number>;
  reasons: Record<string, string[]>;
  alternatives: Record<string, TemplateConfiguration[]>;
}

// 全局配置
export interface GlobalConfig {
  preferredTemplates: string[];
  autoUpdate: boolean;
  language: 'en' | 'zh';
  registryUrl?: string;
  customTemplatePath?: string;
  cacheExpiry?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// 规则执行上下文
export interface RuleContext {
  projectRoot: string;
  projectInfo: ProjectInfo;
  rulesDir: string;
  config: GlobalConfig;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 规则市场数据
export interface MarketplaceRule extends RuleTemplate {
  downloads: number;
  rating: number;
  reviews: number;
  lastUpdated: string;
}

// 缓存接口（新增）
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// 验证结果（新增）
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorInfo[];
  warnings: ValidationWarningInfo[];
}

export interface ValidationErrorInfo {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarningInfo {
  field: string;
  message: string;
  suggestion?: string;
}

// 模板加载选项（新增）
export interface LoadOptions {
  useCache?: boolean;
  validateSchema?: boolean;
  includeMetadata?: boolean;
}

// 条件评估上下文（新增）
export interface ConditionContext {
  projectInfo: ProjectInfo;
  variables: Record<string, any>;
  environmentVars: Record<string, string>;
}

// 错误类型（新增）
export class TemplateError extends Error {
  constructor(
    message: string,
    public templateId?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'TemplateError';
  }
}

export class TemplateValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

export class CompatibilityError extends Error {
  constructor(
    message: string,
    public templateId?: string,
    public projectType?: string
  ) {
    super(message);
    this.name = 'CompatibilityError';
  }
}

// 推荐系统相关类型定义（新增）

/**
 * 推荐策略接口 - 支持可插拔设计
 */
export interface RecommendationStrategy {
  readonly name: string;
  readonly description: string;
  readonly weight: number;
  
  calculateScore(template: TemplateConfiguration, project: ProjectInfo): Promise<number>;
  getReasons(template: TemplateConfiguration, project: ProjectInfo, score: number): Promise<string[]>;
}

/**
 * 推荐偏好配置
 */
export interface RecommendationPreferences {
  prioritizePopular: boolean;
  includeExperimental: boolean;
  maxResults: number;
  minimumScore: number;
  preferredCategories: TemplateCategory[];
  excludeTemplates: string[];
}

/**
 * 单个推荐结果
 */
export interface TemplateRecommendation {
  templateId: string;
  score: number;
  reasons: string[];
  dependencies: string[];
  conflicts?: string[];
  metadata: {
    strategyScores: Record<string, number>;
    confidence: number;
    category: 'essential' | 'recommended' | 'optional';
    processingTime: number;
  };
}

/**
 * 完整推荐结果
 */
export interface CompleteRecommendationResult {
  recommendations: TemplateRecommendation[];
  metadata: {
    totalTemplates: number;
    applicableTemplates: number;
    strategiesUsed: string[];
    processingTime: number;
    cacheHits: number;
  };
}

/**
 * 分类推荐结果
 */
export interface CategorizedRecommendations {
  essential: string[];
  recommended: string[];
  optional: string[];
  complete: TemplateRecommendation[];
  metadata: CompleteRecommendationResult['metadata'];
}

/**
 * 依赖解析结果
 */
export interface DependencyResolutionResult {
  resolved: string[];
  missing: string[];
  conflicts: Array<{
    template1: string;
    template2: string;
    reason: string;
  }>;
  resolutionPath: string[];
}

/**
 * 推荐系统配置
 */
export interface RecommendationConfig {
  strategies: Array<{
    name: string;
    enabled: boolean;
    weight: number;
    config?: Record<string, any>;
  }>;
  caching: {
    enabled: boolean;
    ttl: number; // Time to live in milliseconds
    maxSize: number;
  };
  performance: {
    maxConcurrentStrategies: number;
    timeoutMs: number;
  };
}
