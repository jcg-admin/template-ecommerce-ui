/**
 * Check: Calculadora de costo de envío en el carrito (UC-LOG-09)
 *
 * Se agrega un producto a la bolsa (navega a /cart) y en /cart se ejercita el
 * ShippingCalculator: se escribe un código postal de 5 dígitos y se pulsa
 * "Calcular"; debe aparecer un resultado role="status" con la zona, el costo
 * (o "Envío gratis") y la entrega estimada en días.
 */

export default {
  id: 'cart-shipping-calc',
  title: 'Carrito: calcular costo de envío por CP (UC-LOG-09)',
  critical: false,

  async run(page, { base }) {
    try {
      // Llegar a /cart con un item (mismo patrón que add-to-cart/cart-freeship).
      const candidates = [base + '/catalog/abe-esu-cuchilla-de-esu'];
      try {
        await page.goto(base + '/catalog', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        const hrefs = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href*="/catalog/"]'))
            .map((a) => a.getAttribute('href'))
            .filter((h) => h && /\/catalog\/[^/?#]+$/.test(h)),
        );
        for (const h of hrefs) {
          const abs = h.startsWith('http') ? h : base + h;
          if (!candidates.includes(abs)) candidates.push(abs);
        }
      } catch { /* usar candidato por defecto */ }

      let clicked = false;
      for (const url of candidates) {
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);
        } catch { continue; }
        const addBtn = page.getByRole('button', { name: /Agregar a la bolsa/i });
        try { await addBtn.first().waitFor({ state: 'visible', timeout: 6000 }); }
        catch { continue; }
        if (await addBtn.first().isEnabled().catch(() => false)) {
          await addBtn.first().scrollIntoViewIfNeeded().catch(() => {});
          await addBtn.first().click();
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        return { status: 'warn', notes: 'No se pudo agregar un producto para llegar a /cart; calculadora no ejercitada.' };
      }

      try {
        await page.waitForFunction(() => location.pathname.includes('/cart'), undefined, { timeout: 8000 });
      } catch { /* seguimos; intentamos igualmente */ }
      await page.waitForTimeout(1500);

      // Localizar el input de código postal del ShippingCalculator.
      const cpInput = page.locator('#shipping-postal-code');
      try { await cpInput.waitFor({ state: 'visible', timeout: 6000 }); }
      catch {
        return { status: 'fail', notes: 'UC-LOG-09: en /cart no aparece el ShippingCalculator (input #shipping-postal-code ausente).' };
      }

      await cpInput.fill('06000');
      const calcBtn = page.getByRole('button', { name: /^Calcular$/i });
      await calcBtn.first().click();

      // Esperar el resultado: el role="status" DENTRO de la sección del
      // calculador (hay otros role="status" en /cart, p.ej. el badge del header).
      const calcSection = page.locator('section[aria-labelledby="shipping-calc-title"]');
      const result = calcSection.getByRole('status');
      try { await result.first().waitFor({ state: 'visible', timeout: 8000 }); }
      catch {
        return { status: 'fail', notes: 'UC-LOG-09: tras "Calcular" no apareció el resultado (role="status") en el ShippingCalculator.' };
      }

      const resultText = (await result.first().innerText().catch(() => '')) || '';
      const hasZoneOrCp = /CP\s*06000|metropolitana|nacional|extendida/i.test(resultText);
      const hasCostOrFree = /Env[ií]o gratis|\$|MXN|[0-9]/.test(resultText);
      const hasEta = /Entrega estimada|d[ií]as/i.test(resultText);

      if (hasZoneOrCp && hasCostOrFree && hasEta) {
        return { status: 'pass', notes: `UC-LOG-09 OK: cotización mostrada para CP 06000 — "${resultText.replace(/\s+/g, ' ').slice(0, 120)}".` };
      }
      return {
        status: 'warn',
        notes: `UC-LOG-09: resultado presente pero incompleto (zona/cp=${hasZoneOrCp}, costo=${hasCostOrFree}, eta=${hasEta}). Texto: "${resultText.replace(/\s+/g, ' ').slice(0, 120)}".`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepción en UC-LOG-09: ${err?.message || String(err)}` };
    }
  },
};
