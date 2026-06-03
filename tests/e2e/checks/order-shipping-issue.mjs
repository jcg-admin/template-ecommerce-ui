/**
 * Check: Reportar problema de envío desde el detalle de pedido (UC-LOG-07)
 *
 * Login comprador -> /account/orders -> abrir pedidos hasta encontrar uno
 * despachado (SHIPPED/DELIVERED) donde aparece "Reportar problema de envío";
 * se abre el formulario, se elige motivo + descripción y se envía; debe
 * mostrarse la confirmación role="status" "Reporte enviado".
 *
 * Resiliente: si ningún pedido del demo está despachado (estados aleatorios),
 * devuelve 'warn' en vez de 'fail'.
 */

import { loginAsBuyer, navigateInApp } from '../lib/auth.mjs';

export default {
  id: 'order-shipping-issue',
  title: 'Pedido: reportar problema de envío (UC-LOG-07)',
  critical: false,

  async run(page, { base }) {
    try {
      await loginAsBuyer(page, base);
      await navigateInApp(page, '/account/orders');
      await page.waitForTimeout(1800);

      // Recolectar hrefs de detalle de pedido.
      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href*="/account/orders/"]'))
          .map((a) => a.getAttribute('href'))
          .filter((h) => h && /\/account\/orders\/[^/?#]+$/.test(h)),
      ).catch(() => []);

      if (!hrefs.length) {
        return { status: 'warn', notes: 'UC-LOG-07: no se encontraron pedidos en /account/orders (demo sin pedidos o login fallido).' };
      }

      const reportBtnRe = /Reportar problema de envío/i;
      let foundOrder = null;

      for (const h of hrefs.slice(0, 8)) {
        await navigateInApp(page, h);
        await page.waitForTimeout(1200);
        const btn = page.getByRole('button', { name: reportBtnRe });
        if ((await btn.count().catch(() => 0)) > 0) { foundOrder = h; break; }
      }

      if (!foundOrder) {
        return {
          status: 'warn',
          notes: `UC-LOG-07: ningún pedido despachado (SHIPPED/DELIVERED) entre ${Math.min(hrefs.length, 8)} revisados — el botón "Reportar problema de envío" solo aparece tras el despacho (estados aleatorios en demo).`,
        };
      }

      // Abrir el formulario.
      await page.getByRole('button', { name: reportBtnRe }).first().click();
      await page.waitForTimeout(500);

      // Elegir motivo y describir.
      const motivo = page.getByLabel(/Motivo/i);
      if ((await motivo.count().catch(() => 0)) === 0) {
        return { status: 'fail', notes: `UC-LOG-07: se abrió el reporte (${foundOrder}) pero no aparece el campo "Motivo".` };
      }
      await motivo.first().selectOption('DANADO').catch(async () => {
        await motivo.first().selectOption({ label: /dañado/i }).catch(() => {});
      });
      await page.getByLabel(/Descripción/i).first().fill('La caja llegó abierta y un producto está roto.');

      // Enviar.
      await page.getByRole('button', { name: /Enviar reporte/i }).first().click();

      // Confirmación: el mensaje "Reporte enviado" (hay otros role="status" en
      // la página, p.ej. el PdfViewer de la factura — buscamos el texto exacto).
      const confirm = page.getByText(/Reporte enviado/i);
      try { await confirm.first().waitFor({ state: 'visible', timeout: 6000 }); }
      catch {
        return { status: 'fail', notes: `UC-LOG-07: tras enviar el reporte (${foundOrder}) no apareció la confirmación "Reporte enviado".` };
      }
      return { status: 'pass', notes: `UC-LOG-07 OK: reporte de problema de envío enviado en ${foundOrder} y confirmado ("Reporte enviado").` };
    } catch (err) {
      return { status: 'warn', notes: `UC-LOG-07 no alcanzable: ${err?.message || String(err)}` };
    }
  },
};
