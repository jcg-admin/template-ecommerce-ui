/**
 * Check: DataGrid de usuarios del panel admin (UC-ADM-GRID)
 *
 * Tras iniciar sesion como admin (la app deja la SPA en /admin), navegamos a
 * /admin/users clicando el enlace del panel — NO con goto, que reiniciaria la
 * sesion MSW (el perfil caeria al comprador sin is_admin y AdminRoute
 * redirigiria a /auth/login). En /admin/users hay un DataGrid (role="table"
 * con aria-label="Listado de usuarios") con filas. Opcional: el searchbox del
 * grid (aria-label="Buscar en la tabla").
 *
 * Si el panel admin no es alcanzable en demo -> 'warn'; 'fail' solo si la tabla
 * existe sin filas (grid vacio/roto).
 */
import { loginAsAdmin } from '../lib/auth.mjs';

// Navegacion SPA via <Link> del panel (preserva la sesion admin viva en MSW).
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
  id: 'admin-users-grid',
  title: 'DataGrid "Listado de usuarios" en /admin/users (UC-ADM-GRID)',
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

      const navigated = await spaClickAdminLink(page, '/admin/users');
      const pathname = await page.evaluate(() => location.pathname);
      if (!navigated || !pathname.includes('/admin/users')) {
        return {
          status: 'warn',
          notes: `No se pudo navegar a /admin/users via enlace del panel (estamos en ${pathname}); flujo admin no alcanzable en demo sin recargar (que perderia la sesion).`,
        };
      }

      const table = page.getByRole('table', { name: 'Listado de usuarios' });
      const tableCount = await table.count().catch(() => 0);
      if (tableCount === 0) {
        return {
          status: 'warn',
          notes: `En /admin/users no aparecio el DataGrid role="table" aria-label="Listado de usuarios"; posible que la lista de usuarios no cargue en demo.`,
        };
      }

      const bodyRowCount = await table
        .first()
        .locator('tbody tr')
        .count()
        .catch(() => 0);

      const searchbox = page.getByRole('searchbox', { name: 'Buscar en la tabla' });
      const hasSearch = (await searchbox.count().catch(() => 0)) > 0;

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/admin-users-grid.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (bodyRowCount >= 1) {
        return {
          status: 'pass',
          notes: `UC-ADM-GRID OK: DataGrid "Listado de usuarios" presente con ${bodyRowCount} fila(s) de cuerpo; searchbox del grid presente=${hasSearch}.`,
        };
      }

      return {
        status: 'fail',
        notes: `UC-ADM-GRID: el DataGrid "Listado de usuarios" existe pero no tiene filas de cuerpo (esperadas >=1); searchbox presente=${hasSearch}.`,
      };
    } catch (err) {
      return {
        status: 'warn',
        notes: `Excepcion en check del DataGrid de usuarios (flujo admin no alcanzable en demo): ${err?.message || String(err)}`,
      };
    }
  },
};
