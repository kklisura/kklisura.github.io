#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');

const { OUTPUT_DIR } = require('./lib/config');

const PORT = process.env.PORT || 4000;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
};

if (!fs.existsSync(OUTPUT_DIR)) {
  console.error(`Nothing built yet. Run "npm run build" (or "npm run build:drafts") first.`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  let filePath = path.join(OUTPUT_DIR, urlPath);
  if (!filePath.startsWith(OUTPUT_DIR)) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    filePath += '.html';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const type = CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Serving ${path.relative(process.cwd(), OUTPUT_DIR)} at http://localhost:${PORT}`);
});
