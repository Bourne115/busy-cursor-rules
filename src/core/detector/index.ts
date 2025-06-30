import { ProjectInfo, ProjectType } from '@/types/index';
import { exists, readJson } from '@/utils/file';
import path from 'path';

/**
 * 检测项目类型和信息
 */
export async function detectProject(
  projectRoot: string = process.cwd()
): Promise<ProjectInfo> {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  // 默认项目信息
  const projectInfo: ProjectInfo = {
    type: 'generic',
    language: 'javascript',
    packageManager: 'npm',
    dependencies: [],
    devDependencies: [],
    hasTypeScript: false,
    hasTests: false,
  };

  // 检测 package.json
  if (await exists(packageJsonPath)) {
    try {
      const packageJson = await readJson(packageJsonPath);
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      projectInfo.dependencies = Object.keys(packageJson.dependencies || {});
      projectInfo.devDependencies = Object.keys(
        packageJson.devDependencies || {}
      );

      // 检测项目类型
      projectInfo.type = detectProjectType(deps);

      // 检测语言
      projectInfo.language = detectLanguage(projectRoot, deps);

      // 检测包管理器
      projectInfo.packageManager = await detectPackageManager(projectRoot);

      // 检测 TypeScript
      projectInfo.hasTypeScript =
        deps.typescript ||
        deps['@types/node'] ||
        (await exists(path.join(projectRoot, 'tsconfig.json')));

      // 检测测试框架
      projectInfo.hasTests =
        deps.jest ||
        deps.vitest ||
        deps.mocha ||
        (await exists(path.join(projectRoot, 'test'))) ||
        (await exists(path.join(projectRoot, '__tests__')));

      // 检测具体框架
      projectInfo.framework = detectFramework(deps);
    } catch (error) {
      console.warn('Failed to parse package.json:', error);
    }
  }

  return projectInfo;
}

/**
 * 检测项目类型
 */
function detectProjectType(dependencies: Record<string, string>): ProjectType {
  if (dependencies.react) {
    if (dependencies.next) return 'next';
    return 'react';
  }

  if (dependencies.vue) {
    if (dependencies.nuxt) return 'nuxt';
    return 'vue';
  }

  if (dependencies['@angular/core']) {
    return 'angular';
  }

  if (dependencies.express || dependencies.koa || dependencies.fastify) {
    return 'node';
  }

  return 'generic';
}

/**
 * 检测编程语言
 */
function detectLanguage(
  projectRoot: string,
  dependencies: Record<string, string>
): string {
  if (dependencies.typescript || dependencies['@types/node']) {
    return 'typescript';
  }

  // 可以通过检查文件扩展名来进一步确定
  return 'javascript';
}

/**
 * 检测包管理器
 */
async function detectPackageManager(
  projectRoot: string
): Promise<'npm' | 'yarn' | 'pnpm'> {
  if (await exists(path.join(projectRoot, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  if (await exists(path.join(projectRoot, 'yarn.lock'))) {
    return 'yarn';
  }

  return 'npm';
}

/**
 * 检测具体框架
 */
function detectFramework(
  dependencies: Record<string, string>
): string | undefined {
  if (dependencies.next) return 'Next.js';
  if (dependencies.nuxt) return 'Nuxt.js';
  if (dependencies.react) return 'React';
  if (dependencies.vue) return 'Vue.js';
  if (dependencies['@angular/core']) return 'Angular';
  if (dependencies.express) return 'Express';
  if (dependencies.koa) return 'Koa';
  if (dependencies.fastify) return 'Fastify';

  return undefined;
}

/**
 * 获取推荐的规则模板（已弃用，请使用新的推荐系统）
 * @deprecated 使用 @/core/recommendation/integration.recommendationSystem.getSimpleRecommendations() 替代
 */
export function getRecommendedTemplates(projectInfo: ProjectInfo): string[] {
  console.warn('getRecommendedTemplates 已弃用，请使用新的推荐系统');

  const templates: string[] = ['basic']; // 基础规则总是推荐

  switch (projectInfo.type) {
    case 'react':
      templates.push('react');
      if (projectInfo.hasTypeScript) templates.push('typescript');
      break;
    case 'vue':
      templates.push('vue');
      if (projectInfo.hasTypeScript) templates.push('typescript');
      break;
    case 'angular':
      templates.push('angular', 'typescript');
      break;
    case 'node':
      templates.push('node');
      if (projectInfo.hasTypeScript) templates.push('typescript');
      break;
    case 'next':
      templates.push('react', 'next');
      if (projectInfo.hasTypeScript) templates.push('typescript');
      break;
    case 'nuxt':
      templates.push('vue', 'nuxt');
      if (projectInfo.hasTypeScript) templates.push('typescript');
      break;
  }

  if (projectInfo.hasTests) {
    templates.push('testing');
  }

  return templates;
}
