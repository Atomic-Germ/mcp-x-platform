import * as fs from 'fs';
import * as path from 'path';

export interface FilePathIssue {
  type: 'file-path';
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue: 'separator' | 'case-sensitivity' | 'reserved-name' | 'absolute-path' | 'special-chars';
  filePath: string;
  location?: { line: number; column: number };
  message: string;
  suggestion: string;
}

/**
 * Windows reserved file names
 */
const WINDOWS_RESERVED_NAMES = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
];

/**
 * Analyze file paths for cross-platform compatibility issues
 */
export class FilePathAnalyzer {
  private issues: FilePathIssue[] = [];

  analyzeCode(code: string, filePath: string): FilePathIssue[] {
    this.issues = [];

    // Check for hardcoded path separators
    this.checkPathSeparators(code, filePath);

    // Check for absolute paths
    this.checkAbsolutePaths(code, filePath);

    // Check for case sensitivity issues
    this.checkCaseSensitivity(code, filePath);

    return this.issues;
  }

  analyzeFilesystem(directoryPath: string): FilePathIssue[] {
    this.issues = [];

    this.traverseDirectory(directoryPath);

    return this.issues;
  }

  private traverseDirectory(dirPath: string): void {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // Check for reserved names
        if (this.isReservedName(entry.name)) {
          this.issues.push({
            type: 'file-path',
            severity: 'critical',
            issue: 'reserved-name',
            filePath: fullPath,
            message: `File/directory name "${entry.name}" is reserved on Windows`,
            suggestion: 'Rename to avoid Windows reserved names',
          });
        }

        // Check for problematic characters
        if (this.hasSpecialCharacters(entry.name)) {
          this.issues.push({
            type: 'file-path',
            severity: 'medium',
            issue: 'special-chars',
            filePath: fullPath,
            message: `File/directory name contains special characters: "${entry.name}"`,
            suggestion: 'Use alphanumeric characters, hyphens, and underscores only',
          });
        }

        // Check for case sensitivity issues (files that differ only in case)
        this.checkDuplicateCaseInsensitive(dirPath, entry.name);

        // Recurse into subdirectories
        if (entry.isDirectory()) {
          this.traverseDirectory(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
  }

  private checkPathSeparators(code: string, filePath: string): void {
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      // Look for hardcoded backslashes in strings
      const backslashMatches = line.match(/['"`].*\\+.*['"`]/g);
      if (backslashMatches) {
        this.issues.push({
          type: 'file-path',
          severity: 'high',
          issue: 'separator',
          filePath,
          location: { line: index + 1, column: line.indexOf('\\') },
          message: 'Hardcoded backslash path separator detected',
          suggestion: 'Use path.join() or path.resolve() for cross-platform compatibility',
        });
      }

      // Look for forward slashes in what might be Windows paths
      if (line.includes('C:/') || line.includes('D:/')) {
        this.issues.push({
          type: 'file-path',
          severity: 'medium',
          issue: 'separator',
          filePath,
          location: { line: index + 1, column: line.indexOf(':/') },
          message: 'Hardcoded drive letter detected',
          suggestion: 'Avoid absolute paths; use relative paths or environment variables',
        });
      }
    });
  }

  private checkAbsolutePaths(code: string, filePath: string): void {
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      // Unix absolute paths
      if (line.match(/['"`]\/[a-zA-Z\/]+['"`]/)) {
        this.issues.push({
          type: 'file-path',
          severity: 'high',
          issue: 'absolute-path',
          filePath,
          location: { line: index + 1, column: line.indexOf('/') },
          message: 'Hardcoded absolute path detected',
          suggestion: 'Use relative paths or environment-specific configuration',
        });
      }

      // Windows absolute paths
      if (line.match(/['"`][A-Z]:[\\\/]/)) {
        this.issues.push({
          type: 'file-path',
          severity: 'high',
          issue: 'absolute-path',
          filePath,
          location: { line: index + 1, column: line.search(/[A-Z]:/) },
          message: 'Hardcoded Windows absolute path detected',
          suggestion: 'Use relative paths or environment-specific configuration',
        });
      }
    });
  }

  private checkCaseSensitivity(code: string, filePath: string): void {
    // This would require more sophisticated analysis
    // For now, we'll flag potential issues based on patterns
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('require(') || line.includes('import ')) {
        const moduleMatch = line.match(/['"`]\.\/([^'"`]+)['"`]/);
        if (moduleMatch) {
          const modulePath = moduleMatch[1];
          // Check if the path uses inconsistent casing
          if (modulePath !== modulePath.toLowerCase() && modulePath !== modulePath.toUpperCase()) {
            this.issues.push({
              type: 'file-path',
              severity: 'medium',
              issue: 'case-sensitivity',
              filePath,
              location: { line: index + 1, column: 0 },
              message: 'Mixed-case path detected - may cause issues on case-sensitive filesystems',
              suggestion: 'Use consistent lowercase naming for cross-platform compatibility',
            });
          }
        }
      }
    });
  }

  private isReservedName(name: string): boolean {
    const baseName = path.parse(name).name.toUpperCase();
    return WINDOWS_RESERVED_NAMES.includes(baseName);
  }

  private hasSpecialCharacters(name: string): boolean {
    // Characters that are problematic across platforms
    const problematicChars = /[<>:"|?*\x00-\x1f]/;
    return problematicChars.test(name);
  }

  private checkDuplicateCaseInsensitive(dirPath: string, fileName: string): void {
    try {
      const entries = fs.readdirSync(dirPath);
      const lowerCaseFiles = entries.map(e => e.toLowerCase());
      const duplicates = lowerCaseFiles.filter((name, index) => 
        lowerCaseFiles.indexOf(name) !== index
      );

      if (duplicates.includes(fileName.toLowerCase())) {
        this.issues.push({
          type: 'file-path',
          severity: 'critical',
          issue: 'case-sensitivity',
          filePath: path.join(dirPath, fileName),
          message: `File/directory name conflicts with another name that differs only in case`,
          suggestion: 'Ensure all files have unique names regardless of case',
        });
      }
    } catch (error) {
      // Ignore errors
    }
  }
}
