/**
 * Check de wishlist (favoritos).
 *
 * Cubre BUG-CARD-01 / BUG-WISHLIST-01/02/03.
 *
 * El boton de favoritos en las cards usa aria-label="Añadir a deseos"
 * y al estar en la wishlist pasa a aria-label="Quitar de deseos".
 * La reflexion en UI requiere wishlist cargada -> solo con sesion
 * (StorefrontLayout hace fetchWishlist si isAuthenticated). Por eso
 * primero hacemos login.
 *
 * PASS si el toggle de aria-label se refleja en la UI.
 * WARN si el toggle funciona pero no persiste tras reload (estado MSW
 *      por carga de pagina en demo).
 * FAIL si no hay boton o el toggle no cambia.
 */
const ADD = 'Añadir a deseos';
const REMOVE = 'Quitar de deseos';

export default {
  id: 'wishlist',
  title: 'Wishlist toggle (♡ -> ♥)',
  critical: false,
  async run(page, { base }) {
    // Observamos las llamadas al endpoint de wishlist para distinguir
    // "el servidor acepto el cambio pero la UI no lo refleja" (firma de
    // BUG-CARD-01) de "la peticion fallo".
    let lastWishlistWrite = null;
    page.on('response', (res) => {
      try {
        const u = res.url();
        const m = res.request().method();
        if (u.includes('/api/v1/wishlist') && (m === 'POST' || m === 'DELETE')) {
          lastWishlistWrite = { method: m, status: res.status() };
        }
      } catch { /* noop */ }
    });

    try {
      // 1) Login
      await page.goto(base + '/auth/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      await page.fill('input[type=email]', 'comprador@test.mx');
      await page.fill('input[type=password]', 'Test1234!');
      await page.getByRole('button', { name: 'Entrar a mi cuenta' }).click();

      // Esperar salir de /auth/login
      try {
        await page.waitForFunction(
          () => !location.pathname.startsWith('/auth/login'),
          { timeout: 15000 },
        );
      } catch {
        return {
          status: 'fail',
          notes: `No se completo el login: la URL siguio en ${new URL(page.url()).pathname} tras pulsar "Entrar a mi cuenta".`,
        };
      }
      await page.waitForTimeout(1500);

      // 2) Ir a una ficha/catalogo y localizar el boton de wishlist
      await page.goto(base + '/catalog/abe-esu-cuchilla-de-esu', {
        waitUntil: 'networkidle',
      });
      await page.waitForTimeout(2500);

      let addBtn = page.locator(`button[aria-label="${ADD}"]`).first();
      let removeBtn = page.locator(`button[aria-label="${REMOVE}"]`).first();

      // Si la ficha no expone el boton, caer al catalogo (cards).
      if (
        (await addBtn.count()) === 0 &&
        (await removeBtn.count()) === 0
      ) {
        await page.goto(base + '/catalog', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2500);
        addBtn = page.locator(`button[aria-label="${ADD}"]`).first();
        removeBtn = page.locator(`button[aria-label="${REMOVE}"]`).first();
      }

      const hasAdd = (await addBtn.count()) > 0;
      const hasRemove = (await removeBtn.count()) > 0;
      if (!hasAdd && !hasRemove) {
        return {
          status: 'fail',
          notes: 'No se encontro ningun boton de wishlist (ni "Añadir a deseos" ni "Quitar de deseos") tras login en ficha ni en /catalog.',
        };
      }

      // Determinar estado inicial y boton a clicar.
      const startedInWishlist = !hasAdd && hasRemove;
      const toggleBtn = startedInWishlist ? removeBtn : addBtn;
      const expectedAfter = startedInWishlist ? ADD : REMOVE;
      const expectedBefore = startedInWishlist ? REMOVE : ADD;

      // 3) Click y verificar que el aria-label alterna.
      await toggleBtn.scrollIntoViewIfNeeded();
      await toggleBtn.click();

      let toggled = false;
      try {
        await page.waitForSelector(`button[aria-label="${expectedAfter}"]`, {
          timeout: 10000,
        });
        toggled = true;
      } catch {
        toggled = false;
      }

      if (!toggled) {
        const wr = lastWishlistWrite
          ? `La peticion ${lastWishlistWrite.method} /api/v1/wishlist respondio ${lastWishlistWrite.status}.`
          : 'No se observo ninguna peticion de escritura a /api/v1/wishlist tras el click.';
        const serverOk =
          lastWishlistWrite &&
          lastWishlistWrite.status >= 200 &&
          lastWishlistWrite.status < 300;
        const diag = serverOk
          ? ' El servidor acepto el cambio pero la card NO actualiza su aria-label: en CatalogPage.jsx el <ProductCard> se renderiza sin la prop inWishlist (default false), por lo que el boton de la card nunca refleja el estado (BUG-CARD-01).'
          : '';
        return {
          status: 'fail',
          notes: `El boton de wishlist no alterno en la UI: tras click se esperaba aria-label="${expectedAfter}" (estado inicial "${expectedBefore}") y no aparecio. ${wr}${diag}`,
        };
      }

      // 4) Reload y reportar persistencia.
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      const afterReloadRemove =
        (await page.locator(`button[aria-label="${REMOVE}"]`).count()) > 0;
      const afterReloadAdd =
        (await page.locator(`button[aria-label="${ADD}"]`).count()) > 0;

      // Estado esperado si persistiera: el opuesto del inicial.
      const persisted = startedInWishlist
        ? // empezamos en wishlist -> lo quitamos -> deberia quedar "Añadir"
          afterReloadAdd && !afterReloadRemove
        : // empezamos fuera -> lo agregamos -> deberia quedar "Quitar"
          afterReloadRemove;

      if (persisted) {
        return {
          status: 'pass',
          notes: `Toggle de wishlist OK (${expectedBefore} -> ${expectedAfter}) y persistio tras reload.`,
        };
      }

      return {
        status: 'warn',
        notes: `Toggle de wishlist OK (${expectedBefore} -> ${expectedAfter}) reflejado en UI, pero NO persiste tras reload. Esperado en demo: el estado de MSW es por carga de pagina (modulo se reinicia al recargar).`,
      };
    } catch (err) {
      return {
        status: 'fail',
        notes: `Excepcion durante el check de wishlist: ${err && err.message ? err.message : String(err)}`,
      };
    }
  },
};
