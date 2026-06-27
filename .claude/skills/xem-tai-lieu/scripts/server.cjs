'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildData } = require('./data.cjs');

const ASSETS = path.join(__dirname, '..', 'assets');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function sendFile(res, fp) {
  fs.readFile(fp, (err, buf) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(buf);
  });
}

function createServer(sddDir) {
  const clients = new Set();

  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    if (url === '/') return sendFile(res, path.join(ASSETS, 'frame.html'));
    if (url === '/data.json') {
      const body = JSON.stringify(buildData(sddDir));
      res.writeHead(200, { 'Content-Type': MIME['.json'] });
      return res.end(body);
    }
    if (url === '/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
      res.write(': ok\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    const safe = path.normalize(url).replace(/^([/\\]|\.\.[/\\])+/, '');
    const fp = path.join(ASSETS, safe);
    if (fp.startsWith(ASSETS) && fs.existsSync(fp) && fs.statSync(fp).isFile()) return sendFile(res, fp);
    res.writeHead(404); res.end('Not found');
  });

  let timer = null;
  try {
    fs.watch(sddDir, { persistent: false }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        for (const res of clients) { try { res.write('event: changed\ndata: {}\n\n'); } catch (e) {} }
      }, 150);
    });
  } catch (e) { /* thư mục có thể chưa tồn tại */ }

  return server;
}

if (require.main === module) {
  const sddDir = process.argv[2] || path.join(process.cwd(), 'docs', 'sdd');
  const port = parseInt(process.argv[3] || process.env.PORT || '0', 10);
  const server = createServer(sddDir);
  server.listen(port, '127.0.0.1', () => {
    const addr = server.address();
    process.stdout.write(JSON.stringify({ type: 'server-started', url: `http://localhost:${addr.port}/`, port: addr.port, pid: process.pid, sddDir }) + '\n');
  });
}

module.exports = { createServer };
