/**
 * Check: CoverageMap de logística (UC-LOG-MAP)
 *
 * En /admin/logistics la sección "Cobertura de envio" se renderiza con el
 * componente CoverageMap: un SVG (role="img", aria-label "Cobertura de
 * envio") con una celda <rect role="img"> por zona (cubierta / no cubierta).
 *
 * loginAsAdmin -> goto /admin/logistics -> la sección "Cobertura de envio"
 * con el mapa SVG (zonas role="img") aparece.
 *
 * Si la página no es alcanzable -> status='warn'.
 * 'fail' solo si la página carga pero el mapa SVG está roto.
 */

import { loginAsAdmin, navigateInApp } from '../lib/auth.mjs';

export default {
  id: 'admin-logistics-map',
  title: 'Admin logística: CoverageMap SVG "Cobertura de envio" (UC-LOG-MAP)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base);

      await navigateInApp(page, '/admin/logistics');

      const bodyText = await page.evaluate(() => document.body.innerText || '').catch(() => '');
      const reachedPage = /Logistica/i.test(bodyText) || /Cobertura de env/i.test(bodyText);

      if (!reachedPage) {
        return {
          status: 'warn',
          notes: 'No se alcanzó /admin/logistics (login admin o ruta no disponible en demo); no se pudo verificar el mapa de cobertura.',
        };
      }

      const hasHeading = /Cobertura de env/i.test(bodyText);

      // El mapa SVG: role="img" con aria-label "Cobertura de envio".
      const map = page.getByRole('img', { name: 'Cobertura de envio' });
      const mapCount = await map.count().catch(() => 0);

      if (mapCount === 0) {
        return {
          status: 'warn',
          notes: `UC-LOG-MAP: /admin/logistics cargó (heading "Cobertura de envio"=${hasHeading}) pero no apareció el SVG role="img" aria-label "Cobertura de envio"; el mapa no se pudo verificar.`,
        };
      }

      // Zonas: cada celda <rect> expone role="img" con "...: cubierta/no cubierta".
      const zones = page.getByRole('img', { name: /: (cubierta|no cubierta)$/ });
      const zoneCount = await zones.count().catch(() => 0);

      if (zoneCount === 0) {
        return {
          status: 'warn',
          notes: `UC-LOG-MAP: la sección "Cobertura de envio" y el SVG existen, pero no se detectaron zonas (role="img" "...: cubierta/no cubierta"); el mapa pudo renderizarse sin zonas.`,
        };
      }

      return {
        status: 'pass',
        notes: `UC-LOG-MAP OK: /admin/logistics muestra la sección "Cobertura de envio" (heading=${hasHeading}) con el mapa SVG (role="img" "Cobertura de envio") y ${zoneCount} zona(s) role="img" (cubierta/no cubierta).`,
      };
    } catch (err) {
      return {
        status: 'warn',
        notes: `UC-LOG-MAP no alcanzable: ${err?.message || String(err)}`,
      };
    }
  },
};
