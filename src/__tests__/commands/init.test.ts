import { initCommand } from '../../commands/init';
import { detectProject } from '../../core/detector';
import { generateRules } from '../../core/generator';
import { getTemplateList } from '../../templates';
import { getGlobalConfig } from '../../utils/config';
import { exists } from '../../utils/file';
import inquirer from 'inquirer';
import type { InitOptions, ProjectInfo } from '../../types/index';

// Mock dependencies
jest.mock('../../core/detector');
jest.mock('../../core/generator');
jest.mock('../../templates');
jest.mock('../../utils/config');
jest.mock('../../utils/file');
jest.mock('inquirer');

const mockDetectProject = detectProject as jest.MockedFunction<
  typeof detectProject
>;
const mockGenerateRules = generateRules as jest.MockedFunction<
  typeof generateRules
>;
const mockGetTemplateList = getTemplateList as jest.MockedFunction<
  typeof getTemplateList
>;
const mockGetGlobalConfig = getGlobalConfig as jest.MockedFunction<
  typeof getGlobalConfig
>;
const mockExists = exists as jest.MockedFunction<typeof exists>;
const mockInquirer = inquirer as jest.Mocked<typeof inquirer>;

const mockProjectInfo: ProjectInfo = {
  type: 'react',
  language: 'typescript',
  packageManager: 'pnpm',
  dependencies: ['react', '@types/react'],
  devDependencies: ['typescript', '@testing-library/react', 'jest'],
  hasTypeScript: true,
  hasTests: true,
  framework: 'react',
  rootPath: '/test/project',
};

const mockTemplateList = [
  {
    id: 'react',
    name: 'React',
    description: 'React 组件开发、状态管理、性能优化',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: '类型系统、泛型、工具类型最佳实践',
  },
  {
    id: 'testing',
    name: '测试',
    description: '单元测试、集成测试、端到端测试',
  },
  {
    id: 'workflow',
    name: '开发工作流',
    description: 'Git工作流、CI/CD、代码质量控制',
  },
];

