import { detectProject } from '../../core/detector';
import * as fs from 'fs-extra';

// Mock fs-extra
jest.mock('fs-extra');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('ProjectDetector', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('React project detection', () => {
    it('should detect React project with TypeScript', async () => {
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('tsconfig.json')) return Promise.resolve(true);
        if (pathStr.includes('pnpm-lock.yaml')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('react');
      expect(result.framework).toBe('react');
      expect(result.language).toBe('typescript');
      expect(result.packageManager).toBe('pnpm');
      expect(result.hasTypeScript).toBe(true);
      expect(result.dependencies).toContain('react');
      expect(result.devDependencies).toContain('typescript');
    });

    it('should detect React project with JavaScript', async () => {
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
        },
        devDependencies: {
          jest: '^29.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('yarn.lock')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('react');
      expect(result.language).toBe('javascript');
      expect(result.packageManager).toBe('yarn');
      expect(result.hasTypeScript).toBe(false);
      expect(result.hasTests).toBe(true);
    });

    it('should detect Next.js project', async () => {
      const packageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('next.config.js')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('next');
      expect(result.framework).toBe('next');
    });
  });

  describe('Vue project detection', () => {
    it('should detect Vue 3 project', async () => {
      const packageJson = {
        dependencies: {
          vue: '^3.3.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^4.0.0',
          vite: '^4.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('vue');
      expect(result.framework).toBe('vue');
      expect(result.dependencies).toContain('vue');
    });

    it('should detect Nuxt project', async () => {
      const packageJson = {
        dependencies: {
          nuxt: '^3.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('nuxt.config.ts')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('nuxt');
      expect(result.framework).toBe('nuxt');
    });
  });

  describe('Node.js project detection', () => {
    it('should detect Express project', async () => {
      const packageJson = {
        dependencies: {
          express: '^4.18.0',
          cors: '^2.8.5',
        },
        devDependencies: {
          '@types/express': '^4.17.0',
          nodemon: '^3.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('node');
      expect(result.framework).toBe('express');
      expect(result.dependencies).toContain('express');
    });

    it('should detect generic Node.js project', async () => {
      const packageJson = {
        main: 'index.js',
        scripts: {
          start: 'node index.js',
        },
        dependencies: {
          lodash: '^4.17.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('node');
      expect(result.framework).toBeUndefined();
    });
  });

  describe('package manager detection', () => {
    it('should detect pnpm from lock file', async () => {
      const packageJson = { dependencies: {} };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('pnpm-lock.yaml')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.packageManager).toBe('pnpm');
    });

    it('should detect yarn from lock file', async () => {
      const packageJson = { dependencies: {} };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('yarn.lock')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.packageManager).toBe('yarn');
    });

    it('should default to npm when no lock file found', async () => {
      const packageJson = { dependencies: {} };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.packageManager).toBe('npm');
    });
  });

  describe('language detection', () => {
    it('should detect TypeScript from dependencies', async () => {
      const packageJson = {
        devDependencies: {
          typescript: '^5.0.0',
          '@types/node': '^20.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('tsconfig.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.language).toBe('typescript');
      expect(result.hasTypeScript).toBe(true);
    });

    it('should detect TypeScript from config file', async () => {
      const packageJson = { dependencies: {} };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('tsconfig.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.hasTypeScript).toBe(true);
    });

    it('should default to JavaScript when no TypeScript found', async () => {
      const packageJson = { dependencies: {} };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.language).toBe('javascript');
      expect(result.hasTypeScript).toBe(false);
    });
  });

  describe('test framework detection', () => {
    it('should detect Jest', async () => {
      const packageJson = {
        devDependencies: {
          jest: '^29.0.0',
          '@testing-library/react': '^13.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.hasTests).toBe(true);
    });

    it('should detect Vitest', async () => {
      const packageJson = {
        devDependencies: {
          vitest: '^1.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.hasTests).toBe(true);
    });

    it('should detect Cypress', async () => {
      const packageJson = {
        devDependencies: {
          cypress: '^13.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.hasTests).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error when project directory does not exist', async () => {
      mockFs.pathExists.mockImplementation(() => Promise.resolve(false));

      await expect(detectProject('/non/existent/path')).rejects.toThrow(
        '项目目录不存在'
      );
    });

    it('should throw error when package.json is not found', async () => {
      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('/non/existent/path'))
          return Promise.resolve(true);
        return Promise.resolve(false);
      });

      await expect(detectProject('/non/existent/path')).rejects.toThrow(
        '未找到 package.json 文件'
      );
    });

    it('should handle malformed package.json gracefully', async () => {
      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockRejectedValue(new Error('Invalid JSON'));

      await expect(detectProject('/test/project')).rejects.toThrow(
        'package.json 文件格式错误'
      );
    });

    it('should handle missing dependencies gracefully', async () => {
      const packageJson = {
        name: 'test-project',
        // missing dependencies and devDependencies
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('generic');
      expect(result.dependencies).toEqual([]);
      expect(result.devDependencies).toEqual([]);
    });

    it('should handle file system errors gracefully', async () => {
      mockFs.pathExists.mockImplementation((_path: string | Buffer) => {
        return Promise.reject(new Error('Permission denied'));
      });

      await expect(detectProject('/test/project')).rejects.toThrow(
        '项目检测失败'
      );
    });
  });

  describe('additional metadata', () => {
    it('should extract scripts from package.json', async () => {
      const packageJson = {
        scripts: {
          start: 'react-scripts start',
          build: 'react-scripts build',
          test: 'react-scripts test',
          eject: 'react-scripts eject',
        },
        dependencies: { react: '^18.0.0' },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.scripts).toEqual(packageJson.scripts);
    });

    it('should set correct root path', async () => {
      const packageJson = { dependencies: {} };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/custom/project/path');

      expect(result.rootPath).toBe('/custom/project/path');
    });

    it('should extract git repository information if available', async () => {
      const packageJson = {
        repository: {
          type: 'git',
          url: 'https://github.com/user/repo.git',
        },
        dependencies: {},
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.gitRepository).toBe('https://github.com/user/repo.git');
    });
  });

  describe('complex project scenarios', () => {
    it('should detect monorepo setup', async () => {
      const packageJson = {
        workspaces: ['packages/*'],
        devDependencies: {
          lerna: '^7.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('lerna.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      expect(result.type).toBe('generic'); // or could be 'monorepo' if we add this type
    });

    it('should handle mixed framework project', async () => {
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
          express: '^4.18.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
        },
      };

      mockFs.pathExists.mockImplementation((path: string | Buffer) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json')) return Promise.resolve(true);
        if (pathStr.includes('tsconfig.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      mockFs.readJSON.mockResolvedValue(packageJson);

      const result = await detectProject('/test/project');

      // Should prioritize React over Express
      expect(result.type).toBe('react');
      expect(result.framework).toBe('react');
      expect(result.dependencies).toContain('react');
      expect(result.dependencies).toContain('express');
    });
  });
});
