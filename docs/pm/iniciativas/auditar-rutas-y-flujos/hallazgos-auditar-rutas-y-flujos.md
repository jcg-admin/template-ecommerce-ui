# Hallazgos — auditar-rutas-y-flujos

## HALLAZGO-ROUTER-01 — 12 páginas JSX sin ruta en el router (PENDIENTE)
- **Fecha**: 2026-05-28
- **Severidad**: Alta (páginas inaccesibles desde el browser)
- **Descripción**: Existen 12 páginas JSX completamente implementadas que no tienen
  entrada en AppRouter.jsx. No son alcanzables por URL.
- **Páginas afectadas**:
  - AdminGatewaysPage → `/admin/config/gateways`
  - AdminInventoryDashboardPage → `/admin/inventory/dashboard`
  - AdminProductDetailPage → `/admin/products/:id`
  - AdminProductImportPage → `/admin/products/import`
  - AdminProductVariantsPage → `/admin/products/:id/variants` (CONFLICTO con AdminVariantsPage)
  - AdminShippingMethodsPage → `/admin/config/shipping`
  - AdminSiteSettingsPage → `/admin/config/site`
  - AdminStaticPageEditorPage → `/admin/pages/:slug/edit`
  - AdminStaticPagesPage → `/admin/pages`
  - AdminStockAlertsPage → `/admin/inventory/stock-alerts`
  - AdminVariantTypesPage → `/admin/products/:id/variant-types`
  - AdminVoucherDetailPage → `/admin/vouchers/:id`
- **Acción requerida**: Registrar cada página en AppRouter.jsx bajo `<AdminRoute>`.

## HALLAZGO-ROUTER-02 — AdminVariantsPage y AdminProductVariantsPage cubren el mismo path (PENDIENTE)
- **Fecha**: 2026-05-28
- **Severidad**: Media (duplicado — una de las dos sobra o tienen propósitos distintos)
- **Descripción**:
  - `AdminVariantsPage` (en router) — UC-CHT-03, gestiona variantes existentes (tipo, opción, stock, precio).
  - `AdminProductVariantsPage` (huérfana) — tabla de combinaciones generadas con bulk update y regeneración.
  - Ambas apuntan al mismo path `/admin/products/:productId/variants`.
- **Decisión requerida**: Unificar en una sola página o asignar paths distintos:
  - Opción A: `/admin/products/:id/variants` → AdminVariantsPage (gestión), `/admin/products/:id/variants/matrix` → AdminProductVariantsPage (tabla de combinaciones)
  - Opción B: Fusionar ambas en AdminVariantsPage con tabs.

## HALLAZGO-ROUTER-03 — NotFoundPage sin ruta directa /404 (PENDIENTE)
- **Fecha**: 2026-05-28
- **Severidad**: Baja (funcional pero inconsistente)
- **Descripción**: El router define `<Route path="404" element={<NotFoundPage />} />` sin slash
  inicial, lo que en React Router v6 con `<Routes>` lo convierte en una ruta relativa que
  solo matchea bajo el padre actual. El fallback `<Route path="*" element={<Navigate to="/404" replace />}>`
  debería funcionar, pero la ruta `/404` directa puede no resolverse.
- **Acción requerida**: Cambiar `path="404"` a una ruta absoluta o verificar en browser
  que `https://localhost/404` carga NotFoundPage correctamente.

## HALLAZGO-ROUTER-04 — AdminConfigPage sin sub-rutas definidas (PENDIENTE)
- **Fecha**: 2026-05-28
- **Severidad**: Media
- **Descripción**: La ruta `/admin/config` existe y apunta a `AdminConfigPage` (hub de configuración).
  Sin embargo las páginas de configuración específicas (Gateways, Shipping, Site) son huérfanas
  y no tienen rutas. AdminConfigPage probablemente muestra links a rutas que no existen.
- **Acción requerida**: Registrar las 3 sub-páginas de configuración en el router y verificar
  que AdminConfigPage enlaza a ellas correctamente.

## HALLAZGO-FLUJO-01 — Flujo de búsqueda desconectado (PENDIENTE)
- **Fecha**: 2026-05-28
- **Descripción**: El Header tiene un botón de búsqueda (`aria-expanded`) que al
  hacer click abre un panel de búsqueda. Al escribir y buscar, debería navegar a
  `/search?q=...` (SearchResultsPage). Sin embargo la ruta `/search` existe pero
  no está verificada en browser.
- **Relacion**: SearchBar en CatalogPage está conectado y funciona.
  El SearchBar del Header (buscador global) puede tener un flujo diferente.

## HALLAZGO-FLUJO-02 — Flujo de login sin redirección ?next= verificada (PENDIENTE)
- **Fecha**: 2026-05-28
- **Descripción**: ProtectedRoute redirige a `/auth/login` cuando no hay sesión.
  No está verificado si pasa el parámetro `?next=/ruta-original` ni si LoginPage
  lo lee para redirigir al destino correcto tras el login.

## HALLAZGO-BROWSER-01..04 — Bugs visuales corregidos
Ver hallazgos en la iniciativa `cobertura-tests-completa`:
- BUG-BROWSER-01: ProductPage selector incorrecto → CORREGIDO
- BUG-BROWSER-02: SearchBar texto invisible → CORREGIDO
- BUG-BROWSER-03: RangeSlider sin thumb/tooltip → CORREGIDO
- BUG-BROWSER-04: CatalogPage ignoraba ?category → CORREGIDO
