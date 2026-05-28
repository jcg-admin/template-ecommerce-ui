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
