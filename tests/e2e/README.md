# Validación E2E en browser (storefront demo)

Harness de validación de los flujos del storefront en un **navegador real**
(Chromium headless vía Playwright) sobre el build demo con **MSW**. Cubre lo
que los tests unitarios de jsdom **no** pueden: service worker MSW real,
render y CSS aplicados, navegación del router, scroll y animaciones.

Nació para cerrar el checklist manual de la iniciativa
[`corregir-bugs-validacion-storefront`](../../docs/pm/iniciativas/corregir-bugs-validacion-storefront/index.md):
convertir "validar a mano en WSL2" en una corrida reproducible.

## Requisitos

- **Binario de Chromium**: este harness no descarga navegadores. Usa el
  Chromium ya presente bajo `PLAYWRIGHT_BROWSERS_PATH` (en el entorno de
  ejecución remota: `/opt/pw-browsers`). `lib/browser.mjs` resuelve el
  `executablePath` automáticamente; se puede forzar con `PW_CHROMIUM=/ruta/chrome`.
- **Paquete npm `playwright`** (devDependency). Si `npm install` intenta
  descargar navegadores y la red lo bloquea, instálalo con
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install`.
- **Build demo**: `dist/` generado con `DEMO_MODE=true npm run build:demo`
  (incluye `mockServiceWorker.js` y `dist/catalog/images/`).

## Uso

```bash
DEMO_MODE=true npm run build:demo   # genera dist/ con MSW
npm run test:e2e                    # arranca server + Chromium + corre checks
```

`run.mjs` levanta el servidor estático (`serve-dist.mjs`) en el puerto 4599
(configurable con `PORT`), lanza Chromium, ejecuta cada módulo de `checks/`
en un contexto fresco, guarda un screenshot por check en `screenshots/` y
sale con código != 0 si falla algún check marcado `critical`.

## Estructura

```
tests/e2e/
  serve-dist.mjs    Servidor estático de dist/ con fallback SPA + mime del SW
  lib/browser.mjs   launchBrowser(): resuelve el Chromium del entorno
  run.mjs           Runner: descubre checks/, los corre, reporta, screenshots
  checks/           Un módulo por ítem del checklist (NN-id.mjs)
  screenshots/      Salida visual (gitignored)
  README.md         Este archivo
```

## Añadir un check

Cada archivo en `checks/` hace `export default` de un objeto:

```js
export default {
  id: 'login',                       // único; = nombre del screenshot
  title: 'Login -> /account sin loading infinito',
  critical: true,                    // si true, su fallo hace exit != 0
  async run(page, { base }) {        // 'page' ya viene creado por el runner
    await page.goto(base + '/auth/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500); // dar tiempo al SW de MSW + primer fetch
    // ...interactuar y asertar...
    return { status: 'pass', notes: 'detalle conciso' };
    // status: 'pass' | 'warn' (funciona con salvedad) | 'fail' (roto)
  },
};
```

## Notas y limitaciones conocidas

- **Primer fetch vs service worker**: en la primera carga el SW de MSW tarda
  en tomar control. Tras `goto(..., { waitUntil: 'networkidle' })` conviene un
  `waitForTimeout(~2500)` antes de asertar datos.
- **Estado de MSW por carga**: el estado mutable de los handlers (carrito,
  wishlist) vive en variables de módulo que se **reinician al recargar** la
  página. La persistencia tras `reload()` puede no mantenerse en demo; los
  checks que la tocan lo reportan como `warn`, no `fail`.
- **Modal de búsqueda**: se abre con el botón `aria-label="Buscar productos"`;
  el atajo ⌘K no está cableado en el bundle demo.
- **Versión de Playwright vs Chromium**: el paquete npm puede pedir un build
  de Chromium distinto al cacheado. Por eso lanzamos con `executablePath`
  explícito (un Chromium ligeramente más viejo se maneja vía CDP).
- **Alcance**: esto valida comportamiento en runtime, no es pixel-perfect. Las
  animaciones quedan como evidencia en los screenshots, no como aserción.
