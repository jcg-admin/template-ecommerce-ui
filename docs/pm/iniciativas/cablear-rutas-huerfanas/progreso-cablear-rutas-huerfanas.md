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

## 2026-06-02 — F2 AdminSidebar (12 rutas admin)

`AdminSidebar/index.jsx` es la **fuente única** de la nav admin (BUG-S03 ya
deduplicó AdminLayout↔AdminSidebar en T-202), así que no hay drift como en
cuenta. Las 12 rutas verificadas en el router
(`grep -nE 'path="admin/(couriers|…|reviews/moderation)"' AppRouter.jsx`
→ 12 hits, líneas 267-326).

**Cambios (TDD):**
- `AdminSidebar/AdminSidebar.test.jsx` (nuevo): `it.each` con las 12 rutas y
  su `to`. Rojo: 12 failed / 12.
- `AdminSidebar/index.jsx`: +12 entradas a `ADMIN_NAV`, agrupadas —
  Catálogo (+Descuentos), Ventas (+Panel de pedidos), nueva sección
  Comunicación (notif. compose, newsletter compose/subscribers, questions
  answer/moderation, reviews moderation), Operaciones (+Sincronizar precios,
  +Mensajeros), Configuración (+Permisos, +Respaldos). Verde: AdminSidebar
  12/12 + AdminLayout.navigation 2/2 = 14/14.

Sin SCSS nuevo: las entradas reusan `styles.navSection` y `styles.link`.

## 2026-06-02 — F3 enlaces desde página padre (5 reales)

Premise Gate por sub-ruta (grep de enlace dinámico previo):
- `admin/variants/:variantId/price` → **ya cableada** en
  `AdminVariantsPage.jsx:168` (matriz de variantes). Descartada.
- Las otras 5 confirmadas huérfanas (solo URLs de API en el grep).

**Cambios (TDD):**
- `AdminProductsPage.jsx`: "Importar CSV" pasó de `<Button>` muerto a
  `<Link to="/admin/products/import">`; corregido bug `/products/nuevo` →
  `/products/new`. +2 asserts en `AdminProductsPage.test.jsx`.
- `AdminInventoryPage.jsx`: +`<Link to="/admin/inventory/dashboard">` en
  cabecera (grupo `.headerActions` nuevo en el .scss). +1 assert.
- `AdminConfigPage.jsx`: repunte de 3 tarjetas CFG-01/02/03 a
  `/admin/config/{gateways,shipping,site}` (dominio dedicado). 3 asserts
  actualizados en `AdminConfigPage.test.jsx`.

Rojo: 4 failed. Verde: 3 suites, 17 passed / 10 skipped. check-scss: 170
entries clean.

## 2026-06-02T19:00:32 — F4 verificación y cierre

Gates (citas verbatim de tool output):
- `npx jest --ci` → `Test Suites: 2 skipped, 272 passed, 272 of 274 total` /
  `Tests: 109 skipped, 1694 passed, 1803 total` / `EXIT=0`. Sin regresiones.
- `node scripts/check-scss.mjs` → `170 SCSS entries compiled clean`.
- `DEMO_MODE=true npm run build:demo` → `webpack 5.106.2 compiled with 2
  warnings` (asset/entrypoint size, pre-existentes) / `EXIT=0`.

19/19 huérfanas reales cableadas. Iniciativa CERRADA. Ver
`decisiones-cablear-rutas-huerfanas.md` para la matriz y los drifts diferidos
(DR-01 doble nav cuenta, DR-02 doble SiteSettings).
