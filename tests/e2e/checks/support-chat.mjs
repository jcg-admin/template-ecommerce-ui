/**
 * Check: Chat de soporte en /contact (UC-SUP-CHAT)
 *
 * En la pagina de contacto (sin login) existe la seccion "Chat de soporte"
 * con el ChatWidget: un hilo accesible (role="log") y un input de mensaje.
 * Al escribir un mensaje y enviarlo (boton "Enviar" o Enter) el mensaje del
 * usuario aparece en el hilo y, si la hay, la autorespuesta del agente
 * ("Gracias, te responderemos pronto.").
 *
 * Si la seccion no es alcanzable en demo -> status='warn'; 'fail' solo si la
 * seccion existe pero el envio no refleja el mensaje en el hilo.
 */

export default {
  id: 'support-chat',
  title: 'Chat de soporte en /contact: enviar mensaje y verlo en el hilo (UC-SUP-CHAT)',
  critical: false,

  async run(page, { base }) {
    try {
      try {
        await page.goto(base + '/contact', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2500);
      } catch (e) {
        return {
          status: 'warn',
          notes: `No se pudo cargar ${base}/contact (${e?.message || String(e)}). Chat de soporte no alcanzable en demo.`,
        };
      }

      // Localizar la seccion "Chat de soporte".
      const bodyText = await page.evaluate(() => document.body.innerText || '');
      const hasHeading = /chat de soporte/i.test(bodyText);

      const log = page.getByRole('log');
      const hasLog = await log.count().catch(() => 0);
      if (!hasLog) {
        return {
          status: 'warn',
          notes: `En ${base}/contact no se encontro el hilo del ChatWidget (role="log"). heading "Chat de soporte"=${hasHeading}. Seccion no renderizada en demo.`,
        };
      }

      // Input de mensaje del ChatWidget. El placeholder es "Escribe un mensaje…"
      // y se expone como aria-label; tomamos el primer textbox de la seccion.
      let input = page.getByRole('textbox', { name: /escribe un mensaje/i });
      if (!(await input.count().catch(() => 0))) {
        // Fallback: cualquier input de texto cerca del log.
        input = page.locator('input[type="text"]');
      }
      if (!(await input.count().catch(() => 0))) {
        return {
          status: 'fail',
          notes: `La seccion "Chat de soporte" existe (role="log") pero no se hallo el input de mensaje del ChatWidget.`,
        };
      }

      const message = `Hola soporte ${Date.now()}`;
      const inputEl = input.first();
      await inputEl.scrollIntoViewIfNeeded().catch(() => {});
      await inputEl.fill(message);

      // Enviar via boton "Enviar"; si no existe, Enter.
      const sendBtn = page.getByRole('button', { name: /^enviar$/i });
      if (await sendBtn.count().catch(() => 0)) {
        await sendBtn.first().click();
      } else {
        await inputEl.press('Enter');
      }

      // Esperar a que el mensaje del usuario aparezca en el hilo.
      let userMsgVisible = false;
      try {
        await page.waitForFunction(
          (msg) => {
            const logEl = document.querySelector('[role="log"]');
            return !!logEl && (logEl.innerText || '').includes(msg);
          },
          message,
          { timeout: 5000 }
        );
        userMsgVisible = true;
      } catch {
        userMsgVisible = false;
      }
      await page.waitForTimeout(500);

      const logText = await log.first().innerText().catch(() => '');
      userMsgVisible = userMsgVisible || logText.includes(message);

      // Autorespuesta del agente (best-effort): texto simulado de ContactPage.
      const agentReply = /gracias, te responderemos pronto/i.test(logText);

      // El input deberia limpiarse tras enviar (handleSubmit hace setText('')).
      const inputCleared = (await inputEl.inputValue().catch(() => '')) === '';

      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/support-chat.png' }).catch(() => {});
      } catch { /* best-effort */ }

      if (!userMsgVisible) {
        return {
          status: 'fail',
          notes: `UC-SUP-CHAT: se escribio y envio "${message}" pero no aparecio en el hilo (role="log"). Contenido del hilo: ${JSON.stringify(logText.slice(0, 200))}.`,
        };
      }

      return {
        status: 'pass',
        notes: `UC-SUP-CHAT OK: en ${base}/contact el ChatWidget (role="log") aparece (heading="Chat de soporte"=${hasHeading}). El mensaje del usuario se refleja en el hilo${agentReply ? ' junto con la autorespuesta del agente ("Gracias, te responderemos pronto.")' : ' (sin autorespuesta detectada)'}. Input limpiado tras enviar=${inputCleared}.`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de support-chat: ${err?.message || String(err)}` };
    }
  },
};
