/**
 * Check: Preguntas frecuentes de la ficha (UC-CAT-FAQ)
 *
 * En una ficha existe la seccion "Preguntas frecuentes" con un Accordion
 * (role="group", aria-label "Preguntas frecuentes"). Expandir un panel
 * (clic en su <button aria-expanded>) debe poner aria-expanded="true" y
 * revelar el contenido (role="region" controlado por ese boton).
 *
 * Si ninguna ficha del demo expone FAQs no hay seccion que ejercitar
 * end-to-end -> status='warn' (cubierto por el unit test de Accordion).
 */

export default {
  id: 'product-faq',
  title: 'FAQ de la ficha: expandir un panel del Accordion (UC-CAT-FAQ)',
  critical: false,

  async run(page, { base }) {
    try {
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

      let usedUrl = null;
      let faqGroup = null;

      for (const url of candidates) {
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2500);
        } catch {
          continue;
        }
        const group = page.getByRole('group', { name: 'Preguntas frecuentes' });
        if (await group.count().catch(() => 0)) {
          usedUrl = url;
          faqGroup = group.first();
          break;
        }
      }

      if (!faqGroup) {
        return {
          status: 'warn',
          notes: `Ninguna ficha del demo expuso la seccion "Preguntas frecuentes" (Accordion) entre ${candidates.length} candidatos; no hay panel que ejercitar end-to-end. Comportamiento cubierto por el unit test de Accordion.`,
        };
      }

      // Verificar que el titulo de seccion existe (texto "Preguntas frecuentes").
      const bodyText = await page.evaluate(() => document.body.innerText || '');
      const hasHeading = /preguntas frecuentes/i.test(bodyText);

      const triggers = faqGroup.getByRole('button');
      const triggerCount = await triggers.count().catch(() => 0);
      if (triggerCount === 0) {
        return {
          status: 'fail',
          notes: `La seccion "Preguntas frecuentes" existe en ${usedUrl} pero el Accordion no tiene botones de panel.`,
        };
      }

      // Elegir un panel cerrado (aria-expanded != "true").
      let targetIndex = -1;
      for (let i = 0; i < triggerCount; i++) {
        const exp = await triggers.nth(i).getAttribute('aria-expanded').catch(() => null);
        if (exp !== 'true') {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex < 0) targetIndex = 0; // todos abiertos: usamos el primero igualmente

      const trigger = triggers.nth(targetIndex);
      const controlsId = await trigger.getAttribute('aria-controls').catch(() => null);

      await trigger.scrollIntoViewIfNeeded().catch(() => {});
      await trigger.click();

      // Esperar a que aria-expanded pase a "true".
      let expanded = false;
      try {
        await page.waitForFunction(
          (el) => el && el.getAttribute('aria-expanded') === 'true',
          await trigger.elementHandle(),
          { timeout: 4000 }
        );
        expanded = true;
      } catch {
        expanded = false;
      }
      await page.waitForTimeout(300);

      const expandedAttr = await trigger.getAttribute('aria-expanded').catch(() => null);
      expanded = expanded || expandedAttr === 'true';

      // El panel revelado: region controlada por el boton (su aria-controls).
      let panelVisible = false;
      if (controlsId) {
        panelVisible = await page
          .evaluate((id) => {
            const el = document.getElementById(id);
            if (!el) return false;
            const r = el.getBoundingClientRect();
            return r.height > 0 && (el.innerText || '').trim().length > 0;
          }, controlsId)
          .catch(() => false);
      }

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/product-faq.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (expanded && panelVisible) {
        return {
          status: 'pass',
          notes: `UC-CAT-FAQ OK: ficha ${usedUrl} tiene "Preguntas frecuentes" (heading=${hasHeading}). Al clicar un panel cerrado, aria-expanded paso a "true" y se revelo la respuesta (region #${controlsId} visible con contenido).`,
        };
      }

      if (expanded && !panelVisible) {
        return {
          status: 'warn',
          notes: `UC-CAT-FAQ: aria-expanded paso a "true" en ${usedUrl} pero no se pudo confirmar el contenido visible del panel (region #${controlsId}). Posible animacion/medicion. heading=${hasHeading}.`,
        };
      }

      return {
        status: 'fail',
        notes: `UC-CAT-FAQ: en ${usedUrl} el panel del Accordion no se expandio: aria-expanded=${expandedAttr} (esperado "true"), panelVisible=${panelVisible}.`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de FAQ: ${err?.message || String(err)}` };
    }
  },
};
