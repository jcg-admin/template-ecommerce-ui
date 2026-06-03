/**
 * Check: Agregar a la bolsa -> /cart con item (BUG-CART-03/04)
 *
 * Abre una ficha de producto con stock, pulsa "Agregar a la bolsa" y verifica
 * que la URL pase a /cart, que el carrito no este vacio y que el contador del
 * header (aria-label "Carrito (N piezas)") quede > 0.
 */

export default {
  id: 'add-to-cart',
  title: 'Agregar a la bolsa -> /cart con item (BUG-CART-03/04)',
  critical: true,

  async run(page, { base }) {
    try {
      // Resolver un href de ficha con stock. Empezamos por el sugerido y, si
      // no tiene stock, tomamos hrefs de cards en /catalog.
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
        /* si /catalog falla seguimos con el candidato por defecto */
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

        const addBtn = page.getByRole('button', { name: addRe });
        // Esperar a que aparezca (el boton esta mas abajo en la ficha).
        try {
          await addBtn.first().waitFor({ state: 'visible', timeout: 6000 });
        } catch {
          continue; // ficha sin boton de agregar (p.ej. "Sin stock").
        }

        if (await addBtn.first().isEnabled().catch(() => false)) {
          await addBtn.first().scrollIntoViewIfNeeded().catch(() => {});
          await addBtn.first().click();
          usedUrl = url;
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        return {
          status: 'fail',
          notes: `No se encontro ninguna ficha con boton "Agregar a la bolsa" habilitado entre ${candidates.length} candidatos. Posible falta de stock o boton ausente.`,
        };
      }

      // Esperar navegacion a /cart (hasta 8s).
      let navegoACart = false;
      try {
        await page.waitForFunction(
          () => location.pathname.includes('/cart'),
          undefined,
          { timeout: 8000 }
        );
        navegoACart = true;
      } catch {
        navegoACart = false;
      }
      await page.waitForTimeout(2000);

      const finalUrl = page.url();

      // Leer contador del header via aria-label "Carrito (N piezas)".
      const cartCount = await page.evaluate(() => {
        const el = document.querySelector('[aria-label^="Carrito ("]');
        if (!el) return null;
        const m = (el.getAttribute('aria-label') || '').match(/Carrito \((\d+)/);
        return m ? Number(m[1]) : null;
      });

      // Comprobar que el carrito muestra item (no vacio).
      const bodyText = await page.evaluate(() => document.body.innerText || '');
      const looksEmpty = /(tu bolsa esta vacia|carrito.*vac[ií]o|no tienes (productos|art[ií]culos)|bolsa vac[ií]a)/i.test(bodyText);

      const countOk = typeof cartCount === 'number' && cartCount > 0;

      if (!navegoACart) {
        return {
          status: 'fail',
          notes: `BUG-CART-03/04: tras "Agregar a la bolsa" (${usedUrl}) la URL no paso a /cart (quedo en ${finalUrl}). cartCount=${cartCount}.`,
        };
      }

      if (!countOk) {
        return {
          status: 'fail',
          notes: `BUG-CART-03/04: navego a /cart pero el contador del header es ${cartCount === null ? 'no legible' : cartCount} (esperado > 0). El item no se agrego al carrito. Ficha: ${usedUrl}.`,
        };
      }

      if (looksEmpty) {
        return {
          status: 'warn',
          notes: `Contador del header = ${cartCount} (>0) pero la pagina /cart parece mostrar estado vacio. Posible desincronizacion vista/estado. Ficha: ${usedUrl}.`,
        };
      }

      return {
        status: 'pass',
        notes: `Agregar a la bolsa OK: navego a /cart (${finalUrl}), carrito no vacio y header marca Carrito (${cartCount} piezas). Ficha: ${usedUrl}.`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de add-to-cart: ${err?.message || String(err)}` };
    }
  },
};
