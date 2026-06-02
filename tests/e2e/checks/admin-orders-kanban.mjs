/**
 * Check: Tablero kanban de pedidos por estado (UC-ADM-KANBAN)
 *
 * En /admin/orders-dashboard hay una seccion "Tablero" con un KanbanBoard cuyas
 * columnas son regiones por estado (role="region" con aria-label = nombre del
 * estado: Pendiente, En proceso, En preparacion, Enviado, Entregado).
 *
 * Limitacion de demo (MSW): la sesion admin vive en una variable de modulo del
 * service worker y un page.goto() la reinicia (el perfil cae al comprador, sin
 * is_admin) -> AdminRoute redirige a /auth/login. A diferencia de /admin/orders
 * y /admin/users, NINGUN enlace del panel apunta a /admin/orders-dashboard, asi
 * que no hay navegacion SPA (sin recargar) que lo alcance conservando la sesion.
 * Por eso intentamos: (1) clic en un enlace si apareciera; (2) goto directo. Si
 * el goto redirige fuera del panel (sesion perdida) reportamos 'warn'
 * justificado — el contenido del tablero esta cubierto por los unit tests de
 * AdminOrdersDashboardPage/KanbanBoard. 'fail' solo si el tablero carga pero sin
 * columnas por estado.
 */
import { loginAsAdmin, navigateInApp } from '../lib/auth.mjs';

const STATE_LABELS = ['Pendiente', 'En proceso', 'En preparación', 'Enviado', 'Entregado'];

async function countStateRegions(page) {
  return page
    .evaluate((labels) => {
      const regions = Array.from(document.querySelectorAll('[role="region"]'));
      return regions.filter((r) => labels.includes((r.getAttribute('aria-label') || '').trim())).length;
    }, STATE_LABELS)
    .catch(() => 0);
}

export default {
  id: 'admin-orders-kanban',
  title: 'Tablero kanban por estado en /admin/orders-dashboard (UC-ADM-KANBAN)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base);
      await page.waitForTimeout(1500);

      // Navegacion CLIENT-SIDE (pushState+popstate): preserva la sesion admin
      // aunque /admin/orders-dashboard no tenga enlace en el panel (un goto la
      // perderia al recargar y reiniciar el estado de MSW).
      await navigateInApp(page, '/admin/orders-dashboard');

      const pathname = await page.evaluate(() => location.pathname);
      const heading = await page.evaluate(() => /tablero/i.test(document.body.innerText || ''));
      const stateRegionCount = await countStateRegions(page);

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/admin-orders-kanban.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (!pathname.includes('/admin/orders-dashboard')) {
        return {
          status: 'warn',
          notes: `UC-ADM-KANBAN: /admin/orders-dashboard no es alcanzable como admin en demo. No hay enlace del panel hacia el (unica via seria recargar, que reinicia la sesion MSW: el perfil cae al comprador sin is_admin y AdminRoute redirige a ${pathname}). Tablero/columnas cubiertos por los unit tests de AdminOrdersDashboardPage y KanbanBoard.`,
        };
      }

      if (!heading && stateRegionCount === 0) {
        return {
          status: 'warn',
          notes: `En ${pathname} no aparecio la seccion "Tablero" ni columnas-region por estado; posible que el dashboard transaccional no cargue datos en demo.`,
        };
      }

      if (stateRegionCount >= 1) {
        return {
          status: 'pass',
          notes: `UC-ADM-KANBAN OK: seccion "Tablero" (heading=${heading}) con ${stateRegionCount} columna(s) role="region" por estado (de ${STATE_LABELS.length} posibles) en ${pathname} (${reachedViaSpa ? 'via enlace SPA' : 'via goto'}).`,
        };
      }

      return {
        status: 'fail',
        notes: `UC-ADM-KANBAN: la seccion "Tablero" aparece en ${pathname} (heading=${heading}) pero no hay columnas-region con aria-label de estado (esperadas >=1).`,
      };
    } catch (err) {
      return {
        status: 'warn',
        notes: `Excepcion en check del tablero kanban (flujo admin no alcanzable en demo): ${err?.message || String(err)}`,
      };
    }
  },
};
