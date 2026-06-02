# Progreso — cablear-rutas-huerfanas

## 2026-06-02T18:50:10 — F1 AccountLayout (cuenta)

**Premise Gate (nivel 0a → escalado 0b por RF-5/RF-7).** Al localizar el
archivo de nav de cuenta se descubrió que el análisis original solo había
inspeccionado `AccountSidebar/index.jsx`, omitiendo la nav a nivel de layout
`src/layouts/AccountLayout.jsx` — que es la canónica (montada en el router
vía `<Route element={<AccountLayout/>}>` y cubierta por
`AccountLayout.test.jsx`).

Evidencia:
- `grep -nE "change-password|notifications" src/layouts/AccountLayout.jsx`
  → líneas 21 (`notifications/preferences`) y 23 (`change-password`).
- Conclusión: de las 4 supuestas huérfanas de cuenta, **2 ya estaban
  cableadas**. Huérfanas reales: `account/referral`, `account/search-history`
  (`grep -rn` de ambos paths en `src/` → solo URLs de API, ningún `to=`).

**Cambios (TDD):**
- `AccountLayout.test.jsx`: +2 filas `it.each` (Referidos→/account/referral,
  Historial de busqueda→/account/search-history). Rojo: 2 failed / 8 passed.
- `AccountLayout.jsx`: +2 entradas en `NAV_ITEMS`. Verde: 10/10.

**Hallazgo (drift, fuera de alcance):** coexisten dos navs de cuenta que se
renderizan a la vez — `AccountLayout` (layout, canónica) y `AccountSidebar`
(embebida en cada página). Deduplicación → iniciativa separada
`unificar-navs-cuenta`. Se cableó en la canónica.

## Pendiente
- F2 AdminSidebar (12 rutas admin) + test de nav admin.
- F3 enlaces desde página padre (6 sub-rutas) — verificar enlace dinámico antes.
- F4 verificación (jest + check-scss + build:demo) + cierre.
