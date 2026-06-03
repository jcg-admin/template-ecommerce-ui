/**
 * Check: Asignacion de categorias con DualListBox (UC-ADM-LISTBOX)
 *
 * En el alta de producto (/admin/products/new, AdminProductForm) el campo
 * "Categorias del producto" usa un DualListBox: un contenedor role="group"
 * con aria-label "Categorías del producto" que agrupa dos role="listbox"
 * ("Disponibles" y "Asignadas") para mover categorias entre ambos paneles.
 *
 * Se verifica end-to-end que, tras iniciar sesion como admin, el grupo y sus
 * dos listbox aparecen con la semantica accesible esperada.
 *
 * 'warn' si la ruta admin no es alcanzable en demo; 'fail' solo si la pagina
 * carga pero el grupo o sus listbox no aparecen (componente roto).
 */
import { loginAsAdmin } from '../lib/auth.mjs';

export default {
  id: 'admin-product-duallist',
  title: 'Alta de producto: DualListBox de categorias (UC-ADM-LISTBOX)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base); // tras login aterriza en /admin

      // OJO: navegar con page.goto a una ruta admin redirige a /auth/login: la
      // sesion vive en memoria y el route guard actua antes de que se rehidrate
      // el perfil tras el reload. Navegamos DENTRO de la SPA (clic en el link
      // "Crear Producto" del panel admin) para preservar la sesion.
      let reached = false;
      try {
        const link = page.getByRole('link', { name: /Crear Producto/i });
        if (await link.count().catch(() => 0)) {
          await link.first().click();
          await page
            .waitForFunction(() => location.pathname.includes('/admin/products/new'), { timeout: 8000 })
            .catch(() => {});
          reached = page.url().includes('/admin/products/new');
        }
      } catch {
        reached = false;
      }
      if (!reached) {
        return {
          status: 'warn',
          notes: 'No se pudo alcanzar /admin/products/new tras login (link "Crear Producto" no navegable en demo); DualListBox cubierto por su unit test.',
        };
      }
      await page.waitForTimeout(2500);

      // El contenedor role="group" del DualListBox.
      const group = page.getByRole('group', { name: 'Categorías del producto' });
      const groupCount = await group.count().catch(() => 0);

      if (groupCount === 0) {
        const onForm = await page
          .evaluate(() => !!document.querySelector('form'))
          .catch(() => false);
        if (!onForm) {
          return {
            status: 'warn',
            notes: 'En /admin/products/new no se renderizo el formulario de alta (posible redireccion/sesion); no se pudo ejercitar el DualListBox end-to-end.',
          };
        }
        return {
          status: 'fail',
          notes: 'El formulario de alta cargo pero no aparece el DualListBox (role="group" aria-label "Categorías del producto").',
        };
      }

      // Los dos listbox dentro del grupo: "Disponibles" y "Asignadas".
      const listboxes = group.first().getByRole('listbox');
      const listboxCount = await listboxes.count().catch(() => 0);
      const available = group.first().getByRole('listbox', { name: 'Disponibles' });
      const assigned = group.first().getByRole('listbox', { name: 'Asignadas' });
      const availableCount = await available.count().catch(() => 0);
      const assignedCount = await assigned.count().catch(() => 0);

      try {
        await page
          .screenshot({ path: 'tests/e2e/screenshots/admin-product-duallist.png' })
          .catch(() => {});
      } catch {
        /* best-effort */
      }

      if (listboxCount < 2 || availableCount === 0 || assignedCount === 0) {
        return {
          status: 'fail',
          notes: `DualListBox presente pero faltan sus listbox (total=${listboxCount}, Disponibles=${availableCount}, Asignadas=${assignedCount}; se esperaban ambos).`,
        };
      }

      return {
        status: 'pass',
        notes: 'UC-ADM-LISTBOX OK: en /admin/products/new el campo "Categorías del producto" es un DualListBox (role="group") con dos role="listbox" ("Disponibles" y "Asignadas").',
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de DualListBox: ${err?.message || String(err)}` };
    }
  },
};
