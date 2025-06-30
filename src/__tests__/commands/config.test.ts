import { configCommand } from '../../commands/config';
import { getGlobalConfig, saveGlobalConfig, resetConfig } from '../../utils/config';
import type { GlobalConfig } from '../../types/index';

// Mock dependencies
jest.mock('../../utils/config');

const mockGetGlobalConfig = getGlobalConfig as jest.MockedFunction<typeof getGlobalConfig>;
const mockSaveGlobalConfig = saveGlobalConfig as jest.MockedFunction<typeof saveGlobalConfig>;
const mockResetConfig = resetConfig as jest.MockedFunction<typeof resetConfig>;

// Define ConfigOptions based on command
interface ConfigOptions {
  reset?: boolean;
  set?: string;
  get?: string;
}

const mockGlobalConfig: GlobalConfig = {
  preferredTemplates: ['react', 'typescript'],
  autoUpdate: false,
  language: 'zh',
  registryUrl: 'https://example.com/registry',
};

describe('ConfigCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockGetGlobalConfig.mockResolvedValue(mockGlobalConfig);
    mockSaveGlobalConfig.mockResolvedValue();
    mockResetConfig.mockResolvedValue();
  });

  describe('show all config', () => {
    it('should display all config when no options specified', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = {};
      await configCommand(options);

      expect(mockGetGlobalConfig).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('⚙️ 当前配置'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('preferredTemplates'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('autoUpdate'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('language'));

      logSpy.mockRestore();
    });

    it('should display config help information', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = {};
      await configCommand(options);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('💡 配置管理'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--set key=value'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--get key'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--reset'));

      logSpy.mockRestore();
    });

    it('should format config values as JSON', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = {};
      await configCommand(options);

      const logOutput = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logOutput).toContain('"zh"'); // JSON formatted
      expect(logOutput).toContain('false'); // JSON formatted

      logSpy.mockRestore();
    });
  });

  describe('get specific config', () => {
    it('should display specific config value', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { get: 'language' };
      await configCommand(options);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('language: zh'));

      logSpy.mockRestore();
    });

    it('should display array config values', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { get: 'preferredTemplates' };
      await configCommand(options);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('preferredTemplates'));

      logSpy.mockRestore();
    });

    it('should handle non-existent config key', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { get: 'nonExistent' };
      await configCommand(options);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('nonExistent: undefined'));

      logSpy.mockRestore();
    });
  });

  describe('set config', () => {
    it('should set string config value', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { set: 'language=en' };
      await configCommand(options);

      expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
        ...mockGlobalConfig,
        language: 'en',
      });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置已保存: language = en')
      );

      logSpy.mockRestore();
    });

    it('should set boolean true value', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { set: 'autoUpdate=true' };
      await configCommand(options);

      expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
        ...mockGlobalConfig,
        autoUpdate: true,
      });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置已保存: autoUpdate = true')
      );

      logSpy.mockRestore();
    });

    it('should set boolean false value', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { set: 'autoUpdate=false' };
      await configCommand(options);

      expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
        ...mockGlobalConfig,
        autoUpdate: false,
      });

      logSpy.mockRestore();
    });

    it('should handle malformed set format', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const options: ConfigOptions = { set: 'invalidformat' };
      await configCommand(options);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('格式错误，请使用: --set key=value')
      );
      expect(mockSaveGlobalConfig).not.toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    it('should handle empty key in set format', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const options: ConfigOptions = { set: '=value' };
      await configCommand(options);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('格式错误，请使用: --set key=value')
      );

      errorSpy.mockRestore();
    });

    it('should handle empty value in set format', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const options: ConfigOptions = { set: 'key=' };
      await configCommand(options);

      expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
        ...mockGlobalConfig,
        key: '',
      });

      errorSpy.mockRestore();
    });
  });

  describe('reset config', () => {
    it('should reset config to defaults', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { reset: true };
      await configCommand(options);

      expect(mockResetConfig).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置已重置为默认值')
      );

      logSpy.mockRestore();
    });

    it('should not call other config operations when reset is true', async () => {
      const options: ConfigOptions = { 
        reset: true, 
        set: 'language=en',
        get: 'language' 
      };
      await configCommand(options);

      expect(mockResetConfig).toHaveBeenCalled();
      expect(mockGetGlobalConfig).not.toHaveBeenCalled();
      expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
    });
  });

  describe('priority of operations', () => {
    it('should prioritize reset over set and get', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { 
        reset: true, 
        set: 'language=en',
        get: 'language' 
      };
      await configCommand(options);

      expect(mockResetConfig).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置已重置为默认值')
      );

      logSpy.mockRestore();
    });

    it('should prioritize set over get when both provided', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = { 
        set: 'language=en',
        get: 'language' 
      };
      await configCommand(options);

      expect(mockSaveGlobalConfig).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置已保存: language = en')
      );

      logSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle config loading errors', async () => {
      mockGetGlobalConfig.mockRejectedValue(new Error('Config load failed'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      const options: ConfigOptions = {};
      await expect(configCommand(options)).rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置操作失败'),
        expect.stringContaining('Config load failed')
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle config saving errors', async () => {
      mockSaveGlobalConfig.mockRejectedValue(new Error('Config save failed'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      const options: ConfigOptions = { set: 'language=en' };
      await expect(configCommand(options)).rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置操作失败'),
        expect.stringContaining('Config save failed')
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle reset errors', async () => {
      mockResetConfig.mockRejectedValue(new Error('Reset failed'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      const options: ConfigOptions = { reset: true };
      await expect(configCommand(options)).rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置操作失败'),
        expect.stringContaining('Reset failed')
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('should handle non-Error objects gracefully', async () => {
      mockGetGlobalConfig.mockRejectedValue('String error');
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      const options: ConfigOptions = {};
      await expect(configCommand(options)).rejects.toThrow('Process exit');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置操作失败'),
        'String error'
      );

      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('config value formatting', () => {
    it('should handle complex config objects', async () => {
      const complexConfig = {
        ...mockGlobalConfig,
        preferredTemplates: ['react', 'vue', 'typescript'],
        autoUpdate: true,
        customField: { nested: 'value' },
      };
      mockGetGlobalConfig.mockResolvedValue(complexConfig);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = {};
      await configCommand(options);

      // Should format complex objects as JSON
      const logOutput = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logOutput).toContain('["react","vue","typescript"]');
      expect(logOutput).toContain('{"nested":"value"}');

      logSpy.mockRestore();
    });

    it('should handle null and undefined values', async () => {
      const configWithNulls = {
        ...mockGlobalConfig,
        registryUrl: undefined,
      };
      mockGetGlobalConfig.mockResolvedValue(configWithNulls);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const options: ConfigOptions = {};
      await configCommand(options);

      const logOutput = logSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logOutput).toContain('null');

      logSpy.mockRestore();
    });
  });
}); 