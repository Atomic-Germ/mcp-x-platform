# Optimist MCP Server - Troubleshooting Guide

Comprehensive troubleshooting guide for common issues and solutions.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Analysis Issues](#analysis-issues)
- [Performance Problems](#performance-problems)
- [Memory Issues](#memory-issues)
- [Configuration Problems](#configuration-problems)
- [Tool-Specific Issues](#tool-specific-issues)
- [Integration Problems](#integration-problems)
- [Error Reference](#error-reference)
- [Performance Tuning](#performance-tuning)

## Quick Diagnostics

### Health Check Commands

Verify Optimist is working correctly:

```bash
# Basic health check
mcp-optimist --version

# Test simple analysis
mcp-optimist detect_code_smells --path ./src --severity high

# Check configuration
mcp-optimist config validate

# Verbose logging
DEBUG=mcp:optimist mcp-optimist analyze_performance --path ./src
```

### Common Quick Fixes

| Issue | Quick Fix | Command |
|-------|-----------|---------|
| Tool not found | Reinstall package | `npm install -g @mcp/optimist` |
| Permission denied | Fix file permissions | `chmod -R 755 ./src` |
| Out of memory | Increase memory limit | `NODE_OPTIONS="--max-old-space-size=8192"` |
| Analysis timeout | Increase timeout | `OPTIMIST_ANALYSIS_TIMEOUT=600000` |
| Parse errors | Check syntax | `npm run build` or `tsc --noEmit` |

## Analysis Issues

### Issue: "No files found to analyze"

**Symptoms:**
```
{
  status: "error",
  error: {
    code: "NO_FILES_FOUND",
    message: "No analyzable files found in the specified path"
  }
}
```

**Debugging Steps:**

1. **Verify path exists:**
```bash
ls -la ./src
```

2. **Check file extensions:**
```bash
find ./src -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" | head -10
```

3. **Verify permissions:**
```bash
find ./src -type f ! -readable
```

**Solutions:**

1. **Correct path:**
```typescript
// Wrong - relative to wrong directory
{
  path: "./src"  
}

// Correct - absolute or correct relative path
{
  path: "/absolute/path/to/src"
  // or ensure you're in the right working directory
}
```

2. **Include correct extensions:**
```typescript
{
  path: "./src",
  fileExtensions: [".js", ".ts", ".jsx", ".tsx", ".vue"]
}
```

3. **Check ignore patterns:**
```json
// optimist.config.json
{
  "analysis": {
    "ignorePatterns": [
      "**/node_modules/**",
      "**/dist/**", 
      "**/*.test.ts",
      "**/*.spec.ts"
    ]
  }
}
```

### Issue: "Parse Error - Cannot analyze file"

**Symptoms:**
```
{
  status: "error",
  error: {
    code: "PARSE_ERROR", 
    message: "Cannot parse source code",
    details: {
      file: "src/utils/helper.ts",
      line: 42,
      column: 15
    }
  }
}
```

**Debugging Steps:**

1. **Check syntax errors:**
```bash
npx tsc --noEmit src/utils/helper.ts
```

2. **Verify TypeScript configuration:**
```bash
npx tsc --showConfig
```

3. **Test with simpler parser:**
```bash
node -e "require('fs').readFileSync('./src/utils/helper.ts', 'utf8')"
```

**Solutions:**

1. **Fix syntax errors:**
```typescript
// Common syntax issues
// Missing semicolon, unclosed brackets, etc.

// Before - syntax error
function example( {
  return "missing closing parenthesis";
}

// After - fixed
function example() {
  return "proper syntax";
}
```

2. **Update TypeScript configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": false,
    "skipLibCheck": true
  }
}
```

3. **Exclude problematic files:**
```json
// optimist.config.json
{
  "analysis": {
    "ignorePatterns": [
      "src/legacy/**",
      "src/generated/**"
    ]
  }
}
```

### Issue: "Analysis timeout"

**Symptoms:**
```
{
  status: "error",
  error: {
    code: "TIMEOUT",
    message: "Analysis took too long and was terminated",
    details: {
      duration: 300000,
      filesStarted: 45,
      filesCompleted: 23
    }
  }
}
```

**Solutions:**

1. **Increase timeout:**
```bash
export OPTIMIST_ANALYSIS_TIMEOUT=600000  # 10 minutes
```

2. **Analyze smaller chunks:**
```typescript
// Instead of analyzing entire project
{
  path: "./src"
}

// Analyze by directory
{
  path: "./src/components"
}
{
  path: "./src/services"  
}
```

3. **Enable parallel processing:**
```bash
export OPTIMIST_PARALLEL_WORKERS=8
```

4. **Optimize analysis scope:**
```json
{
  "analysis": {
    "depth": "shallow",
    "maxFileSize": "500KB",
    "ignorePatterns": ["**/node_modules/**", "**/dist/**"]
  }
}
```

## Performance Problems

### Issue: Slow analysis performance

**Symptoms:**
- Analysis takes much longer than expected
- High CPU usage during analysis
- Memory usage keeps growing

**Debugging Steps:**

1. **Profile analysis:**
```bash
time mcp-optimist analyze_performance --path ./src
```

2. **Check resource usage:**
```bash
top -p $(pgrep -f mcp-optimist)
```

3. **Monitor file system:**
```bash
iotop -o
```

**Optimization Solutions:**

1. **Reduce scope:**
```typescript
// Too broad
{
  path: "./",
  includeTests: true
}

// Optimized
{
  path: "./src",
  includeTests: false,
  threshold: "high"  // Only find critical issues
}
```

2. **Tune worker processes:**
```bash
# For smaller projects
export OPTIMIST_PARALLEL_WORKERS=2

# For larger projects
export OPTIMIST_PARALLEL_WORKERS=8
```

3. **Enable caching:**
```bash
export OPTIMIST_CACHE_ENABLED=true
export OPTIMIST_CACHE_DIR="/tmp/optimist-cache"
```

4. **Limit file size:**
```json
{
  "analysis": {
    "maxFileSize": "1MB",
    "maxFiles": 500
  }
}
```

### Issue: High memory usage

**Symptoms:**
- Process memory usage exceeds 4-8GB
- Out of memory errors
- System becomes unresponsive

**Solutions:**

1. **Increase Node.js memory limit:**
```bash
export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB
```

2. **Reduce analysis scope:**
```typescript
{
  path: "./src",
  includeTests: false,
  maxComplexity: 20,  // Skip very complex files
  reportFormat: "summary"  // Less detailed output
}
```

3. **Process in batches:**
```typescript
// Split large analysis into batches
const directories = ['./src/components', './src/services', './src/utils'];

for (const dir of directories) {
  const result = await runTool('analyze_performance', { path: dir });
  // Process result before next batch
}
```

4. **Configure garbage collection:**
```bash
export NODE_OPTIONS="--max-old-space-size=8192 --gc-global"
```

## Memory Issues

### Issue: Memory analysis not finding leaks

**Symptoms:**
- Analysis completes successfully
- No memory issues reported
- But you know there are memory leaks

**Debugging Steps:**

1. **Enable detailed memory tracking:**
```typescript
{
  tool: "optimize_memory",
  arguments: {
    path: "./src",
    detectLeaks: true,
    trackAllocations: true,
    analyzeClosures: true,
    deepAnalysis: true
  }
}
```

2. **Check specific patterns:**
```bash
grep -r "addEventListener" ./src --include="*.ts" --include="*.tsx"
grep -r "setInterval\|setTimeout" ./src --include="*.ts"
grep -r "useEffect" ./src --include="*.tsx"
```

3. **Manual profiling:**
```bash
node --inspect-brk=9229 your-app.js
# Open chrome://inspect in Chrome
```

**Solutions:**

1. **Use lower sensitivity:**
```typescript
{
  path: "./src",
  detectLeaks: true,
  sensitivity: "low",  // Catch more potential issues
  includeUnused: true
}
```

2. **Analyze specific components:**
```typescript
// Focus on components that handle events
{
  path: "./src/components/EventHandlers",
  analyzeClosures: true,
  trackEventListeners: true
}
```

3. **Custom leak patterns:**
```json
{
  "memory": {
    "customPatterns": [
      "addEventListener without removeEventListener",
      "setInterval without clearInterval",
      "useEffect without cleanup function"
    ]
  }
}
```

### Issue: False positive memory leak warnings

**Symptoms:**
- Many memory leak warnings for valid code
- Suggestions to remove necessary event listeners
- Warnings about intentional closures

**Solutions:**

1. **Adjust sensitivity:**
```typescript
{
  path: "./src",
  detectLeaks: true,
  sensitivity: "high",  // Only report definite leaks
  ignorePatterns: ["*.test.ts", "*.stories.tsx"]
}
```

2. **Whitelist known patterns:**
```json
{
  "memory": {
    "whitelist": [
      "global event listeners in app.ts",
      "intentional singletons",
      "cache implementations"
    ]
  }
}
```

3. **Use code annotations:**
```typescript
// Mark intentional memory usage
/* eslint-disable-next-line memory-leak */
window.addEventListener('beforeunload', handleBeforeUnload);

// Or use specific comments for Optimist
/* optimist:ignore-memory-leak */
const globalCache = new Map();
```

## Configuration Problems

### Issue: Configuration not being loaded

**Symptoms:**
- Default settings always used
- Custom rules ignored
- Configuration warnings

**Debugging Steps:**

1. **Verify config file location:**
```bash
ls -la optimist.config.json
ls -la .optimistrc
ls -la package.json  # Check for optimist section
```

2. **Validate JSON syntax:**
```bash
jq . optimist.config.json
```

3. **Check file permissions:**
```bash
ls -la optimist.config.json
```

**Solutions:**

1. **Correct config file format:**
```json
// optimist.config.json
{
  "analysis": {
    "depth": "deep",
    "ignorePatterns": ["**/node_modules/**"],
    "fileExtensions": [".js", ".ts", ".jsx", ".tsx"]
  },
  "performance": {
    "threshold": "medium"
  },
  "memory": {
    "detectLeaks": true
  }
}
```

2. **Alternative config locations:**
```javascript
// package.json
{
  "optimist": {
    "analysis": {
      "depth": "deep"
    }
  }
}
```

3. **Environment variable config:**
```bash
export OPTIMIST_CONFIG_PATH="/path/to/config.json"
```

### Issue: Invalid configuration values

**Symptoms:**
```
{
  status: "error",
  error: {
    code: "INVALID_CONFIG",
    message: "Invalid configuration value",
    details: {
      field: "performance.threshold",
      value: "invalid",
      expected: ["low", "medium", "high"]
    }
  }
}
```

**Solutions:**

1. **Use valid enum values:**
```json
{
  "performance": {
    "threshold": "medium",  // Valid: "low", "medium", "high"
    "profileHotPaths": true,  // Valid: true, false
    "trackAsyncOperations": false
  },
  "complexity": {
    "maxCyclomatic": 10,  // Valid: positive number
    "reportFormat": "detailed"  // Valid: "summary", "detailed", "json"
  }
}
```

2. **Check numeric ranges:**
```json
{
  "analysis": {
    "maxFileSize": "5MB",  // Valid formats: "1MB", "500KB"
    "maxFiles": 1000,  // Valid: positive integer
    "depth": 5  // Valid: 1-10
  }
}
```

## Tool-Specific Issues

### analyze_performance Issues

**Issue: No performance issues found in slow code**

**Solutions:**

1. **Lower threshold:**
```typescript
{
  path: "./src",
  threshold: "low",  // Instead of "medium" or "high"
  profileHotPaths: true,
  trackAsyncOperations: true
}
```

2. **Include more analysis types:**
```typescript
{
  path: "./src",
  includeComplexity: true,
  includeMemoryPatterns: true,
  analyzeDataStructures: true
}
```

### detect_code_smells Issues

**Issue: Too many false positives**

**Solutions:**

1. **Adjust severity threshold:**
```typescript
{
  path: "./src",
  severity: "high",  // Only critical issues
  categories: ["large-class", "long-method"]  // Specific smells only
}
```

2. **Custom rules:**
```json
{
  "codeSmells": {
    "customRules": {
      "maxMethodLength": 100,  // More lenient
      "maxClassMethods": 30,
      "allowLargeFunctions": ["tests", "config"]
    }
  }
}
```

### analyze_complexity Issues

**Issue: Complex but necessary functions flagged**

**Solutions:**

1. **Exclude specific patterns:**
```json
{
  "complexity": {
    "ignorePatterns": [
      "config/*.ts",
      "migrations/*.ts",
      "*.generated.ts"
    ]
  }
}
```

2. **Adjust thresholds:**
```typescript
{
  path: "./src",
  maxComplexity: 15,  // More lenient for complex domains
  ignoreCognitiveComplexity: false
}
```

## Integration Problems

### MCP Client Connection Issues

**Issue: Cannot connect to Optimist server**

**Solutions:**

1. **Verify server status:**
```bash
ps aux | grep mcp-optimist
netstat -tlnp | grep 3000
```

2. **Check configuration:**
```json
// Claude Desktop config
{
  "mcpServers": {
    "optimist": {
      "command": "npx",
      "args": ["-y", "@mcp/optimist"]
    }
  }
}
```

3. **Debug connection:**
```bash
DEBUG=mcp:* npx @mcp/optimist
```

### Integration with other MCP servers

**Issue: Conflicts with mcp-consult or mcp-tdd**

**Solutions:**

1. **Use different ports:**
```json
{
  "mcpServers": {
    "optimist": {
      "command": "npx",
      "args": ["-y", "@mcp/optimist", "--port", "3001"]
    },
    "consult": {
      "command": "npx", 
      "args": ["-y", "@mcp/consult", "--port", "3002"]
    }
  }
}
```

2. **Sequential usage pattern:**
```typescript
// Use one tool, then another
const optimizationResults = await optimist.analyze_performance(path);
const aiAdvice = await consult.consult_ollama({
  prompt: `How to implement these optimizations: ${JSON.stringify(optimizationResults)}`,
  model: "qwen2.5-coder:7b"
});
```

## Error Reference

### Complete Error Code Reference

| Error Code | Description | Common Causes | Solutions |
|------------|-------------|---------------|-----------|
| `INVALID_PATH` | Path doesn't exist | Typo, wrong working directory | Verify path exists |
| `NO_FILES_FOUND` | No analyzable files | Empty directory, wrong extensions | Check file types |
| `PARSE_ERROR` | Cannot parse source code | Syntax errors, unsupported syntax | Fix syntax, update parser |
| `OUT_OF_MEMORY` | Insufficient memory | Large files, deep analysis | Increase memory, reduce scope |
| `TIMEOUT` | Analysis took too long | Large codebase, slow system | Increase timeout, parallel processing |
| `PERMISSION_DENIED` | Cannot read files | File permissions | Fix permissions with chmod |
| `INVALID_CONFIG` | Configuration error | Wrong values, syntax errors | Validate configuration |
| `TOOL_ERROR` | Tool-specific failure | Missing dependencies | Install dependencies |
| `NETWORK_ERROR` | Network connectivity | Offline, proxy issues | Check connection |
| `VERSION_MISMATCH` | Incompatible versions | Outdated packages | Update packages |

### Debug Information Collection

When reporting issues, collect this debug information:

```bash
#!/bin/bash
# debug-info.sh

echo "=== System Information ==="
uname -a
node --version
npm --version

echo -e "\n=== Package Information ==="
npm list @mcp/optimist
cat package.json | jq '.dependencies | to_entries[] | select(.key | contains("mcp"))'

echo -e "\n=== Configuration ==="
cat optimist.config.json 2>/dev/null || echo "No config file found"

echo -e "\n=== Environment Variables ==="
env | grep OPTIMIST

echo -e "\n=== Recent Logs ==="
tail -n 50 ~/.optimist/logs/latest.log 2>/dev/null || echo "No log file found"

echo -e "\n=== File Structure ==="
find ./src -name "*.ts" -o -name "*.js" | head -20

echo -e "\n=== Test Analysis ==="
timeout 30s mcp-optimist detect_code_smells --path ./src --severity high 2>&1 || echo "Analysis failed or timed out"
```

## Performance Tuning

### Optimal Configuration for Different Project Sizes

#### Small Projects (<100 files)

```json
{
  "analysis": {
    "depth": "deep",
    "parallelWorkers": 2,
    "maxFiles": 200
  },
  "performance": {
    "threshold": "low",
    "profileHotPaths": true
  },
  "memory": {
    "detectLeaks": true,
    "trackAllocations": true
  }
}
```

#### Medium Projects (100-1000 files)

```json
{
  "analysis": {
    "depth": "medium", 
    "parallelWorkers": 4,
    "maxFiles": 1000,
    "cacheEnabled": true
  },
  "performance": {
    "threshold": "medium",
    "profileHotPaths": false
  },
  "memory": {
    "detectLeaks": true,
    "trackAllocations": false
  }
}
```

#### Large Projects (>1000 files)

```json
{
  "analysis": {
    "depth": "shallow",
    "parallelWorkers": 8, 
    "maxFiles": 2000,
    "maxFileSize": "1MB",
    "cacheEnabled": true,
    "batchSize": 50
  },
  "performance": {
    "threshold": "high",
    "profileHotPaths": false
  },
  "memory": {
    "detectLeaks": false,
    "quickScan": true
  }
}
```

### System Resource Optimization

```bash
# For systems with limited memory
export NODE_OPTIONS="--max-old-space-size=4096 --gc-global"
export OPTIMIST_PARALLEL_WORKERS=2
export OPTIMIST_CACHE_ENABLED=false

# For high-performance systems  
export NODE_OPTIONS="--max-old-space-size=16384"
export OPTIMIST_PARALLEL_WORKERS=12
export OPTIMIST_CACHE_ENABLED=true
export OPTIMIST_CACHE_DIR="/tmp/ramdisk/optimist"
```

If you continue to experience issues after trying these solutions, please open an issue on the [GitHub repository](https://github.com/your-org/mcp-optimist) with the debug information collected using the script above.