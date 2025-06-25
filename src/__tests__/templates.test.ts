import {
  getAllTemplates,
  getTemplate,
  getTemplateList,
  hasTemplate,
} from '../templates/index';

describe('Template System', () => {
  test('should get basic template', async () => {
    const template = await getTemplate('basic');
    expect(template).toBeDefined();
    expect(template.id).toBe('basic');
    expect(template.name).toBe('基础规则');
  });

  test('should get React template', async () => {
    const template = await getTemplate('react');
    expect(template).toBeDefined();
    expect(template.id).toBe('react');
    expect(template.category).toBe('module');
  });

  test('should get TypeScript template', async () => {
    const template = await getTemplate('typescript');
    expect(template).toBeDefined();
    expect(template.id).toBe('typescript');
    expect(template.tags).toContain('typescript');
  });

  test('should throw error for non-existent template', async () => {
    await expect(getTemplate('non-existent')).rejects.toThrow(
      'Template "non-existent" not found'
    );
  });

  test('should check if template exists', () => {
    expect(hasTemplate('basic')).toBe(true);
    expect(hasTemplate('react')).toBe(true);
    expect(hasTemplate('non-existent')).toBe(false);
  });

  test('should get all templates', async () => {
    const templates = await getAllTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.some(t => t.id === 'basic')).toBe(true);
    expect(templates.some(t => t.id === 'react')).toBe(true);
  });

  test('should get template list', async () => {
    const list = await getTemplateList();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('id');
    expect(list[0]).toHaveProperty('name');
    expect(list[0]).toHaveProperty('description');
  });
});
