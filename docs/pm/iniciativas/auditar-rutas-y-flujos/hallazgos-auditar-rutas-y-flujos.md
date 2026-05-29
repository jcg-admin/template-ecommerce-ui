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

---

## Hallazgos de la auditoría de calidad de vistas (2026-05-28)

## HALLAZGO-SCSS-01 — 11 páginas importan SCSS Module que no existe en disco (CRÍTICO)
- **Fecha**: 2026-05-28
- **Severidad**: Alta — crash en webpack al intentar hacer build con esas páginas
- **Descripción**: Las siguientes páginas tienen `import styles from './NombrePage.module.scss'`
  pero el archivo SCSS no existe en el sistema de archivos:
  - AdminProductEditPage.module.scss
  - AdminProductImportPage.module.scss
  - AdminProductVariantsPage.module.scss
  - AdminReportDashboardPage.module.scss
  - AdminReportSalesPage.module.scss
  - AdminReportTopSellersPage.module.scss
  - AdminReportCustomersRfmPage.module.scss
  - AdminShippingMethodsPage.module.scss
  - AdminStaticPagesPage.module.scss
  - AdminStockAlertsPage.module.scss
  - AdminVariantTypesPage.module.scss
- **Impacto**: El build actual con webpack no crashea solo porque esas páginas son
  lazy-loaded y webpack no las compila hasta que el navegador las solicita.
  En el browser, al navegar a esas rutas, se producirá un error de módulo no encontrado.
- **Corrección requerida**: Crear los 11 archivos SCSS con los selectores que cada
  página usa, o convertir los estilos a inline hasta que se diseñen los módulos.

## HALLAZGO-UX-01 — Loading infinito cuando recurso no existe (MEDIO)
- **Fecha**: 2026-05-28
- **Severidad**: Media — el usuario ve un spinner infinito en lugar de un 404 útil
- **Descripción**: ProductPage, OrderSuccessPage y OrderDetailPage usan el patrón:
  ```jsx
  if (isLoading || !product) return <div>Cargando...</div>;
  ```
  Cuando `isLoading` se vuelve `false` y `product` sigue siendo `null` (porque la API
  devolvió 404), el componente queda mostrando el spinner indefinidamente.
- **Corrección**:
  ```jsx
  if (isLoading) return <div>Cargando...</div>;
  if (!product) return <Navigate to="/404" replace />;
  ```

## HALLAZGO-MSW-01 — Endpoints sin mock que causan errores silenciosos (MEDIO)
- **Fecha**: 2026-05-28
- **Severidad**: Media — funciones del UI que no responden en modo demo
- **Descripción**: Los siguientes endpoints son llamados por páginas del UI pero no
  tienen handler en los archivos MSW:
  - DELETE /api/v1/auth/addresses/:id/ — eliminar dirección en AddressesPage
  - PATCH /api/v1/auth/addresses/:id/ — editar dirección existente en AddressesPage
  - GET /api/v1/admin/products/:id/ — cargar producto para AdminProductEditPage
  - GET /api/v1/payments/gateways/ — listar gateways para PaymentSelectionPage
  - GET /api/v1/admin/pages/ — listar páginas CMS para AdminStaticPagesPage
  - GET /api/v1/admin/pages/:slug/ — cargar página CMS para AdminStaticPageEditorPage
  - GET /api/v1/admin/inventory/dashboard/ — métricas para AdminInventoryDashboardPage
  - GET /api/v1/admin/inventory/stock-alerts/ — alertas para AdminStockAlertsPage

## HALLAZGO-ROUTER-05 — AdminConfigPage deshabilitada por rutas inexistentes (MEDIO)
- **Fecha**: 2026-05-28
- **Severidad**: Media
- **Descripción**: AdminConfigPage renderiza sus 3 tarjetas de configuración con
  `aria-disabled="true"` porque las rutas destino no existen en el router.
  Al registrar las páginas huérfanas de configuración (AdminGatewaysPage,
  AdminShippingMethodsPage, AdminSiteSettingsPage) en el router, estas tarjetas
  deben habilitarse quitando el `aria-disabled`.

## HALLAZGO-SLICE-CONFLICT-01 — AdminProductCreatePage importa productsSlice, no adminSlice (MEDIO)
- **Fecha**: 2026-05-28
- **Descripción**: `AdminProductCreatePage` importa `createProduct` de
  `@redux/slices/productsSlice`, pero el thunk `createProduct` fue implementado
  en `adminSlice` en la sesión anterior. Hay ambigüedad sobre qué slice es
  la fuente de verdad para la creación de productos.

---

## HALLAZGO-SCSS-02 — Los SCSS "faltantes" importaban archivos compartidos que ya existían (CORREGIDO)
- **Fecha**: 2026-05-28
- **Severidad**: Media (solo faltaban 3 clases específicas, no 11 archivos)
- **Descripción**: El hallazgo HALLAZGO-SCSS-01 sobreestimó el problema. Al auditar
  minuciosamente los imports, se encontró que las 11 páginas "sin SCSS" importan en
  realidad **5 archivos SCSS compartidos** que ya existían en disco:

  | Archivo compartido | Páginas que lo usan |
  |--------------------|---------------------|
  | AdminProductCreatePage.module.scss (20L) | AdminProductEditPage |
  | AdminBulkPage.module.scss (186L) | AdminProductImportPage |
  | AdminVariantsPage.module.scss (158L) | AdminProductVariantsPage, AdminVariantTypesPage |
  | AdminReportPage.module.scss (109L) | AdminReportDashboardPage, AdminReportSalesPage, AdminReportTopSellersPage, AdminReportCustomersRfmPage |
  | AdminTablePage.module.scss (156L) | AdminShippingMethodsPage, AdminStaticPagesPage, AdminStockAlertsPage |

- **Problema real**: Solo faltaban 3 clases en 2 archivos:
  - `AdminTablePage.module.scss`: faltaba `.actionDelete`
  - `AdminVariantsPage.module.scss`: faltaban `.iconBtnDelete` y `.smallBtnDelete`
    (existían como pseudo-selectores `:hover` pero no como bloques CSS propios,
    lo que causa que CSS Modules devuelva `undefined` al usarlos como className)
- **Corrección adicional**: `RangeSlider.module.scss` usaba `$bg-dark` que no existe
  en el sistema de variables — corregido a `$bg-page` (#0E1400).
- **Estado**: CORREGIDO — `check-scss` pasa con 146 entries limpias, 0 issues.
