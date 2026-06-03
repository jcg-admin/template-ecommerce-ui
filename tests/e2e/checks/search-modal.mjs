/**
 * Check: Modal de busqueda se abre con bordes redondeados (BUG-SEARCH-02)
 *
 * El boton `button[aria-label="Buscar productos"]` abre un modal/overlay de
 * busqueda. Antes de abrirlo no hay ningun input[type="search"] visible;
 * tras el click aparece un input de busqueda dentro de un contenedor
 * role="dialog". BUG-SEARCH-02 cubre que el modal aparezca y se vea con
 * bordes redondeados (border-radius computado > 0 en el input o el panel).
 *
 * NOTA: ⌘K / Meta+K NO abre el modal en este build; solo el boton lo hace.
 * La animacion de entrada no se puede asertar de forma fiable en
 * automatizacion: queda como evidencia visual en el screenshot.
 */

const SEARCH_INPUT = 'input[type="search"]';

export default {
  id: 'search-modal',
  title: 'Modal de busqueda se abre con bordes redondeados (BUG-SEARCH-02)',
  critical: false,

  async run(page, { base }) {
    try {
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);

      // El input de busqueda no debe estar visible antes de abrir el modal.
      const searchVisibleBefore = await page
        .locator(SEARCH_INPUT)
        .first()
        .isVisible()
        .catch(() => false);

      const btn = page.locator('button[aria-label="Buscar productos"]');
      if (!(await btn.count())) {
        return {
          status: 'fail',
          notes: 'No se encontro el boton button[aria-label="Buscar productos"] en la home; no se puede abrir el modal de busqueda.',
        };
      }

      await btn.first().click();
      await page.waitForTimeout(600);

      // Esperar a que aparezca el input de busqueda del modal.
      let inputVisible = false;
      try {
        await page.locator(SEARCH_INPUT).first().waitFor({ state: 'visible', timeout: 4000 });
        inputVisible = true;
      } catch {
        inputVisible = false;
      }

      if (!inputVisible) {
        return {
          status: 'fail',
          notes: 'BUG-SEARCH-02: tras hacer click en "Buscar productos" no aparecio ningun input[type="search"] visible. El modal de busqueda no se abrio.',
        };
      }

      // Medir border-radius del input y de su contenedor de dialogo.
      const radii = await page.evaluate((sel) => {
        const parsePx = (v) => {
          const n = parseFloat(String(v).split(' ')[0]);
          return Number.isFinite(n) ? n : 0;
        };
        const input = document.querySelector(sel);
        if (!input) return null;
        const inputBR = parsePx(getComputedStyle(input).borderRadius);

        // Buscar contenedor del modal: role="dialog" o clase con modal/search/overlay.
        let dialog = input.closest('[role="dialog"]');
        if (!dialog) {
          let el = input.parentElement;
          while (el && el !== document.body) {
            if (/modal|search|overlay/i.test((el.className || '').toString())) {
              dialog = el;
              break;
            }
            el = el.parentElement;
          }
        }
        const dialogBR = dialog ? parsePx(getComputedStyle(dialog).borderRadius) : 0;

        // Border-radius maximo en la cadena de ancestros (panel real del modal).
        let maxAncestorBR = 0;
        let walk = input;
        for (let i = 0; walk && i < 6; i++) {
          maxAncestorBR = Math.max(maxAncestorBR, parsePx(getComputedStyle(walk).borderRadius));
          walk = walk.parentElement;
        }

        return {
          inputBR,
          dialogBR,
          maxAncestorBR,
          hasDialogRole: !!input.closest('[role="dialog"]'),
        };
      }, SEARCH_INPUT);

      if (!radii) {
        return {
          status: 'fail',
          notes: 'BUG-SEARCH-02: el input de busqueda no pudo localizarse en el DOM para medir su border-radius.',
        };
      }

      const rounded = radii.inputBR > 0 || radii.dialogBR > 0 || radii.maxAncestorBR > 0;

      // Evidencia visual de la animacion / aspecto del modal.
      try {
        await page.screenshot({ path: 'tests/e2e/screenshots/search-modal.png' }).catch(() => {});
      } catch { /* screenshot best-effort */ }

      const wasHidden = !searchVisibleBefore;
      const radiusMsg = `border-radius input=${radii.inputBR}px, dialogo=${radii.dialogBR}px, max-ancestro=${radii.maxAncestorBR}px`;

      if (!rounded) {
        return {
          status: 'fail',
          notes: `BUG-SEARCH-02: el modal aparecio (input[type="search"] visible${radii.hasDialogRole ? ' dentro de role="dialog"' : ''}) pero NO tiene bordes redondeados (${radiusMsg}).`,
        };
      }

      return {
        status: 'pass',
        notes: `Modal de busqueda OK: el input[type="search"] no estaba visible antes (${wasHidden ? 'confirmado' : 'no confirmado'}) y aparece tras el click${radii.hasDialogRole ? ' dentro de role="dialog"' : ''} con bordes redondeados (${radiusMsg}). La animacion de entrada es visual y queda en el screenshot search-modal.png (no aserta-ble de forma fiable en automatizacion).`,
      };
    } catch (err) {
      return { status: 'fail', notes: `Excepcion en check de modal de busqueda: ${err?.message || String(err)}` };
    }
  },
};
