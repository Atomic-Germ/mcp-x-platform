#!/usr/bin/env node
const { spawn } = require('child_process');
const { Client } = require('@modelcontextprotocol/sdk/client');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio');

async function run() {
  // Spawn the server as a child process
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  const transport = new StdioClientTransport({
    read: server.stdout,
    write: server.stdin,
  });

  const client = new Client({ name: 'mcp-client', version: '0.1.0' });

  await client.connect(transport);

  // List tools
  const toolsResp = await client.listTools();
  console.log('TOOLS:', toolsResp.tools.map(t => t.name));

  // Call detect_platform_apis
  const callResp = await client.callTool('detect_platform_apis', { path: 'src', includeTests: false });
  console.log('CALL RESPONSE:', JSON.stringify(callResp, null, 2));

  // Cleanup
  transport.close();
  server.kill();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
