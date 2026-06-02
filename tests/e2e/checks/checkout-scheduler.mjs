/**
 * Check: Programador de entrega en el checkout (UC-CHT-SCHED)
 *
 * El checkout requiere items en el carrito. Flujo:
 *   1. Abrir una ficha de producto con stock y pulsar "Agregar a la bolsa"
 *      (navega a /cart, dejando el carrito con un item).
 *   2. Ir a /checkout. Si redirige a login, hacer loginAsBuyer y reintentar.
 *   3. Verificar la seccion "Fecha de entrega" con el DeliveryScheduler:
 *      un role="group" aria-label "Fecha de entrega" con franjas seleccionables.
 *   4. Seleccionar una franja y verificar aria-pressed / aria-checked = "true".
 *
 * Si el checkout no es alcanzable en demo (carrito vacio o sesion) ->
 * status='warn' explicando el punto exacto donde se detiene.
 */

import { loginAsBuyer } from '../lib/auth.mjs';

export default {
  id: 'checkout-scheduler',
  title: 'Checkout: seleccionar franja de "Fecha de entrega" (UC-CHT-SCHED)',
  critical: false,

  async run(page, { base }) {
    try {
      // --- Paso 1: agregar un producto con stock a la bolsa --------------
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
      let addedFrom = null;
      for (const url of candidates) {
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2500);
        } catch {
          continue;
        }
        const addBtn = page.getByRole('button', { name: addRe });
        try {
          await addBtn.first().waitFor({ state: 'visible', timeout: 6000 });
        } catch {
          continue; // ficha sin boton (p.ej. sin stock).
        }
        if (await addBtn.first().isEnabled().catch(() => false)) {
          await addBtn.first().scrollIntoViewIfNeeded().catch(() => {});
          await addBtn.first().click();
          addedFrom = url;
          break;
        }
      }

      if (!addedFrom) {
        return {
          status: 'warn',
          notes: `Punto de detencion: no se hallo ninguna ficha con "Agregar a la bolsa" habilitado entre ${candidates.length} candidatos; sin item el checkout no tiene pedido que programar. Carrito no poblado en demo.`,
        };
      }

      // Esperar a que navegue a /cart (confirma que el item se agrego).
      try {
        await page.waitForFunction(() => location.pathname.includes('/cart'), undefined, { timeout: 8000 });
      } catch {
        /* aun asi intentamos el checkout */
      }
      await page.waitForTimeout(1500);

      // --- Paso 2: ir al checkout (login si redirige) --------------------
      const gotoCheckout = async () => {
        await page.goto(base + '/checkout', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2500);
      };
      await gotoCheckout();

      if (page.url().includes('/auth/login') || page.url().includes('/login')) {
        // El checkout redirigio a login: autenticar y reintentar.
        await loginAsBuyer(page, base);
        await gotoCheckout();
      }

      const finalUrl = page.url();
      if (finalUrl.includes('/auth/login') || finalUrl.includes('/login')) {
        return {
          status: 'warn',
          notes: `Punto de detencion: /checkout sigue redirigiendo a login (${finalUrl}) incluso tras loginAsBuyer. Sesion no alcanzable en demo.`,
        };
      }
      if (!finalUrl.includes('/checkout')) {
        return {
          status: 'warn',
          notes: `Punto de detencion: /checkout redirigio a ${finalUrl} (probable carrito vacio tras navegar). El DeliveryScheduler no llego a renderizarse. Item agregado desde ${addedFrom}.`,
        };
      }

      // --- Paso 3: localizar el DeliveryScheduler -----------------------
      const group = page.getByRole('group', { name: 'Fecha de entrega' });
      if (!(await group.count().catch(() => 0))) {
        return {
          status: 'warn',
          notes: `Punto de detencion: /checkout cargo (${finalUrl}) pero no aparecio el group role="group" aria-label "Fecha de entrega" (DeliveryScheduler). Posible carrito vacio o seccion no renderizada en demo. Item desde ${addedFrom}.`,
        };
      }
      const scheduler = group.first();
      await scheduler.scrollIntoViewIfNeeded().catch(() => {});

      const slots = scheduler.getByRole('button');
      const slotCount = await slots.count().catch(() => 0);
      if (slotCount === 0) {
        return {
          status: 'fail',
          notes: `UC-CHT-SCHED: la seccion "Fecha de entrega" existe pero el DeliveryScheduler no tiene franjas seleccionables (0 botones).`,
        };
      }

      // --- Paso 4: seleccionar una franja habilitada --------------------
      let targetIndex = -1;
      for (let i = 0; i < slotCount; i++) {
        if (await slots.nth(i).isEnabled().catch(() => false)) {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex < 0) {
        return {
          status: 'warn',
          notes: `Punto de detencion: el DeliveryScheduler tiene ${slotCount} franjas pero todas estan deshabilitadas (sin disponibilidad). No hay franja que seleccionar.`,
        };
      }

      const slot = slots.nth(targetIndex);
      await slot.scrollIntoViewIfNeeded().catch(() => {});
      await slot.click();

      // Verificar aria-pressed / aria-checked = "true".
      let pressed = false;
      try {
        await page.waitForFunction(
          (el) =>
            el &&
            (el.getAttribute('aria-pressed') === 'true' ||
              el.getAttribute('aria-checked') === 'true'),
          await slot.elementHandle(),
          { timeout: 4000 }
        );
        pressed = true;
      } catch {
        pressed = false;
      }
      await page.waitForTimeout(300);

      const ariaPressed = await slot.getAttribute('aria-pressed').catch(() => null);
      const ariaChecked = await slot.getAttribute('aria-checked').catch(() => null);
      pressed = pressed || ariaPressed === 'true' || ariaChecked === 'true';

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/checkout-scheduler.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (pressed) {
        return {
          status: 'pass',
          notes: `UC-CHT-SCHED OK: en ${finalUrl} la seccion "Fecha de entrega" (DeliveryScheduler, role="group") muestra ${slotCount} franjas. Al seleccionar una franja habilitada quedo marcada (aria-pressed=${ariaPressed}, aria-checked=${ariaChecked}). Item desde ${addedFrom}.`,
        };
      }

      return {
        status: 'fail',
        notes: `UC-CHT-SCHED: se clico una franja del DeliveryScheduler pero no quedo marcada (aria-pressed=${ariaPressed}, aria-checked=${ariaChecked}; esperado "true"). URL ${finalUrl}.`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de checkout-scheduler: ${err?.message || String(err)}` };
    }
  },
};
