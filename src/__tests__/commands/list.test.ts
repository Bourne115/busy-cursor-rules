import { listCommand } from '../../commands/list';
import { getTemplateList } from '../../templates';
import { getGlobalConfig } from '../../utils/config';

// Define local options type based on list command
interface ListOptions {
  category?: string;
  tag?: string;
  detailed?: boolean;
  json?: boolean;
  search?: string;
}

// Mock dependencies
jest.mock('../../templates');
jest.mock('../../utils/config');

const mockGetTemplateList = getTemplateList as jest.MockedFunction<typeof getTemplateList>;
const mockGetGlobalConfig = getGlobalConfig as jest.MockedFunction<typeof getGlobalConfig>;

const mockTemplateList = [
  { id: 'react', name: 'React', description: 'React 组件开发、状态管理、性能优化' },
  { id: 'vue', name: 'Vue', description: 'Vue 组件开发、状态管理、路由' },
  { id: 'node', name: 'Node.js', description: 'Node.js API开发、数据库操作、安全' },
  { id: 'typescript', name: 'TypeScript', description: '类型系统、泛型、工具类型最佳实践' },
  { id: 'testing', name: '测试', description: '单元测试、集成测试、端到端测试' },
  { id: 'workflow', name: '开发工作流', description: 'Git工作流、CI/CD、代码质量控制' },
];

describe('ListCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockGetTemplateList.mockResolvedValue(mockTemplateList);
    mockGetGlobalConfig.mockResolvedValue({
      preferredTemplates: ['react', 'typescript'],
      autoUpdate: false,
      language: 'zh',
      registryUrl: undefined,
    });
  });

  describe('basic listing', () => {
    it('should list all templates by default', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = {};
      await listCommand(options);

      expect(mockGetTemplateList).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('可用模板'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('react'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('vue'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('node'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('typescript'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('testing'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('workflow'));

      logSpy.mockRestore();
    });

    it('should display template details', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = {};
      await listCommand(options);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('React 组件开发、状态管理、性能优化'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Vue 组件开发、状态管理、路由'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Node.js API开发、数据库操作、安全'));

      logSpy.mockRestore();
    });

    it('should show preferred templates with star marker', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = {};
      await listCommand(options);

      // Check that preferred templates are marked with star
      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('★ react');
      expect(logCalls).toContain('★ typescript');

      logSpy.mockRestore();
    });
  });

  describe('category filtering', () => {
    it('should filter by module category', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { category: 'module' };
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('react');
      expect(logCalls).toContain('vue');
      expect(logCalls).toContain('node');
      expect(logCalls).toContain('typescript');
      expect(logCalls).not.toContain('workflow');
      expect(logCalls).not.toContain('testing');

      logSpy.mockRestore();
    });

    it('should filter by workflow category', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { category: 'workflow' };
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('workflow');
      expect(logCalls).toContain('testing');
      expect(logCalls).not.toContain('react');
      expect(logCalls).not.toContain('vue');

      logSpy.mockRestore();
    });

    it('should show no templates for invalid category', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { category: 'invalid' as any };
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('未找到');

      logSpy.mockRestore();
    });
  });

  describe('tag filtering', () => {
    it('should filter by tag', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { tag: 'typescript' };
      await listCommand(options);

      // Should only show templates with typescript tag
      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('typescript');

      logSpy.mockRestore();
    });

    it('should show no templates for non-existent tag', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { tag: 'non-existent' };
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('未找到');

      logSpy.mockRestore();
    });
  });

  describe('detailed output', () => {
    it('should show detailed information with --detailed flag', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { detailed: true };
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      
      // Should include more details about templates
      expect(logCalls).toContain('模块');
      expect(logCalls).toContain('工作流');

      logSpy.mockRestore();
    });
  });

  describe('json output', () => {
    it('should output JSON format with --json flag', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { json: true };
      await listCommand(options);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const output = logSpy.mock.calls[0][0];
      
      // Should be valid JSON
      expect(() => JSON.parse(output)).not.toThrow();
      
      const parsed = JSON.parse(output);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(mockTemplateList.length);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('name');
      expect(parsed[0]).toHaveProperty('description');

      logSpy.mockRestore();
    });

    it('should filter JSON output by category', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { json: true, category: 'module' };
      await listCommand(options);

      const output = logSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      
      // Should only include module templates
      expect(parsed.every((t: any) => ['react', 'vue', 'node', 'typescript'].includes(t.id))).toBe(true);

      logSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle template loading errors', async () => {
      mockGetTemplateList.mockRejectedValue(new Error('Loading failed'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      const options: ListOptions = {};
      await expect(listCommand(options)).rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle config loading errors gracefully', async () => {
      mockGetGlobalConfig.mockRejectedValue(new Error('Config error'));
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = {};
      await listCommand(options);

      // Should still show templates without preferred markers
      expect(logSpy).toHaveBeenCalled();

      logSpy.mockRestore();
    });

    it('should handle empty template list', async () => {
      mockGetTemplateList.mockResolvedValue([]);
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = {};
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('未找到');

      logSpy.mockRestore();
    });
  });

  describe('search functionality', () => {
    it('should search templates by name', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { search: 'React' };
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('react');
      expect(logCalls).not.toContain('vue');

      logSpy.mockRestore();
    });

    it('should search templates by description', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { search: '组件开发' };
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('react');
      expect(logCalls).toContain('vue');

      logSpy.mockRestore();
    });

    it('should show no results for non-matching search', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ListOptions = { search: 'non-existent-term' };
      await listCommand(options);

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('未找到');

      logSpy.mockRestore();
    });
  });
}); 