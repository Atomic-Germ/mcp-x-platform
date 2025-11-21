import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

export interface PlatformAPI {
  name: string;
  platforms: string[];
  alternatives?: Record<string, string>;
}

export interface PlatformAPIIssue {
  type: "platform-api";
  severity: "low" | "medium" | "high" | "critical";
  platform: string;
  apiName: string;
  location: { line: number; column: number };
  message: string;
  suggestion?: string;
}

/**
 * Known platform-specific APIs
 */
const PLATFORM_APIS: Record<string, PlatformAPI> = {
  // Windows-specific
  win32: { name: "win32", platforms: ["windows"] },
  GetSystemDirectory: { name: "GetSystemDirectory", platforms: ["windows"] },
  RegOpenKeyEx: { name: "RegOpenKeyEx", platforms: ["windows"] },

  // POSIX/Unix-specific
  fork: { name: "fork", platforms: ["posix", "linux", "macos"] },
  exec: { name: "exec", platforms: ["posix", "linux", "macos"] },
  chmod: { name: "chmod", platforms: ["posix", "linux", "macos"] },
  chown: { name: "chown", platforms: ["posix", "linux", "macos"] },

  // macOS-specific
  NSApplication: { name: "NSApplication", platforms: ["macos"] },
  FSEventStreamCreate: { name: "FSEventStreamCreate", platforms: ["macos"] },

  // Linux-specific
  inotify_init: { name: "inotify_init", platforms: ["linux"] },
  epoll_create: { name: "epoll_create", platforms: ["linux"] },
};

/**
 * Analyze code for platform-specific API usage
 */
export class PlatformAPIAnalyzer {
  private issues: PlatformAPIIssue[] = [];

  analyze(code: string, filePath: string): PlatformAPIIssue[] {
    this.issues = [];

    try {
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });

      traverse(ast, {
        // Check for imports of platform-specific modules
        ImportDeclaration: (path) => {
          const source = path.node.source.value;
          if (this.isPlatformSpecificImport(source)) {
            this.issues.push({
              type: "platform-api",
              severity: "high",
              platform: this.getPlatformFromImport(source),
              apiName: source,
              location: {
                line: path.node.loc?.start.line || 0,
                column: path.node.loc?.start.column || 0,
              },
              message: `Platform-specific import detected: ${source}`,
              suggestion:
                "Consider using a cross-platform alternative or feature detection",
            });
          }
        },

        // Check for platform-specific function calls
        CallExpression: (path) => {
          if (t.isIdentifier(path.node.callee)) {
            const functionName = path.node.callee.name;
            const apiInfo = PLATFORM_APIS[functionName];

            if (apiInfo) {
              this.issues.push({
                type: "platform-api",
                severity: "high",
                platform: apiInfo.platforms.join(", "),
                apiName: functionName,
                location: {
                  line: path.node.loc?.start.line || 0,
                  column: path.node.loc?.start.column || 0,
                },
                message: `Platform-specific API call: ${functionName} (${apiInfo.platforms.join(", ")})`,
                suggestion: this.getSuggestion(functionName),
              });
            }
          }

          // Check for process.platform checks
          if (
            t.isMemberExpression(path.node.callee) &&
            t.isIdentifier(path.node.callee.object, { name: "process" }) &&
            t.isIdentifier(path.node.callee.property, { name: "platform" })
          ) {
            // This is actually good - they're checking the platform
            // But we should track it for the report
          }
        },

        // Check for require() of platform-specific modules
        VariableDeclarator: (path) => {
          if (
            t.isCallExpression(path.node.init) &&
            t.isIdentifier(path.node.init.callee, { name: "require" }) &&
            path.node.init.arguments.length > 0
          ) {
            const arg = path.node.init.arguments[0];
            if (t.isStringLiteral(arg)) {
              const moduleName = arg.value;
              if (this.isPlatformSpecificImport(moduleName)) {
                this.issues.push({
                  type: "platform-api",
                  severity: "high",
                  platform: this.getPlatformFromImport(moduleName),
                  apiName: moduleName,
                  location: {
                    line: path.node.loc?.start.line || 0,
                    column: path.node.loc?.start.column || 0,
                  },
                  message: `Platform-specific module required: ${moduleName}`,
                  suggestion: "Use dynamic imports with feature detection",
                });
              }
            }
          }
        },
      });
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error);
    }

    return this.issues;
  }

  private isPlatformSpecificImport(moduleName: string): boolean {
    const platformSpecificModules = [
      "win32",
      "fsevents",
      "inotify",
      "node-windows",
      "node-mac",
      "node-linux",
    ];

    return platformSpecificModules.some((mod) => moduleName.includes(mod));
  }

  private getPlatformFromImport(moduleName: string): string {
    if (moduleName.includes("win32") || moduleName.includes("windows"))
      return "windows";
    if (
      moduleName.includes("mac") ||
      moduleName.includes("darwin") ||
      moduleName.includes("fsevents")
    )
      return "macos";
    if (moduleName.includes("linux") || moduleName.includes("inotify"))
      return "linux";
    return "unknown";
  }

  private getSuggestion(apiName: string): string {
    const suggestions: Record<string, string> = {
      fork: "Use worker_threads for cross-platform parallelism",
      chmod: "Use fs.chmod with platform checks",
      chown: "Check platform before using chown, not available on Windows",
    };

    return (
      suggestions[apiName] || "Use feature detection and provide fallbacks"
    );
  }
}
