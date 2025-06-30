import {
  getAllTemplates,
  getTemplate,
  getTemplateList,
  hasTemplate,
} from '../templates/index';
import type { ProjectInfo } from '../types/index';

const mockProjectInfo: ProjectInfo = {
  type: 'generic',
  language: 'javascript',
  packageManager: 'npm',
  dependencies: [],
  devDependencies: [],
  hasTypeScript: false,
  hasTests: false,
};

describe('Template System', () => {
  test('should get React template', async () => {
    const template = await getTemplate('react');
    expect(template).toBeDefined();
    expect(template.id).toBe('react');
    expect(template.name).toBe('React');
    expect(template.category).toBe('module');
  });

  test('should get TypeScript template', async () => {
    const template = await getTemplate('typescript');
    expect(template).toBeDefined();
    expect(template.id).toBe('typescript');
    expect(template.name).toBe('TypeScript');
    expect(template.tags).toContain('typescript');
  });

  test('should get Vue template', async () => {
    const template = await getTemplate('vue');
    expect(template).toBeDefined();
    expect(template.id).toBe('vue');
    expect(template.name).toBe('Vue');
    expect(template.category).toBe('module');
  });

  test('should get Node.js template', async () => {
    const template = await getTemplate('node');
    expect(template).toBeDefined();
    expect(template.id).toBe('node');
    expect(template.name).toBe('Node.js');
    expect(template.category).toBe('module');
  });

  test('should get workflow template', async () => {
    const template = await getTemplate('workflow');
    expect(template).toBeDefined();
    expect(template.id).toBe('workflow');
    expect(template.name).toBe('开发工作流');
    expect(template.category).toBe('workflow');
  });

  test('should get testing template', async () => {
    const template = await getTemplate('testing');
    expect(template).toBeDefined();
    expect(template.id).toBe('testing');
    expect(template.name).toBe('测试');
    expect(template.category).toBe('workflow');
  });

  test('should throw error for non-existent template', async () => {
    await expect(getTemplate('non-existent')).rejects.toThrow(
      'Template not found: non-existent'
    );
  });

  test('should check if template exists', async () => {
    expect(await hasTemplate('react')).toBe(true);
    expect(await hasTemplate('typescript')).toBe(true);
    expect(await hasTemplate('vue')).toBe(true);
    expect(await hasTemplate('node')).toBe(true);
    expect(await hasTemplate('workflow')).toBe(true);
    expect(await hasTemplate('testing')).toBe(true);
    expect(await hasTemplate('non-existent')).toBe(false);
  });

  test('should get all templates', async () => {
    const templates = await getAllTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.some(t => t.id === 'react')).toBe(true);
    expect(templates.some(t => t.id === 'typescript')).toBe(true);
    expect(templates.some(t => t.id === 'vue')).toBe(true);
    expect(templates.some(t => t.id === 'node')).toBe(true);
    expect(templates.some(t => t.id === 'workflow')).toBe(true);
    expect(templates.some(t => t.id === 'testing')).toBe(true);
  });

  test('should get template list', async () => {
    const list = await getTemplateList();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('id');
    expect(list[0]).toHaveProperty('name');
    expect(list[0]).toHaveProperty('description');
    
    // 验证具体的模板
    const reactTemplate = list.find(t => t.id === 'react');
    expect(reactTemplate).toBeDefined();
    expect(reactTemplate?.name).toBe('React');
    expect(reactTemplate?.description).toBe('React 组件开发、状态管理、性能优化');
  });

  test('should handle template with project info', async () => {
    const template = await getTemplate('react', mockProjectInfo);
    expect(template).toBeDefined();
    expect(template.id).toBe('react');
  });

  test('should get all templates with project info', async () => {
    const templates = await getAllTemplates(mockProjectInfo);
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.some(t => t.id === 'react')).toBe(true);
  });
});
