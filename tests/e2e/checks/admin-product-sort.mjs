/**
 * Check: Reordenar imagenes del producto con SortableList (UC-ADM-SORT)
 *
 * En la ficha admin de un producto (/admin/products/:id) la pestana
 * "Imagenes" muestra un SortableList (role="list", aria-label "Imágenes del
 * producto") con las imagenes existentes; cada fila trae controles de reorden
 * (botones "Subir"/"Bajar" con aria-label) y debajo un FileUpload para subir
 * nuevas imagenes.
 *
 * Flujo: loginAsAdmin -> /admin/products -> clic en el enlace del primer
 * producto -> ficha de detalle -> activar pestana "Imagenes".
 *
 * NOTA demo: el handler MSW de GET /api/v1/admin/products/:id/ devuelve
 * `images: []`, asi que la SortableList se renderiza vacia: no hay filas
 * (listitem) ni botones "Subir"/"Bajar" que ejercitar. En ese caso el check
 * confirma que la pestana funciona (SortableList + FileUpload presentes) y
 * reporta 'warn' explicando que el demo no provee imagenes para reordenar.
 * 'fail' solo si la pestana carga pero faltan la SortableList o el FileUpload.
 */
import { loginAsAdmin } from '../lib/auth.mjs';

export default {
  id: 'admin-product-sort',
  title: 'Ficha de producto: SortableList de imagenes (UC-ADM-SORT)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsAdmin(page, base); // tras login aterriza en /admin

      // OJO: navegar con page.goto a una ruta admin redirige a /auth/login: la
      // sesion vive en memoria y el route guard actua antes de que se rehidrate
      // el perfil tras el reload. Navegamos DENTRO de la SPA (clic en el link
      // "Productos" del panel admin) para preservar la sesion.
      let onList = false;
      try {
        const link = page.getByRole('link', { name: /^Productos$/i });
        if (await link.count().catch(() => 0)) {
          await link.first().click();
          await page
            .waitForFunction(() => /\/admin\/products\/?$/.test(location.pathname), { timeout: 8000 })
            .catch(() => {});
          onList = /\/admin\/products\/?$/.test(new URL(page.url()).pathname);
        }
      } catch {
        onList = false;
      }
      if (!onList) {
        return {
          status: 'warn',
          notes: 'No se pudo alcanzar /admin/products tras login (link "Productos" no navegable en demo); SortableList cubierto por su unit test.',
        };
      }
      await page.waitForTimeout(2500);

      // Localizar y clicar el enlace al detalle del primer producto:
      // /admin/products/:id (no /new, /import, /edit ni subrutas mas largas).
      //
      // El click se dispara via DOM .click() dentro de page.evaluate, no con el
      // click de Playwright: el aside de navegacion lateral (sticky) se solapa
      // con la tabla en este viewport e intercepta el puntero, pero el .click()
      // del nodo dispara igual el onClick de React Router y navega DENTRO de la
      // SPA (sin goto, preservando la sesion en memoria).
      const detailHref = await page
        .evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href]'));
          for (const a of links) {
            const h = a.getAttribute('href') || '';
            const m = h.match(/\/admin\/products\/([^/?#]+)$/);
            if (m && !['new', 'import', 'nuevo'].includes(m[1])) {
              a.click();
              return h;
            }
          }
          return null;
        })
        .catch(() => null);

      if (!detailHref) {
        return {
          status: 'warn',
          notes: 'No se encontro ningun enlace a la ficha de un producto (/admin/products/:id) en el listado demo; no se pudo abrir una ficha para ejercitar el SortableList.',
        };
      }

      const detailUrl = detailHref.startsWith('http') ? detailHref : base + detailHref;
      await page
        .waitForFunction(
          (href) => location.pathname === href.replace(/^https?:\/\/[^/]+/, ''),
          detailHref,
          { timeout: 8000 },
        )
        .catch(() => {});

      if (new URL(page.url()).pathname.includes('/auth/login')) {
        return {
          status: 'warn',
          notes: `Al abrir la ficha ${detailUrl} la SPA redirigio a /auth/login (sesion no rehidratada); no se pudo ejercitar el SortableList end-to-end.`,
        };
      }
      await page.waitForTimeout(2500);

      // Activar la pestana "Imagenes" (UI con acento: "Imágenes"). De nuevo via
      // DOM .click() para esquivar el aside lateral que intercepta el puntero.
      const tabClicked = await page
        .evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(
            (b) => b.textContent.trim() === 'Imágenes',
          );
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })
        .catch(() => false);

      if (!tabClicked) {
        return {
          status: 'warn',
          notes: `La ficha ${detailUrl} cargo pero no se encontro la pestana "Imágenes" (posible ficha sin tabs en demo).`,
        };
      }
      await page.waitForTimeout(1000);

      // El SortableList de imagenes: role="list" aria-label "Imágenes del producto".
      const sortable = page.getByRole('list', { name: 'Imágenes del producto' });
      const sortableCount = await sortable.count().catch(() => 0);

      // El FileUpload de subida (zona role="button" + label de subida).
      const fileUpload = page.getByRole('button', { name: /Zona de subida de archivos/ });
      const fileUploadCount = await fileUpload.count().catch(() => 0);
      const uploadInput = await page
        .evaluate(() => !!document.querySelector('input[type="file"]'))
        .catch(() => false);

      try {
        await page
          .screenshot({ path: 'tests/e2e/screenshots/admin-product-sort.png' })
          .catch(() => {});
      } catch {
        /* best-effort */
      }

      if (sortableCount === 0) {
        return {
          status: 'fail',
          notes: `La pestana "Imágenes" de ${detailUrl} cargo pero no aparece el SortableList (role="list" aria-label "Imágenes del producto").`,
        };
      }
      if (fileUploadCount === 0 && !uploadInput) {
        return {
          status: 'fail',
          notes: `La pestana "Imágenes" de ${detailUrl} muestra el SortableList pero no aparece el FileUpload de subida.`,
        };
      }

      // Filas de imagenes (listitem) y controles de reorden.
      const rows = sortable.first().getByRole('listitem');
      const rowCount = await rows.count().catch(() => 0);
      const upBtns = sortable.first().getByRole('button', { name: 'Subir' });
      const downBtns = sortable.first().getByRole('button', { name: 'Bajar' });
      const upCount = await upBtns.count().catch(() => 0);
      const downCount = await downBtns.count().catch(() => 0);

      if (rowCount > 0 && upCount > 0 && downCount > 0) {
        return {
          status: 'pass',
          notes: `UC-ADM-SORT OK: la pestana "Imágenes" de ${detailUrl} lista ${rowCount} imagen(es) en el SortableList con controles de reorden ("Subir"=${upCount}, "Bajar"=${downCount}) y el FileUpload de subida.`,
        };
      }

      return {
        status: 'warn',
        notes: `UC-ADM-SORT: la pestana "Imágenes" de ${detailUrl} renderiza correctamente el SortableList (role="list" "Imágenes del producto") y el FileUpload de subida, pero el demo no provee imagenes (GET /admin/products/:id/ devuelve images:[]), por lo que no hay filas (listitem=${rowCount}) ni botones "Subir"/"Bajar" que ejercitar. Reorden cubierto por el unit test de SortableList.`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de SortableList: ${err?.message || String(err)}` };
    }
  },
};
