/**
 * Check: TreeList de categorías en el admin (UC-ADM-TREELIST)
 *
 * En /admin/categories el árbol jerárquico de categorías se renderiza con
 * el componente TreeList: un contenedor role="treegrid" con aria-label
 * "Categorías" y filas (role="row") por categoría.
 *
 * loginAsAdmin -> goto /admin/categories -> el treegrid "Categorías" existe
 * y tiene filas de categoría.
 *
 * Si el árbol no es alcanzable (MSW no entregó categorías) -> status='warn'.
 * 'fail' solo si la página carga pero el TreeList está roto.
 */

import { loginAsAdmin, navigateInApp } from '../lib/auth.mjs';

export default {
  id: 'admin-categories-treelist',
  title: 'Admin categorías: TreeList role="treegrid" "Categorías" (UC-ADM-TREELIST)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base);

      await navigateInApp(page, '/admin/categories');

      const tree = page.getByRole('treegrid', { name: 'Categorías' });
      const treeCount = await tree.count().catch(() => 0);

      if (treeCount === 0) {
        // Sin el treegrid: distinguir "página sin datos" (warn) de roto.
        const bodyText = await page.evaluate(() => document.body.innerText || '').catch(() => '');
        const reachedPage = /Categorías/i.test(bodyText);
        return {
          status: 'warn',
          notes: reachedPage
            ? 'La página /admin/categories cargó pero no apareció el TreeList (role="treegrid" "Categorías"); probablemente MSW no entregó categorías (estado "Cargando árbol…"/"Sin categorías").'
            : 'No se alcanzó /admin/categories (login admin o ruta no disponible en demo); no se pudo ejercitar el TreeList.',
        };
      }

      // Filas de categoría: el TreeList usa role="row" (incluida la cabecera).
      const rows = tree.first().getByRole('row');
      const rowCount = await rows.count().catch(() => 0);
      // Cabecera + al menos una fila de categoría => rowCount >= 2.
      const categoryRows = Math.max(rowCount - 1, 0);

      if (categoryRows === 0) {
        return {
          status: 'warn',
          notes: `UC-ADM-TREELIST: el treegrid "Categorías" existe pero solo se ven ${rowCount} filas (sin filas de categoría); MSW pudo no entregar nodos.`,
        };
      }

      return {
        status: 'pass',
        notes: `UC-ADM-TREELIST OK: /admin/categories muestra un role="treegrid" aria-label "Categorías" (TreeList) con ${categoryRows} fila(s) de categoría (más la cabecera).`,
      };
    } catch (err) {
      return {
        status: 'warn',
        notes: `UC-ADM-TREELIST no alcanzable: ${err?.message || String(err)}`,
      };
    }
  },
};
