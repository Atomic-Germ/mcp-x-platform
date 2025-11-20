export interface ShellCommandIssue {
  type: 'shell-command';
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue: 'incompatible-shell' | 'platform-specific' | 'env-var' | 'command-not-found';
  command: string;
  location?: { line: number; column: number };
  platform: string[];
  message: string;
  suggestion: string;
}

/**
 * Shell commands and their platform compatibility
 */
interface ShellCommand {
  name: string;
  platforms: string[];
  alternatives?: Record<string, string>;
}

const SHELL_COMMANDS: Record<string, ShellCommand> = {
  // Unix/POSIX commands
  'ls': { name: 'ls', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'dir' } },
  'grep': { name: 'grep', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'findstr' } },
  'cat': { name: 'cat', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'type' } },
  'rm': { name: 'rm', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'del' } },
  'mv': { name: 'mv', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'move' } },
  'cp': { name: 'cp', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'copy' } },
  'chmod': { name: 'chmod', platforms: ['linux', 'macos', 'posix'] },
  'chown': { name: 'chown', platforms: ['linux', 'macos', 'posix'] },
  'ps': { name: 'ps', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'tasklist' } },
  'kill': { name: 'kill', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'taskkill' } },
  'which': { name: 'which', platforms: ['linux', 'macos', 'posix'], alternatives: { windows: 'where' } },
  
  // Windows commands
  'dir': { name: 'dir', platforms: ['windows'], alternatives: { unix: 'ls' } },
  'del': { name: 'del', platforms: ['windows'], alternatives: { unix: 'rm' } },
  'copy': { name: 'copy', platforms: ['windows'], alternatives: { unix: 'cp' } },
  'move': { name: 'move', platforms: ['windows'], alternatives: { unix: 'mv' } },
  'tasklist': { name: 'tasklist', platforms: ['windows'], alternatives: { unix: 'ps' } },
  'taskkill': { name: 'taskkill', platforms: ['windows'], alternatives: { unix: 'kill' } },
};

/**
 * Analyze shell commands for cross-platform compatibility
 */
export class ShellCommandAnalyzer {
  private issues: ShellCommandIssue[] = [];

  analyzeCode(code: string, filePath: string): ShellCommandIssue[] {
    this.issues = [];

    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for exec, spawn, execSync patterns
      if (
        line.includes('exec(') ||
        line.includes('execSync(') ||
        line.includes('spawn(') ||
        line.includes('spawnSync(')
      ) {
        this.analyzeCommandLine(line, index + 1);
      }

      // Check for shell scripts in package.json scripts
      if (line.includes('"scripts"') || line.match(/"\w+":\s*"/)) {
        this.analyzeCommandLine(line, index + 1);
      }

      // Check for environment variable access
      this.checkEnvironmentVariables(line, index + 1);
    });

    return this.issues;
  }

  analyzeShellScript(scriptContent: string, filePath: string): ShellCommandIssue[] {
    this.issues = [];

    const lines = scriptContent.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (trimmed.startsWith('#') || trimmed === '') {
        return;
      }

      // Check shebang
      if (index === 0 && trimmed.startsWith('#!')) {
        this.analyzeShebang(trimmed, index + 1);
      }

      // Check for platform-specific commands
      this.analyzeCommandLine(line, index + 1);
    });

    return this.issues;
  }

  private analyzeCommandLine(line: string, lineNumber: number): void {
    // Extract commands from the line
    const commands = this.extractCommands(line);

    for (const cmd of commands) {
      const cmdInfo = SHELL_COMMANDS[cmd];
      
      if (cmdInfo) {
        const isWindows = cmdInfo.platforms.includes('windows');
        const isUnix = cmdInfo.platforms.some(p => ['linux', 'macos', 'posix'].includes(p));

        if (isWindows && !isUnix) {
          this.issues.push({
            type: 'shell-command',
            severity: 'high',
            issue: 'platform-specific',
            command: cmd,
            location: { line: lineNumber, column: line.indexOf(cmd) },
            platform: ['windows'],
            message: `Windows-specific command "${cmd}" detected`,
            suggestion: cmdInfo.alternatives?.unix 
              ? `Use "${cmdInfo.alternatives.unix}" on Unix systems or use a cross-platform alternative`
              : 'Consider using Node.js APIs instead of shell commands',
          });
        } else if (isUnix && !isWindows) {
          this.issues.push({
            type: 'shell-command',
            severity: 'high',
            issue: 'platform-specific',
            command: cmd,
            location: { line: lineNumber, column: line.indexOf(cmd) },
            platform: cmdInfo.platforms,
            message: `Unix-specific command "${cmd}" detected`,
            suggestion: cmdInfo.alternatives?.windows
              ? `Use "${cmdInfo.alternatives.windows}" on Windows or use a cross-platform alternative`
              : 'Consider using Node.js APIs instead of shell commands',
          });
        }
      }
    }
  }

  private extractCommands(line: string): string[] {
    const commands: string[] = [];
    
    // Simple command extraction - look for known command names
    for (const cmd of Object.keys(SHELL_COMMANDS)) {
      const regex = new RegExp(`\\b${cmd}\\b`);
      if (regex.test(line)) {
        commands.push(cmd);
      }
    }

    return commands;
  }

  private checkEnvironmentVariables(line: string, lineNumber: number): void {
    // Check for environment variable patterns
    const patterns = [
      /\$[A-Z_][A-Z0-9_]*/g,  // Unix-style: $VAR
      /%[A-Z_][A-Z0-9_]*%/g,  // Windows-style: %VAR%
      /process\.env\.[A-Z_][A-Z0-9_]*/g,  // Node.js: process.env.VAR
    ];

    for (const pattern of patterns) {
      const matches = line.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Common cross-platform env vars are OK
          const commonVars = ['PATH', 'HOME', 'USER', 'TEMP', 'TMP'];
          const varName = match.replace(/[$%]/g, '').replace('process.env.', '');
          
          if (!commonVars.includes(varName)) {
            this.issues.push({
              type: 'shell-command',
              severity: 'medium',
              issue: 'env-var',
              command: match,
              location: { line: lineNumber, column: line.indexOf(match) },
              platform: [],
              message: `Environment variable "${varName}" may not be available on all platforms`,
              suggestion: 'Check if environment variable exists before using it, or provide defaults',
            });
          }
        }
      }
    }
  }

  private analyzeShebang(shebang: string, lineNumber: number): void {
    if (shebang.includes('/bin/bash') || shebang.includes('/usr/bin/bash')) {
      this.issues.push({
        type: 'shell-command',
        severity: 'medium',
        issue: 'incompatible-shell',
        command: shebang,
        location: { line: lineNumber, column: 0 },
        platform: ['linux', 'macos'],
        message: 'Bash shebang detected - script won\'t run natively on Windows',
        suggestion: 'Use #!/usr/bin/env node for Node.js scripts or provide .bat/.ps1 alternatives for Windows',
      });
    }
  }
}
