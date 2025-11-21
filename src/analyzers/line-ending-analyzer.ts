import * as fs from "fs";

export interface LineEndingIssue {
  type: "line-ending";
  severity: "low" | "medium" | "high";
  filePath: string;
  detectedEnding: "CRLF" | "LF" | "CR" | "mixed";
  lineCount: { crlf: number; lf: number; cr: number };
  message: string;
  suggestion: string;
}

/**
 * Analyze files for line ending inconsistencies
 */
export class LineEndingAnalyzer {
  analyze(filePath: string): LineEndingIssue | null {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return this.analyzeContent(content, filePath);
    } catch (error) {
      return null;
    }
  }

  analyzeContent(content: string, filePath: string): LineEndingIssue | null {
    const crlfCount = (content.match(/\r\n/g) || []).length;
    const lfCount = (content.match(/(?<!\r)\n/g) || []).length;
    const crCount = (content.match(/\r(?!\n)/g) || []).length;

    const totalLines = crlfCount + lfCount + crCount;
    if (totalLines === 0) {
      return null; // Single line file or no line endings
    }

    // Determine the dominant and mixed status
    let detectedEnding: "CRLF" | "LF" | "CR" | "mixed";
    let severity: "low" | "medium" | "high" = "low";
    let message = "";
    let suggestion = "";

    const hasMixed =
      (crlfCount > 0 && lfCount > 0) ||
      (crlfCount > 0 && crCount > 0) ||
      (lfCount > 0 && crCount > 0);

    if (hasMixed) {
      detectedEnding = "mixed";
      severity = "high";
      message = `Mixed line endings detected: ${crlfCount} CRLF, ${lfCount} LF, ${crCount} CR`;
      suggestion =
        "Normalize all line endings to LF (Unix-style) for better cross-platform compatibility. Configure .gitattributes and editor settings.";
    } else if (crlfCount > 0) {
      detectedEnding = "CRLF";
      severity = "low";
      message = "Windows-style line endings (CRLF) detected";
      suggestion =
        'Consider using LF for better compatibility. Configure .gitattributes: "* text=auto eol=lf"';
    } else if (lfCount > 0) {
      detectedEnding = "LF";
      severity = "low";
      message = "Unix-style line endings (LF) detected";
      suggestion =
        "Good! LF is recommended for cross-platform projects. Ensure .gitattributes is configured.";
    } else {
      detectedEnding = "CR";
      severity = "medium";
      message = "Old Mac-style line endings (CR) detected";
      suggestion =
        "Convert to LF. CR is outdated and not supported on modern systems.";
    }

    return {
      type: "line-ending",
      severity,
      filePath,
      detectedEnding,
      lineCount: { crlf: crlfCount, lf: lfCount, cr: crCount },
      message,
      suggestion,
    };
  }

  suggestGitAttributes(): string {
    return `# Recommended .gitattributes for cross-platform projects
* text=auto eol=lf
*.{cmd,bat} text eol=crlf
*.sh text eol=lf
*.{jpg,png,gif,ico,svg} binary
`;
  }
}
