/**
 * Check de resultados de busqueda.
 *
 * Cubre el fix BUG-SEARCH-03/04.
 *
 * Navega a /search?q=medicina.
 * PASS si ocurre CUALQUIERA de:
 *   (a) aparecen product cards de resultados (elemento `article`), o
 *   (b) aparece un bloque de error `[role="alert"]` con boton
 *       "Reintentar búsqueda".
 * Ambos son comportamiento correcto.
 * FAIL si la pagina queda en blanco o crashea (ni resultados ni mensaje).
 */
export default {
  id: 'search-results',
  title: 'Resultados de busqueda (/search?q=medicina)',
  critical: false,
  async run(page, { base }) {
    try {
      await page.goto(base + '/search?q=medicina', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      // El endpoint de busqueda puede tardar: react-query reintenta varias
      // veces antes de exponer el estado de error. Esperamos a que aparezca
      // un resultado (<article>) o el bloque de error [role="alert"], o a que
      // se quede sin spinner de "Buscando...". Timeout generoso.
      try {
        await page.waitForFunction(
          () =>
            document.querySelector('article') ||
            document.querySelector('[role="alert"]') ||
            !document.body.innerText.includes('Buscando'),
          { timeout: 30000 },
        );
      } catch {
        /* seguimos y evaluamos lo que haya */
      }
      await page.waitForTimeout(1000);

      const articles = page.locator('article');
      const alert = page.locator('[role="alert"]');
      const retryBtn = page.getByRole('button', { name: 'Reintentar búsqueda' });

      const articleCount = await articles.count();
      const hasAlert = (await alert.count()) > 0;
      const hasRetry = (await retryBtn.count()) > 0;

      // Camino (a): resultados.
      if (articleCount > 0) {
        return {
          status: 'pass',
          notes: `Camino (a) RESULTADOS: aparecieron ${articleCount} product card(s) (<article>) para "medicina".`,
        };
      }

      // Camino (b): error + retry.
      if (hasAlert && hasRetry) {
        let retryNote = '';
        try {
          // Opcional: pulsar Reintentar y observar si dispara nueva peticion.
          const reqPromise = page
            .waitForRequest((r) => /\/api\/.*search|\/api\/.*products|\/api\/.*catalog/i.test(r.url()), {
              timeout: 6000,
            })
            .then(() => true)
            .catch(() => false);
          await retryBtn.first().click();
          const fired = await reqPromise;
          retryNote = fired
            ? ' Al pulsar "Reintentar busqueda" se disparo una nueva peticion /api/*.'
            : ' Al pulsar "Reintentar busqueda" no se observo una nueva peticion (puede haberse resuelto desde cache MSW), pero el boston no rompio la pagina.';
        } catch (e) {
          retryNote = ` (No se pudo observar el retry: ${e && e.message ? e.message : String(e)}).`;
        }
        return {
          status: 'pass',
          notes: `Camino (b) ERROR+RETRY: bloque [role="alert"] con boton "Reintentar búsqueda" para "medicina".${retryNote}`,
        };
      }

      // Si hay alert pero sin retry, sigue siendo mensaje claro -> warn.
      if (hasAlert) {
        return {
          status: 'warn',
          notes: 'Aparecio un bloque [role="alert"] pero SIN boton "Reintentar búsqueda" para "medicina".',
        };
      }

      // Comprobar que al menos no quedo en blanco / crasheado.
      const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
      const trimmed = bodyText.trim();
      if (trimmed.length === 0) {
        return {
          status: 'fail',
          notes: 'La pagina /search?q=medicina quedo en blanco (sin resultados, sin alert, sin texto).',
        };
      }

      return {
        status: 'fail',
        notes: `Ni product cards (<article>) ni bloque de error [role="alert"] para "medicina". Texto visible (recorte): "${trimmed.slice(0, 160)}".`,
      };
    } catch (err) {
      return {
        status: 'fail',
        notes: `Excepcion durante el check de busqueda: ${err && err.message ? err.message : String(err)}`,
      };
    }
  },
};
