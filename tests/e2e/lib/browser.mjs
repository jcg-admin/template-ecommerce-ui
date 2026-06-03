/**
 * Helper de lanzamiento de Chromium para la validacion E2E.
 *
 * El binario de Chromium ya vive en el entorno (PLAYWRIGHT_BROWSERS_PATH,
 * normalmente /opt/pw-browsers). La version del paquete npm `playwright`
 * puede no coincidir con el build cacheado, asi que resolvemos el
 * executablePath explicitamente en vez de depender de la resolucion
 * automatica de Playwright.
 *
 * Orden de resolucion:
 *   1. env PW_CHROMIUM (ruta explicita)
 *   2. primer chromium-* / chrome-linux / chrome bajo PLAYWRIGHT_BROWSERS_PATH
 *   3. chromium.executablePath() de Playwright (fallback)
 */
import { chromium } from 'playwright';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function resolveChromium() {
  if (process.env.PW_CHROMIUM && existsSync(process.env.PW_CHROMIUM)) {
    return process.env.PW_CHROMIUM;
  }
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dirs = readdirSync(root)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort();
    for (const d of dirs) {
      const candidate = join(root, d, 'chrome-linux', 'chrome');
      if (existsSync(candidate)) return candidate;
    }
  } catch { /* root inexistente */ }
  try { return chromium.executablePath(); } catch { return undefined; }
}

export async function launchBrowser() {
  const executablePath = resolveChromium();
  return chromium.launch({ headless: true, executablePath });
}
