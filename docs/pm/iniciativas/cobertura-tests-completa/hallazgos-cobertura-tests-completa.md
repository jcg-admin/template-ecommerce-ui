# Hallazgos: cobertura-tests-completa

## BUG-SLICE-01 — jest.mock cierre incorrecto en 23 slices (CORREGIDO)
- **Fecha**: 2026-05-28
- **Severidad**: Alta (bloqueaba toda la suite)
- **Descripción**: El generador de tests usó f-strings de Python con `{`/`}` que requieren escapado `{{`/`}}`. Esto produjo `});` en lugar de `}));` como cierre del `jest.mock`. Babel fallaba con SyntaxError en línea 12:2 en todos los archivos generados.
- **Archivos afectados**: 23 de 23 slices generados
- **Corrección**: Reemplazar `},\n});\n\nconst makeStore` por `},\n}));\n\nconst makeStore` en todos los archivos.
- **Lección**: Al generar código con f-strings Python que contienen JSX/JS, usar Template strings o raw strings para evitar el escapado de `{` y `}`.

## BUG-SLICE-02 — authSlice.logoutUser no tiene handler pending (DOCUMENTADO)
- **Fecha**: 2026-05-28
- **Severidad**: Baja (solo impacto en el test)
- **Descripción**: `logoutUser` usa `createAsyncThunk('auth/logout')` pero el `extraReducers` solo tiene `.addCase(logoutUser.fulfilled)`. No hay `pending` ni `rejected`. Esto es intencional: el logout siempre tiene éxito localmente aunque el backend falle.
- **Impacto**: El test asumía que `/pending` activaba `isLoading`, pero no hay ese handler.
- **Corrección**: El test fue actualizado para verificar el comportamiento real del `fulfilled`.

## BUG-SLICE-03 — priceSyncSlice.applyCsv activa isApplying, no isLoading (DOCUMENTADO)
- **Fecha**: 2026-05-28
- **Severidad**: Baja
- **Descripción**: `priceSyncSlice` diferencia entre previsualización (`isLoading`) y aplicación (`isApplying`). El test generado asumía que todos los thunks activaban `isLoading`.
- **Corrección**: Test actualizado para verificar `isApplying` en el thunk de `applyCsv`.

## BUG-SLICE-04 — ordersSlice usa isActioning, no isLoading (DOCUMENTADO)
- **Fecha**: 2026-05-28
- **Severidad**: Baja
- **Descripción**: `ordersSlice` usa `handlePending = (state) => { state.isActioning = true; }` para las acciones mutantes (checkout, cancel). El test generado asumía `isLoading`.
- **Corrección**: Tests actualizados para verificar `isActioning`.

## HALLAZGO-SCOPE-01 — FilterSidebar en CatalogPage capturaba closure inválido (CORREGIDO)
- **Fecha**: 2026-05-28
- **Severidad**: Alta (ReferenceError en runtime)
- **Descripción**: `FilterSidebar` es una función definida FUERA de `CatalogPage`. Al integrar `activeOrishas`/`setActiveOrishas` como estado de `CatalogPage`, `FilterSidebar` no tenía acceso al closure — resultando en `ReferenceError: activeOrishas is not defined` en los tests y en producción.
- **Corrección**: `FilterSidebar` fue refactorizado para recibir `{ activeOrishas, setActiveOrishas, activeTypes, setActiveTypes }` como props.

## HALLAZGO-CHARS-01 — Caracteres UTF-8 ─ en Tabs.jsx bloqueaban a Babel (CORREGIDO)
- **Fecha**: 2026-05-28
- **Severidad**: Alta (SyntaxError en todas las suites que importaban Tabs)
- **Descripción**: Los separadores de sección `// ── Tab ──` en Tabs.jsx usaban el carácter U+2500 (─). Babel no puede parsear ese codepoint en ciertos contextos dentro de comentarios JSX.
- **Corrección**: Reemplazar `─` por `-` en todo el archivo con `re.sub(r'─', '-', content)`.

## HALLAZGO-EXPORT-01 — 20 componentes sin named export (CORREGIDO)
- **Fecha**: 2026-05-28
- **Severidad**: Alta (undefined en imports named)
- **Descripción**: Los 20 componentes nuevos e implementados solo tenían `export default`. Cuando `CheckoutPage` importaba `import { Stepper } from '...'`, `Stepper` era `undefined`.
- **Corrección**: Agregado `export { NombreComponente }` al final de todos los archivos afectados.

