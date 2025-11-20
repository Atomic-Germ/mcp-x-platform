import * as fs from 'fs';
import * as path from 'path';
import { ShellCommandAnalyzer } from '../analyzers/shell-command-analyzer';

export interface AnalyzeShellCommandsInput {
  path: string;
  targetShells?: string[];
  checkEnvVars?: boolean;
}

export interface AnalyzeShellCommandsResult {
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

export async function analyzeShellCommands(
  input: AnalyzeShellCommandsInput
): Promise<AnalyzeShellCommandsResult> {
  const analyzer = new ShellCommandAnalyzer();
  const allIssues: any[] = [];

  const filesToAnalyze = collectRelevantFiles(input.path);

  for (const filePath of filesToAnalyze) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(filePath);

      let issues: any[] = [];
      
      if (['.sh', '.bash'].includes(ext)) {
        issues = analyzer.analyzeShellScript(code, filePath);
      } else {
        issues = analyzer.analyzeCode(code, filePath);
      }

      allIssues.push(...issues);
    } catch (error) {
      // Skip files that can't be read
    }
  }

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
  const recommendations: string[] = [];

  if (byIssueType['platform-specific']) {
    recommendations.push('Use cross-platform alternatives:');
    recommendations.push('  - Use "rimraf" instead of rm/del');
    recommendations.push('  - Use "cross-spawn" for spawning processes');
    recommendations.push('  - Use "cross-env" for environment variables');
    recommendations.push('  - Use "shelljs" for portable shell commands');
  }

  if (byIssueType['incompatible-shell']) {
    recommendations.push('Provide both .sh and .bat/.ps1 scripts for cross-platform support');
    recommendations.push('Or use Node.js scripts instead of shell scripts');
  }

  if (byIssueType['env-var']) {
    recommendations.push('Always check environment variables before use: process.env.VAR || defaultValue');
  }

  recommendations.push('Consider using package.json scripts with cross-platform tools');

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

function collectRelevantFiles(targetPath: string): string[] {
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
        if (isRelevantFile(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Can't read directory
  }
}

function isRelevantFile(fileName: string): boolean {
  const ext = path.extname(fileName);
  return (
    ['.js', '.ts', '.jsx', '.tsx', '.sh', '.bash', '.bat', '.ps1', '.cmd'].includes(ext) ||
    fileName === 'package.json'
  );
}

function shouldSkipDirectory(dirName: string): boolean {
  const skipDirs = ['node_modules', 'dist', 'build', 'coverage', '.git'];
  return skipDirs.includes(dirName);
}
