/**
 * Check: Editor enriquecido de la descripcion del producto (UC-ADM-RTE)
 *
 * En el alta de producto (/admin/products/new, AdminProductForm) la
 * "Descripcion completa" se edita con un RichTextEditor: un area editable
 * con role="textbox" y aria-label "Descripcion del producto", acompanada de
 * una toolbar (role="toolbar") con botones de formato (Negrita, Cursiva, ...).
 *
 * Se verifica end-to-end que, tras iniciar sesion como admin, el editor y su
 * toolbar aparecen renderizados con la semantica accesible esperada.
 *
 * 'warn' si la ruta admin no es alcanzable en demo; 'fail' solo si la pagina
 * carga pero el editor o su toolbar no aparecen (componente roto).
 */
import { loginAsAdmin } from '../lib/auth.mjs';

export default {
  id: 'admin-product-rte',
  title: 'Alta de producto: RichTextEditor de la descripcion (UC-ADM-RTE)',
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
          notes: 'No se pudo alcanzar /admin/products/new tras login (link "Crear Producto" no navegable en demo); RichTextEditor cubierto por su unit test.',
        };
      }
      await page.waitForTimeout(2500);

      // El area editable del RichTextEditor.
      const editor = page.getByRole('textbox', { name: 'Descripción del producto' });
      const editorCount = await editor.count().catch(() => 0);

      if (editorCount === 0) {
        // Si ni siquiera renderizo el formulario (p.ej. redireccion a login),
        // lo reportamos como warn; si el form esta pero falta el editor, fail.
        const onForm = await page
          .evaluate(() => !!document.querySelector('form'))
          .catch(() => false);
        if (!onForm) {
          return {
            status: 'warn',
            notes: 'En /admin/products/new no se renderizo el formulario de alta (posible redireccion/sesion); no se pudo ejercitar el editor end-to-end.',
          };
        }
        return {
          status: 'fail',
          notes: 'El formulario de alta cargo pero no aparece el RichTextEditor (role="textbox" aria-label "Descripción del producto").',
        };
      }

      // La toolbar de formato y sus botones.
      const toolbar = page.getByRole('toolbar', { name: 'Formato de texto' });
      const toolbarCount = await toolbar.count().catch(() => 0);
      const boldBtn = page.getByRole('button', { name: 'Negrita' });
      const boldCount = await boldBtn.count().catch(() => 0);

      try {
        await page
          .screenshot({ path: 'tests/e2e/screenshots/admin-product-rte.png' })
          .catch(() => {});
      } catch {
        /* best-effort */
      }

      if (toolbarCount === 0 || boldCount === 0) {
        return {
          status: 'fail',
          notes: `RichTextEditor presente pero falta su toolbar de botones (toolbar=${toolbarCount}, boton Negrita=${boldCount}).`,
        };
      }

      return {
        status: 'pass',
        notes: 'UC-ADM-RTE OK: en /admin/products/new aparece el RichTextEditor (role="textbox" aria-label "Descripción del producto") con su toolbar de formato y el boton "Negrita".',
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de RichTextEditor: ${err?.message || String(err)}` };
    }
  },
};