## HALLAZGO-SIDEBAR-01 — Sidebar desktop renderizaba null con open=false (CORREGIDO)
- **Fecha**: 2026-05-28
- **Severidad**: Alta (links de navigación admin ocultos en DOM)
- **Descripción**: El nuevo Sidebar retornaba `null` cuando `open=false`, pero para desktop el Sidebar es siempre visible — solo cambia CSS. `AdminLayout.navigation.test` fallaba porque los links de "Configuración" y "Logística" no estaban en el DOM.
- **Corrección**: Sidebar no-overlaid siempre monta; `open` controla la clase CSS `sidebarHidden`.

## HALLAZGO-ADMIN-SLICE-01 — Páginas admin usan funciones inexistentes en adminSlice (DEUDA TÉCNICA)
- **Fecha**: 2026-05-28
- **Severidad**: Media (las páginas se cargan pero muestran "sin datos")
- **Descripción**: Varias páginas admin usan funciones de `adminSlice` que no existen en el archivo:
  - `AdminShippingMethodsPage`: `fetchShippingMethods`, `createShippingMethod`, `updateShippingMethod`, `deleteShippingMethod` → no definidas
  - `AdminStaticPagesPage`: `fetchAdminPages` → no definida en el slice exportado
  - `AdminStockAlertsPage`: `fetchStockAlerts` → definida en adminSlice.js línea ~145
  - `AdminProductVariantsPage`: `fetchProductVariants`, `bulkUpdateVariants`, `regenerateVariants` → no definidas
  - `AdminVoucherDetailPage`: `fetchAdminVoucher`, `createVoucher`, `updateVoucher` → no definidas
- **Impacto**: Las páginas muestran "sin datos" o estado vacío porque los thunks no existen en el slice exportado. Los mocks de tests devuelven `{ type: '...' }` en lugar de un async thunk real.
- **Acción requerida**: Implementar los thunks faltantes en `adminSlice.js` o crear slices dedicados (`shippingSlice`, `pagesSlice`, `variantsSlice`).
- **Relacionado**: La auditoría de adminSlice muestra solo 30 thunks — las páginas admin necesitan ~15 más.

## HALLAZGO-QUERY-01 — AdminProductForm y hooks de dominio requieren QueryClientProvider
- **Fecha**: 2026-05-28
- **Severidad**: Media (crashes en tests sin el Provider)
- **Descripción**: `AdminProductForm` importa `useAdminCategories` que usa `react-query` internamente. Sin `QueryClientProvider` en el wrapper del test, el componente crashea con "No QueryClient set".
- **Corrección**: Agregar `QueryClientProvider` en el wrapper de los tests afectados.
- **Afectados**: `AdminProductForm`, `useSearch`, potencialmente otros hooks de dominio.

---

## Resumen final de hallazgos

| ID | Categoría | Severidad | Estado |
|----|-----------|-----------|--------|
| BUG-SLICE-01 | jest.mock mal cerrado en 23 slices | Alta | CORREGIDO |
| BUG-SLICE-02 | authSlice.logout sin handler pending | Baja | DOCUMENTADO |
| BUG-SLICE-03 | priceSyncSlice.applyCsv usa isApplying | Baja | DOCUMENTADO |
| BUG-SLICE-04 | ordersSlice usa isActioning no isLoading | Baja | DOCUMENTADO |
| HALLAZGO-SCOPE-01 | FilterSidebar sin acceso al closure | Alta | CORREGIDO |
| HALLAZGO-CHARS-01 | UTF-8 ─ en Tabs.jsx bloqueaba a Babel | Alta | CORREGIDO |
| HALLAZGO-EXPORT-01 | 20 componentes sin named export | Alta | CORREGIDO |
| HALLAZGO-SIDEBAR-01 | Sidebar desktop renderizaba null | Alta | CORREGIDO |
| HALLAZGO-ADMIN-SLICE-01 | Páginas admin usan funciones no implementadas | Media | DEUDA TÉCNICA |
| HALLAZGO-QUERY-01 | Hooks que usan react-query necesitan QueryClientProvider | Media | DOCUMENTADO |

## Métricas finales

| Métrica | Inicio sesión | Final sesión |
|---------|--------------|--------------|
| Tests pasando | 999 | **1331** (+332) |
| Tests fallando | 0 | **0** |
| Tests skipped | 109 | **109** |
| Total tests | 1108 | **1440** |
| Páginas sin test | 17 | **0** |
| Slices sin test | 23 | **0** |
| Hooks dominio sin test | 29 | **0** |
| Hooks utils sin test | 12 | **0** |
| SCSS issues | 0 | **0** |
