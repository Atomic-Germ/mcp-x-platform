/**
 * Configuration options for Optimist server
 */
export interface OptimistConfig {
  maxComplexity?: number;
  analysisDepth?: 'shallow' | 'medium' | 'deep';
  ignorePatterns?: string[];
  fileExtensions?: string[];
  enabledTools?: string[] | 'all';
}

/**
 * Server information
 */
export interface ServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
}

/**
 * Tool definition
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: object;
}

/**
 * Analysis result structure
 */
export interface AnalysisResult {
  status: 'success' | 'error';
  tool: string;
  data: {
    summary: string;
    findings: Finding[];
    suggestions: Suggestion[];
    metrics: Record<string, any>;
  };
  metadata: {
    timestamp: string;
    duration: number;
    filesAnalyzed: number;
  };
}

/**
 * Finding structure
 */
export interface Finding {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    file: string;
    line?: number;
    column?: number;
  };
  message: string;
  code?: string;
}

/**
 * Suggestion structure
 */
export interface Suggestion {
  type: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  example?: string;
  impact?: string;
}
