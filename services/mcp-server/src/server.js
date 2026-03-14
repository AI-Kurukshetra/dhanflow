const http = require('http');
const { toolHandlers } = require('./tools');

const TOOL_LIST = Object.keys(toolHandlers);

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (_error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function createMcpServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'mcp-server' }));
      return;
    }

    if (req.method === 'GET' && req.url === '/tools') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tools: TOOL_LIST }));
      return;
    }

    if (req.method === 'POST' && req.url === '/mcp') {
      try {
        const payload = await readJsonBody(req);
        const tool = payload.tool;
        const input = payload.input || {};

        if (!tool || !toolHandlers[tool]) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              ok: false,
              error: {
                message: `Unknown tool. Expected one of: ${TOOL_LIST.join(', ')}`,
              },
            }),
          );
          return;
        }

        const result = await toolHandlers[tool](input);
        res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: { message: error.message || 'Unknown error' } }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: { message: 'Not found' } }));
  });
}

function startMcpServer(port = Number(process.env.MCP_PORT || process.env.PORT || 8790)) {
  const server = createMcpServer();
  server.listen(port, () => {
    console.log(`MCP server listening on :${port}`);
  });
  return server;
}

module.exports = {
  createMcpServer,
  startMcpServer,
};
