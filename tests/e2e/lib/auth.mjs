/**
 * Helpers de autenticación para los checks E2E.
 *
 * Inician sesión vía el formulario /auth/login del storefront demo (MSW).
 * Credenciales demo:
 *   comprador@test.mx / Test1234!            (comprador)
 *   admin@e-comerce.example.com / Admin1234! (admin)
 */

export async function login(page, base, email, password) {
  await page.goto(base + '/auth/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Esperar a salir de /auth/login (sesión iniciada).
  await page
    .waitForFunction(() => !location.pathname.includes('/auth/login'), { timeout: 12000 })
    .catch(() => {});
  await page.waitForTimeout(1500); // dejar que fetchProfile/MSW asienten
}

export const loginAsBuyer = (page, base) =>
  login(page, base, 'comprador@test.mx', 'Test1234!');

export const loginAsAdmin = (page, base) =>
  login(page, base, 'admin@e-comerce.example.com', 'Admin1234!');

/**
 * Navegación CLIENT-SIDE (sin recarga) dentro de la SPA via History API.
 *
 * Un `page.goto()` recarga la página y reinicia el estado de MSW (la sesión
 * `_activeSession` vive en un módulo), por lo que tras un login admin la
 * navegación con goto pierde la sesión y AdminRoute redirige a /auth/login.
 * pushState + popstate dispara la navegación de React Router sin recargar,
 * conservando la sesión y el estado de Redux/MSW.
 */
export async function navigateInApp(page, path) {
  await page.evaluate((p) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await page.waitForTimeout(2500); // dejar que el router renderice + MSW responda
}
