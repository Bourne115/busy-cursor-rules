import {
  loadTemplateConfig,
  getAllTemplateConfigs,
  loadRuleFile,
  evaluateCondition,
  processVariables,
  processTemplate,
  validateTemplateConfig,
  clearCache,
  getCacheStats,
} from '../../templates/loader';
import type {
  TemplateConfiguration,
  ProjectInfo,
  VariableContext,
  ConditionContext,
} from '../../types/index';
import { TemplateError } from '../../types/index';

// 测试数据
const mockProjectInfo: ProjectInfo = {
  type: 'react',
  language: 'typescript',
  packageManager: 'pnpm',
  dependencies: ['react', '@types/react'],
  devDependencies: ['typescript', '@types/react-dom'],
  hasTypeScript: true,
  hasTests: true,
  framework: 'react',
  rootPath: '/test/project',
};

const mockVariableContext: VariableContext = {
  projectInfo: mockProjectInfo,
  templateVariables: {
    PROJECT_NAME: 'test-project',
    AUTHOR: 'Test Author',
  },
  globalConfig: {
    preferredTemplates: [],
    autoUpdate: false,
    language: 'zh',
  },
  templateConfig: {} as TemplateConfiguration,
};

const mockConditionContext: ConditionContext = {
  projectInfo: mockProjectInfo,
  variables: { test: 'value' },
  environmentVars: process.env as Record<string, string>,
};

