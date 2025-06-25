// 规则模板结构
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

// 项目检测结果
export interface ProjectInfo {
  type: ProjectType;
  framework?: string;
  language: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  dependencies: string[];
  devDependencies: string[];
  hasTypeScript: boolean;
  hasTests: boolean;
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

// CLI命令选项
export interface InitOptions {
  template?: string;
  force?: boolean;
  interactive?: boolean;
}

export interface AddOptions {
  force?: boolean;
  category?: string;
}

export interface ConfigOptions {
  global?: boolean;
  reset?: boolean;
}

// 全局配置
export interface GlobalConfig {
  preferredTemplates: string[];
  autoUpdate: boolean;
  language: 'en' | 'zh';
  registryUrl?: string;
  customTemplatePath?: string;
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