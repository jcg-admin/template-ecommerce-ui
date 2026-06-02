# Plan — cablear-rutas-huerfanas

**Estrategia:** una tarea por archivo de navegación; cada cambio con su test de
navegación. Verificación por fase: jest + check-scss + build:demo. Antes de
cablear una sub-página, confirmar que no haya ya un enlace dinámico.

## FASE 1 — AccountSidebar (4 rutas)
- F1-T1 `AccountSidebar/index.jsx`: entradas para account/referral,
  account/change-password, account/search-history,
  account/notifications/preferences.
- F1-T2 test de AccountSidebar: las 4 entradas presentes y con `to` correcto.

## FASE 2 — AdminSidebar (12 rutas, agrupadas)
- F2-T1 `AdminSidebar/index.jsx`: entradas/grupos para couriers, permissions,
  backups, orders-dashboard, price-sync, product-discounts,
  notifications/compose, newsletter/subscribers, newsletter/compose,
  questions/answer, questions/moderation, reviews/moderation.
- F2-T2 actualizar `AdminLayout.navigation.test.jsx` (cubre la nav admin).

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
