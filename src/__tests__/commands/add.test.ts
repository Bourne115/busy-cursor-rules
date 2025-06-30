import { addCommand } from '../../commands/add';
import { detectProject } from '../../core/detector';
import { addRule } from '../../core/generator';
import { getTemplateList } from '../../templates';
import { getGlobalConfig } from '../../utils/config';
import type { ProjectInfo } from '../../types/index';

// Mock dependencies
jest.mock('../../core/detector');
jest.mock('../../core/generator');
jest.mock('../../templates');
jest.mock('../../utils/config');

const mockDetectProject = detectProject as jest.MockedFunction<typeof detectProject>;
const mockAddRule = addRule as jest.MockedFunction<typeof addRule>;
const mockGetTemplateList = getTemplateList as jest.MockedFunction<typeof getTemplateList>;
const mockGetGlobalConfig = getGlobalConfig as jest.MockedFunction<typeof getGlobalConfig>;

// Define AddOptions based on command
interface AddOptions {
  force?: boolean;
}

const mockProjectInfo: ProjectInfo = {
  type: 'react',
  language: 'typescript',
  packageManager: 'pnpm',
  dependencies: ['react', '@types/react'],
  devDependencies: ['typescript', '@testing-library/react'],
  hasTypeScript: true,
  hasTests: true,
  framework: 'react',
  rootPath: '/test/project',
};

const mockTemplateList = [
  { id: 'react', name: 'React', description: 'React 组件开发、状态管理、性能优化' },
  { id: 'vue', name: 'Vue', description: 'Vue 组件开发、状态管理、路由' },
  { id: 'node', name: 'Node.js', description: 'Node.js API开发、数据库操作、安全' },
  { id: 'typescript', name: 'TypeScript', description: '类型系统、泛型、工具类型最佳实践' },
  { id: 'testing', name: '测试', description: '单元测试、集成测试、端到端测试' },
  { id: 'workflow', name: '开发工作流', description: 'Git工作流、CI/CD、代码质量控制' },
];

describe('AddCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockDetectProject.mockResolvedValue(mockProjectInfo);
    mockGetTemplateList.mockResolvedValue(mockTemplateList);
    mockGetGlobalConfig.mockResolvedValue({
      preferredTemplates: [],
      autoUpdate: false,
      language: 'zh',
    });
    mockAddRule.mockResolvedValue();

    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('successful rule addition', () => {
    it('should add valid template rule', async () => {
      const options: AddOptions = { force: false };

      await addCommand('typescript', options);

      expect(mockDetectProject).toHaveBeenCalledWith('/test/project');
      expect(mockGetTemplateList).toHaveBeenCalled();
      expect(mockAddRule).toHaveBeenCalledWith(
        expect.objectContaining({
          projectRoot: '/test/project',
          projectInfo: mockProjectInfo,
          rulesDir: '/test/project/.cursor/rules',
        }),
        'typescript',
        false
      );
    });

    it('should add rule with force flag', async () => {
      const options: AddOptions = { force: true };

      await addCommand('react', options);

      expect(mockAddRule).toHaveBeenCalledWith(
        expect.any(Object),
        'react',
        true
      );
    });

    it('should display success message and rule info', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('typescript', { force: false });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('📋 规则信息: typescript')
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('TypeScript')
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('类型系统、泛型、工具类型最佳实践')
      );

      logSpy.mockRestore();
    });

    it('should display related suggestions for React template', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('react', { force: false });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('💡 您可能还需要这些规则')
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('typescript')
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('testing')
      );

      logSpy.mockRestore();
    });

    it('should show compatibility for relevant templates', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('react', { force: false });

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('✓ 适用');

      logSpy.mockRestore();
    });
  });

  describe('template validation', () => {
    it('should reject non-existent template', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await expect(addCommand('invalid-template', { force: false }))
        .rejects.toThrow('Process exit');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('📋 可用的规则')
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      logSpy.mockRestore();
    });

    it('should show available templates when invalid template provided', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await expect(addCommand('invalid-template', { force: false }))
        .rejects.toThrow('Process exit');

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('react');
      expect(logCalls).toContain('vue');
      expect(logCalls).toContain('typescript');

      exitSpy.mockRestore();
      logSpy.mockRestore();
    });
  });

  describe('project compatibility', () => {
    it('should show relevant compatibility for React project', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('react', { force: false });

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('✓ 适用');

      logSpy.mockRestore();
    });

    it('should show general compatibility for non-matching template', async () => {
      const vueProjectInfo: ProjectInfo = {
        ...mockProjectInfo,
        type: 'vue',
      };
      mockDetectProject.mockResolvedValue(vueProjectInfo);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('react', { force: false });

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('? 通用');

      logSpy.mockRestore();
    });

    it('should show TypeScript suggestions for TypeScript projects', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // Add a non-TypeScript template to trigger suggestions
      await addCommand('workflow', { force: false });

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('typescript');

      logSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle project detection errors', async () => {
      mockDetectProject.mockRejectedValue(new Error('Detection failed'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      await expect(addCommand('typescript', { force: false }))
        .rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('错误详情'),
        expect.stringContaining('Detection failed')
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle template loading errors', async () => {
      mockGetTemplateList.mockRejectedValue(new Error('Template loading failed'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      await expect(addCommand('typescript', { force: false }))
        .rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle rule addition errors', async () => {
      mockAddRule.mockRejectedValue(new Error('Rule addition failed'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      await expect(addCommand('typescript', { force: false }))
        .rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('错误详情'),
        expect.stringContaining('Rule addition failed')
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle config loading errors gracefully', async () => {
      mockGetGlobalConfig.mockRejectedValue(new Error('Config error'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      await expect(addCommand('typescript', { force: false }))
        .rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('suggestions and recommendations', () => {
    it('should provide different suggestions for different templates', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('vue', { force: false });

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('typescript');
      expect(logCalls).toContain('testing');

      logSpy.mockRestore();
    });

    it('should suggest workflow for generic templates', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('typescript', { force: false });

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('workflow');

      logSpy.mockRestore();
    });

    it('should not suggest already added template', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('react', { force: false });

      const logCalls = logSpy.mock.calls.map(call => call[0]).join(' ');
      // Should not suggest react since it's the added template
      const suggestionLines = logCalls.split('\n').filter(line => line.includes('💡'));
      expect(suggestionLines.join(' ')).not.toContain('react');

      logSpy.mockRestore();
    });

    it('should show usage hint', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await addCommand('typescript', { force: false });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('cursor-rules add <rule-name>')
      );

      logSpy.mockRestore();
    });
  });
}); 