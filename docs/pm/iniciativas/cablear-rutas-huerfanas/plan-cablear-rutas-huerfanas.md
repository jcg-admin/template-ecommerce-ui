# Plan — cablear-rutas-huerfanas

**Estrategia:** una tarea por archivo de navegación; cada cambio con su test de
navegación. Verificación por fase: jest + check-scss + build:demo. Antes de
cablear una sub-página, confirmar que no haya ya un enlace dinámico.

## FASE 1 — AccountLayout (2 rutas reales) — HECHA
> Premise Gate corrigió el alcance: la nav canónica es `AccountLayout.jsx`
> (no `AccountSidebar`), y `change-password`/`notifications/preferences` ya
> estaban cableadas allí. Huérfanas reales: solo `referral`, `search-history`.
- F1-T1 `layouts/AccountLayout.jsx`: entradas para account/referral y
  account/search-history en `NAV_ITEMS`.
- F1-T2 `AccountLayout.test.jsx`: filas it.each para las 2 nuevas entradas
  (TDD: rojo → verde, 10/10).

## FASE 2 — AdminSidebar (12 rutas, agrupadas) — HECHA
- F2-T1 `AdminSidebar/index.jsx`: 12 entradas agrupadas (couriers, permissions,
  backups, orders-dashboard, price-sync, product-discounts,
  notifications/compose, newsletter/subscribers, newsletter/compose,
  questions/answer, questions/moderation, reviews/moderation).
- F2-T2 `AdminSidebar/AdminSidebar.test.jsx` (nuevo): it.each 12/12. Se testea
  AdminSidebar directamente (fuente única, sin redux) en lugar de
  `AdminLayout.navigation.test.jsx`, que sigue verde sin cambios.

## FASE 3 — Enlaces desde página padre (6 sub-rutas)
- F3-T1 AdminProductsPage → botón "Importar" (admin/products/import).
- F3-T2 AdminInventoryPage → enlace a inventory/dashboard.
- F3-T3 matriz de variantes → enlace a variants/:id/price.
- F3-T4 AdminConfigPage → tabs gateways/shipping/site (si no existen ya).
- F3-T5 tests de los enlaces nuevos.
- Antes de cada uno: grep para confirmar que el enlace no exista ya (descartar
  si el grep inicial fue falso positivo).

## FASE 4 — Verificación y cierre
- jest 0 fallos; check-scss clean; build:demo OK.
- (Opcional) check E2E: navegar desde el sidebar a 2-3 rutas antes huérfanas.
- decisiones-*.md + matriz de rutas actualizada + índice → Cerrada.

## Nota
Las rutas intencionalmente no-navegables (auth, checkout, redirects) NO se tocan.
