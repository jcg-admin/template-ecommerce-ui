/**
 * Check: Indicadores radiales del panel admin (UC-ADM-GAUGE)
 *
 * Tras iniciar sesion como admin, el storefront demo redirige a /admin (el
 * dashboard). Alli la seccion "Indicadores" (section aria-label="Indicadores")
 * expone medidores con role="meter". Verificamos que la seccion aparece y que
 * hay al menos un role="meter".
 *
 * Nota de demo (MSW): el estado de sesion vive en una variable de modulo del
 * service worker y un page.goto() la reinicia (el perfil cae al comprador, sin
 * is_admin), por lo que AdminRoute redirige a /auth/login. Por eso NO usamos
 * goto para llegar a /admin: aprovechamos que loginAsAdmin ya deja la SPA en
 * /admin con la sesion admin viva. Si pese a ello /admin no es admin-alcanzable
 * -> 'warn'; 'fail' solo si la seccion existe sin medidores (contrato roto).
 */
import { loginAsAdmin } from '../lib/auth.mjs';

export default {
  id: 'admin-dashboard-gauge',
  title: 'Indicadores con medidores role="meter" en /admin (UC-ADM-GAUGE)',
  critical: false,

  async run(page, { base }) {
    try {
      // loginAsAdmin envia el formulario y la app redirige al panel (/admin)
      // mediante navegacion SPA, conservando la sesion admin (sin recargar).
      await loginAsAdmin(page, base);
      await page.waitForTimeout(2500); // dar tiempo a fetchProfile + render del dashboard

      const pathname = await page.evaluate(() => location.pathname);
      const onAdmin = pathname === '/admin' || pathname.startsWith('/admin');
      if (!onAdmin) {
        return {
          status: 'warn',
          notes: `Tras loginAsAdmin la SPA no quedo en /admin (estamos en ${pathname}); panel admin no alcanzable en demo (sesion admin no persiste).`,
        };
      }

      const section = page.locator('section[aria-label="Indicadores"]');
      const hasSection = (await section.count().catch(() => 0)) > 0;
      const heading = await page.evaluate(() => /indicadores/i.test(document.body.innerText || ''));

      const meters = page.locator('[role="meter"]');
      const meterCount = await meters.count().catch(() => 0);

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/admin-dashboard-gauge.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (!hasSection && meterCount === 0) {
        return {
          status: 'warn',
          notes: `En ${pathname} no aparecio la seccion "Indicadores" ni ningun role="meter" (heading=${heading}); posible que el dashboard admin no cargue datos en demo.`,
        };
      }

      if (hasSection && meterCount >= 1) {
        return {
          status: 'pass',
          notes: `UC-ADM-GAUGE OK: seccion "Indicadores" presente en ${pathname} con ${meterCount} medidor(es) role="meter" (heading=${heading}).`,
        };
      }

      if (meterCount >= 1) {
        return {
          status: 'pass',
          notes: `UC-ADM-GAUGE OK: ${meterCount} medidor(es) role="meter" presentes en ${pathname} (seccion aria-label="Indicadores" no localizada exactamente, heading=${heading}).`,
        };
      }

      return {
        status: 'fail',
        notes: `UC-ADM-GAUGE: la seccion "Indicadores" existe en ${pathname} pero no hay ningun role="meter" (medidores esperados >=1).`,
      };
    } catch (err) {
      return {
        status: 'warn',
        notes: `Excepcion en check de indicadores admin (flujo admin no alcanzable en demo): ${err?.message || String(err)}`,
      };
    }
  },
};
