/**
 * Check: Toggle de vista del catalogo (UC-CAT-LIST)
 *
 * En /catalog existe un ViewToggle (role="group", aria-label "Vista del
 * catalogo") con dos botones. Pulsar "Vista de lista" debe:
 *   - actualizar la URL a ?view=list
 *   - dejar ese boton con aria-pressed="true"
 *
 * (grid es el default y no ensucia la URL: por eso solo verificamos list.)
 */

export default {
  id: 'catalog-list-toggle',
  title: 'Toggle de vista del catalogo -> ?view=list (UC-CAT-LIST)',
  critical: false,

  async run(page, { base }) {
    try {
      await page.goto(base + '/catalog', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      const group = page.getByRole('group', { name: 'Vista del catálogo' });
      if (!(await group.count().catch(() => 0))) {
        return {
          status: 'fail',
          notes: 'No se encontro el ViewToggle (role="group" aria-label "Vista del catálogo") en /catalog.',
        };
      }

      const listBtn = group.getByRole('button', { name: 'Vista de lista' }).first();
      if (!(await listBtn.count().catch(() => 0))) {
        return {
          status: 'fail',
          notes: 'El grupo "Vista del catálogo" existe pero no tiene un boton "Vista de lista".',
        };
      }

      const pressedBefore = await listBtn.getAttribute('aria-pressed').catch(() => null);

      await listBtn.scrollIntoViewIfNeeded().catch(() => {});
      await listBtn.click();

      // Esperar a que la URL refleje ?view=list.
      let urlOk = false;
      try {
        await page.waitForFunction(
          () => new URLSearchParams(location.search).get('view') === 'list',
          undefined,
          { timeout: 6000 }
        );
        urlOk = true;
      } catch {
        urlOk = false;
      }
      await page.waitForTimeout(400);

      const finalUrl = page.url();
      const pressedAfter = await listBtn.getAttribute('aria-pressed').catch(() => null);
      const ariaOk = pressedAfter === 'true';

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/catalog-list-toggle.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (urlOk && ariaOk) {
        return {
          status: 'pass',
          notes: `UC-CAT-LIST OK: clic en "Vista de lista" llevo la URL a ?view=list (${finalUrl}) y el boton quedo aria-pressed="true" (antes ${pressedBefore}).`,
        };
      }

      return {
        status: 'fail',
        notes: `UC-CAT-LIST: tras clicar "Vista de lista": URL view=list ${urlOk ? 'OK' : 'NO'} (${finalUrl}); aria-pressed=${pressedAfter} (esperado "true").`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de view toggle: ${err?.message || String(err)}` };
    }
  },
};
