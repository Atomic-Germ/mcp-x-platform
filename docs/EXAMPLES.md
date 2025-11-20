# Optimist MCP Server - Examples

Comprehensive examples for code optimization and analysis workflows.

## Table of Contents

- [Quick Start Examples](#quick-start-examples)
- [Performance Analysis](#performance-analysis)
- [Memory Optimization](#memory-optimization) 
- [Code Quality Analysis](#code-quality-analysis)
- [Dependency Analysis](#dependency-analysis)
- [Advanced Workflows](#advanced-workflows)
- [Integration Patterns](#integration-patterns)
- [Real-World Case Studies](#real-world-case-studies)

## Quick Start Examples

### Basic Project Analysis

Perform comprehensive analysis of your entire project:

```typescript
// Analyze overall code quality
{
  tool: "detect_code_smells",
  arguments: {
    path: "./src",
    severity: "medium"
  }
}

// Check performance issues
{
  tool: "analyze_performance", 
  arguments: {
    path: "./src",
    threshold: "medium",
    includeTests: false
  }
}

// Find complexity issues
{
  tool: "analyze_complexity",
  arguments: {
    path: "./src", 
    maxComplexity: 8,
    reportFormat: "detailed"
  }
}
```

### Single File Analysis

Analyze a specific problematic file:

```typescript
{
  tool: "analyze_performance",
  arguments: {
    path: "./src/services/dataProcessor.ts",
    threshold: "low",
    profileHotPaths: true,
    trackAsyncOperations: true
  }
}
```

## Performance Analysis

### Identifying Bottlenecks

Analyze a data processing service with performance issues:

```typescript
// Input: DataProcessorService with known slowness
{
  tool: "analyze_performance",
  arguments: {
    path: "./src/services/dataProcessor.ts",
    threshold: "low",
    profileHotPaths: true
  }
}
```

**Expected Output:**
```typescript
{
  status: "success",
  data: {
    findings: [
      {
        type: "nested-loops",
        severity: "high",
        file: "src/services/dataProcessor.ts", 
        line: 42,
        description: "Nested loop with O(n²) complexity detected in processLargeDataset",
        suggestion: "Replace inner loop with Map lookup for O(n) complexity"
      },
      {
        type: "blocking-sync-operation",
        severity: "medium",
        file: "src/services/dataProcessor.ts",
        line: 67,
        description: "Synchronous JSON.stringify blocks event loop",
        suggestion: "Use async streaming JSON serialization"
      }
    ],
    suggestions: [
      {
        category: "algorithmic",
        priority: "high", 
        description: "Replace nested loops with hash map lookups",
        estimatedImprovement: "90% reduction in processing time"
      }
    ]
  }
}
```

**Implementation Fix:**

Before (Problematic):
```typescript
// O(n²) complexity - problematic
function processLargeDataset(items: Item[], lookup: LookupItem[]): ProcessedItem[] {
  return items.map(item => {
    // Inner loop for each item - O(n²)
    const match = lookup.find(l => l.id === item.lookupId);
    return { ...item, enrichedData: match?.data };
  });
}
```

After (Optimized):
```typescript
// O(n) complexity - optimized  
function processLargeDataset(items: Item[], lookup: LookupItem[]): ProcessedItem[] {
  // Create lookup map once - O(n)
  const lookupMap = new Map(lookup.map(l => [l.id, l.data]));
  
  // Single pass through items - O(n)
  return items.map(item => ({
    ...item,
    enrichedData: lookupMap.get(item.lookupId)
  }));
}
```

### Hot Path Optimization

Identify and optimize frequently executed code paths:

```typescript
{
  tool: "optimize_hot_paths",
  arguments: {
    path: "./src",
    profilingData: "./profiling/cpu-profile.json",
    threshold: 1000
  }
}
```

**Hot Path Analysis Result:**
```typescript
{
  data: {
    findings: [
      {
        type: "hot-path",
        file: "src/utils/validation.ts",
        function: "validateEmail",
        executions: 15420,
        totalTime: "2.3s",
        averageTime: "0.15ms",
        suggestion: "Cache regex compilation outside function"
      }
    ]
  }
}
```

**Optimization:**

Before:
```typescript
function validateEmail(email: string): boolean {
  // Regex compiled on every call - inefficient
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

After:
```typescript
// Compile regex once - more efficient
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
```

## Memory Optimization

### Memory Leak Detection

Find and fix memory leaks in a React component:

```typescript
{
  tool: "optimize_memory",
  arguments: {
    path: "./src/components",
    detectLeaks: true,
    analyzeClosures: true
  }
}
```

**Leak Analysis Result:**
```typescript
{
  data: {
    findings: [
      {
        type: "event-listener-leak",
        file: "src/components/DataChart.tsx",
        line: 23,
        description: "Event listeners not cleaned up in useEffect",
        leakPotential: "high"
      },
      {
        type: "closure-retention",
        file: "src/hooks/useDataFetch.ts",
        line: 15,
        description: "Closure retaining large objects unnecessarily"
      }
    ]
  }
}
```

**Memory Leak Fixes:**

Problem - Event Listener Leak:
```typescript
// Problematic - no cleanup
function DataChart() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // Missing cleanup function
  }, []);
}
```

Fixed:
```typescript
// Fixed with proper cleanup
function DataChart() {
  useEffect(() => {
    const handleResize = () => {
      // Handle resize
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function prevents leak
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}
```

Problem - Closure Retention:
```typescript
// Problematic - closure retains large data
function useDataFetch() {
  const [data, setData] = useState(null);
  const largeDataSet = useMemo(() => generateLargeDataSet(), []);
  
  const processData = useCallback((newData) => {
    // Closure captures largeDataSet unnecessarily
    return newData.map(item => ({ ...item, processed: true }));
  }, [largeDataSet]); // Remove this dependency
  
  return { data, processData };
}
```

Fixed:
```typescript
// Fixed - remove unnecessary closure capture
function useDataFetch() {
  const [data, setData] = useState(null);
  
  const processData = useCallback((newData) => {
    // No longer captures large data set
    return newData.map(item => ({ ...item, processed: true }));
  }, []); // Empty dependency array
  
  return { data, processData };
}
```

### Memory Usage Optimization

Optimize memory usage in data processing:

```typescript
{
  tool: "optimize_memory",
  arguments: {
    path: "./src/utils/dataProcessor.ts",
    trackAllocations: true,
    suggestFixes: true
  }
}
```

**Optimization Example:**

Before (Memory Inefficient):
```typescript
// Creates multiple intermediate arrays
function processLargeDataset(data: RawData[]): ProcessedData[] {
  const filtered = data.filter(item => item.active);
  const transformed = filtered.map(item => transformItem(item));
  const sorted = transformed.sort((a, b) => a.priority - b.priority);
  const deduplicated = [...new Set(sorted)];
  return deduplicated;
}
```

After (Memory Optimized):
```typescript
// Single pass, minimal allocations
function processLargeDataset(data: RawData[]): ProcessedData[] {
  const seen = new Set();
  const result: ProcessedData[] = [];
  
  // Single iteration, minimal memory footprint
  for (const item of data) {
    if (!item.active) continue;
    
    const transformed = transformItem(item);
    const key = getUniqueKey(transformed);
    
    if (seen.has(key)) continue;
    seen.add(key);
    
    // Insert in sorted position (avoid final sort)
    insertSorted(result, transformed);
  }
  
  return result;
}

function insertSorted(arr: ProcessedData[], item: ProcessedData) {
  const index = binarySearch(arr, item);
  arr.splice(index, 0, item);
}
```

## Code Quality Analysis

### Code Smell Detection

Comprehensive analysis of a service class:

```typescript
{
  tool: "detect_code_smells",
  arguments: {
    path: "./src/services/UserService.ts",
    severity: "low",
    categories: ["large-class", "long-method", "feature-envy"]
  }
}
```

**Analysis Result:**
```typescript
{
  data: {
    findings: [
      {
        type: "large-class",
        severity: "high",
        class: "UserService",
        description: "Class has 28 methods and 650 lines",
        suggestion: "Split into AuthService, ProfileService, NotificationService"
      },
      {
        type: "long-method",
        method: "processUserRegistration", 
        line: 45,
        description: "Method has 85 lines and 8 responsibilities",
        suggestion: "Extract validation, persistence, and notification logic"
      }
    ]
  }
}
```

**Refactoring Solution:**

Before (God Class):
```typescript
// Problematic - too many responsibilities
class UserService {
  // Authentication methods
  async login(email: string, password: string) { /* ... */ }
  async logout(userId: string) { /* ... */ }
  async resetPassword(email: string) { /* ... */ }
  
  // Profile methods  
  async updateProfile(userId: string, data: ProfileData) { /* ... */ }
  async getProfile(userId: string) { /* ... */ }
  async uploadAvatar(userId: string, file: File) { /* ... */ }
  
  // Notification methods
  async sendWelcomeEmail(userId: string) { /* ... */ }
  async sendPasswordReset(email: string) { /* ... */ }
  
  // 20+ more methods...
}
```

After (Single Responsibility):
```typescript
// Authentication service
class AuthService {
  async login(email: string, password: string) { /* ... */ }
  async logout(userId: string) { /* ... */ }
  async resetPassword(email: string) { /* ... */ }
  async validateToken(token: string) { /* ... */ }
}

// Profile service
class ProfileService {
  async updateProfile(userId: string, data: ProfileData) { /* ... */ }
  async getProfile(userId: string) { /* ... */ }
  async uploadAvatar(userId: string, file: File) { /* ... */ }
  async deleteProfile(userId: string) { /* ... */ }
}

// Notification service
class NotificationService {
  async sendWelcomeEmail(userId: string) { /* ... */ }
  async sendPasswordReset(email: string) { /* ... */ }
  async sendProfileUpdate(userId: string) { /* ... */ }
}

// Orchestrator service
class UserService {
  constructor(
    private auth: AuthService,
    private profile: ProfileService, 
    private notifications: NotificationService
  ) {}
  
  async registerUser(userData: UserData) {
    const user = await this.auth.createUser(userData);
    await this.profile.createProfile(user.id, userData.profile);
    await this.notifications.sendWelcomeEmail(user.id);
    return user;
  }
}
```

### Complexity Analysis

Analyze function complexity in a validation module:

```typescript
{
  tool: "analyze_complexity",
  arguments: {
    path: "./src/utils/validation.ts",
    maxComplexity: 6,
    includeCognitive: true
  }
}
```

**Complex Function Example:**

Before (High Complexity):
```typescript
// Cyclomatic: 15, Cognitive: 18
function validateUserInput(input: UserInput): ValidationResult {
  const errors: string[] = [];
  
  // Email validation - complexity +3
  if (input.email) {
    if (!input.email.includes('@')) {
      errors.push('Invalid email format');
    } else if (input.email.length > 255) {
      errors.push('Email too long');
    } else if (/[<>]/.test(input.email)) {
      errors.push('Email contains invalid characters');
    }
  } else {
    errors.push('Email is required');
  }
  
  // Password validation - complexity +4  
  if (input.password) {
    if (input.password.length < 8) {
      errors.push('Password too short');
    } else if (input.password.length > 128) {
      errors.push('Password too long');
    } else if (!/[A-Z]/.test(input.password)) {
      errors.push('Password needs uppercase letter');
    } else if (!/[0-9]/.test(input.password)) {
      errors.push('Password needs number');
    }
  } else {
    errors.push('Password is required');
  }
  
  // Age validation - complexity +3
  if (input.age !== undefined) {
    if (input.age < 13) {
      errors.push('Must be 13 or older');
    } else if (input.age > 120) {
      errors.push('Invalid age');
    } else if (!Number.isInteger(input.age)) {
      errors.push('Age must be whole number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

After (Reduced Complexity):
```typescript
// Split into focused functions with lower complexity
function validateUserInput(input: UserInput): ValidationResult {
  const errors: string[] = [];
  
  errors.push(...validateEmail(input.email));
  errors.push(...validatePassword(input.password));
  errors.push(...validateAge(input.age));
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Cyclomatic: 4, Cognitive: 4
function validateEmail(email?: string): string[] {
  if (!email) return ['Email is required'];
  
  if (!email.includes('@')) return ['Invalid email format'];
  if (email.length > 255) return ['Email too long'];
  if (/[<>]/.test(email)) return ['Email contains invalid characters'];
  
  return [];
}

// Cyclomatic: 4, Cognitive: 4
function validatePassword(password?: string): string[] {
  if (!password) return ['Password is required'];
  
  if (password.length < 8) return ['Password too short'];
  if (password.length > 128) return ['Password too long'];
  if (!/[A-Z]/.test(password)) return ['Password needs uppercase letter'];
  if (!/[0-9]/.test(password)) return ['Password needs number'];
  
  return [];
}

// Cyclomatic: 3, Cognitive: 3
function validateAge(age?: number): string[] {
  if (age === undefined) return [];
  
  if (age < 13) return ['Must be 13 or older'];
  if (age > 120) return ['Invalid age'];  
  if (!Number.isInteger(age)) return ['Age must be whole number'];
  
  return [];
}
```

## Dependency Analysis

### Circular Dependency Detection

Analyze project dependencies for circular references:

```typescript
{
  tool: "analyze_dependencies",
  arguments: {
    path: "./",
    checkCircular: true,
    includeDevDeps: false
  }
}
```

**Circular Dependency Example:**

Problem Structure:
```
src/services/userService.ts → src/services/authService.ts
src/services/authService.ts → src/services/userService.ts
```

Before (Circular):
```typescript
// userService.ts
import { AuthService } from './authService';

export class UserService {
  constructor(private auth: AuthService) {}
  
  async getUser(id: string) {
    if (!this.auth.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    // ...
  }
}

// authService.ts  
import { UserService } from './userService';

export class AuthService {
  constructor(private userService: UserService) {}
  
  async authenticate(token: string) {
    const user = await this.userService.getUser(userId);
    // ...
  }
}
```

After (Fixed):
```typescript
// types/auth.ts
export interface AuthContext {
  userId: string;
  isAuthenticated: boolean;
}

// userService.ts
import { AuthContext } from '../types/auth';

export class UserService {
  async getUser(id: string, authContext?: AuthContext) {
    if (!authContext?.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    // ...
  }
}

// authService.ts
import { UserService } from './userService';
import { AuthContext } from '../types/auth';

export class AuthService {
  constructor(private userService: UserService) {}
  
  async authenticate(token: string): Promise<AuthContext> {
    const authContext: AuthContext = {
      userId: extractUserId(token),
      isAuthenticated: true
    };
    
    // Use injected context instead of calling userService
    return authContext;
  }
}
```

### Dead Code Elimination

Find unused code across the project:

```typescript
{
  tool: "find_dead_code",
  arguments: {
    path: "./src",
    includeUnusedExports: true,
    includeUnusedImports: true
  }
}
```

**Dead Code Results:**
```typescript
{
  data: {
    findings: [
      {
        type: "unused-export",
        file: "src/utils/legacy.ts",
        name: "oldDateFormatter",
        line: 15,
        description: "Function exported but never imported"
      },
      {
        type: "unused-import", 
        file: "src/components/UserList.tsx",
        name: "moment",
        line: 3,
        description: "Imported but never used"
      }
    ]
  }
}
```

**Cleanup Actions:**

Remove unused exports:
```typescript
// Before - unused export
export function oldDateFormatter(date: Date): string {
  // This function is never used anywhere
  return date.toLocaleDateString();
}

// After - remove entirely or make private
function oldDateFormatter(date: Date): string {
  // Keep as private utility if needed internally
  return date.toLocaleDateString();
}
```

Remove unused imports:
```typescript
// Before - unused import
import React from 'react';
import moment from 'moment'; // Never used
import { UserType } from '../types';

// After - clean imports
import React from 'react';
import { UserType } from '../types';
```

## Advanced Workflows

### Multi-Stage Optimization Pipeline

Complete optimization workflow for a large project:

```typescript
// Stage 1: Initial Assessment
const qualityAnalysis = await runTool("detect_code_smells", {
  path: "./src",
  severity: "medium"
});

const performanceAnalysis = await runTool("analyze_performance", {
  path: "./src", 
  threshold: "medium"
});

// Stage 2: Prioritize Issues
const criticalIssues = [
  ...qualityAnalysis.findings.filter(f => f.severity === 'high'),
  ...performanceAnalysis.findings.filter(f => f.severity === 'high')
];

// Stage 3: Deep Analysis
for (const issue of criticalIssues) {
  const detailedAnalysis = await runTool("analyze_complexity", {
    path: issue.file,
    maxComplexity: 5,
    reportFormat: "detailed"
  });
  
  // Generate refactoring suggestions
  const refactorSuggestions = await runTool("suggest_refactoring", {
    path: issue.file,
    focusArea: "maintainability"
  });
}

// Stage 4: Memory Optimization
const memoryOptimization = await runTool("optimize_memory", {
  path: "./src",
  detectLeaks: true,
  suggestFixes: true
});

// Stage 5: Dependency Cleanup
const dependencyAnalysis = await runTool("analyze_dependencies", {
  path: "./",
  checkCircular: true,
  suggestUpdates: true
});

// Stage 6: Dead Code Removal
const deadCodeAnalysis = await runTool("find_dead_code", {
  path: "./src",
  includeUnusedExports: true
});
```

### Performance Monitoring Integration

Set up continuous performance monitoring:

```typescript
// performance-monitor.ts
class PerformanceMonitor {
  private hotPaths: Map<string, number> = new Map();
  
  async analyzeAndOptimize() {
    // Analyze hot paths
    const hotPathAnalysis = await runTool("optimize_hot_paths", {
      path: "./src",
      profilingData: this.getProfilingData(),
      threshold: 1000
    });
    
    // Track execution counts
    for (const finding of hotPathAnalysis.findings) {
      this.hotPaths.set(finding.function, finding.executions);
    }
    
    // Optimize frequently called functions
    const frequentFunctions = Array.from(this.hotPaths.entries())
      .filter(([, count]) => count > 5000)
      .map(([fn]) => fn);
      
    for (const funcName of frequentFunctions) {
      await this.optimizeFunction(funcName);
    }
  }
  
  private async optimizeFunction(functionName: string) {
    const suggestions = await runTool("suggest_refactoring", {
      path: this.findFunctionFile(functionName),
      focusArea: "performance"
    });
    
    // Apply optimization suggestions
    await this.applyOptimizations(suggestions);
  }
}
```

## Integration Patterns

### With mcp-consult Integration

Get AI assistance for optimization decisions:

```typescript
// Step 1: Analyze code
const analysis = await runTool("analyze_performance", {
  path: "./src/utils/dataProcessor.ts"
});

// Step 2: Get AI consultation 
const consultation = await runTool("consult_ollama", {
  prompt: `
    I have performance issues in my data processor. 
    Here are the analysis results: ${JSON.stringify(analysis.findings)}
    
    Should I prioritize algorithmic optimization or caching?
    What's the best approach for the nested loop issue?
  `,
  model: "qwen2.5-coder:7b",
  context: {
    code: readFileSync("./src/utils/dataProcessor.ts", "utf8"),
    language: "typescript"
  }
});

// Step 3: Implement suggestions
const refactoring = await runTool("suggest_refactoring", {
  path: "./src/utils/dataProcessor.ts",
  focusArea: "performance"
});
```

### With mcp-tdd Integration

Use TDD to implement optimizations safely:

```typescript
// Step 1: Identify optimization opportunity
const memoryAnalysis = await runTool("optimize_memory", {
  path: "./src/cache/memoryCache.ts",
  detectLeaks: true
});

// Step 2: Initialize TDD cycle for optimization
await runTool("tdd_init_cycle", {
  feature: "memory-optimization", 
  description: "Optimize memory cache to prevent leaks and improve performance"
});

// Step 3: Write failing tests for optimized behavior
await runTool("tdd_write_test", {
  testFile: "./test/cache/memoryCache.test.ts",
  testName: "should clean up expired entries automatically",
  testCode: `
    test('should clean up expired entries automatically', () => {
      const cache = new MemoryCache({ ttl: 100, cleanupInterval: 50 });
      
      cache.set('key1', 'value1');
      
      // Wait for expiration
      jest.advanceTimersByTime(150);
      
      // Should be cleaned up automatically
      expect(cache.has('key1')).toBe(false);
      expect(cache.size).toBe(0);
    });
  `
});

// Step 4: Implement optimization
await runTool("tdd_implement", {
  file: "./src/cache/memoryCache.ts",
  code: `
    class MemoryCache {
      private cleanupTimer?: NodeJS.Timer;
      
      constructor(options: CacheOptions) {
        if (options.cleanupInterval) {
          this.cleanupTimer = setInterval(() => {
            this.cleanupExpired();
          }, options.cleanupInterval);
        }
      }
      
      private cleanupExpired() {
        for (const [key, entry] of this.store.entries()) {
          if (entry.expiry < Date.now()) {
            this.store.delete(key);
          }
        }
      }
      
      destroy() {
        if (this.cleanupTimer) {
          clearInterval(this.cleanupTimer);
        }
      }
    }
  `
});

// Step 5: Verify optimization worked
await runTool("tdd_run_tests", {
  expectation: "pass"
});
```

### CI/CD Pipeline Integration

Automated optimization in GitHub Actions:

```yaml
name: Code Optimization Analysis

on: 
  pull_request:
    paths: ['src/**']

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install MCP Optimist
        run: npm install -g @mcp/optimist
        
      - name: Performance Analysis
        run: |
          mcp-optimist analyze_performance \
            --path ./src \
            --threshold medium \
            --output performance-report.json
            
      - name: Memory Analysis 
        run: |
          mcp-optimist optimize_memory \
            --path ./src \
            --detect-leaks \
            --output memory-report.json
            
      - name: Code Quality Analysis
        run: |
          mcp-optimist detect_code_smells \
            --path ./src \
            --severity high \
            --output quality-report.json
            
      - name: Comment PR with Results
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const reports = {
              performance: JSON.parse(fs.readFileSync('performance-report.json')),
              memory: JSON.parse(fs.readFileSync('memory-report.json')),
              quality: JSON.parse(fs.readFileSync('quality-report.json'))
            };
            
            const issueCount = reports.performance.findings.length + 
                             reports.memory.findings.length + 
                             reports.quality.findings.length;
                             
            const comment = `## 🔍 Code Optimization Analysis
            
            Found ${issueCount} optimization opportunities:
            
            ### Performance Issues: ${reports.performance.findings.length}
            ${reports.performance.findings.map(f => `- **${f.type}**: ${f.description}`).join('\n')}
            
            ### Memory Issues: ${reports.memory.findings.length}  
            ${reports.memory.findings.map(f => `- **${f.type}**: ${f.description}`).join('\n')}
            
            ### Quality Issues: ${reports.quality.findings.length}
            ${reports.quality.findings.map(f => `- **${f.type}**: ${f.description}`).join('\n')}
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

## Real-World Case Studies

### Case Study 1: E-commerce API Optimization

**Scenario:** E-commerce API with performance problems under load.

**Initial Analysis:**
```typescript
const analysis = await runTool("analyze_performance", {
  path: "./src/api",
  threshold: "low",
  profileHotPaths: true
});
```

**Findings:**
- Product search endpoint had O(n²) complexity
- Cart operations caused memory leaks
- Database queries weren't optimized

**Optimization Steps:**

1. **Search Optimization:**
```typescript
// Before: O(n²) product search
function searchProducts(query: string, filters: Filter[]) {
  return products.filter(product => {
    return filters.every(filter => {
      return product.attributes.find(attr => 
        attr.name === filter.name && attr.value === filter.value
      );
    });
  });
}

// After: O(n) with indexed search
class ProductSearchEngine {
  private attributeIndex = new Map<string, Set<string>>();
  
  constructor(products: Product[]) {
    this.buildIndex(products);
  }
  
  search(query: string, filters: Filter[]) {
    // Use index for O(1) attribute lookups
    const candidateIds = filters.length > 0 
      ? this.getFilteredIds(filters)
      : new Set(this.products.keys());
      
    return Array.from(candidateIds)
      .map(id => this.products.get(id))
      .filter(product => product.name.includes(query));
  }
}
```

2. **Memory Leak Fix:**
```typescript
// Before: Cart operations leaked memory
class CartService {
  private carts = new Map<string, Cart>();
  
  addItem(userId: string, item: CartItem) {
    // Memory leak: carts never cleaned up
    const cart = this.carts.get(userId) || new Cart();
    cart.addItem(item);
    this.carts.set(userId, cart);
  }
}

// After: TTL-based cleanup
class CartService {
  private carts = new Map<string, { cart: Cart, lastAccess: number }>();
  private cleanupInterval: NodeJS.Timer;
  
  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCarts();
    }, 60000); // Cleanup every minute
  }
  
  addItem(userId: string, item: CartItem) {
    const cartData = this.carts.get(userId) || { 
      cart: new Cart(), 
      lastAccess: Date.now() 
    };
    cartData.cart.addItem(item);
    cartData.lastAccess = Date.now();
    this.carts.set(userId, cartData);
  }
  
  private cleanupExpiredCarts() {
    const expiry = Date.now() - (30 * 60 * 1000); // 30 minutes
    for (const [userId, cartData] of this.carts) {
      if (cartData.lastAccess < expiry) {
        this.carts.delete(userId);
      }
    }
  }
}
```

**Results:**
- API response time improved by 75%
- Memory usage reduced by 60%
- Zero memory leaks under load testing

### Case Study 2: React Dashboard Performance

**Scenario:** Dashboard with poor rendering performance and memory leaks.

**Analysis Findings:**
```typescript
// Multiple issues found:
{
  findings: [
    {
      type: "unnecessary-rerenders",
      component: "DashboardGrid",
      description: "Component re-renders on every state change"
    },
    {
      type: "memory-leak", 
      component: "ChartWidget",
      description: "Event listeners not cleaned up"
    },
    {
      type: "large-bundle",
      description: "Import entire lodash library for one function"
    }
  ]
}
```

**Optimizations Applied:**

1. **Prevent Unnecessary Re-renders:**
```typescript
// Before: Re-renders entire dashboard
function Dashboard({ data }) {
  return (
    <div>
      {data.widgets.map(widget => (
        <Widget key={widget.id} data={widget} />
      ))}
    </div>
  );
}

// After: Memoized components
const Widget = React.memo(({ data }) => {
  return <div>{/* widget content */}</div>;
});

function Dashboard({ data }) {
  const widgets = useMemo(() => 
    data.widgets.map(widget => (
      <Widget key={widget.id} data={widget} />
    )), 
    [data.widgets]
  );
  
  return <div>{widgets}</div>;
}
```

2. **Fix Memory Leaks:**
```typescript
// Before: Event listeners leaked
function ChartWidget({ data }) {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);
  
  return <canvas ref={canvasRef} />;
}

// After: Proper cleanup
function ChartWidget({ data }) {
  useEffect(() => {
    const handleResize = () => {
      // Resize logic
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <canvas ref={canvasRef} />;
}
```

3. **Bundle Size Optimization:**
```typescript
// Before: Import entire lodash
import _ from 'lodash';

function processData(data) {
  return _.debounce(() => {
    // Process data
  }, 300);
}

// After: Import only needed function
import debounce from 'lodash/debounce';

function processData(data) {
  return debounce(() => {
    // Process data
  }, 300);
}
```

**Results:**
- Page load time reduced by 50%
- Memory usage stabilized (no more leaks)
- Bundle size reduced by 200KB
- User interactions became 60% more responsive

These examples demonstrate how MCP Optimist can identify real performance bottlenecks and guide systematic optimization efforts with measurable results.