import { OptimistConfig, ServerInfo, Tool } from "./types";

/**
 * Default configuration for Optimist server
 */
const DEFAULT_CONFIG: Required<OptimistConfig> = {
  maxComplexity: 10,
  analysisDepth: "medium",
  ignorePatterns: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  fileExtensions: [".js", ".ts", ".jsx", ".tsx"],
  enabledTools: "all",
};

/**
 * XPlatformServer - Main MCP server implementation for cross-platform analysis
 */
export class XPlatformServer {
  public readonly name = "x-platform";
  public readonly version = "0.1.0";
  private readonly protocolVersion = "2024-11-05";
  public readonly config: Required<OptimistConfig>;

  constructor(config: OptimistConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get server information
   */
  getServerInfo(): ServerInfo {
    return {
      name: this.name,
      version: this.version,
      protocolVersion: this.protocolVersion,
    };
  }

  /**
   * List available tools
   */
  listTools(): Tool[] {
    const tools: Tool[] = [
      {
        name: "detect_platform_apis",
        description:
          "Detect platform-specific API calls (Windows, macOS, Linux, POSIX)",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Directory or file path to analyze",
            },
            platforms: {
              type: "array",
              items: {
                type: "string",
                enum: ["windows", "macos", "linux", "posix"],
              },
              description: "Platforms to check against",
            },
            includeTests: {
              type: "boolean",
              description: "Include test files",
              default: false,
            },
          },
          required: ["path"],
        },
      },
      {
        name: "analyze_file_paths",
        description:
          "Analyze file system paths for cross-platform compatibility issues",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Directory or file path to analyze",
            },
            checkCaseSensitivity: {
              type: "boolean",
              description: "Check for case sensitivity issues",
              default: true,
            },
            checkSeparators: {
              type: "boolean",
              description: "Check path separator usage",
              default: true,
            },
            checkReservedNames: {
              type: "boolean",
              description: "Check for Windows reserved names",
              default: true,
            },
          },
          required: ["path"],
        },
      },
      {
        name: "analyze_line_endings",
        description: "Detect line ending inconsistencies (CRLF vs LF)",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Directory or file path to analyze",
            },
            autoFix: {
              type: "boolean",
              description: "Suggest auto-fix options",
              default: false,
            },
            preferredEnding: {
              type: "string",
              enum: ["LF", "CRLF", "auto"],
              description: "Preferred line ending style",
              default: "LF",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "analyze_shell_commands",
        description:
          "Analyze shell commands and scripts for cross-platform compatibility",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Directory or file path to analyze",
            },
            targetShells: {
              type: "array",
              items: {
                type: "string",
                enum: ["bash", "sh", "powershell", "cmd", "zsh"],
              },
              description: "Target shell environments",
            },
            checkEnvVars: {
              type: "boolean",
              description: "Check environment variable usage",
              default: true,
            },
          },
          required: ["path"],
        },
      },
      {
        name: "analyze_dependencies",
        description:
          "Analyze dependencies for platform-specific packages and compatibility",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Project root path" },
            checkNativeModules: {
              type: "boolean",
              description: "Check for native/binary dependencies",
              default: true,
            },
            checkArchitecture: {
              type: "boolean",
              description: "Check architecture-specific dependencies",
              default: true,
            },
            platforms: {
              type: "array",
              items: { type: "string" },
              description: "Target platforms to validate against",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "analyze_build_systems",
        description:
          "Analyze build system configurations for cross-platform compatibility",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Project root path" },
            buildTools: {
              type: "array",
              items: {
                type: "string",
                enum: ["npm", "yarn", "pnpm", "make", "cmake", "gradle"],
              },
              description: "Build tools to analyze",
            },
            checkScripts: {
              type: "boolean",
              description: "Check build scripts for platform issues",
              default: true,
            },
          },
          required: ["path"],
        },
      },
      {
        name: "detect_encoding_issues",
        description:
          "Detect file encoding issues that may cause cross-platform problems",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Directory or file path to analyze",
            },
            preferredEncoding: {
              type: "string",
              enum: ["UTF-8", "UTF-16", "ASCII"],
              description: "Preferred file encoding",
              default: "UTF-8",
            },
            checkBOM: {
              type: "boolean",
              description: "Check for BOM (Byte Order Mark) issues",
              default: true,
            },
          },
          required: ["path"],
        },
      },
      {
        name: "generate_compatibility_report",
        description:
          "Generate comprehensive cross-platform compatibility report",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Project root path" },
            targetPlatforms: {
              type: "array",
              items: { type: "string", enum: ["windows", "macos", "linux"] },
              description: "Target platforms for analysis",
              default: ["windows", "macos", "linux"],
            },
            format: {
              type: "string",
              enum: ["summary", "detailed", "json", "markdown"],
              description: "Report format",
              default: "summary",
            },
            severity: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Minimum severity to include",
              default: "medium",
            },
          },
          required: ["path"],
        },
      },
    ];

    return tools;
  }
}
