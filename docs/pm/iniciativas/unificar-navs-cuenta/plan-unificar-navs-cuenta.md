# Plan — unificar-navs-cuenta (DR-01)

**Estrategia:** TDD. Primero AccountLayout no pierde items, luego se quita
AccountSidebar de cada página, por último se borra el componente. Verificación
por fase: jest + check-scss + build:demo.

## FASE 1 — Completar AccountLayout (no perder items)
- F1-T1 `AccountLayout.test.jsx`: añadir fila it.each para
  `Mis direcciones` → `/account/addresses` (rojo).
- F1-T2 `AccountLayout.jsx`: añadir entrada `addresses` a `NAV_ITEMS` (verde).
- F1-T3 (opcional) decidir si se migran contadores; si sí, añadir el selector
  de contadores al AccountLayout y un test.

## FASE 2 — Quitar AccountSidebar de las 8 páginas
Por cada página (`AccountPage`, `OrdersPage`, `WishlistPage`, `AddressesPage`,
`ProfilePage`, `ReferralPage`, `SecurityPage`, `SearchHistoryPage`):
- F2-Tn quitar `import AccountSidebar` y el `<AccountSidebar/>`.
- Ajustar el grid/markup del contenido (y su `.module.scss`) para que no quede
  una columna vacía.
- F2-Ttest actualizar `AddressesPage.test.jsx` y `WishlistPage.test.jsx`
  (quitar asserts de contenido de AccountSidebar; verificar que la página
  sigue renderizando su contenido propio).

## FASE 3 — Eliminar el componente
- F3-T1 borrar `src/components/account/AccountSidebar/index.jsx` y
  `AccountSidebar.module.scss`.
- F3-T2 `grep -rn AccountSidebar src/` → 0 resultados (gate).

## FASE 4 — Verificación y cierre
- jest completo 0 fallos; check-scss clean; build:demo EXIT=0.
- decisiones-*.md + actualizar índice → Cerrada.

## Nota de orden
F1 antes que F2 (no perder `addresses`). F3 después de F2 (no quedar imports
rotos). Las 8 sub-tareas de F2 son independientes entre sí → paralelizables,
pero el test full corre una sola vez al final de la fase.
