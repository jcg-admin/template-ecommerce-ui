/**
 * Servidor estatico para validacion E2E.
 *
 * Sirve dist/ (build:demo) con fallback SPA: las rutas sin archivo real
 * (p.ej. /search, /account) devuelven index.html para que el router del
 * cliente las maneje. mockServiceWorker.js se sirve con mime JS y el header
 * Service-Worker-Allowed para que MSW intercepte sobre el bundle compilado.
 *
 * Uso: PORT=4599 node tests/e2e/serve-dist.mjs
 * Tambien lo arranca run.mjs como proceso hijo.
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../dist/', import.meta.url));
const PORT = Number(process.env.PORT) || 4599;
const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.map': 'application/json', '.ico': 'image/x-icon', '.webp': 'image/webp',
};

export function startServer(port = PORT) {
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = join(ROOT, normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
      let info = null;
      try { info = await stat(filePath); } catch { /* no existe */ }
      if (!info || info.isDirectory()) {
        if (extname(urlPath)) { res.writeHead(404); return res.end('not found'); }
        filePath = join(ROOT, 'index.html'); // fallback SPA
      }
      const body = await readFile(filePath);
      const headers = { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' };
      if (filePath.endsWith('mockServiceWorker.js')) headers['Service-Worker-Allowed'] = '/';
      res.writeHead(200, headers);
      res.end(body);
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
  return new Promise((resolve) => server.listen(port, () => resolve({ server, port })));
}

// Ejecutado directamente: levantar y quedarse escuchando.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer().then(({ port }) => console.log(`serving dist/ on http://127.0.0.1:${port}`));
}