describe('InitCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockDetectProject.mockResolvedValue(mockProjectInfo);
    mockGetGlobalConfig.mockResolvedValue({
      preferredTemplates: [],
      autoUpdate: false,
      language: 'zh',
      registryUrl: undefined,
    });
    mockExists.mockResolvedValue(false);
    mockGetTemplateList.mockResolvedValue(mockTemplateList);
    mockGenerateRules.mockResolvedValue({
      successfulTemplates: ['react', 'typescript'],
      failedTemplates: [],
    });

    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('with valid React project', () => {
    it('should initialize rules with specified template', async () => {
      const options: InitOptions = {
        template: 'react',
        force: false,
        interactive: false,
      };

      await initCommand(options);

      expect(mockDetectProject).toHaveBeenCalledWith('/test/project');
      expect(mockGenerateRules).toHaveBeenCalledWith(
        expect.objectContaining({
          projectRoot: '/test/project',
          projectInfo: mockProjectInfo,
          rulesDir: '/test/project/.cursor/rules',
        }),
        ['react']
      );
    });

    it('should initialize rules with multiple templates', async () => {
      const options: InitOptions = {
        template: 'react,typescript,testing',
        force: false,
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).toHaveBeenCalledWith(expect.any(Object), [
        'react',
        'typescript',
        'testing',
      ]);
    });

    it('should use dependency-based recommendations for non-interactive mode', async () => {
      const options: InitOptions = {
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['react', 'typescript', 'testing', 'workflow'])
      );
    });

    it('should prompt for overwrite when rules exist without force flag', async () => {
      mockExists.mockResolvedValue(true);
      mockInquirer.prompt.mockResolvedValue({ overwrite: true });

      const options: InitOptions = {
        template: 'react',
        force: false,
        interactive: false,
      };

      await initCommand(options);

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'confirm',
          name: 'overwrite',
          message: '检测到已存在 Cursor Rules，是否覆盖？',
        }),
      ]);
    });

    it('should skip overwrite prompt with force flag', async () => {
      mockExists.mockResolvedValue(true);

      const options: InitOptions = {
        template: 'react',
        force: true,
        interactive: false,
      };

      await initCommand(options);

      expect(mockInquirer.prompt).not.toHaveBeenCalled();
      expect(mockGenerateRules).toHaveBeenCalled();
    });

    it('should cancel operation when user chooses not to overwrite', async () => {
      mockExists.mockResolvedValue(true);
      mockInquirer.prompt.mockResolvedValue({ overwrite: false });

      const options: InitOptions = {
        template: 'react',
        force: false,
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).not.toHaveBeenCalled();
    });
  });

  describe('interactive mode', () => {
    it('should show template selection with dependency-based recommendations', async () => {
      mockInquirer.prompt.mockResolvedValue({
        templates: ['react', 'typescript'],
      });

      const options: InitOptions = {
        interactive: true,
      };

      await initCommand(options);

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'checkbox',
          name: 'templates',
          message: '选择要使用的规则模板 (✓ 标记的是基于项目依赖的建议):',
          choices: expect.arrayContaining([
            expect.objectContaining({
              name: expect.stringContaining('✓'),
              value: 'react',
              checked: true,
            }),
            expect.objectContaining({
              name: expect.stringContaining('✓'),
              value: 'typescript',
              checked: true,
            }),
          ]),
        }),
      ]);
    });

    it('should validate that at least one template is selected', async () => {
      mockInquirer.prompt.mockResolvedValue({ templates: ['react'] });

      const options: InitOptions = {
        interactive: true,
      };

      await initCommand(options);

      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        expect.objectContaining({
          validate: expect.any(Function),
        }),
      ]);

      // Test the validator function
      const promptCall = mockInquirer.prompt.mock.calls[0][0] as any[];
      const validator = promptCall[0].validate;

      expect(validator([])).toBe('请至少选择一个模板');
      expect(validator(['react'])).toBe(true);
    });
  });

  describe('dependency-based recommendations', () => {
    it('should recommend React template for React projects', async () => {
      const reactProject: ProjectInfo = {
        ...mockProjectInfo,
        dependencies: ['react', 'react-dom'],
        devDependencies: [],
      };
      mockDetectProject.mockResolvedValue(reactProject);

      const options: InitOptions = {
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['react'])
      );
    });

    it('should recommend Vue template for Vue projects', async () => {
      const vueProject: ProjectInfo = {
        ...mockProjectInfo,
        type: 'vue',
        dependencies: ['vue'],
        devDependencies: ['@vitejs/plugin-vue'],
      };
      mockDetectProject.mockResolvedValue(vueProject);

      const options: InitOptions = {
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['vue'])
      );
    });

    it('should recommend Node.js template for Express projects', async () => {
      const nodeProject: ProjectInfo = {
        ...mockProjectInfo,
        type: 'node',
        dependencies: ['express', 'cors'],
        devDependencies: ['@types/express'],
      };
      mockDetectProject.mockResolvedValue(nodeProject);

      const options: InitOptions = {
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['node'])
      );
    });

    it('should recommend TypeScript template when TypeScript dependencies found', async () => {
      const tsProject: ProjectInfo = {
        ...mockProjectInfo,
        devDependencies: ['typescript', '@types/node'],
      };
      mockDetectProject.mockResolvedValue(tsProject);

      const options: InitOptions = {
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['typescript'])
      );
    });

    it('should recommend testing template when test dependencies found', async () => {
      const testProject: ProjectInfo = {
        ...mockProjectInfo,
        devDependencies: ['jest', '@testing-library/react'],
      };
      mockDetectProject.mockResolvedValue(testProject);

      const options: InitOptions = {
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['testing'])
      );
    });

    it('should always recommend workflow template', async () => {
      const minimalProject: ProjectInfo = {
        ...mockProjectInfo,
        dependencies: [],
        devDependencies: [],
        hasTypeScript: false,
        hasTests: false,
      };
      mockDetectProject.mockResolvedValue(minimalProject);

      const options: InitOptions = {
        interactive: false,
      };

      await initCommand(options);

      expect(mockGenerateRules).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining(['workflow'])
      );
    });
  });

  describe('error handling', () => {
    it('should handle project detection errors', async () => {
      mockDetectProject.mockRejectedValue(
        new Error('Project detection failed')
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      const options: InitOptions = {
        template: 'react',
        interactive: false,
      };

      await expect(initCommand(options)).rejects.toThrow('Process exit');
      expect(consoleSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle rule generation errors gracefully', async () => {
      mockGenerateRules.mockRejectedValue(new Error('Generation failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const options: InitOptions = {
        template: 'react',
        interactive: false,
      };

      await initCommand(options);

      expect(warnSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it('should handle partial rule generation failures', async () => {
      mockGenerateRules.mockResolvedValue({
        successfulTemplates: ['react'],
        failedTemplates: ['invalid-template'],
      });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const options: InitOptions = {
        template: 'react,invalid-template',
        interactive: false,
      };

      await initCommand(options);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('失败的模板: invalid-template')
      );

      warnSpy.mockRestore();
    });
  });
});
