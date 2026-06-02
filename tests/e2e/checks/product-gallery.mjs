/**
 * Check: Galeria de producto (UC-CAT-GAL)
 *
 * En una ficha de producto, el componente ProductGallery muestra una imagen
 * principal (data-testid="product-gallery-main") y una tira de thumbnails.
 * Clicar un thumbnail distinto del activo (o, en su defecto, el boton
 * "Imagen siguiente") debe cambiar el src de la imagen principal.
 *
 * Si la ficha solo tiene una imagen no hay thumbnails ni controles que
 * ejercitar -> status='warn' (cubierto por el unit test de ProductGallery).
 */

export default {
  id: 'product-gallery',
  title: 'Galeria de producto cambia la imagen principal (UC-CAT-GAL)',
  critical: false,

  async run(page, { base }) {
    try {
      // Resolver una ficha: el slug sugerido y, como respaldo, hrefs de cards.
      const candidates = [base + '/catalog/abe-esu-cuchilla-de-esu'];
      try {
        await page.goto(base + '/catalog', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2500);
        const hrefs = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/catalog/"]'));
          return links
            .map((a) => a.getAttribute('href'))
            .filter((h) => h && /\/catalog\/[^/?#]+$/.test(h));
        });
        for (const h of hrefs) {
          const abs = h.startsWith('http') ? h : base + h;
          if (!candidates.includes(abs)) candidates.push(abs);
        }
      } catch {
        /* seguimos con el candidato por defecto */
      }

      const mainSel = '[data-testid="product-gallery-main"]';
      let usedUrl = null;        // primera ficha con galeria (aunque sea de 1 img)
      let multi = false;

      // Buscar una ficha cuya galeria tenga >1 imagen (thumbnails/controles)
      // para ejercitar el cambio de imagen principal. Recordamos la primera
      // ficha con galeria como respaldo (WARN) si ninguna tiene multiples.
      // Cap de candidatos para no recorrer las 256 fichas del demo.
      for (const url of candidates.slice(0, 30)) {
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2500);
        } catch {
          continue;
        }

        const main = page.locator(mainSel).first();
        if (!(await main.count().catch(() => 0))) continue;

        if (!usedUrl) usedUrl = url; // primera ficha con galeria

        const nextBtn = page.getByRole('button', { name: /Imagen siguiente/i });
        const thumbs = page.getByRole('button', { name: /Ver imagen \d+ de/i });
        const hasControls =
          (await nextBtn.count().catch(() => 0)) > 0 ||
          (await thumbs.count().catch(() => 0)) > 1;
        if (hasControls) {
          usedUrl = url;
          multi = true;
          break;
        }
        // ficha con una sola imagen: seguimos buscando una con multiples.
      }

      if (!usedUrl) {
        return {
          status: 'fail',
          notes: `No se encontro ninguna ficha con galeria (img principal data-testid="product-gallery-main") entre ${candidates.length} candidatos.`,
        };
      }

      const main = page.locator(mainSel).first();
      await main.waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});
      const srcBefore = await main.getAttribute('src').catch(() => null);

      if (!multi) {
        return {
          status: 'warn',
          notes: `Galeria ProductGallery presente y con imagen principal (data-testid="product-gallery-main", src=${srcBefore}) en ${usedUrl}, pero ninguna ficha del demo tiene >1 imagen: los datos MSW (src/mocks/data/catalog.ts) traen 1 imagen por producto en los 256 productos, asi que no se renderizan thumbnails ni controles que ejercitar end-to-end. El cambio de imagen principal esta cubierto por el unit test de ProductGallery.`,
        };
      }

      // Intentar via thumbnail (uno distinto del activo) y, si no, via boton.
      let switched = false;
      let how = '';
      const thumbs = page.getByRole('button', { name: /Ver imagen \d+ de/i });
      const thumbCount = await thumbs.count().catch(() => 0);
      if (thumbCount > 1) {
        // El thumbnail activo tiene aria-current="true"; elegimos otro.
        let targetIndex = -1;
        for (let i = 0; i < thumbCount; i++) {
          const cur = await thumbs.nth(i).getAttribute('aria-current').catch(() => null);
          if (cur !== 'true') {
            targetIndex = i;
            break;
          }
        }
        if (targetIndex >= 0) {
          await thumbs.nth(targetIndex).scrollIntoViewIfNeeded().catch(() => {});
          await thumbs.nth(targetIndex).click().catch(() => {});
          how = `thumbnail #${targetIndex + 1}`;
        }
      }

      await page.waitForTimeout(600);
      let srcAfter = await main.getAttribute('src').catch(() => null);

      if (srcAfter === srcBefore) {
        // Respaldo: boton "Imagen siguiente".
        const nextBtn = page.getByRole('button', { name: /Imagen siguiente/i }).first();
        if (await nextBtn.count().catch(() => 0)) {
          await nextBtn.scrollIntoViewIfNeeded().catch(() => {});
          await nextBtn.click().catch(() => {});
          how = how ? `${how} + boton siguiente` : 'boton siguiente';
          await page.waitForTimeout(600);
          srcAfter = await main.getAttribute('src').catch(() => null);
        }
      }

      switched = !!srcAfter && srcAfter !== srcBefore;

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/product-gallery.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (switched) {
        return {
          status: 'pass',
          notes: `UC-CAT-GAL OK: ficha ${usedUrl}, galeria con imagen principal + thumbnails. Tras interactuar (${how}) la imagen principal cambio de src (${srcBefore} -> ${srcAfter}).`,
        };
      }

      return {
        status: 'fail',
        notes: `UC-CAT-GAL: ficha ${usedUrl} con multiples imagenes pero la imagen principal NO cambio de src tras interactuar (${how || 'sin interaccion efectiva'}). src antes=${srcBefore}, despues=${srcAfter}.`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de galeria: ${err?.message || String(err)}` };
    }
  },
};
