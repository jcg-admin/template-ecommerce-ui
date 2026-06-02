/**
 * Runner de validacion E2E del storefront en modo demo.
 *
 * Arranca el servidor estatico (dist/ del build:demo), lanza Chromium real
 * y ejecuta cada modulo de checks/ contra la app con MSW activo. Cada check
 * corre en un contexto/page fresco y produce un screenshot en screenshots/.
 *
 * Contrato de cada modulo en checks/ (export default):
 *   {
 *     id: 'login',                 // identificador unico (= nombre del shot)
 *     title: 'Login -> /account',  // descripcion legible
 *     critical: true,              // si true, su fallo hace exit != 0
 *     async run(page, { base }) {  // page: Playwright Page ya creado
 *       // ...interactuar...
 *       return { status: 'pass'|'fail'|'warn', notes: 'detalle' };
 *     }
 *   }
 *
 * Uso: node tests/e2e/run.mjs    (requiere dist/ de `npm run build:demo`)
 */
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { startServer } from './serve-dist.mjs';
import { launchBrowser } from './lib/browser.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHECKS_DIR = join(HERE, 'checks');
const SHOTS_DIR = join(HERE, 'screenshots');
const PORT = Number(process.env.PORT) || 4599;
const BASE = `http://127.0.0.1:${PORT}`;

// Filtros opcionales por nombre (argv): `node run.mjs gauge map` corre solo los
// checks cuyo archivo o id contenga alguno de esos terminos. Util para iterar
// un check en aislamiento (combinado con PORT=46xx para no colisionar).
const FILTERS = process.argv.slice(2).map((s) => s.toLowerCase());

async function loadChecks() {
  if (!existsSync(CHECKS_DIR)) return [];
  let files = readdirSync(CHECKS_DIR).filter((f) => f.endsWith('.mjs')).sort();
  if (FILTERS.length) {
    files = files.filter((f) => FILTERS.some((q) => f.toLowerCase().includes(q)));
  }
  const mods = [];
  for (const f of files) {
    const mod = (await import(pathToFileURL(join(CHECKS_DIR, f)).href)).default;
    if (mod && typeof mod.run === 'function') mods.push(mod);
  }
  return mods;
}

async function main() {
  if (!existsSync(join(HERE, '../../dist/index.html'))) {
    console.error('No existe dist/index.html. Corre primero: DEMO_MODE=true npm run build:demo');
    process.exit(2);
  }
  mkdirSync(SHOTS_DIR, { recursive: true });
  const checks = await loadChecks();
  if (checks.length === 0) { console.error('No hay checks en tests/e2e/checks/'); process.exit(2); }

  const { server } = await startServer(PORT);
  const browser = await launchBrowser();
  const results = [];

  for (const check of checks) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    let res;
    try {
      res = await check.run(page, { base: BASE });
    } catch (e) {
      res = { status: 'fail', notes: `excepcion: ${String(e).slice(0, 200)}` };
    }
    try { await page.screenshot({ path: join(SHOTS_DIR, `${check.id}.png`) }); } catch { /* noop */ }
    await ctx.close();
    results.push({ id: check.id, title: check.title, critical: check.critical !== false, ...res });
    const icon = res.status === 'pass' ? 'PASS' : res.status === 'warn' ? 'WARN' : 'FAIL';
    console.log(`[${icon}] ${check.id} — ${check.title}`);
    if (res.notes) console.log(`        ${res.notes}`);
  }

  await browser.close();
  server.close();

  const failed = results.filter((r) => r.status === 'fail' && r.critical);
  console.log(`\nResumen: ${results.filter(r => r.status==='pass').length} pass, ` +
    `${results.filter(r => r.status==='warn').length} warn, ` +
    `${results.filter(r => r.status==='fail').length} fail (de ${results.length}). ` +
    `Screenshots en tests/e2e/screenshots/.`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
