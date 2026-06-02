# Progreso — unificar-navs-cuenta (DR-01)

## 2026-06-02T20:00:41 — Ejecución F1-F4

### F1 — Completar AccountLayout (no perder items)
- `AccountLayout.test.jsx`: +fila it.each `Mis direcciones → /account/addresses`
  (rojo: 1 failed / 10 passed).
- `AccountLayout.jsx`: +entrada `addresses` en `NAV_ITEMS` (verde: 11/11).
- **Decisión:** los **contadores** de AccountSidebar (orders/wishlist/addresses)
  NO se migran. Eran badges informativos sobre selectors que el layout no
  consume; no son navegación. Se documenta como simplificación, no regresión
  de nav.

### F2 — Quitar AccountSidebar de las 8 páginas
- Removido `import AccountSidebar` + `<AccountSidebar/>` (cada página lo
  referenciaba exactamente 2 veces — verificado con `grep -c`) en:
  ProfilePage, SearchHistoryPage, ReferralPage, WishlistPage, AddressesPage,
  OrdersPage, SecurityPage, AccountPage.
- `.module.scss` de cada página: `.layout` colapsado de
  `grid-template-columns: 260px 1fr` → `1fr` (contenido a ancho completo).
- Tests de página: `AddressesPage`/`WishlistPage` afirmaban su **propio**
  heading (`<h1>Mis direcciones</h1>`, `<h1>Lista de deseos</h1>`), no el
  sidebar → no requirieron cambio.

### F3 — Eliminar el componente
- `git rm` de `AccountSidebar/index.jsx` + `AccountSidebar.module.scss`.
- Gate: `grep -rn AccountSidebar src/` → 0.

### Hallazgo durante F4 (test fuera de src/)
- `tests/unit/pages/SecurityPage.test.jsx` hacía `jest.mock(...AccountSidebar)`
  y un test `el AccountSidebar se renderiza` → la suite **falló al cargar**
  (módulo inexistente). Removidos el mock y ese test (5/5 verde).
- `tests/unit/pages/AccountPage.test.jsx:88`: solo un comentario; actualizado a
  "AccountLayout (nav canónica)". El test que lo rodea está `.skip`.

### F4 — Verificación
- `node scripts/check-scss.mjs` → `169 SCSS entries compiled clean` (uno menos
  tras borrar AccountSidebar.module.scss).
- `npx jest --ci` → `Test Suites: 2 skipped, 272 passed` / `Tests: 109 skipped,
  1694 passed, 1803 total` / `EXIT=0`. Sin regresiones.
- `DEMO_MODE=true npm run build:demo` → `compiled with 2 warnings` (tamaño de
  asset, pre-existentes) / `EXIT=0`.

Iniciativa CERRADA. Una sola nav de cuenta (AccountLayout). Ver
`decisiones-unificar-navs-cuenta.md`.
