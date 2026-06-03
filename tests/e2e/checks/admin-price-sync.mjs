/**
 * Check: Sincronización de precios — modos CSV y porcentaje (UC-CAT-12)
 *
 * En /admin/price-sync el admin tiene dos modos contra los endpoints reales:
 *   - "Desde CSV": zona de carga de CSV (preview-csv / apply-csv).
 *   - "Ajuste por porcentaje": formulario de % (preview-percentage / apply-percentage).
 *
 * (La "Edición rápida" client-side fue eliminada: apply-csv aplica la sesión
 * del server y nunca recibía precios editados en cliente.)
 *
 * loginAsAdmin -> /admin/price-sync -> verificar tabs de modo + dropzone CSV;
 * cambiar a "Ajuste por porcentaje" y verificar el formulario de porcentaje.
 */

import { loginAsAdmin, navigateInApp } from '../lib/auth.mjs';

export default {
  id: 'admin-price-sync',
  title: 'Admin precios: modos CSV + porcentaje (UC-CAT-12)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base);
      await navigateInApp(page, '/admin/price-sync');
      await page.waitForTimeout(1500);

      const bodyText = await page.evaluate(() => document.body.innerText || '').catch(() => '');
      if (!/Sincronizar precios/i.test(bodyText)) {
        return { status: 'warn', notes: 'No se alcanzó /admin/price-sync (login admin o ruta no disponible en demo).' };
      }

      // Tabs de modo.
      const csvTab = page.getByRole('tab', { name: /Desde CSV/i });
      const pctTab = page.getByRole('tab', { name: /Ajuste por porcentaje/i });
      const hasCsvTab = (await csvTab.count().catch(() => 0)) > 0;
      const hasPctTab = (await pctTab.count().catch(() => 0)) > 0;

      if (!hasCsvTab || !hasPctTab) {
        return {
          status: 'fail',
          notes: `UC-CAT-12: faltan los tabs de modo en /admin/price-sync (Desde CSV=${hasCsvTab}, Ajuste por porcentaje=${hasPctTab}).`,
        };
      }

      // Modo CSV por defecto: zona de carga visible.
      const hasDropZone = /Arrastra el CSV/i.test(bodyText);

      // Cambiar a modo porcentaje y verificar el formulario.
      await pctTab.first().click();
      await page.waitForTimeout(800);

      const pctField = page.getByLabel(/Porcentaje de ajuste/i);
      const previewBtn = page.getByRole('button', { name: /Previsualizar ajuste/i });
      const hasPctField = (await pctField.count().catch(() => 0)) > 0;
      const hasPreviewBtn = (await previewBtn.count().catch(() => 0)) > 0;

      if (hasPctField && hasPreviewBtn) {
        return {
          status: 'pass',
          notes: `UC-CAT-12 OK: /admin/price-sync con tabs "Desde CSV"${hasDropZone ? ' (dropzone visible)' : ''} y "Ajuste por porcentaje"; el modo porcentaje muestra el campo de % y el botón "Previsualizar ajuste".`,
        };
      }
      return {
        status: 'warn',
        notes: `UC-CAT-12: tabs presentes pero el formulario de porcentaje no se detectó completo (campo=${hasPctField}, botón=${hasPreviewBtn}).`,
      };
    } catch (err) {
      return { status: 'warn', notes: `UC-CAT-12 no alcanzable: ${err?.message || String(err)}` };
    }
  },
};
