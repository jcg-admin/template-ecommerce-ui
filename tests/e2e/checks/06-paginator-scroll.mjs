/**
 * Check: El catalogo scrollea al inicio al cambiar de pagina (BUG-SCROLL-02)
 *
 * El catalogo (/catalog) muestra 20 cards por pagina. La API
 * /api/v1/catalogue/ devuelve { count } con el total de productos. Si
 * count > 20 hay paginacion (controles "Siguiente →" / numeros de pagina al
 * fondo). BUG-SCROLL-02: al cambiar de pagina, la ventana debe volver al
 * inicio (scrollY ~ 0) DESPUES de que rendericen los nuevos productos.
 *
 * Si count <= 20 (una sola pagina) no hay paginador que ejercitar
 * end-to-end aqui -> status='warn' (cubierto por el unit test de CatalogPage).
 */

export default {
  id: 'paginator-scroll',
  title: 'Cambio de pagina del catalogo scrollea al inicio (BUG-SCROLL-02)',
  critical: false,

  async run(page, { base }) {
    try {
      // Observar el count total del catalogo desde la respuesta de la API.
      let count = null;
      const onResponse = async (resp) => {
        try {
          if (/\/api\/v1\/catalogue\//.test(resp.url())) {
            const j = await resp.json();
            if (j && typeof j.count === 'number') count = j.count;
          }
        } catch { /* respuesta no-JSON o ya consumida */ }
      };
      page.on('response', onResponse);

      await page.goto(base + '/catalog', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      page.off('response', onResponse);

      if (typeof count !== 'number') {
        return {
          status: 'warn',
          notes: 'No se pudo leer el count de /api/v1/catalogue/ en la respuesta de la API; no se puede determinar si hay paginacion para ejercitar el scroll-to-top.',
        };
      }

      if (count <= 20) {
        return {
          status: 'warn',
          notes: `El catalogo demo tiene una sola pagina (count=${count} <= 20). El paginador no se puede ejercitar end-to-end aqui; el comportamiento de scroll-to-top esta cubierto por el unit test de CatalogPage.`,
        };
      }

      // Localizar el control de "siguiente pagina". getByRole con name es
      // mas fiable que un filtro por texto sobre el arbol completo (un filtro
      // amplio puede capturar un contenedor cuyo click no avanza de pagina).
      const nextBtn = page.getByRole('button', { name: /Siguiente/i });
      const nextLink = page.getByRole('link', { name: /Siguiente/i });
      const page2Btn = page.getByRole('button', { name: '2', exact: true });

      let control = null;
      if (await nextBtn.count().catch(() => 0)) {
        control = nextBtn.first();
      } else if (await nextLink.count().catch(() => 0)) {
        control = nextLink.first();
      } else if (await page2Btn.count().catch(() => 0)) {
        control = page2Btn.first();
      }

      if (!control) {
        return {
          status: 'fail',
          notes: `Hay paginacion (count=${count} > 20) pero no se encontro un control de "Siguiente"/"2" al fondo del catalogo.`,
        };
      }

      // Texto de la primera card actual para detectar el re-render. Las cards
      // del catalogo son <article>; el encabezado de la pagina es estatico y
      // no cambia al paginar, asi que NO sirve como senal de re-render.
      const firstCardBefore = await page
        .evaluate(() => {
          const a = document.querySelector('article');
          return a ? (a.innerText || '').trim() : '';
        })
        .catch(() => '');

      // Bajar el scroll antes de cambiar de pagina (hasta el fondo real).
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      const scrollBefore = await page.evaluate(() => window.scrollY);

      await control.scrollIntoViewIfNeeded().catch(() => {});
      await control.click();

      // Esperar a que rendericen los nuevos productos (cambia la 1a card).
      let rerendered = false;
      try {
        await page.waitForFunction(
          (prev) => {
            const a = document.querySelector('article');
            const cur = a ? (a.innerText || '').trim() : '';
            return cur && cur !== prev;
          },
          firstCardBefore,
          { timeout: 6000 }
        );
        rerendered = true;
      } catch {
        // Si no detectamos cambio de card, damos tiempo fijo igualmente.
        await page.waitForTimeout(1500);
      }
      await page.waitForTimeout(800);

      const scrollAfter = await page.evaluate(() => window.scrollY);

      // Evidencia visual.
      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/paginator-scroll.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (scrollAfter <= 5) {
        return {
          status: 'pass',
          notes: `BUG-SCROLL-02 OK: catalogo con ${count} productos (>20, hay paginacion). Tras bajar a scrollY=${scrollBefore} y cambiar de pagina${rerendered ? ' (re-render de productos confirmado)' : ' (re-render no confirmado por timeout, se uso espera fija)'}, la ventana volvio al inicio (scrollY=${scrollAfter} ~ 0).`,
        };
      }

      return {
        status: 'fail',
        notes: `BUG-SCROLL-02: tras cambiar de pagina (count=${count}, scroll previo=${scrollBefore}${rerendered ? ', re-render confirmado' : ', re-render NO confirmado'}) la ventana NO volvio al inicio: scrollY=${scrollAfter} (se esperaba ~0).`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de paginador/scroll: ${err?.message || String(err)}` };
    }
  },
};
