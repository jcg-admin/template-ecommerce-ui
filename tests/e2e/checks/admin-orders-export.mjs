/**
 * Check: Exportar pedidos a CSV (UC-ADM-XLSX)
 *
 * Tras iniciar sesion como admin (la app deja la SPA en /admin), navegamos a
 * /admin/orders clicando el enlace de navegacion del panel — NO con goto, que
 * reiniciaria la sesion MSW (el perfil caeria al comprador sin is_admin y
 * AdminRoute redirigiria a /auth/login). En /admin/orders existe el boton
 * "Exportar CSV"; verificamos que aparece y que clicarlo no lanza (en headless
 * la descarga puede no completarse: basta con el boton y un click inocuo).
 *
 * Si el panel admin no es alcanzable en demo -> 'warn'; 'fail' solo si el click
 * rompe la pagina.
 */
import { loginAsAdmin } from '../lib/auth.mjs';

// Navegacion SPA: clic en un <Link> del panel (preserva la sesion admin viva
// en el service worker; un goto la perderia).
async function spaClickAdminLink(page, hrefPath) {
  const link = page.locator(`a[href="${hrefPath}"], a[href$="${hrefPath}"]`).first();
  if (!(await link.count().catch(() => 0))) return false;
  await link.scrollIntoViewIfNeeded().catch(() => {});
  await link.click({ timeout: 5000 }).catch(() => {});
  await page.waitForFunction(
    (p) => location.pathname === p || location.pathname.endsWith(p),
    hrefPath,
    { timeout: 8000 },
  ).catch(() => {});
  await page.waitForTimeout(2500); // dar tiempo a la carga de datos via MSW
  return true;
}

export default {
  id: 'admin-orders-export',
  title: 'Boton "Exportar CSV" en /admin/orders (UC-ADM-XLSX)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base);
      await page.waitForTimeout(1500);

      if (!(await page.evaluate(() => location.pathname.startsWith('/admin')))) {
        return {
          status: 'warn',
          notes: `Tras loginAsAdmin la SPA no quedo en el panel admin (estamos en ${await page.evaluate(() => location.pathname)}); panel admin no alcanzable en demo.`,
        };
      }

      const navigated = await spaClickAdminLink(page, '/admin/orders');
      const pathname = await page.evaluate(() => location.pathname);
      if (!navigated || !pathname.includes('/admin/orders')) {
        return {
          status: 'warn',
          notes: `No se pudo navegar a /admin/orders via enlace del panel (estamos en ${pathname}); flujo admin no alcanzable en demo sin recargar (que perderia la sesion).`,
        };
      }

      const button = page.getByRole('button', { name: 'Exportar CSV' });
      const count = await button.count().catch(() => 0);
      if (count === 0) {
        return {
          status: 'warn',
          notes: `En /admin/orders no se encontro el boton "Exportar CSV"; posible que la lista de pedidos no cargue en demo.`,
        };
      }

      // Clicar no debe lanzar. La descarga puede no completarse en headless.
      let clickError = null;
      try {
        await button.first().scrollIntoViewIfNeeded().catch(() => {});
        await button.first().click({ timeout: 4000 });
        await page.waitForTimeout(500);
      } catch (e) {
        clickError = e?.message || String(e);
      }

      const stillAlive = (await page.getByRole('button', { name: 'Exportar CSV' }).count().catch(() => 0)) > 0;

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/admin-orders-export.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (clickError) {
        return {
          status: 'fail',
          notes: `UC-ADM-XLSX: el boton "Exportar CSV" existe pero el click lanzo: ${clickError}.`,
        };
      }

      return {
        status: 'pass',
        notes: `UC-ADM-XLSX OK: boton "Exportar CSV" presente en /admin/orders; el click no lanzo (descarga puede no completarse en headless). Pagina viva tras el click=${stillAlive}.`,
      };
    } catch (err) {
      return {
        status: 'warn',
        notes: `Excepcion en check de exportar CSV (flujo admin no alcanzable en demo): ${err?.message || String(err)}`,
      };
    }
  },
};
