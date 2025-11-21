import * as fs from "fs";
import * as path from "path";
import { FilePathAnalyzer } from "../analyzers/file-path-analyzer";

export interface AnalyzeFilePathsInput {
  path: string;
  checkCaseSensitivity?: boolean;
  checkSeparators?: boolean;
  checkReservedNames?: boolean;
}

export interface AnalyzeFilePathsResult {
  success: boolean;
  issues: any[];
  summary: {
    totalFiles: number;
    totalIssues: number;
    byIssueType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  recommendations: string[];
}

export async function analyzeFilePaths(
  input: AnalyzeFilePathsInput,
): Promise<AnalyzeFilePathsResult> {
  const analyzer = new FilePathAnalyzer();

  // Analyze both code and filesystem
  const codeIssues: any[] = [];
  const filesystemIssues = analyzer.analyzeFilesystem(input.path);

  // Also analyze code for hardcoded paths
  const filesToAnalyze = collectFiles(input.path);

  for (const filePath of filesToAnalyze) {
    try {
      const code = fs.readFileSync(filePath, "utf-8");
      const issues = analyzer.analyzeCode(code, filePath);
      codeIssues.push(...issues);
    } catch (error) {
      // Skip files that can't be read
    }
  }

  const allIssues = [...codeIssues, ...filesystemIssues];

  // Calculate summary
  const byIssueType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const issue of allIssues) {
    byIssueType[issue.issue] = (byIssueType[issue.issue] || 0) + 1;
    bySeverity[issue.severity]++;
  }

  // Generate recommendations
  const recommendations: string[] = [
    "Always use path.join() or path.resolve() instead of string concatenation",
    "Use path.sep for cross-platform path separators",
    "Avoid absolute paths - use relative paths or environment variables",
    "Normalize paths with path.normalize() when handling user input",
  ];

  if (byIssueType["reserved-name"]) {
    recommendations.push(
      "CRITICAL: Rename files that use Windows reserved names",
    );
  }

  if (byIssueType["case-sensitivity"]) {
    recommendations.push(
      "Ensure consistent file naming to avoid case-sensitivity issues",
    );
  }

  return {
    success: true,
    issues: allIssues,
    summary: {
      totalFiles: filesToAnalyze.length,
      totalIssues: allIssues.length,
      byIssueType,
      bySeverity,
    },
    recommendations,
  };
}

function collectFiles(targetPath: string): string[] {
  const files: string[] = [];

  try {
    const stat = fs.statSync(targetPath);

    if (stat.isFile()) {
      files.push(targetPath);
    } else if (stat.isDirectory()) {
      traverseDirectory(targetPath, files);
    }
  } catch (error) {
    // Path doesn't exist
  }

  return files;
}

function traverseDirectory(dirPath: string, files: string[]): void {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (shouldSkipDirectory(entry.name)) {
          continue;
        }
        traverseDirectory(fullPath, files);
      } else if (entry.isFile()) {
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
  return [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".json",
    ".sh",
    ".bat",
    ".ps1",
  ].includes(ext);
}

function shouldSkipDirectory(dirName: string): boolean {
  const skipDirs = ["node_modules", "dist", "build", "coverage", ".git"];
  return skipDirs.includes(dirName);
}