describe('TemplateLoader', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('validateTemplateConfig', () => {
    it('should validate valid template config', () => {
      const validConfig = {
        id: 'test',
        name: 'Test Template',
        description: 'A test template',
        version: '1.0.0',
        category: 'basic',
        tags: ['test'],
        author: 'Test Author',
        compatibility: {
          projectTypes: ['react'],
          languages: ['typescript'],
        },
        rules: [
          {
            name: 'Test Rule',
            file: 'test.mdc',
            category: 'basic',
            required: true,
          },
        ],
      };

      const result = validateTemplateConfig(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidConfig = {
        id: 'test',
        // missing required fields
      };

      const result = validateTemplateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
    });

    it('should detect invalid category', () => {
      const invalidConfig = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        category: 'invalid',
        author: 'Test',
        compatibility: { projectTypes: [], languages: [] },
        rules: [],
      };

      const result = validateTemplateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_CATEGORY')).toBe(true);
    });

    it('should warn about version format', () => {
      const configWithBadVersion = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        version: 'v1.0',
        category: 'basic',
        author: 'Test',
        compatibility: { projectTypes: [], languages: [] },
        rules: [],
      };

      const result = validateTemplateConfig(configWithBadVersion);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate variable definitions', () => {
      const configWithVariables = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
        category: 'basic',
        author: 'Test',
        compatibility: { projectTypes: [], languages: [] },
        rules: [],
        variables: {
          validVar: {
            type: 'string',
            description: 'A valid variable',
            default: 'test',
          },
          invalidVar: {
            type: 'invalid',
            description: 'Invalid variable',
          },
          enumVar: {
            type: 'enum',
            description: 'Enum without values',
          },
        },
      };

      const result = validateTemplateConfig(configWithVariables);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_VARIABLE_TYPE')).toBe(true);
      expect(result.errors.some(e => e.code === 'MISSING_ENUM_VALUES')).toBe(true);
    });
  });

  describe('loadTemplateConfig', () => {
    it('should load existing template config', async () => {
      const config = await loadTemplateConfig('react');
      expect(config).toBeDefined();
      expect(config.id).toBe('react');
      expect(config.name).toBe('React');
      expect(config.category).toBe('module');
    });

    it('should throw error for non-existent template', async () => {
      await expect(loadTemplateConfig('non-existent')).rejects.toThrow(TemplateError);
    });

    it('should use cache on subsequent calls', async () => {
      const config1 = await loadTemplateConfig('react');
      const config2 = await loadTemplateConfig('react');
      
      expect(config1).toBe(config2); // Same reference due to caching
    });

    it('should skip cache when useCache is false', async () => {
      const config1 = await loadTemplateConfig('react', { useCache: true });
      const config2 = await loadTemplateConfig('react', { useCache: false });
      
      expect(config1).toEqual(config2); // Same content but different objects
    });

    it('should validate schema when validateSchema is true', async () => {
      // This would require a malformed config file to test properly
      // For now, we test that it doesn't throw with a valid config
      await expect(loadTemplateConfig('react', { validateSchema: true })).resolves.toBeDefined();
    });
  });

  describe('getAllTemplateConfigs', () => {
    it('should load all template configs', async () => {
      const configs = await getAllTemplateConfigs();
      expect(configs.length).toBeGreaterThan(0);
      expect(configs.some(c => c.id === 'react')).toBe(true);
      expect(configs.some(c => c.id === 'typescript')).toBe(true);
    });

    it('should handle loading errors gracefully', async () => {
      // Should not throw even if some configs are invalid
      const configs = await getAllTemplateConfigs();
      expect(Array.isArray(configs)).toBe(true);
    });
  });

  describe('loadRuleFile', () => {
    it('should load existing rule file', async () => {
      const content = await loadRuleFile('basic/general.mdc');
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent rule file', async () => {
      await expect(loadRuleFile('non-existent.mdc')).rejects.toThrow(TemplateError);
    });

    it('should use cache on subsequent calls', async () => {
      const content1 = await loadRuleFile('basic/general.mdc', true);
      const content2 = await loadRuleFile('basic/general.mdc', true);
      
      expect(content1).toBe(content2);
    });
  });

  describe('evaluateCondition', () => {
    it('should evaluate basic conditions', () => {
      expect(evaluateCondition('hasTypeScript', mockConditionContext)).toBe(true);
      expect(evaluateCondition('hasTests', mockConditionContext)).toBe(true);
      expect(evaluateCondition('isReact', mockConditionContext)).toBe(true);
      expect(evaluateCondition('isVue', mockConditionContext)).toBe(false);
    });

    it('should evaluate package manager conditions', () => {
      expect(evaluateCondition('isPnpm', mockConditionContext)).toBe(true);
      expect(evaluateCondition('isYarn', mockConditionContext)).toBe(false);
      expect(evaluateCondition('isNpm', mockConditionContext)).toBe(false);
    });

    it('should handle unknown conditions', () => {
      expect(evaluateCondition('unknownCondition', mockConditionContext)).toBe(false);
    });

    it('should evaluate project type conditions', () => {
      expect(evaluateCondition('isNode', mockConditionContext)).toBe(false);
      expect(evaluateCondition('isNext', mockConditionContext)).toBe(false);
    });
  });

  describe('processVariables', () => {
    it('should replace mustache variables', () => {
      const content = 'Project: {{PROJECT_TYPE}}, Language: {{LANGUAGE}}';
      const result = processVariables(content, mockVariableContext);
      expect(result).toContain('react');
      expect(result).toContain('typescript');
    });

    it('should replace dollar variables', () => {
      const content = 'Project: ${PROJECT_TYPE}, Language: ${LANGUAGE}';
      const result = processVariables(content, mockVariableContext);
      expect(result).toContain('react');
      expect(result).toContain('typescript');
    });

    it('should replace percent variables', () => {
      const content = 'Project: %PROJECT_TYPE%, Language: %LANGUAGE%';
      const result = processVariables(content, mockVariableContext);
      expect(result).toContain('react');
      expect(result).toContain('typescript');
    });

    it('should handle template variables', () => {
      const content = 'Author: {{AUTHOR}}, Project: {{PROJECT_NAME}}';
      const result = processVariables(content, mockVariableContext);
      expect(result).toContain('Test Author');
      expect(result).toContain('test-project');
    });

    it('should include date variables', () => {
      const content = 'Date: {{CURRENT_DATE}}, Year: {{CURRENT_YEAR}}';
      const result = processVariables(content, mockVariableContext);
      expect(result).toMatch(/Date: \d{4}-\d{2}-\d{2}/);
      expect(result).toMatch(/Year: \d{4}/);
    });

    it('should handle package manager variables', () => {
      const content = 'Package Manager: {{PACKAGE_MANAGER}}';
      const result = processVariables(content, mockVariableContext);
      expect(result).toContain('pnpm');
    });

    it('should handle boolean variables', () => {
      const content = 'TypeScript: {{HAS_TYPESCRIPT}}, Tests: {{HAS_TESTS}}';
      const result = processVariables(content, mockVariableContext);
      expect(result).toContain('true');
    });
  });

  describe('processTemplate', () => {
    it('should process template successfully', async () => {
      const result = await processTemplate('react', mockProjectInfo);
      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.templateId).toBe('react');
    });

    it('should process variables correctly', async () => {
      const variables = { CUSTOM_VAR: 'custom_value' };
      const result = await processTemplate('react', mockProjectInfo, variables);
      expect(result.success).toBe(true);
      expect(result.variables).toMatchObject(variables);
    });

    it('should handle missing rule files gracefully', async () => {
      // Test should not throw for missing rule files
      await expect(processTemplate('react', mockProjectInfo)).resolves.toBeDefined();
    });

    it('should skip rules that do not meet conditions', async () => {
      const noTypeScriptProject: ProjectInfo = {
        ...mockProjectInfo,
        hasTypeScript: false,
        language: 'javascript',
      };
      
      const result = await processTemplate('react', noTypeScriptProject);
      expect(result.success).toBe(true);
      // Should have fewer files since TypeScript rules are skipped
    });

    it('should generate correct file paths', async () => {
      const result = await processTemplate('react', mockProjectInfo);
      if (result.success && result.files.length > 0) {
        result.files.forEach(file => {
          expect(file.path).toBeDefined();
          expect(typeof file.path).toBe('string');
          expect(file.content).toBeDefined();
          expect(typeof file.content).toBe('string');
        });
      }
    });

    it('should set compatibility score to 100', async () => {
      const result = await processTemplate('react', mockProjectInfo);
      expect(result.metadata?.compatibilityScore).toBe(100);
    });
  });

  describe('caching', () => {
    it('should track cache statistics', async () => {
      clearCache();
      let stats = getCacheStats();
      expect(stats.templates).toBe(0);
      expect(stats.files).toBe(0);

      await loadTemplateConfig('react');
      stats = getCacheStats();
      expect(stats.templates).toBe(1);

      await loadRuleFile('basic/general.mdc');
      stats = getCacheStats();
      expect(stats.files).toBe(1);
    });

    it('should clear cache correctly', async () => {
      await loadTemplateConfig('react');
      await loadRuleFile('basic/general.mdc');
      
      let stats = getCacheStats();
      expect(stats.templates).toBeGreaterThan(0);
      expect(stats.files).toBeGreaterThan(0);

      clearCache();
      stats = getCacheStats();
      expect(stats.templates).toBe(0);
      expect(stats.files).toBe(0);
    });

    it('should respect cache options', async () => {
      const config1 = await loadTemplateConfig('react', { useCache: false });
      const config2 = await loadTemplateConfig('react', { useCache: false });
      
      // Without caching, objects should be different instances
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('error handling', () => {
    it('should handle template validation errors', async () => {
      await expect(loadTemplateConfig('non-existent')).rejects.toThrow(TemplateError);
    });

    it('should handle rule file loading errors', async () => {
      await expect(loadRuleFile('non-existent/file.mdc')).rejects.toThrow(TemplateError);
    });

    it('should handle JSON parsing errors gracefully', async () => {
      // This would require a malformed JSON file to test properly
      // For now, we test that valid configs don't throw
      await expect(loadTemplateConfig('react')).resolves.toBeDefined();
    });
  });
}); 