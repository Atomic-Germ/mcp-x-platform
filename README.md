# MCP X-Platform

> A Cross-Platform Compatibility Analyzer MCP server that systematically identifies platform-specific code patterns, dependencies, and potential portability issues

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)

## Overview

MCP X-Platform is a Model Context Protocol (MCP) server designed to analyze codebases for cross-platform compatibility issues. It detects platform-specific APIs, file path problems, line ending inconsistencies, shell command incompatibilities, and dependency issues across Windows, macOS, and Linux.

### Key Features

- 🔍 **Platform API Detection** - Identify Windows, macOS, Linux, and POSIX-specific APIs
- 📁 **File Path Analysis** - Detect separator issues, reserved names, and case sensitivity problems
- 📝 **Line Ending Check** - Find CRLF vs LF inconsistencies
- 🖥️ **Shell Command Analysis** - Identify platform-specific shell commands and scripts
- 📦 **Dependency Compatibility** - Analyze dependencies for platform-specific packages
- 📊 **Comprehensive Reports** - Generate detailed cross-platform compatibility reports
- 🔗 **MCP Integration** - Seamless integration with other MCP tools
- ✅ **Test-Driven** - Built using TDD methodology

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Quick Start

### As an MCP Server

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "x-platform": {
      "command": "node",
      "args": ["/path/to/mcp-x-platform/dist/index.js"]
    }
  }
}
```

## Core Tools

| Tool                            | Purpose                              |
| ------------------------------- | ------------------------------------ |
| `detect_platform_apis`          | Detect platform-specific API calls   |
| `analyze_file_paths`            | Analyze file paths for compatibility |
| `analyze_line_endings`          | Check line ending consistency        |
| `analyze_shell_commands`        | Analyze shell command compatibility  |
| `generate_compatibility_report` | Generate comprehensive reports       |

## Usage Examples

### Detect Platform APIs

```json
{
  "tool": "detect_platform_apis",
  "arguments": {
    "path": "./src",
    "platforms": ["windows", "macos", "linux"]
  }
}
```

### Analyze File Paths

```json
{
  "tool": "analyze_file_paths",
  "arguments": {
    "path": "./src",
    "checkCaseSensitivity": true,
    "checkSeparators": true
  }
}
```

## Best Practices

### File Paths

```typescript
// ✅ GOOD
import * as path from "path";
const filePath = path.join("src", "utils", "helper.js");

// ❌ BAD
const filePath = "src\\utils\\helper.js";
```

### Line Endings

```bash
# .gitattributes
* text=auto eol=lf
*.sh text eol=lf
*.{cmd,bat} text eol=crlf
```

### Shell Commands

```typescript
// ✅ GOOD - Cross-platform
import { rimraf } from "rimraf";
await rimraf("./temp");

// ❌ BAD - Platform-specific
exec("rm -rf ./temp");
```

## Development

```bash
# Build
npm run build

# Test
npm test

# Watch mode
npm run build:watch
```

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built for cross-platform compatibility with ❤️**
