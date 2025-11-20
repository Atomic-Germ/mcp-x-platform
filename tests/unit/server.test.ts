import { OptimistServer } from '../../src/server';

describe('OptimistServer', () => {
  describe('initialization', () => {
    it('should create server instance with default config', () => {
      const server = new OptimistServer();
      expect(server).toBeDefined();
      expect(server.name).toBe('optimist');
      expect(server.version).toBe('0.1.0');
    });

    it('should accept custom configuration', () => {
      const config = { maxComplexity: 15 };
      const server = new OptimistServer(config);
      expect(server.config.maxComplexity).toBe(15);
    });

    it('should expose server info via getServerInfo', () => {
      const server = new OptimistServer();
      const info = server.getServerInfo();
      expect(info.name).toBe('optimist');
      expect(info.version).toBe('0.1.0');
      expect(info.protocolVersion).toBeDefined();
    });
  });

  describe('tool management', () => {
    it('should list available tools', () => {
      const server = new OptimistServer();
      const tools = server.listTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should include analyze_performance tool', () => {
      const server = new OptimistServer();
      const tools = server.listTools();
      const perfTool = tools.find((t) => t.name === 'analyze_performance');
      expect(perfTool).toBeDefined();
      expect(perfTool?.description).toContain('performance');
    });
  });
});
