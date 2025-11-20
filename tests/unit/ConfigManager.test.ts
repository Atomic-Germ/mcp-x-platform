import { ConfigManager } from '../../src/config/ConfigManager';
import { ValidationError } from '../../src/types';

describe('ConfigManager', () => {
  describe('constructor', () => {
    it('should use default values when no options provided', () => {
      const config = new ConfigManager();
      expect(config.getOllamaBaseUrl()).toBe('http://localhost:11434');
      expect(config.getDefaultModel()).toBeTruthy();
      expect(config.getTimeout()).toBe(30000);
      expect(config.getMaxRetries()).toBe(3);
    });

    it('should accept custom configuration', () => {
      const config = new ConfigManager({
        ollamaBaseUrl: 'http://custom:8080',
        defaultModel: 'mistral',
        timeout: 60000,
        maxRetries: 5,
      });
      expect(config.getOllamaBaseUrl()).toBe('http://custom:8080');
      expect(config.getDefaultModel()).toBe('mistral');
      expect(config.getTimeout()).toBe(60000);
      expect(config.getMaxRetries()).toBe(5);
    });

    it('should remove trailing slash from URL', () => {
      const config = new ConfigManager({
        ollamaBaseUrl: 'http://localhost:11434/',
      });
      expect(config.getOllamaBaseUrl()).toBe('http://localhost:11434');
    });

    it('should throw ValidationError for invalid URL', () => {
      expect(() => new ConfigManager({ ollamaBaseUrl: 'not-a-url' })).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-HTTP protocol', () => {
      expect(() => new ConfigManager({ ollamaBaseUrl: 'ftp://localhost:11434' })).toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for timeout too small', () => {
      expect(() => new ConfigManager({ timeout: 500 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for timeout too large', () => {
      expect(() => new ConfigManager({ timeout: 400000 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for negative retries', () => {
      expect(() => new ConfigManager({ maxRetries: -1 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for retries too large', () => {
      expect(() => new ConfigManager({ maxRetries: 11 })).toThrow(ValidationError);
    });
  });

  describe('getApiUrl', () => {
    it('should construct correct API URL', () => {
      const config = new ConfigManager({ ollamaBaseUrl: 'http://localhost:11434' });
      expect(config.getApiUrl('/api/generate')).toBe('http://localhost:11434/api/generate');
    });
  });
});
