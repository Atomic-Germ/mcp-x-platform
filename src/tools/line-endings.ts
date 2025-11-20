import * as fs from 'fs';
import * as path from 'path';
import { LineEndingAnalyzer } from '../analyzers/line-ending-analyzer';

export interface AnalyzeLineEndingsInput {
  path: string;
  autoFix?: boolean;
  preferredEnding?: 'LF' | 'CRLF' | 'auto';
}

export interface AnalyzeLineEndingsResult {
  success: boolean;
  issues: any[];
  summary: {
    totalFiles: number;
    byEnding: Record<string, number>;
    mixedEndingFiles: number;
  };
  gitAttributesSuggestion: string;
  recommendations: string[];
}

export async function analyzeLineEndings(
  input: AnalyzeLineEndingsInput
): Promise<AnalyzeLineEndingsResult> {
  const analyzer = new LineEndingAnalyzer();
  const allIssues: any[] = [];
  const filesToAnalyze = collectTextFiles(input.path);

  const byEnding: Record<string, number> = {
    LF: 0,
    CRLF: 0,
    CR: 0,
    mixed: 0,
  };

  for (const filePath of filesToAnalyze) {
    const issue = analyzer.analyze(filePath);
    if (issue) {
      allIssues.push(issue);
      byEnding[issue.detectedEnding]++;
    }
  }

  const mixedEndingFiles = byEnding.mixed || 0;

  const recommendations: string[] = [
    'Configure .gitattributes to enforce consistent line endings',
    'Set up editor config (.editorconfig) for team consistency',
    'Use "* text=auto eol=lf" in .gitattributes for cross-platform projects',
  ];

  if (mixedEndingFiles > 0) {
    recommendations.unshift('URGENT: Fix files with mixed line endings immediately');
    recommendations.push('Run: git add --renormalize . to normalize line endings');
  }

  return {
    success: true,
    issues: allIssues,
    summary: {
      totalFiles: filesToAnalyze.length,
      byEnding,
      mixedEndingFiles,
    },
    gitAttributesSuggestion: analyzer.suggestGitAttributes(),
    recommendations,
  };
}

function collectTextFiles(targetPath: string): string[] {
  const files: string[] = [];

  try {
    const stat = fs.statSync(targetPath);

    if (stat.isFile()) {
      if (isTextFile(targetPath)) {
        files.push(targetPath);
      }
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
        if (isTextFile(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Can't read directory
  }
}

function isTextFile(fileName: string): boolean {
  const ext = path.extname(fileName);
  const textExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt',
    '.sh', '.bat', '.ps1', '.yml', '.yaml', '.xml', '.html',
    '.css', '.scss', '.less', '.py', '.rb', '.go', '.java',
    '.c', '.cpp', '.h', '.hpp', '.cs', '.php',
  ];
  return textExtensions.includes(ext);
}

function shouldSkipDirectory(dirName: string): boolean {
  const skipDirs = ['node_modules', 'dist', 'build', 'coverage', '.git'];
  return skipDirs.includes(dirName);
}
