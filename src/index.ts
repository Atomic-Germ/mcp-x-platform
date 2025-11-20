#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { XPlatformServer } from './server.js';
import { detectPlatformAPIs } from './tools/platform-apis.js';
import { analyzeFilePaths } from './tools/file-paths.js';
import { analyzeLineEndings } from './tools/line-endings.js';
import { analyzeShellCommands } from './tools/shell-commands.js';
import { generateCompatibilityReport } from './tools/compatibility-report.js';

/**
 * Main entry point for the X-Platform MCP server
 */
async function main() {
  const xplatform = new XPlatformServer();

  const server = new Server(
    {
      name: xplatform.name,
      version: xplatform.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle list_tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = xplatform.listTools();
    return { tools };
  });

  // Handle call_tool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'detect_platform_apis': {
          const result = await detectPlatformAPIs(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'analyze_file_paths': {
          const result = await analyzeFilePaths(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'analyze_line_endings': {
          const result = await analyzeLineEndings(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'analyze_shell_commands': {
          const result = await analyzeShellCommands(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'generate_compatibility_report': {
          const result = await generateCompatibilityReport(args as any);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'analyze_dependencies':
        case 'analyze_build_systems':
        case 'detect_encoding_issues': {
          return {
            content: [
              {
                type: 'text',
                text: `Tool '${name}' implementation pending. Arguments received: ${JSON.stringify(args, null, 2)}`,
              },
            ],
          };
        }

        default: {
          return {
            content: [
              {
                type: 'text',
                text: `Unknown tool: '${name}'`,
              },
            ],
          };
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool '${name}': ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('X-Platform MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
