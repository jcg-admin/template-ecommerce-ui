#!/usr/bin/env node
// verify-build — e-comerce-ui
//
// Inspecciona los chunks JavaScript de `dist/` tras `npm run build`
// y reporta las URLs HTTP(S) inyectadas por webpack DefinePlugin.
// Falla si:
//
//   - dist/ no existe o no contiene main.*.js
//   - ninguna URL http(s) aparece en el bundle principal
//   - el bundle de produccion contiene una URL de localhost o
//     127.0.0.1 (la senal mas comun de un .env mal cargado)
//
// Flags:
//
//   --dist=<path>      directorio a inspeccionar (default: dist)
//   --expected=<url>   exige que la URL aparezca al menos una vez
//                      en el bundle. Util en pipelines manuales:
//                      "verify-build --expected=https://api.prod.example.com".
//   --allow-localhost  permite localhost (uso de desarrollo, no
//                      recomendado para builds de produccion).
//
// Salida:
//
//   exit 0  todo OK, imprime las URLs encontradas para revision.
//   exit 1  uno de los criterios fallo, imprime la razon.
//
// Patron de uso pre-deploy:
//
//   npm run build
//   npm run verify-build -- --expected=https://api.prod.example.com
//
// Implementado en T-020 de la iniciativa
// `resolver-hallazgos-de-deuda-del-template`, sin dependencia de
// CI/CD: ejecuta localmente con `node scripts/verify-build.mjs`.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ── CLI parsing minimo, sin dependencias ─────────────────────────────

const args = process.argv.slice(2);
const opt = {
  dist: 'dist',
  expected: null,
  allowLocalhost: false,
};
for (const a of args) {
  if (a.startsWith('--dist=')) opt.dist = a.slice('--dist='.length);
  else if (a.startsWith('--expected=')) opt.expected = a.slice('--expected='.length);
  else if (a === '--allow-localhost') opt.allowLocalhost = true;
  else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
  else {
    console.error(`verify-build: argumento desconocido: ${a}`);
    printHelp();
    process.exit(1);
  }
}

function printHelp() {
  console.log(`Uso: node scripts/verify-build.mjs [opciones]

Opciones:
  --dist=<path>       Directorio del build (default: dist)
  --expected=<url>    URL que debe aparecer en el bundle
  --allow-localhost   No falla si encuentra localhost
  --help              Mostrar esta ayuda`);
}

// ── Localizar el bundle principal ────────────────────────────────────

const distPath = resolve(repoRoot, opt.dist);
if (!existsSync(distPath)) {
  console.error(`verify-build: no existe ${distPath}. Corre 'npm run build' primero.`);
  process.exit(1);
}

const mainFiles = readdirSync(distPath).filter(
  (f) => /^main(\.[a-z0-9]+)?\.js$/i.test(f) && !f.endsWith('.map'),
);

if (mainFiles.length === 0) {
  console.error(`verify-build: no se encontro ningun main*.js en ${distPath}.`);
  process.exit(1);
}

if (mainFiles.length > 1) {
  console.error(`verify-build: encontre varios main*.js, inspeccionando todos:`);
  for (const f of mainFiles) console.error(`  ${f}`);
}

// ── Extraer URLs http(s) ─────────────────────────────────────────────

const urlRegex = /https?:\/\/[a-zA-Z0-9_.\-:/?=&%~+#]+/g;
const allUrls = new Set();

for (const f of mainFiles) {
  const content = readFileSync(join(distPath, f), 'utf8');
  const matches = content.match(urlRegex) || [];
  for (const u of matches) allUrls.add(u);
}

// Filtros de ruido: URLs de schema/docs que cualquier bundle React
// suele tener (links de pistas de React DevTools, documentacion, etc.)
const NOISE_PATTERNS = [
  /reactjs\.org/,
  /react\.dev/,
  /w3\.org/,
  /github\.com/,
  /unpkg\.com/,
  /cdn\.jsdelivr/,
  /cdnjs\.cloudflare/,
];

const meaningful = [...allUrls].filter(
  (u) => !NOISE_PATTERNS.some((re) => re.test(u)),
);

console.log('verify-build: URLs encontradas en el bundle principal:');
if (meaningful.length === 0) {
  console.log('  (ninguna)');
} else {
  for (const u of meaningful.sort()) console.log(`  ${u}`);
}

// ── Aplicar las reglas ────────────────────────────────────────────────

let failed = false;

if (meaningful.length === 0) {
  console.error('\nverify-build: ERROR ninguna URL http(s) significativa en el bundle.');
  console.error('  Esto suele significar que `process.env.API_URL` quedo undefined al construir.');
  failed = true;
}

const localhostUrls = meaningful.filter(
  (u) => /\b(?:localhost|127\.0\.0\.1)(?:[:/]|$)/.test(u),
);
if (localhostUrls.length > 0 && !opt.allowLocalhost) {
  console.error('\nverify-build: ERROR el bundle contiene URLs de localhost:');
  for (const u of localhostUrls) console.error(`  ${u}`);
  console.error('  Usa `--allow-localhost` si esto es un build de desarrollo.');
  failed = true;
}

if (opt.expected) {
  const found = meaningful.some((u) => u.includes(opt.expected));
  if (!found) {
    console.error(`\nverify-build: ERROR no se encontro la URL esperada en el bundle:`);
    console.error(`  esperada: ${opt.expected}`);
    failed = true;
  } else {
    console.log(`\nverify-build: OK la URL esperada esta presente: ${opt.expected}`);
  }
}

if (failed) {
  console.error('\nverify-build: FAIL revisa los errores arriba y vuelve a construir.');
  process.exit(1);
}

console.log('\nverify-build: OK ningun criterio fallo.');
process.exit(0);
