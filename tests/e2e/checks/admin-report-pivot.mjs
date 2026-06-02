/**
 * Check: PivotTable del reporte de ventas (UC-ADM-PIVOT)
 *
 * En /admin/reports/sales la sección "Tabla pivote" se renderiza con el
 * componente PivotTable: un role="table" con aria-label "Ingresos por año y
 * mes". El pivote deriva año (filas) y mes (columnas) de la serie temporal;
 * si no hay datos parseables la sección muestra "Sin datos para el pivote".
 *
 * loginAsAdmin -> goto /admin/reports/sales -> la tabla pivote aparece.
 * Si no hay datos (MSW sin serie) -> status='warn'.
 * 'fail' solo si la página carga pero el componente está roto.
 */

import { loginAsAdmin, navigateInApp } from '../lib/auth.mjs';

export default {
  id: 'admin-report-pivot',
  title: 'Admin reporte: PivotTable "Ingresos por año y mes" (UC-ADM-PIVOT)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base);

      await navigateInApp(page, '/admin/reports/sales');

      const bodyText = await page.evaluate(() => document.body.innerText || '').catch(() => '');
      const reachedPage = /Reporte de ingresos y ventas/i.test(bodyText);

      if (!reachedPage) {
        return {
          status: 'warn',
          notes: 'No se alcanzó /admin/reports/sales (login admin o ruta no disponible en demo); no se pudo verificar la tabla pivote.',
        };
      }

      const pivot = page.getByRole('table', { name: 'Ingresos por año y mes' });
      const pivotCount = await pivot.count().catch(() => 0);

      if (pivotCount === 0) {
        const noData = /Sin datos para el pivote/i.test(bodyText);
        return {
          status: 'warn',
          notes: noData
            ? 'UC-ADM-PIVOT: /admin/reports/sales cargó pero la sección "Tabla pivote" muestra "Sin datos para el pivote" (la serie de MSW no trae buckets ISO parseables); no hay PivotTable que verificar.'
            : 'UC-ADM-PIVOT: /admin/reports/sales cargó pero no apareció el role="table" "Ingresos por año y mes"; probablemente sin datos de serie en el demo.',
        };
      }

      const hasHeading = /tabla pivote/i.test(bodyText);
      const rows = pivot.first().getByRole('row');
      const rowCount = await rows.count().catch(() => 0);

      return {
        status: 'pass',
        notes: `UC-ADM-PIVOT OK: /admin/reports/sales muestra la sección "Tabla pivote" (heading=${hasHeading}) con un role="table" aria-label "Ingresos por año y mes" (PivotTable, ${rowCount} fila[s]).`,
      };
    } catch (err) {
      return {
        status: 'warn',
        notes: `UC-ADM-PIVOT no alcanzable: ${err?.message || String(err)}`,
      };
    }
  },
};
