import { PlatformAPIAnalyzer } from "../../../src/analyzers/platform-api-analyzer";

describe("PlatformAPIAnalyzer", () => {
  let analyzer: PlatformAPIAnalyzer;

  beforeEach(() => {
    analyzer = new PlatformAPIAnalyzer();
  });

  it("should detect Windows-specific imports", () => {
    const code = `
      import win32 from 'win32';
      const result = win32.doSomething();
    `;

    const issues = analyzer.analyze(code, "test.ts");

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].platform).toBe("windows");
    expect(issues[0].type).toBe("platform-api");
  });

  it("should detect POSIX-specific function calls", () => {
    const code = `
      import { fork } from 'child_process';
      const child = fork('./worker.js');
    `;

    const issues = analyzer.analyze(code, "test.ts");

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((issue) => issue.apiName === "fork")).toBe(true);
  });

  it("should not flag cross-platform code", () => {
    const code = `
      import fs from 'fs';
      const data = fs.readFileSync('./file.txt', 'utf-8');
    `;

    const issues = analyzer.analyze(code, "test.ts");

    expect(issues.length).toBe(0);
  });
});
