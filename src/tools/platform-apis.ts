import * as fs from "fs";
import * as path from "path";
import { PlatformAPIAnalyzer } from "../analyzers/platform-api-analyzer";

export interface DetectPlatformAPIsInput {
  path: string;
  platforms?: string[];
  includeTests?: boolean;
}

export interface DetectPlatformAPIsResult {
  success: boolean;
  issues: any[];
  summary: {
    totalFiles: number;
    totalIssues: number;
    bySeverity: Record<string, number>;
    byPlatform: Record<string, number>;
  };
  recommendations: string[];
}

export async function detectPlatformAPIs(
  input: DetectPlatformAPIsInput,
): Promise<DetectPlatformAPIsResult> {
  const analyzer = new PlatformAPIAnalyzer();
  const allIssues: any[] = [];
  let totalFiles = 0;

  const filesToAnalyze = collectFiles(input.path, input.includeTests || false);

  for (const filePath of filesToAnalyze) {
    try {
      const code = fs.readFileSync(filePath, "utf-8");
      const issues = analyzer.analyze(code, filePath);
      allIssues.push(...issues);
      totalFiles++;
    } catch (error) {
      // Skip files that can't be read
    }
  }

  // Calculate summary statistics
  const bySeverity: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  const byPlatform: Record<string, number> = {};

  for (const issue of allIssues) {
    bySeverity[issue.severity]++;

    const platforms = issue.platform.split(", ");
    for (const platform of platforms) {
      byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (allIssues.length > 0) {
    recommendations.push(
      "Use feature detection and provide fallbacks for platform-specific APIs",
    );
    recommendations.push(
      'Consider using cross-platform libraries like "cross-spawn" for child processes',
    );
    recommendations.push(
      "Add platform checks: if (process.platform === 'win32') { ... }",
    );
  }

  if (bySeverity.high > 0 || bySeverity.critical > 0) {
    recommendations.push(
      "HIGH PRIORITY: Address critical and high-severity platform issues first",
    );
  }

  return {
    success: true,
    issues: allIssues,
    summary: {
      totalFiles,
      totalIssues: allIssues.length,
      bySeverity,
      byPlatform,
    },
    recommendations,
  };
}

function collectFiles(targetPath: string, includeTests: boolean): string[] {
  const files: string[] = [];

  try {
    const stat = fs.statSync(targetPath);

    if (stat.isFile()) {
      if (isAnalyzableFile(targetPath)) {
        files.push(targetPath);
      }
    } else if (stat.isDirectory()) {
      traverseDirectory(targetPath, files, includeTests);
    }
  } catch (error) {
    // Path doesn't exist
  }

  return files;
}

function traverseDirectory(
  dirPath: string,
  files: string[],
  includeTests: boolean,
): void {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip node_modules and other common directories
      if (entry.isDirectory()) {
        if (shouldSkipDirectory(entry.name)) {
          continue;
        }
        traverseDirectory(fullPath, files, includeTests);
      } else if (entry.isFile()) {
        if (!includeTests && isTestFile(entry.name)) {
          continue;
        }
        if (isAnalyzableFile(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Can't read directory
  }
}

function isAnalyzableFile(fileName: string): boolean {
  const ext = path.extname(fileName);
  return [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs"].includes(ext);
}

function isTestFile(fileName: string): boolean {
  return (
    /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(fileName) ||
    fileName.includes("__tests__")
  );
}

function shouldSkipDirectory(dirName: string): boolean {
  const skipDirs = [
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".git",
    ".vscode",
  ];
  return skipDirs.includes(dirName);
}
