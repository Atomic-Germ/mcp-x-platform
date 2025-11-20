import { OllamaService } from '../../src/services/OllamaService';
import { ConfigManager } from '../../src/config/ConfigManager';
import { ValidationError } from '../../src/types';

describe('OllamaService', () => {
  let service: OllamaService;
  let config: ConfigManager;

  beforeEach(() => {
    config = new ConfigManager({ timeout: 5000, maxRetries: 1 });
    service = new OllamaService(config);
  });

  describe('validation', () => {
    it('should throw ValidationError for empty model', async () => {
      await expect(service.consult({ model: '', prompt: 'test' })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty prompt', async () => {
      await expect(service.consult({ model: 'llama2', prompt: '' })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for invalid temperature', async () => {
      await expect(
        service.consult({ model: 'llama2', prompt: 'test', temperature: 3 })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for negative temperature', async () => {
      await expect(
        service.consult({ model: 'llama2', prompt: 'test', temperature: -1 })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('compareModels', () => {
    it('should throw ValidationError for empty models array', async () => {
      await expect(service.compareModels([], 'test prompt')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty prompt', async () => {
      await expect(service.compareModels(['llama2'], '')).rejects.toThrow(ValidationError);
    });
  });
});
