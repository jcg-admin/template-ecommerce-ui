/**
 * Check: Barra de envio gratis en el carrito (UC-CHT-FREESHIP)
 *
 * Se agrega un producto a la bolsa desde una ficha con stock ("Agregar a la
 * bolsa", que navega a /cart) y en /cart se verifica el FreeShippingBar:
 *   - un mensaje de envio gratis ("Te faltan ..." o "envio gratis")
 *   - una barra de progreso accesible (role="progressbar")
 */

export default {
  id: 'cart-freeship',
  title: 'Carrito muestra barra de envio gratis (UC-CHT-FREESHIP)',
  critical: false,

  async run(page, { base }) {
    try {
      // Resolver una ficha con stock: el slug sugerido + hrefs de cards.
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

      const addRe = /Agregar a la bolsa/i;
      let usedUrl = null;
      let clicked = false;

      for (const url of candidates) {
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2500);
        } catch {
          continue;
        }
        const addBtn = page.getByRole('button', { name: addRe }).first();
        try {
          await addBtn.waitFor({ state: 'visible', timeout: 6000 });
        } catch {
          continue;
        }
        if (await addBtn.isEnabled().catch(() => false)) {
          await addBtn.scrollIntoViewIfNeeded().catch(() => {});
          await addBtn.click();
          usedUrl = url;
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        return {
          status: 'fail',
          notes: `No se encontro ninguna ficha con "Agregar a la bolsa" habilitado entre ${candidates.length} candidatos; no se puede llegar a /cart con item.`,
        };
      }

      // Esperar navegacion a /cart.
      try {
        await page.waitForFunction(
          () => location.pathname.includes('/cart'),
          undefined,
          { timeout: 8000 }
        );
      } catch {
        // Respaldo: navegar a /cart directamente (el item ya esta en MSW).
        await page.goto(base + '/cart', { waitUntil: 'networkidle' }).catch(() => {});
      }
      await page.waitForTimeout(2500);

      const finalUrl = page.url();

      // Barra de progreso accesible.
      const progress = page.getByRole('progressbar');
      const hasProgress = (await progress.count().catch(() => 0)) > 0;

      // Mensaje de envio gratis (acentos opcionales).
      const bodyText = await page.evaluate(() => document.body.innerText || '');
      const hasMessage = /(te faltan|env[ií]o gratis)/i.test(bodyText);

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/cart-freeship.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (hasProgress && hasMessage) {
        return {
          status: 'pass',
          notes: `UC-CHT-FREESHIP OK: en ${finalUrl} aparece el mensaje de envio gratis y un role="progressbar". Ficha usada: ${usedUrl}.`,
        };
      }

      if (!finalUrl.includes('/cart')) {
        return {
          status: 'fail',
          notes: `UC-CHT-FREESHIP: no se llego a /cart (URL=${finalUrl}). progressbar=${hasProgress}, mensaje=${hasMessage}. Ficha: ${usedUrl}.`,
        };
      }

      return {
        status: 'fail',
        notes: `UC-CHT-FREESHIP: en /cart (${finalUrl}) falta evidencia de envio gratis: progressbar=${hasProgress}, mensaje("Te faltan"/"envio gratis")=${hasMessage}. Ficha: ${usedUrl}.`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de envio gratis: ${err?.message || String(err)}` };
    }
  },
};
