# Decisiones — unificar-navs-cuenta (DR-01)

Cierre: 2026-06-02T20:00:41

## Resumen

El drift DR-01 (dos navs de cuenta simultáneas) queda resuelto: la única
fuente de navegación de cuenta es ahora `src/layouts/AccountLayout.jsx`. El
componente legacy `AccountSidebar` fue eliminado.

## Decisiones

- **D-01 — Nav canónica = AccountLayout.** Es la nav a nivel de router
  (`<Route element={<AccountLayout/>}>`), con test y más completa (incluía
  returns/support/referral/search-history/notifications que AccountSidebar no
  tenía).
- **D-02 — Migrar `addresses`.** Único item que AccountSidebar aportaba y
  AccountLayout no tenía. Añadido a `NAV_ITEMS` ("Mis direcciones" →
  `/account/addresses`).
- **D-03 — No migrar contadores.** Los badges de conteo (orders/wishlist/
  addresses) de AccountSidebar eran cosméticos sobre selectors no consumidos
  por el layout; no son navegación. Simplificación consciente, no regresión.
- **D-04 — `security` no se migra.** AccountSidebar tenía `/account/security`;
  AccountLayout usa `/account/change-password` para el mismo dominio. Sin
  acción.

## Cambios

| Área | Cambio |
|------|--------|
| `layouts/AccountLayout.jsx` | +entrada `addresses` |
| `layouts/AccountLayout.test.jsx` | +fila it.each addresses |
| 8 páginas `pages/account/*.jsx` | -import y -`<AccountSidebar/>` |
| 8 `pages/account/*.module.scss` | `.layout` → `grid-template-columns: 1fr` |
| `components/account/AccountSidebar/` | **eliminado** (index.jsx + .module.scss) |
| `tests/unit/pages/SecurityPage.test.jsx` | -mock y -test de AccountSidebar |
| `tests/unit/pages/AccountPage.test.jsx` | comentario actualizado |

## Verificación de cierre (F4)

| Gate | Resultado |
|------|-----------|
| `npx jest --ci` | 1694 passed, 0 failed, 109 skipped (272/274 suites) |
| `node scripts/check-scss.mjs` | 169 entries compiled clean |
| `DEMO_MODE=true npm run build:demo` | compiled, EXIT=0 (warnings de tamaño pre-existentes) |

## Drift cerrado

DR-01 (doble nav de cuenta) — **RESUELTO**.
