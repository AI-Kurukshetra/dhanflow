const http = require('http');
const { runAiAdvisorWorkflow } = require('./advisorService');

function parseBody(req) {
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
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function createAiAdvisorServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'ai-advisor' }));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/ai-advisor') {
      try {
        const body = await parseBody(req);
        const result = await runAiAdvisorWorkflow(body);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: error.message || 'Unknown error',
          }),
        );
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
}

function startAiAdvisorServer(port = Number(process.env.PORT || 8787)) {
  const server = createAiAdvisorServer();
  server.listen(port, () => {
    console.log(`AI advisor API listening on :${port}`);
  });
  return server;
}

module.exports = {
  createAiAdvisorServer,
  startAiAdvisorServer,
};
