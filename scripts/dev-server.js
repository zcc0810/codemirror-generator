const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildBundle, buildPreviewBundle } = require('./build');
const { generateThemeCss } = require('./generate-theme-css');
const { getCatalogMeta } = require('../src/catalog');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3456;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.zip': 'application/zip',
  '.map': 'application/json',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const rel = decoded === '/' ? '/index.html' : decoded;
  const resolved = path.normalize(path.join(ROOT, rel));
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

async function handleBuild(req, res) {
  try {
    const config = await readBody(req);
    const result = await buildBundle(config);
    const zip = fs.readFileSync(result.zipPath);
    send(res, 200, zip, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="codemirror-bundle.zip"',
      'Cache-Control': 'no-store',
    });
  } catch (err) {
    send(res, 400, JSON.stringify({ error: err.message || String(err) }), {
      'Content-Type': 'application/json',
    });
  }
}

function serveStatic(req, res) {
  const filePath = safePath(req.url);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(res, 404, 'Not found');
    return;
  }
  const ext = path.extname(filePath);
  const data = fs.readFileSync(filePath);
  send(res, 200, data, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=60',
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/build') {
    await handleBuild(req, res);
    return;
  }
  if (req.method === 'GET' && req.url === '/api/catalog') {
    send(res, 200, JSON.stringify(getCatalogMeta()), {
      'Content-Type': 'application/json',
    });
    return;
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }
  send(res, 405, 'Method not allowed');
});

async function start() {
  fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  console.log('Building preview bundle…');
  await buildPreviewBundle();
  const themeCss = generateThemeCss('oneDark');
  if (themeCss) {
    fs.writeFileSync(path.join(ROOT, 'dist', 'codemirror.theme.css'), themeCss, 'utf8');
  }
  server.listen(PORT, () => {
    console.log(`CodeMirror Generator → http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
