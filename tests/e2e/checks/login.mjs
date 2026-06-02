/**
 * Check: Login -> /account (BUG-ACCOUNT-01)
 *
 * Inicia sesion con credenciales validas y verifica que /account renderice
 * contenido de cuenta (no un loader perpetuo). El bug BUG-ACCOUNT-01 deja
 * /account atascado en "Cargando..." indefinidamente tras el login.
 */

export default {
  id: 'login',
  title: 'Login -> /account renderiza contenido de cuenta (BUG-ACCOUNT-01)',
  critical: true,

  async run(page, { base }) {
    try {
      await page.goto(base + '/auth/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      // Rellenar credenciales.
      const email = page.locator('input[type=email]').first();
      const pass = page.locator('input[type=password]').first();
      await email.fill('comprador@test.mx');
      await pass.fill('Test1234!');

      // Enviar: boton "Entrar a mi cuenta" (o submit como fallback).
      const submitByText = page.getByRole('button', { name: /Entrar a mi cuenta/i });
      if (await submitByText.count()) {
        await submitByText.first().click();
      } else {
        await page.locator('button[type=submit]').first().click();
      }

      // Esperar salir de /auth/login (hasta 8s).
      try {
        await page.waitForFunction(
          () => !location.pathname.includes('/auth/login'),
          undefined,
          { timeout: 8000 }
        );
      } catch {
        return {
          status: 'fail',
          notes: `Tras enviar el login la URL sigue en /auth/login (${page.url()}). El submit no autentica o no redirige.`,
        };
      }

      const afterLoginUrl = page.url();

      // Navegar explicitamente a /account y comprobar que renderiza contenido.
      await page.goto(base + '/account', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      // Buscar texto de contenido de cuenta real (no loader).
      let accountContentVisible = false;
      try {
        await page.waitForFunction(
          () => {
            const t = document.body.innerText || '';
            const loadingOnly = /Cargando/i.test(t) && t.replace(/Cargando[.…]*/gi, '').trim().length < 40;
            const hasContent =
              /Hola,/i.test(t) ||
              /Pedidos recientes/i.test(t) ||
              /Mi cuenta/i.test(t) ||
              /Cerrar sesi/i.test(t);
            return hasContent && !loadingOnly;
          },
          undefined,
          { timeout: 8000 }
        );
        accountContentVisible = true;
      } catch {
        accountContentVisible = false;
      }

      const bodyText = await page.evaluate(() => document.body.innerText || '');

      if (!accountContentVisible) {
        const stuckLoading = /Cargando/i.test(bodyText);
        const empty = bodyText.trim().length < 40;
        return {
          status: 'fail',
          notes: `BUG-ACCOUNT-01: /account no renderizo contenido de cuenta en ~8s tras login (login redirigio a ${afterLoginUrl}). ${
            stuckLoading ? 'Quedo en loader perpetuo ("Cargando...").' : empty ? 'Pagina vacia (posible "if (!user) return null").' : 'Sin texto de cuenta visible.'
          }`,
        };
      }

      // Confirmar sesion: el header ya no debe mostrar "Ingresar".
      const headerText = await page.evaluate(() => {
        const h = document.querySelector('header');
        return h ? h.innerText : document.body.innerText;
      });
      const showsIngresar = /\bIngresar\b/i.test(headerText);
      const showsSession = /Cerrar sesi/i.test(bodyText) || /Mi cuenta/i.test(headerText) || /▾/.test(headerText);

      if (showsIngresar && !showsSession) {
        return {
          status: 'warn',
          notes: `/account renderizo contenido pero el header aun muestra "Ingresar" (sesion no reflejada en UI). URL final ${page.url()}.`,
        };
      }

      return {
        status: 'pass',
        notes: `Login OK: redirigio fuera de /auth/login (${afterLoginUrl}) y /account renderizo contenido de cuenta (sin loader perpetuo). Sesion reflejada en header.`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de login: ${err?.message || String(err)}` };
    }
  },
};
