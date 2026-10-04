const http = require('http');
const fs = require('fs');
const path = require('path');

// .env.local dosyasından BLOB_READ_WRITE_TOKEN yükle
try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        const val = v.join('=').replace(/^["']|["']$/g, '');
        process.env[k.trim()] = val;
      }
    }
  }
} catch (e) {
  console.warn('Env load warning:', e.message);
}

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// API işleyicilerini yükle
const apiHandlers = {
  '/api/photos': require('./api/photos'),
  '/api/upload': require('./api/upload'),
  '/api/delete': require('./api/delete'),
  '/api/login': require('./api/login')
};

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const pathname = decodeURI(urlParts[0]);

  // API rotalarını karşıla
  if (apiHandlers[pathname]) {
    // Body oku
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
      // 20MB limit
      if (bodyData.length > 20 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        if (bodyData) {
          try {
            req.body = JSON.parse(bodyData);
          } catch {
            req.body = {};
          }
        } else {
          req.body = {};
        }

        // Express/Vercel benzeri res.status ve res.json yardımcıları ekle
        res.status = function(code) {
          this.statusCode = code;
          return this;
        };
        res.json = function(data) {
          this.setHeader('Content-Type', 'application/json; charset=utf-8');
          this.end(JSON.stringify(data));
          return this;
        };

        await apiHandlers[pathname](req, res);
      } catch (err) {
        console.error(`API Error on ${pathname}:`, err);
        if (!res.writableEnded) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      }
    });
    return;
  }

  // Statik dosya servisi
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Yerel sunucu aktif: http://localhost:${PORT}`);
  console.log(`☁️ Vercel Blob API entegrasyonu hazır.\n`);
});
