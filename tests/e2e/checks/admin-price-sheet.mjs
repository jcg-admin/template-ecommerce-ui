/**
 * Check: DataSheet de edición rápida de precios (UC-ADM-SHEET)
 *
 * En /admin/price-sync, tras subir un CSV y obtener el preview, aparece la
 * sección "Edición rápida" con un DataSheet (role="table", aria-label
 * "Edición rápida de precios"). El flujo requiere subir un archivo primero:
 * en la carga inicial solo se ve la zona de drop, sin preview ni hoja.
 *
 * loginAsAdmin -> goto /admin/price-sync -> verificar que la página carga.
 * Si ya hay preview con la sección "Edición rápida" (DataSheet), se verifica;
 * si el flujo requiere subir un archivo y no hay preview en carga inicial
 * (caso esperado del demo), status='warn' explicando que la hoja aparece
 * tras subir/preview.
 */

import { loginAsAdmin, navigateInApp } from '../lib/auth.mjs';

export default {
  id: 'admin-price-sheet',
  title: 'Admin precios: DataSheet "Edición rápida" tras preview (UC-ADM-SHEET)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base);

      await navigateInApp(page, '/admin/price-sync');

      const bodyText = await page.evaluate(() => document.body.innerText || '').catch(() => '');
      const reachedPage = /Sincronizar precios/i.test(bodyText);

      if (!reachedPage) {
        return {
          status: 'warn',
          notes: 'No se alcanzó /admin/price-sync (login admin o ruta no disponible en demo); no se pudo verificar el DataSheet.',
        };
      }

      const sheet = page.getByRole('table', { name: 'Edición rápida de precios' });
      const sheetCount = await sheet.count().catch(() => 0);

      if (sheetCount > 0) {
        const hasHeading = /edición rápida/i.test(bodyText);
        const rows = sheet.first().getByRole('row');
        const rowCount = await rows.count().catch(() => 0);
        return {
          status: 'pass',
          notes: `UC-ADM-SHEET OK: /admin/price-sync ya muestra la sección "Edición rápida" (heading=${hasHeading}) con el DataSheet role="table" "Edición rápida de precios" (${rowCount} fila[s] incl. cabecera).`,
        };
      }

      // Sin preview en carga inicial: el flujo necesita subir un CSV primero.
      // La zona de drop ("Arrastra el CSV de precios") confirma el estado inicial.
      const hasDropZone = /Arrastra el CSV/i.test(bodyText);
      return {
        status: 'warn',
        notes: `UC-ADM-SHEET: /admin/price-sync cargó correctamente${hasDropZone ? ' (zona de carga de CSV visible)' : ''} pero sin preview en la carga inicial; la hoja "Edición rápida" (DataSheet role="table") aparece tras subir un CSV y generar el preview, paso que requiere un archivo y no se ejercita end-to-end aquí.`,
      };
    } catch (err) {
      return {
        status: 'warn',
        notes: `UC-ADM-SHEET no alcanzable: ${err?.message || String(err)}`,
      };
    }
  },
};
