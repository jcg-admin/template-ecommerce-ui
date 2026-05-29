# Registro de bugs — corregir-bugs-detectados

Auditoría ejecutada: 2026-05-29
Metodología: lectura de código + cruce automatizado selector vs initialState vs exports.
BUG-TH-04 eliminado como falso positivo tras verificación exhaustiva.

---

## CRÍTICOS — crash o flujo roto

---

### BUG-RT-01 — /confirmacion (typo) vs /confirmation en el router

| Campo | Valor |
|-------|-------|
| ID | BUG-RT-01 |
| Severidad | CRÍTICA |
| Estado | CORREGIDO — Fase 1 |
| Archivo(s) | CheckoutPage.jsx, ExpressCheckoutPage.jsx, PaymentReturnPage.jsx |
| Verificado | Sí — lectura directa del código |

**Síntoma:** Cualquier usuario que completa una compra es redirigido a `/404`
en lugar de ver la confirmación del pedido.

**Causa:** El router registra `order/:id/confirmation` (inglés).
Las páginas navegan a `/order/.../confirmacion` (español):

```jsx
// CheckoutPage.jsx L55
navigate(`/order/${order.order_number}/confirmacion`);   // ← typo

// ExpressCheckoutPage.jsx
navigate(`/order/${result.order_number}/confirmacion`);  // ← typo

// PaymentReturnPage.jsx
navigate(`/order/${id}/confirmacion`);                   // ← typo
```

**Fix:** Cambiar las 3 páginas de `confirmacion` → `confirmation`.
No cambiar el router porque `confirmation` es el término correcto en el código base.

---

## ALTOS — datos vacíos, acciones no-ops, state no actualizado

---

### BUG-SL-01 — AdminInventoryDashboardPage usa selector inexistente

| Campo | Valor |
|-------|-------|
| ID | BUG-SL-01 |
| Severidad | ALTA |
| Estado | CORREGIDO — Fase 4 |
| Archivo | src/pages/admin/AdminInventoryDashboardPage.jsx |
| Verificado | Sí |

**Síntoma:** Página de dashboard de inventario muestra siempre vacía.

**Causa:**
```jsx
// JSX — INCORRECTO
const data = useSelector((s) => s.admin?.inventory);

// adminSlice.initialState tiene:
inventoryDashboard: null,   // ← clave real
stockAlerts:        [],
isLoadingInventory: false,
```

**Fix:** `s.admin?.inventory` → `s.admin?.inventoryDashboard`

**Bug adicional relacionado (BUG-TH-03):** Aunque se corrija el selector,
`fetchInventoryDashboard` no tiene `addCase` en adminSlice, por lo que nunca
actualiza `inventoryDashboard`. Ambos bugs deben corregirse juntos.

---

### BUG-SL-02 — AdminUsersPage usa isLoadingUsers inexistente

| Campo | Valor |
|-------|-------|
| ID | BUG-SL-02 |
| Severidad | ALTA |
| Estado | CORREGIDO — Fase 4 |
| Archivo | src/pages/admin/AdminUsersPage.jsx |
| Verificado | Sí |

**Causa:**
```jsx
// JSX — INCORRECTO
const isLoading = useSelector((s) => s.admin?.isLoadingUsers);  // → undefined

// adminSlice — fetchAdminUsers.pending hace:
state.isLoading = true;  // ← clave real
```

**Fix:** `s.admin?.isLoadingUsers` → `s.admin?.isLoading`

---

### BUG-SL-03 — AdminSiteSettingsPage usa siteSettings inexistente

| Campo | Valor |
|-------|-------|
| ID | BUG-SL-03 |
| Severidad | ALTA |
| Estado | CORREGIDO — Fase 5 (addCase + siteSettings en initialState) |
| Archivo | src/pages/admin/AdminSiteSettingsPage.jsx |
| Verificado | Sí |

**Causa:**
```jsx
// JSX — INCORRECTO
const settings = useSelector((s) => s.admin?.siteSettings);  // → undefined
```

`adminSlice` no tiene `siteSettings` en `initialState` y `fetchSiteSettings.fulfilled`
no tiene `addCase` → el state nunca se actualiza.

**Fix:**
1. Agregar `siteSettings: null` al `initialState` de `adminSlice`
2. Agregar `.addCase(fetchSiteSettings.fulfilled, (state, action) => { state.siteSettings = action.payload; })`
3. La página ya usa el selector correcto una vez que el state exista

---

### BUG-SL-04 — AdminVoucherDetailPage usa voucherChangelog inexistente

| Campo | Valor |
|-------|-------|
| ID | BUG-SL-04 |
| Severidad | ALTA |
| Estado | CORREGIDO — Fase 5 (addCase + voucherChangelog en initialState) |
| Archivo | src/pages/admin/AdminVoucherDetailPage.jsx |
| Verificado | Sí |

**Causa:**
```jsx
// JSX — INCORRECTO
const changelog = useSelector((s) => s.admin?.voucherChangelog || []);
```

`adminSlice` no tiene `voucherChangelog` en `initialState` ni en ningún reducer.
No existe el thunk para cargarlo.

**Fix:**
1. Agregar `voucherChangelog: []` al `initialState` de `adminSlice`
2. Crear thunk `fetchVoucherChangelog(id)` → `GET /api/v1/admin/vouchers/:id/changelog/`
3. Agregar su `addCase`
4. Agregar handler MSW para ese endpoint

---

### BUG-SL-05 — OrderEditPage usa isLoadingDetail inexistente

| Campo | Valor |
|-------|-------|
| ID | BUG-SL-05 |
| Severidad | ALTA |
| Estado | CORREGIDO — Fase 4 |
| Archivo | src/pages/account/OrderEditPage.jsx |
| Verificado | Sí |

**Causa:** Mismo patrón que BUG-BROWSER-01 (ya corregido en OrderDetailPage en Fase 4).
```jsx
// JSX — INCORRECTO
const isLoading = useSelector((s) => s.orders?.isLoadingDetail);  // → undefined

// ordersSlice.initialState:
isLoading: false,  // ← clave real
```

**Fix:** `s.orders?.isLoadingDetail` → `s.orders?.isLoading`

---

### BUG-TH-01 — AddressesPage importa thunks de authSlice que no existen ahí

| Campo | Valor |
|-------|-------|
| ID | BUG-TH-01 |
| Severidad | ALTA |
| Estado | CORREGIDO — Fase 2 |
| Archivo | src/pages/account/AddressesPage.jsx |
| Verificado | Sí |

**Síntoma:** Las acciones de crear dirección, eliminar y establecer predeterminada
son silenciosamente no-ops. El usuario hace clic y no pasa nada.

**Causa:**
```jsx
// AddressesPage.jsx — INCORRECTO
import {
  fetchAddresses, createAddress, deleteAddress, setDefaultAddress,
} from '@redux/slices/authSlice';
// authSlice solo exporta fetchAddresses
// createAddress, deleteAddress, setDefaultAddress → undefined → dispatch(undefined) → no-op
```

**Corrección:**
```jsx
import { fetchAddresses }                           from '@redux/slices/authSlice';
import { createAddress, deleteAddress, setDefaultAddress } from '@redux/slices/addressesSlice';
```

**Nota:** `addressesSlice` también maneja su propio `items` en lugar de
`auth.user.addresses`. El selector de la página también necesita actualizarse
de `s.auth?.user?.addresses` a `s.addresses?.items`.

---

### BUG-TH-02 — CheckoutPage importa createOrder de paymentsSlice (no existe ahí)

| Campo | Valor |
|-------|-------|
| ID | BUG-TH-02 |
| Severidad | ALTA |
| Estado | CORREGIDO — Fase 2 |
| Archivo | src/pages/checkout/CheckoutPage.jsx |
| Verificado | Sí |

**Síntoma:** Al hacer clic en "Pagar" el formulario no hace nada — `createOrder`
es `undefined` y `dispatch(undefined(...))` es un no-op silencioso.

**Causa:**
```jsx
// CheckoutPage.jsx L18 — INCORRECTO
import { createOrder, initiatePayment } from '@redux/slices/paymentsSlice';
// paymentsSlice NO exporta createOrder
// createOrder está en checkoutSlice
```

**Corrección:**
```jsx
import { createOrder }     from '@redux/slices/checkoutSlice';
import { initiatePayment } from '@redux/slices/paymentsSlice';
```

---

### BUG-TH-03 — fetchInventoryDashboard y fetchStockAlerts sin addCase en adminSlice

| Campo | Valor |
|-------|-------|
| ID | BUG-TH-03 |
| Severidad | ALTA |
| Estado | CORREGIDO — Fase 5 |
| Archivos | src/redux/slices/adminSlice.js |
| Páginas afectadas | AdminInventoryDashboardPage, AdminStockAlertsPage |
| Verificado | Sí |

**Causa:** Los dos thunks están definidos y exportados en `adminSlice.js` pero
no tienen `.addCase()` en el `extraReducers`. Cuando resuelven, el state nunca
se actualiza — `inventoryDashboard` permanece `null` y `stockAlerts` permanece `[]`.

**Fix:**
```javascript
// adminSlice.js — agregar en extraReducers:
.addCase(fetchInventoryDashboard.pending,   (state) => { state.isLoadingInventory = true; })
.addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
  state.isLoadingInventory = false;
  state.inventoryDashboard = action.payload;
})
.addCase(fetchInventoryDashboard.rejected,  (state) => { state.isLoadingInventory = false; })

.addCase(fetchStockAlerts.pending,   (state) => { state.isLoadingAlerts = true; })
.addCase(fetchStockAlerts.fulfilled, (state, action) => {
  state.isLoadingAlerts = false;
  state.stockAlerts = action.payload?.results ?? action.payload ?? [];
})
.addCase(fetchStockAlerts.rejected,  (state) => { state.isLoadingAlerts = false; })
```

---

## MEDIOS — UX degradada

---

### BUG-LB-01 — AddressesPage importa LoadingButton de barrel incorrecto

| Campo | Valor |
|-------|-------|
| ID | BUG-LB-01 |
| Severidad | MEDIA |
| Estado | CORREGIDO — Fase 3 |
| Archivo | src/pages/account/AddressesPage.jsx |
| Verificado | Sí |

**Síntoma:** El botón "Guardar dirección" renderiza como `undefined` → error en consola,
el botón no aparece o crashea el componente.

**Causa:**
```jsx
// INCORRECTO — LoadingButton no está en primitives
import { MetaTag, Button, Field, LoadingButton } from '@components/common/primitives';

// CORRECTO
import { MetaTag, Button, Field } from '@components/common/primitives';
import { LoadingButton }           from '@components/common';
```

**Regla:** `LoadingButton`, `Alert`, `Modal`, `Dropdown`, `Tooltip`, `Offcanvas`,
`RangeSlider`, `MultiSelect`, `Autocomplete`, `Chip`, `ChipInput`, `DatePicker`,
`DateRangePicker`, `TimePicker`, `Stepper`, `Carousel`, `Collapse`, `ScrollSpy`,
`Toast`, `Popover` → desde `@components/common`.
Solo `Button`, `Field`, `MetaTag`, `Price`, `SumRow`, `EmptyState`, `StepPanel`,
`Tab`, `TabList`, `TabPanel`, `CarouselSlide` → desde `@components/common/primitives`.

---

### BUG-RT-02 — 7 rutas /info/* usadas en links pero no registradas en el router

| Campo | Valor |
|-------|-------|
| ID | BUG-RT-02 |
| Severidad | MEDIA |
| Estado | CORREGIDO — Fase 6 |
| Verificado | Sí |

**Síntoma:** Los links de "Términos", "Privacidad", "Sobre Ifa", "Envíos", "Santoral"
llevan al usuario a `/404`.

| Ruta | Usada en | Tipo de contenido |
|------|---------|-------------------|
| `/info/ifa` | HomePage | Página informativa Ifá |
| `/info/santoral` | OrderSuccessPage | Santoral de òrìsà |
| `/info/envios` | CheckoutPage | Política de envíos |
| `/info/privacidad` | CheckoutPage | Aviso de privacidad (español) |
| `/info/terminos` | CheckoutPage | Términos de uso (español) |
| `/info/terms` | RegisterPage | Terms of use (inglés) |
| `/info/privacy` | RegisterPage | Privacy policy (inglés) |

**Fix opciones:**
- A) Crear páginas estáticas en `/info/:slug` usando `AdminStaticPagesPage` como template
- B) Unificar los links duplicados (terminos/terms, privacidad/privacy)
  y apuntar a `/admin/pages/:slug` en modo demo

---

### BUG-RT-03 — AdminInventoryDashboardPage enlaza a /admin/inventory/alertas (typo)

| Campo | Valor |
|-------|-------|
| ID | BUG-RT-03 |
| Severidad | MEDIA |
| Estado | CORREGIDO — Fase 1 |
| Archivo | src/pages/admin/AdminInventoryDashboardPage.jsx |
| Verificado | Sí |

**Causa:**
```jsx
<Link to="/admin/inventory/alertas">    {/* ← typo: "alertas" es español */}
// La ruta registrada en el router es:
// /admin/inventory/stock-alerts
```

**Fix:** `to="/admin/inventory/alertas"` → `to="/admin/inventory/stock-alerts"` (2 ocurrencias)

---

### BUG-CONF-01 — window.confirm en 10 páginas bloquea el hilo UI

| Campo | Valor |
|-------|-------|
| ID | BUG-CONF-01 |
| Severidad | MEDIA |
| Estado | PENDIENTE |
| Verificado | Sí |

**Síntoma:** Al intentar eliminar o ejecutar una acción destructiva, el browser
muestra un diálogo nativo que:
- No se puede estilizar
- Bloquea el hilo principal
- En algunos contextos (iframes, ciertas configuraciones) está bloqueado por política

**Páginas (12 usos en 10 archivos):**

| Página | Usos | Contexto |
|--------|------|---------|
| SearchHistoryPage | 1 | Limpiar historial |
| AdminCategoriesPage | 1 | Eliminar categoría |
| AdminProductDetailPage | 1 | Eliminar producto |
| AdminProductDiscountsPage | 1 | Eliminar descuento |
| AdminProductVariantsPage | 1 | Eliminar variante |
| AdminProductsPage | 1 | Eliminar producto de lista |
| AdminShippingMethodsPage | 1 | Eliminar método de envío |
| AdminStaticPageEditorPage | 2 | Descartar cambios / restaurar versión |
| AdminVariantTypesPage | 2 | Eliminar tipo / eliminar opción |
| AdminVoucherDetailPage | 1 | Eliminar voucher |

**Fix:** Reemplazar cada `window.confirm(...)` por el componente `Modal` de ui-core:
```jsx
<Modal open={showConfirm} onClose={() => setShowConfirm(false)}
  centered size="sm" backdrop="static">
  <p>{mensaje}</p>
  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
    <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
    <LoadingButton variant="danger" onClick={handleConfirmedAction}>Confirmar</LoadingButton>
  </div>
</Modal>
```

---

## BAJOS / ANTIPATRONES — no críticos

---

### BUG-SL-06 — searchHistory no declarada en initialState de catalogSlice (antipatrón)

| Campo | Valor |
|-------|-------|
| ID | BUG-SL-06 |
| Severidad | BAJA (antipatrón) |
| Estado | PENDIENTE |
| Archivo | src/redux/slices/catalogSlice.js |
| Verificado | Sí — Redux crea la clave dinámicamente en el primer dispatch |

**Descripción:**
`catalogSlice` tiene thunks `fetchSearchHistory`, `deleteSearchTerm` y `clearSearchHistory`
con sus `addCase` correctos, pero `searchHistory` e `isLoadingSearchHistory` no están
declaradas en `initialState`. Redux Toolkit las crea en el state al primer dispatch
pero TypeScript y las herramientas de dev tools pueden no reconocerlas.

**Fix:**
```javascript
// catalogSlice.js initialState — agregar:
searchHistory:          [],
isLoadingSearchHistory: false,
```

---

### BUG-MSW-01 — count = results.length en handlers con paginación real

| Campo | Valor |
|-------|-------|
| ID | BUG-MSW-01 |
| Severidad | BAJA (parcial) |
| Estado | PENDIENTE |
| Verificado | Parcial — solo afecta si el componente usa totalPages calculado desde count |

**Descripción:**
Varios handlers devuelven `count: results.length` (items de la página)
en lugar de `count: total` (todos los registros). Esto hace que cualquier componente
que calcule `totalPages = Math.ceil(count / pageSize)` obtenga 1 y no muestre paginador.

**Handlers prioritarios a corregir** (tienen paginación en el componente):

| Handler | Endpoint |
|---------|---------|
| admin.ts | `GET /api/v1/admin/users/` |
| admin.ts | `GET /api/v1/admin/vouchers/` |
| support.ts | `GET /api/v1/support/tickets/` |
| support.ts | `GET /api/v1/admin/support/tickets/` |
| returns.ts | `GET /api/v1/returns/` |
| returns.ts | `GET /api/v1/admin/returns/` |

**Patrón de fix** (ya aplicado en catalog.ts):
```typescript
// ANTES
count: results.length,
// DESPUÉS
count: total,          // total = all.length antes de paginar
next:     page < pages ? `/api/.../?page=${page + 1}` : null,
previous: page > 1    ? `/api/.../?page=${page - 1}` : null,
```

---

### BUG-LOG-01 — console.error en CheckoutPage

| Campo | Valor |
|-------|-------|
| ID | BUG-LOG-01 |
| Severidad | BAJA |
| Estado | PENDIENTE |
| Archivo | src/pages/checkout/CheckoutPage.jsx |
| Verificado | Sí |

```jsx
} catch (err) {
  console.error(err);   // ← fuga de debug introducida en Fase 6
  setOrderError(err?.message || '...');
  setSubmitting(false);
}
```

**Fix:** Eliminar `console.error(err)` — el error ya se muestra al usuario
vía `Alert` y se registra en el state `orderError`.

---

## Bugs descartados (falsos positivos)

| ID original | Razón del descarte |
|-------------|-------------------|
| BUG-TH-04 | Todos los `clearXxxActionState` existen en sus slices — el auditor inicial no los encontró porque buscaba como exports named y son actions del slice |

---

## Verificación de la auditoría

| Categoría auditada | Resultado |
|-------------------|-----------|
| Selectores JSX vs initialState de slice | 6 bugs reales, 1 antipatrón |
| Imports de thunks vs exports del slice | 3 bugs reales, 1 falso positivo |
| Imports de componentes ui-core | 1 bug real |
| Rutas en navigate/Link vs router | 3 bugs reales |
| window.confirm | 1 bug, 12 ocurrencias |
| MSW handlers — count field | 1 bug parcial |
| Console.log/error | 1 fuga de debug |

---

## HALLAZGOS DE FASE 1

---

### HALLAZGO-F1-01 — 7 ocurrencias de "confirmacion" en el proyecto, solo 3 eran bugs de ruta

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F1-01 |
| Fecha | 2026-05-29 |
| Fase | F1 |
| Tipo | Hallazgo de auditoría — falsos positivos potenciales evitados |

**Descripción:**
Antes de aplicar ningún reemplazo se buscaron TODAS las ocurrencias de
`confirmacion` en el proyecto para evitar corregir texto legítimo.
Se encontraron 7 ocurrencias:

| Archivo | Línea | Contenido | Es bug? |
|---------|-------|-----------|---------|
| `checkout/CheckoutPage.jsx` | L57 | `navigate(.../confirmacion)` | **SÍ** |
| `checkout/ExpressCheckoutPage.jsx` | L38 | `navigate(.../confirmacion)` | **SÍ** |
| `checkout/PaymentReturnPage.jsx` | L37 | `navigate(.../confirmacion, ...)` | **SÍ** |
| `admin/AdminNewsletterSubscribersPage.jsx` | L16 | `'Pendiente confirmacion'` (status label) | No |
| `account/ChangePasswordPage.jsx` | L6 | `* confirmacion.` (comentario JSDoc) | No |
| `checkout/OrderSuccessPage.jsx` | L4 | `* /pedido/:id/confirmacion` (comentario) | No |
| `router/AppRouter.jsx` | L184 | `la confirmacion quedan publicas` (comentario) | No |

**Corrección aplicada:** Solo las 3 líneas con `navigate()`. Los 4 textos
legítimos no fueron tocados.

**Lección:** Buscar todas las ocurrencias del string en el proyecto antes
de hacer cualquier reemplazo. Un `str.replace()` global habría corrompido
4 archivos adicionales.

---

### HALLAZGO-F1-02 — PaymentReturnPage.test.jsx hardcodeaba la ruta incorrecta

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F1-02 |
| Fecha | 2026-05-29 |
| Fase | F1 |
| Tipo | Test roto por bug — enmascaraba el bug original |

**Descripción:**
Al correr los tests después de los fixes, `PaymentReturnPage.test.jsx`
falló porque su assertion esperaba la ruta **incorrecta**:

```javascript
// tests/unit/pages/PaymentReturnPage.test.jsx L57 — ANTES (incorrecto)
expect(mockNavigate).toHaveBeenCalledWith(
  '/order/PY-0042/confirmacion',    // ← el test validaba el bug, no el comportamiento correcto
  { replace: true }
);

// DESPUÉS (correcto)
expect(mockNavigate).toHaveBeenCalledWith(
  '/order/PY-0042/confirmation',
  { replace: true }
);
```

**Implicación:** El test estaba pasando con el bug presente porque verificaba
el comportamiento incorrecto. Si el test hubiera usado la ruta correcta desde
el principio, habría detectado el bug de `PaymentReturnPage` desde el commit
que lo introdujo.

**Corrección:** Actualizar la assertion del test a `/confirmation`.

---

### HALLAZGO-F1-03 — BUG-RT-03 tenía exactamente 2 ocurrencias, no 1

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F1-03 |
| Fecha | 2026-05-29 |
| Fase | F1 |
| Tipo | Hallazgo de auditoría — alcance mayor al documentado |

**Descripción:**
El plan original documentaba BUG-RT-03 como "2 ocurrencias" y el registro
lo confirmó. Ambas en `AdminInventoryDashboardPage.jsx`:

```jsx
// L42 — botón principal del header
<Link to="/admin/inventory/alertas">
  Ver stock en alerta →
</Link>

// L62 — link secundario en la tarjeta de KPIs
<Link to="/admin/inventory/alertas" className={styles.cardLink}>
  Ver alertas →
</Link>
```

Ambas corregidas a `/admin/inventory/stock-alerts`.

La ruta registrada en el router era `admin/inventory/stock-alerts`
(sin `/` inicial, relativa — el router de React usa paths relativos).

---

### RESUMEN EJECUTIVO FASE 1

| Métrica | Valor |
|---------|-------|
| Bugs corregidos | 2 (BUG-RT-01 y BUG-RT-03) |
| Archivos de página modificados | 4 |
| Archivos de test modificados | 1 (PaymentReturnPage.test.jsx) |
| Ocurrencias de `confirmacion` evaluadas | 7 (3 corregidas, 4 ignoradas) |
| Ocurrencias de `/alertas` corregidas | 2 |
| Falsos positivos evitados | 4 (texto legítimo no tocado) |
| Tests regresionados | 0 |
| Tests totales | 1330 pasando, 0 fallos |

---

## HALLAZGOS DE FASE 2

---

### HALLAZGO-F2-01 — addressesSlice NO estaba registrado en el store

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F2-01 |
| Fecha | 2026-05-29 |
| Fase | F2 |
| Tipo | Bug adicional descubierto durante la corrección de BUG-TH-01 |
| Severidad | ALTA |

**Descripción:**
Al investigar BUG-TH-01 se encontró que `addressesSlice` no estaba
registrado en `store.js`. El comentario en el encabezado del slice lo
confirma: *"Las lecturas usan useAddresses (React Query)"*.

Esto significa que incluso si AddressesPage hubiera importado
`createAddress` correctamente desde `addressesSlice`, el thunk se habría
ejecutado (el POST a la API sí llegaría) pero el state de Redux nunca
se habría actualizado en `s.addresses?.items`.

**Inventario del estado previo:**

| Thunk | Importado desde | Existe ahí | Efecto |
|-------|----------------|-----------|--------|
| `fetchAddresses` | `authSlice` | SÍ | Fetch OK pero sin addCase → state no cambia |
| `createAddress` | `authSlice` | NO | `undefined` → dispatch es no-op total |
| `deleteAddress` | `authSlice` | NO | `undefined` → dispatch es no-op total |
| `setDefaultAddress` | `authSlice` | NO | `undefined` → dispatch es no-op total |

**Cómo se veían las addresses a pesar del bug:**
`fetchProfile` (que sí tiene addCase en authSlice) devuelve el user completo
incluyendo `user.addresses`. AddressesPage lee `s.auth?.user?.addresses`,
que se llena con el perfil. Por eso las addresses aparecen — pero no se
pueden modificar.

**Fix aplicado:**
1. Registrar `addressesReducer` en `store.js`
2. Mantener `fetchAddresses` en authSlice (correcto — actualiza user)
3. Mover `createAddress`, `deleteAddress`, `setDefaultAddress` a `addressesSlice`

---

### HALLAZGO-F2-02 — fetchAddresses en authSlice existe pero no tiene addCase

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F2-02 |
| Fecha | 2026-05-29 |
| Fase | F2 |
| Tipo | Bug latente — no crítico porque fetchProfile cubre la misma información |
| Severidad | BAJA |

**Descripción:**
`authSlice` exporta `fetchAddresses` como thunk pero no tiene `.addCase()`
en `extraReducers`. Cuando se dispache, el request HTTP sí se ejecuta
pero el state nunca se actualiza.

En la práctica no es visible porque `fetchProfile` ya carga el user completo
incluyendo `user.addresses`. AddressesPage llama ambos en `useEffect` —
el primero que resuelva (fetchProfile) llena el selector.

**Fix sugerido (fuera del scope de F2):**
Agregar en authSlice:
```javascript
.addCase(fetchAddresses.fulfilled, (state, action) => {
  if (state.user) {
    state.user.addresses = action.payload?.results ?? action.payload ?? [];
  }
})
```

---

### HALLAZGO-F2-03 — addressesSlice usa React Query para lecturas, no Redux

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F2-03 |
| Fecha | 2026-05-29 |
| Fase | F2 |
| Tipo | Hallazgo arquitectónico — patrón mixto Redux + React Query |

**Descripción:**
El encabezado de `addressesSlice.js` declara explícitamente:
*"Mutaciones (crear / actualizar / eliminar / set-default) en este slice.
Las lecturas usan useAddresses (React Query)."*

Esto explica por qué el slice no estaba en el store: las lecturas
de addresses no pasan por Redux en absoluto, sino por React Query (`useAddresses`).
Solo las mutaciones pasan por Redux.

**Implicación para el selector en AddressesPage:**
`s.auth?.user?.addresses` sigue siendo el selector correcto para mostrar
las addresses en la UI. El slice de Redux solo gestiona el estado de las
mutaciones (`isActioning`, `actionError`, `lastAction`).

**Implicación del fix:**
`s.addresses?.isActioning` ahora es accesible para mostrar un spinner
durante crear/eliminar/setDefault — mejora de UX disponible sin más cambios.

---

### HALLAZGO-F2-04 — CheckoutPage tenía dos thunks mezclados de slices distintos en un solo import

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F2-04 |
| Fecha | 2026-05-29 |
| Fase | F2 |
| Tipo | Bug verificado — causa directa de que el botón "Pagar" era no-op |
| Severidad | CRÍTICA efectiva |

**Descripción:**
```jsx
// ANTES — un solo import mezclando dos responsabilidades en el slice equivocado
import { createOrder, initiatePayment } from '@redux/slices/paymentsSlice';
//        ↑ no existe ahí              ↑ sí existe
```

`createOrder` es `undefined` cuando se importa de `paymentsSlice`.
`dispatch(createOrder({...}))` equivale a `dispatch(undefined({...}))` —
en Redux Toolkit esto lanza un TypeError en el thunkMiddleware que se captura
silenciosamente. El `try/catch` del componente atrapa el error pero
`orderError` no se mostraba antes de que se agregara el Alert en Fase 6.

El flujo completo de compra (crear orden → iniciar pago → redirect) nunca
se ejecutaba.

**Fix:**
```jsx
// DESPUÉS — imports separados y semánticamente correctos
import { createOrder }     from '@redux/slices/checkoutSlice';
import { initiatePayment } from '@redux/slices/paymentsSlice';
```

---

### RESUMEN EJECUTIVO FASE 2

| Métrica | Valor |
|---------|-------|
| Bugs corregidos | 2 (BUG-TH-01 y BUG-TH-02) |
| Archivos modificados | 3 (store.js, AddressesPage.jsx, CheckoutPage.jsx) |
| Bugs adicionales descubiertos | 2 (addressesSlice sin registrar, fetchAddresses sin addCase) |
| Tests regresionados | 0 |
| Tests totales | 1330 pasando, 0 fallos |

**Impacto real de los fixes:**
- `createOrder` ahora funciona → el flujo completo de compra opera correctamente
- `createAddress`, `deleteAddress`, `setDefaultAddress` ahora ejecutan sus requests API
- `s.addresses?.isActioning` disponible para mejorar UX (fuera de scope de F2)

---

## HALLAZGOS DE LA AUDITORÍA DE FASE 2

---

### HALLAZGO-AUD-F2-01 — MSW faltaba handler POST /api/v1/auth/addresses/:id/set-default/

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F2-01 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría post-Fase 2 |
| Tipo | Bug MSW nuevo — detectado al cruzar URLs del thunk vs handlers existentes |
| Severidad | MEDIA — setDefaultAddress ejecutaría la API real pero fallaría en demo |
| Estado | CORREGIDO en la misma auditoría |

**Descripción:**
Al auditar las URLs de API de `addressesSlice` contra los handlers MSW de
`storefront.ts`, se encontró que `setDefaultAddress` usa
`POST /api/v1/auth/addresses/:id/set-default/` pero dicho handler no existía.

Los otros dos thunks de mutación tenían su handler:
- `createAddress` → `POST /api/v1/auth/addresses/` → OK
- `deleteAddress` → `DELETE /api/v1/auth/addresses/:id/` → OK
- `setDefaultAddress` → `POST /api/v1/auth/addresses/:id/set-default/` → **FALTABA**

**Consecuencia en el browser demo:**
El usuario hacía clic en "Establecer como predeterminada" → MSW no interceptaba
la petición → error de red → el estado de `isActioning` quedaba atascado en `true`
→ el botón no respondía más.

**Corrección:**
```typescript
// storefront.ts — agregado:
http.post('/api/v1/auth/addresses/:id/set-default/', ({ params }) => {
  const id  = Number(params.id);
  const idx = _addresses.findIndex((a) => a.id === id);
  if (idx < 0) return HttpResponse.json({ detail: 'No encontrada' }, { status: 404 });
  _addresses.forEach((a) => { a.is_default = (a.id === id); });
  return HttpResponse.json(_addresses[idx]);
})
```

---

### HALLAZGO-AUD-F2-02 — checkoutSlice usa /api/orders/ sin prefijo /v1/ (antipatrón)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F2-02 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría post-Fase 2 |
| Tipo | Antipatrón de URL — no es un bug funcional |
| Severidad | BAJA — el MSW tiene el handler con la URL correcta, funciona en demo |
| Estado | DOCUMENTADO — corrección fuera del scope de Fase 2 |

**Descripción:**
`checkoutSlice` usa `POST /api/orders/` mientras que el resto del proyecto
usa el prefijo `/api/v1/`. El MSW en `checkout.ts` también registra el handler
en `/api/orders/`, por lo que en el demo funciona correctamente.

```javascript
// checkoutSlice.js
const res = await apiService.post('/api/orders/', payload);  // sin /v1/

// Consistente con el handler MSW:
http.post('/api/orders/', ...)  // también sin /v1/
```

En producción, si el backend usa `/api/v1/orders/`, habrá un 404. Se registra
como deuda técnica para alinear en la integración con el backend real.

---

### RESUMEN DE LA AUDITORÍA DE FASE 2

| Verificación | Resultado |
|-------------|-----------|
| addressesReducer en store | OK |
| createAddress/deleteAddress/setDefaultAddress → addressesSlice | OK |
| addCase de los 3 thunks en addressesSlice | OK |
| fetchAddresses → authSlice | OK |
| createOrder → checkoutSlice | OK |
| initiatePayment → paymentsSlice | OK |
| MSW: POST /api/orders/ para createOrder | OK |
| MSW: POST /api/v1/auth/addresses/ para createAddress | OK |
| MSW: DELETE /api/v1/auth/addresses/:id/ para deleteAddress | OK |
| MSW: PATCH /api/v1/auth/addresses/:id/ para updateAddress | OK |
| MSW: POST /api/v1/auth/addresses/:id/set-default/ | FALTABA → CORREGIDO |
| Sin residuos de imports incorrectos en otras páginas | OK |
| fetchAddresses sin addCase en authSlice | Antipatrón — ya documentado F2-02 |
| checkoutSlice URL sin /v1/ | Antipatrón — funciona en demo |

**9 de 9 fixes de Fase 2 correctos. 1 bug adicional encontrado y corregido.**

---

## HALLAZGOS DE FASE 3

---

### HALLAZGO-F3-01 — 3 estilos de import de LoadingButton coexisten en el proyecto

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F3-01 |
| Fecha | 2026-05-29 |
| Fase | F3 |
| Tipo | Inconsistencia — no es bug, es antipatrón |
| Severidad | BAJA |
| Estado | DOCUMENTADO |

**Descripción:**
La auditoría global encontró 3 estilos distintos de importar `LoadingButton`
en el proyecto, de los cuales 2 funcionan y 1 era el bug:

| Estilo | Ejemplo | Funciona | Páginas |
|--------|---------|---------|---------|
| Named desde barrel (preferido) | `import { LoadingButton } from '@components/common'` | Sí | CartPage, AddressesPage (tras fix) |
| Default directo (funciona) | `import LoadingButton from '@components/common/LoadingButton/LoadingButton'` | Sí | LoginPage, RegisterPage, CheckoutPage |
| Named desde primitives (bug) | `import { LoadingButton } from '@components/common/primitives'` | No | AddressesPage (corregido) |

El estilo "default directo" funciona porque el archivo existe en esa ruta,
pero no usa el barrel — si el componente se moviera o renombrara, habría
que actualizar cada import por separado en lugar de solo el barrel.

**Recomendación:** Unificar a `import { LoadingButton } from '@components/common'`
en LoginPage, RegisterPage y CheckoutPage en una sesión de limpieza posterior.
No es urgente — los 3 funcionan correctamente.

---

### HALLAZGO-F3-02 — Alert no tiene el mismo bug (auditoría preventiva)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F3-02 |
| Fecha | 2026-05-29 |
| Fase | F3 |
| Tipo | Auditoría preventiva — resultado limpio |

**Descripción:**
Se auditó preventivamente si `Alert` (otro componente de `@components/common`
que no está en `primitives`) estaba siendo importado desde el barrel incorrecto
en alguna página. Resultado: ninguna página tiene este bug.

`Alert` está correctamente exportado desde `@components/common`:
```javascript
export { default as Alert } from './Alert/Alert';
```

---

### RESUMEN EJECUTIVO FASE 3

| Métrica | Valor |
|---------|-------|
| Bug corregido | BUG-LB-01 |
| Archivo modificado | account/AddressesPage.jsx (L16 separado en L16+L17) |
| Páginas auditadas globalmente | 99 |
| Páginas con el mismo bug | 0 (solo AddressesPage) |
| Estilos de import de LoadingButton encontrados | 3 (2 válidos, 1 bug) |
| Tests regresionados | 0 |
| Tests totales | 1330 pasando, 0 fallos |

---

## HALLAZGOS DE LA AUDITORÍA DE FASE 3

---

### HALLAZGO-AUD-F3-01 — saving declarado pero setSaving nunca llamado (bug residual de Fase 6)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F3-01 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría post-Fase 3 |
| Tipo | Bug residual — onSubmit inline ignoraba el estado saving |
| Severidad | MEDIA — LoadingButton presente pero spinner nunca visible |
| Estado | CORREGIDO en la auditoría de Fase 3 |

**Descripción:**
Al verificar que `loading={saving}` realmente activaba el spinner del
`LoadingButton`, se encontró que `saving` se declaraba con `useState(false)`
pero `setSaving` nunca se llamaba. El `onSubmit` del formulario era un
inline handler síncrono que ignoraba por completo el estado:

```jsx
// ANTES — saving declarado pero sin efecto
const [saving, setSaving] = useState(false);  // declarado pero muerto
// ...
onSubmit={(e) => { e.preventDefault(); onSave(data); }}  // síncrono, ignora saving
```

Este bug existía desde el commit `fd40ba4` (Fase 6) — la documentación
de esa fase decía que el `handleSubmit async` fue implementado, pero el
código fuente mostraba el inline handler sin modificar.

**Fix aplicado:**

```jsx
// DESPUÉS — handleSubmit async con try/finally
const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  try { await onSave(data); }
  finally { setSaving(false); }
};
// ...
onSubmit={handleSubmit}
```

**Flujo correcto ahora:**
1. Usuario hace clic en "Guardar dirección"
2. `setSaving(true)` → `LoadingButton` muestra spinner
3. `await onSave(data)` → dispara `dispatch(createAddress(data))`
4. `finally: setSaving(false)` → spinner desaparece (tanto si hay error como si no)

---

### HALLAZGO-AUD-F3-02 — 0 colisiones entre barrel @components/common y primitives

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F3-02 |
| Fecha | 2026-05-29 |
| Tipo | Auditoría preventiva — resultado limpio |

**Descripción:**
Se verificó que ningún nombre de componente está exportado en ambos barrels
simultáneamente, lo que podría causar ambigüedad en imports.

`@components/common/primitives` exporta exactamente:
`Button`, `EmptyState`, `Field`, `MetaTag`, `Price`, `SumRow`

`@components/common` exporta (entre otros):
`Alert`, `Autocomplete`, `Calendar`, `Carousel`, `Chip`, `ChipInput`,
`Collapse`, `DatePicker`, `DateRangePicker`, `Dropdown`, `LoadingButton`,
`Modal`, `MultiSelect`, `Offcanvas`, `Popover`, `RangeSlider`,
`ScrollSpy`, `Stepper`, `TimePicker`, `Toast`, `Tooltip`

Sin solapamiento — el sistema de barrels está correctamente particionado.

---

### RESUMEN DE LA AUDITORÍA DE FASE 3

| Verificación | Resultado |
|-------------|-----------|
| Import de LoadingButton en línea correcta | OK |
| Cadena barrel → archivo físico → export default | OK |
| LoadingButton ausente en barrel de primitives | OK |
| 0 residuos del bug en 99 páginas | OK |
| 0 componentes mal importados desde primitives | OK |
| 0 colisiones entre barrels | OK |
| LoadingButton acepta props loading y variant | OK |
| saving declarado y setSaving llamado | **BUG → CORREGIDO** |
| handleSubmit async con try/finally | OK tras corrección |
| Tests: 1330 pasando | OK |

**10/10 verificaciones limpias. 1 bug residual de Fase 6 encontrado y corregido.**

---

## HALLAZGOS DE FASE 4

---

### HALLAZGO-F4-01 — BUG-SL-03 y BUG-SL-04 no son corregibles en Fase 4 — requieren addCase

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F4-01 |
| Fecha | 2026-05-29 |
| Fase | F4 |
| Tipo | Dependencia bloqueante entre fases |

**Descripción:**
`BUG-SL-03` (`siteSettings`) y `BUG-SL-04` (`voucherChangelog`) no son
errores de selector — son errores de que el state nunca se puebla porque
los thunks no tienen `addCase` en `adminSlice`. El selector correcto sería
`s.admin?.siteSettings` y `s.admin?.currentVoucher`, pero esas claves
permanecen en sus valores iniciales (`null` y `null`) porque los thunks
`fetchSiteSettings` y `fetchAdminVoucher` nunca actualizan el state.

Corrección real: en Fase 5 (BUG-TH-03 extendido), agregar los `addCase`
correspondientes. Los selectores son correctos en intención.

**Estado en Fase 4:**
- `AdminSiteSettingsPage`: selector `s.admin?.siteSettings` correcto → sin cambio
- `AdminVoucherDetailPage`: selector `s.admin?.currentVoucher` correcto → sin cambio
  El selector `s.admin?.voucherChangelog` sí es incorrecto (clave no existe en ningún
  lugar del slice) → pendiente de crear la clave + thunk + addCase en Fase 5.

---

### HALLAZGO-F4-02 — AdminInventoryDashboardPage carecía de selector de isLoading

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F4-02 |
| Fecha | 2026-05-29 |
| Fase | F4 |
| Tipo | Mejora detectada durante el fix de BUG-SL-01 |
| Severidad | BAJA — no crashea pero no muestra spinner |
| Estado | CORREGIDO |

**Descripción:**
Al corregir el selector `s.admin?.inventory` → `s.admin?.inventoryDashboard`,
se detectó que la página no tenía selector de `isLoadingInventory`. La página
usaba `data || {}` como fallback — no crasheaba, pero tampoco mostraba un
spinner durante la carga.

`adminSlice.initialState` tiene `isLoadingInventory: false` y el plan de
Fase 5 incluye el `addCase` que lo activa.

**Fix:**
```jsx
// Agregado junto al selector de data:
const isLoading = useSelector((s) => s.admin?.isLoadingInventory);
```

---

### HALLAZGO-F4-03 — OrderEditPage.test tenía tests síncronos sobre thunks async

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F4-03 |
| Fecha | 2026-05-29 |
| Fase | F4 |
| Tipo | Test roto por corrección de BUG-SL-05 — mismo patrón que HALLAZGO-FASE4-05 |
| Estado | CORREGIDO |

**Descripción:**
Al corregir `s.orders?.isLoadingDetail` → `s.orders?.isLoading` en
`OrderEditPage`, el componente ahora muestra el spinner mientras el thunk
resuelve. Los tests eran síncronos y no esperaban a que `fetchOrderDetail`
completara — siempre veían "Cargando pedido…" en lugar del contenido.

**Patrón idéntico al HALLAZGO-FASE4-05** de la iniciativa
`auditar-rutas-y-flujos`: tests con thunks async necesitan
`mockResolvedValue` + `waitFor`.

**Fix aplicado:**
1. `import apiService from '@services/apiService'`
2. `beforeEach(() => apiService.get.mockResolvedValue({ data: ORDER }))`
3. Todos los tests convertidos a `async` con `await waitFor(() => ...)`

---

### RESUMEN EJECUTIVO FASE 4

| Bug | Acción | Resultado |
|-----|--------|-----------|
| BUG-SL-01 | `s.admin?.inventory` → `s.admin?.inventoryDashboard` | CORREGIDO |
| BUG-SL-02 | `s.admin?.isLoadingUsers` → `s.admin?.isLoading` | CORREGIDO |
| BUG-SL-03 | Sin cambio — selector correcto, falta addCase (Fase 5) | PARCIAL |
| BUG-SL-04 | Sin cambio — voucherChangelog requiere nueva clave + thunk (Fase 5) | PARCIAL |
| BUG-SL-05 | `s.orders?.isLoadingDetail` → `s.orders?.isLoading` | CORREGIDO |

| Métrica | Valor |
|---------|-------|
| Archivos de página modificados | 3 |
| Archivos de test modificados | 1 |
| Mejora adicional agregada | isLoadingInventory selector en AdminInventoryDashboardPage |
| Tests regresionados | 0 |
| Tests totales | 1330 pasando, 0 fallos |

---

## HALLAZGOS DE LA AUDITORÍA DE FASE 4

---

### HALLAZGO-AUD-F4-01 — AdminStockAlertsPage usa isLoadingAlerts (no existe en ningún slice)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F4-01 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría proactiva post-Fase 4 |
| Severidad | MEDIA — spinner nunca visible mientras cargan las alertas |
| Estado | CORREGIDO |

**Descripción:**
La auditoría proactiva cruzó todos los selectores `s.admin?.KEY` del proyecto
contra el `initialState` de `adminSlice`. `isLoadingAlerts` no existe en
`adminSlice` ni en ningún otro slice.

La clave disponible más cercana es `isLoadingInventory`, que es la que
controla `fetchInventoryDashboard` y, tras el fix de Fase 5, también
controlará `fetchStockAlerts`.

**Fix:** `s.admin?.isLoadingAlerts` → `s.admin?.isLoadingInventory`

---

### HALLAZGO-AUD-F4-02 — AdminStaticPageEditorPage usa isLoadingPage (typo — falta 's')

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F4-02 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría proactiva post-Fase 4 |
| Severidad | MEDIA — spinner de carga de página CMS nunca visible |
| Estado | CORREGIDO |

**Descripción:**
`AdminStaticPageEditorPage` usaba `s.admin?.isLoadingPage` (singular).
`adminSlice.initialState` tiene `isLoadingPages` (plural).

```jsx
// ANTES (incorrecto)
const isLoading = useSelector((s) => s.admin?.isLoadingPage);   // → undefined

// DESPUÉS (correcto)
const isLoading = useSelector((s) => s.admin?.isLoadingPages);  // → false/true
```

---

### HALLAZGO-AUD-F4-03 — AdminStaticPageEditorPage usa pageVersions (no existe en adminSlice)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F4-03 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría proactiva post-Fase 4 |
| Severidad | MEDIA — historial de versiones de página CMS siempre vacío |
| Estado | PENDIENTE — requiere nuevo thunk + addCase (scope de Fase 5) |

**Descripción:**
```jsx
const versions = useSelector((s) => s.admin?.pageVersions || []);
```

`pageVersions` no existe en `adminSlice.initialState` ni se setea en ningún
reducer. La página muestra el selector de versiones vacío permanentemente.

**Fix requerido en Fase 5:**
1. Agregar `pageVersions: []` al `initialState`
2. Crear thunk `fetchPageVersions(slug)` → `GET /api/v1/admin/pages/:slug/versions/`
3. Agregar `addCase` + handler MSW

---

### HALLAZGO-AUD-F4-04 — AdminProductsPage usaba products e isLoadingProducts sin declarar en initialState

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F4-04 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría proactiva post-Fase 4 |
| Severidad | BAJA — antipatrón, no causa crash porque sí tienen addCase |
| Estado | CORREGIDO — declaradas en initialState |

**Descripción:**
`adminSlice` tenía `fetchAdminProducts` con `addCase` completo que seteaba
`state.products` y `state.isLoadingProducts`, pero ambas claves no estaban
declaradas en `initialState`. Redux Toolkit las creaba dinámicamente en el
primer dispatch, lo que funciona pero es frágil y TypeScript no puede inferir
los tipos.

**Fix:** Agregar al `initialState` de `adminSlice`:
```javascript
products:           [],
isLoadingProducts:  false,
```

---

### RESUMEN DE LA AUDITORÍA DE FASE 4

| Verificación | Resultado |
|-------------|-----------|
| SL-01: inventoryDashboard correcto, sin residuos | OK |
| SL-01: isLoadingInventory selector agregado | OK |
| SL-02: isLoading correcto, sin residuos de isLoadingUsers | OK |
| SL-05: isLoading correcto, sin residuos de isLoadingDetail | OK |
| SL-03/SL-04: selectores correctos en intención | OK — pendiente Fase 5 |
| 0 residuos globales de los 3 selectores corregidos | OK |
| isLoadingAlerts → isLoadingInventory (AdminStockAlertsPage) | **BUG → CORREGIDO** |
| isLoadingPage → isLoadingPages (AdminStaticPageEditorPage) | **BUG → CORREGIDO** |
| products + isLoadingProducts en initialState de adminSlice | **ANTIPATRÓN → CORREGIDO** |
| pageVersions (AdminStaticPageEditorPage) | **BUG → PENDIENTE Fase 5** |
| Tests: 1330 pasando | OK |

**8 checks OK. 3 bugs adicionales corregidos. 1 pendiente para Fase 5.**

---

## HALLAZGOS DE FASE 5

---

### HALLAZGO-F5-01 — adminSlice tiene 72 thunks, 54 sin addCase (solo 12 corregidos en F5)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F5-01 |
| Fecha | 2026-05-29 |
| Fase | F5 |
| Tipo | Inventario de deuda técnica |
| Severidad | Informativo |
| Estado | DOCUMENTADO |

**Descripción:**
Al inventariar todos los thunks de `adminSlice` antes de insertar los `addCase`,
se encontró que el slice tiene 72 thunks definidos y solo 8 tenían `addCase`
antes de Fase 5.

Fase 5 agregó 12 thunks más (los del scope: BUG-TH-03, BUG-SL-03, BUG-SL-04,
más `fetchAdminPages`/`fetchAdminPage`/`savePageDraft`/`publishPage`).

**Estado post-Fase 5:**

| Estado | Thunks |
|--------|--------|
| Con addCase | 20 (8 originales + 12 agregados) |
| Sin addCase | 52 |
| Total | 72 |

Los 52 thunks sin addCase representan funcionalidad de paneles admin que
actualmente no responde visualmente (sin spinner, sin datos actualizados).
Se agregan como deuda técnica a corregir en fases posteriores.

---

### HALLAZGO-F5-02 — AdminStaticPageEditorPage.test tenía preloadedState sin isLoadingPages

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F5-02 |
| Fecha | 2026-05-29 |
| Fase | F5 |
| Tipo | Test roto — mismo patrón que HALLAZGO-F4-03 y HALLAZGO-FASE4-05 |
| Estado | CORREGIDO |

**Descripción:**
Al agregar el `addCase` de `fetchAdminPage`, el thunk al dispararse en el
`useEffect` pone `isLoadingPages = true` antes de resolver. El test tenía
preloadedState sin `isLoadingPages: false` explícito y los tests eran
síncronos — siempre veían el spinner "Cargando…".

**Fix:**
1. `isLoadingPages: false` en el `preloadedState`
2. `apiService.get.mockResolvedValue({ data: PAGE })`
3. Todos los tests convertidos a `async` con `await waitFor()`

**Patrón recurrente documentado:**
Este es el tercer test que sigue el mismo patrón (OrderDetailPage, OrderEditPage,
AdminStaticPageEditorPage). Cualquier test de página que:
- Use un thunk con `addCase` en el `useEffect`
- Tenga assertions síncronas

...debe usar `mockResolvedValue` + `waitFor`. Los tests que no lo hacen
pasan con el bug presente y fallan cuando el addCase se agrega.

---

### HALLAZGO-F5-03 — fetchAdminPages y páginas CMS tenían 0 addCase antes de F5

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F5-03 |
| Fecha | 2026-05-29 |
| Fase | F5 |
| Tipo | Hallazgo de scope — funcionalidad CMS bloqueada |
| Estado | CORREGIDO como parte de F5 (scope ampliado) |

**Descripción:**
Los thunks de páginas CMS (`fetchAdminPages`, `fetchAdminPage`, `savePageDraft`,
`publishPage`) tampoco tenían `addCase` aunque sí estaban definidos. Dado que:
- `AdminStaticPagesPage` usa `s.admin?.staticPages` (actualizado por `fetchAdminPages`)
- `AdminStaticPageEditorPage` usa `s.admin?.currentPage` (actualizado por `fetchAdminPage`)

...agregar los `addCase` de CMS en el mismo commit de F5 era coherente y
evitaba una fase adicional.

---

### RESUMEN EJECUTIVO FASE 5

| Acción | Detalle |
|--------|---------|
| Claves agregadas al initialState | `siteSettings`, `isLoadingSettings`, `voucherChangelog`, `isLoadingAlerts` |
| addCase insertados en extraReducers | 12 thunks × 3 casos = 36 addCase nuevos |
| Thunks cubiertos | fetchInventoryDashboard, fetchStockAlerts, fetchSiteSettings, updateSiteSettings, fetchAdminVoucher, createVoucher, updateVoucher, deleteVoucher, fetchAdminPages, fetchAdminPage, savePageDraft, publishPage |
| Test corregido | AdminStaticPageEditorPage.test.jsx |
| Tests regresionados | 0 |
| Tests totales | 1330 pasando, 0 fallos |

---

## HALLAZGOS DE LA AUDITORÍA DE FASE 5

---

### HALLAZGO-AUD-F5-01 — Falsos negativos en la comparación de handlers MSW

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F5-01 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría post-Fase 5 |
| Tipo | Falso negativo en el método de auditoría |
| Severidad | Informativo |

**Descripción:**
La primera pasada de auditoría de handlers MSW reportó como faltantes:
- `POST /api/v1/admin/vouchers/` → `createVoucher`
- `POST /api/v1/admin/pages/:slug/publish/` → `publishPage`

La verificación directa en `admin.ts` confirmó que ambos **sí existen**.
El falso negativo se originó en cómo se construía el set de rutas MSW:
el comparador usaba `f"{method.upper()} {path}"` pero algunos handlers en
el archivo tenían comillas simples en lugar de comillas dobles, alterando
el patrón de extracción.

**Corrección del método de auditoría:** Verificación directa con
`pattern in src` en lugar de depender del set construido por regex.

---

### HALLAZGO-AUD-F5-02 — updateOrderStatus/adminCancelOrder/createCategory/updateCategory tienen solo fulfilled (patrón intencional)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F5-02 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría post-Fase 5 |
| Tipo | Falso positivo — patrón intencional |
| Severidad | Informativo |

**Descripción:**
La auditoría de thunks pre-existentes detectó que 4 thunks (`updateOrderStatus`,
`adminCancelOrder`, `createCategory`, `updateCategory`) tienen solo `.addCase(X.fulfilled)`
sin `.pending` ni `.rejected`.

Esto es **intencional**: son mutaciones que no tienen estado de carga propio —
usan el `isActioning` genérico del slice que se setea mediante el thunk de carga
previo (`fetchAdminOrder` para órdenes, `fetchAdminCategories` para categorías).
El spinner no se activa en la mutación sino en la carga del recurso.

**Conclusión:** No son bugs — no se corrigen.

---

### HALLAZGO-AUD-F5-03 — pageVersions sigue siendo el único selector sin initialState (pendiente conocido)

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F5-03 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría proactiva post-Fase 5 |
| Tipo | Confirmación de HALLAZGO-AUD-F4-03 |
| Estado | PENDIENTE — requiere nuevo thunk |

**Descripción:**
La auditoría proactiva cruzó todos los `s.admin?.KEY` de las 99 páginas
contra las 48 claves del `initialState` post-Fase 5.

Resultado: **1 clave faltante** — `pageVersions` en `AdminStaticPageEditorPage`,
ya documentada como `HALLAZGO-AUD-F4-03`. Todos los demás selectores usan
claves declaradas en el `initialState`.

---

### RESUMEN DE LA AUDITORÍA DE FASE 5

| Verificación | Resultado |
|-------------|-----------|
| 4 claves nuevas en initialState | OK |
| 12 × 3 addCase (36 total) sin duplicados | OK |
| Cada fulfilled actualiza la clave correcta | OK |
| 6 pares selector ↔ addCase ↔ MSW coherentes | OK |
| 15 thunks pre-existentes intactos | OK |
| MSW handlers para mutaciones | OK (falsos negativos del método) |
| voucherChangelog con guard || [] | OK — no crashea |
| AdminStaticPageEditorPage.test | OK |
| Tests: 1330 pasando | OK |
| pageVersions sin initialState | PENDIENTE CONOCIDO |

**10/10 verificaciones OK. 0 bugs nuevos. 1 pendiente preexistente confirmado.**

---

## HALLAZGOS DE FASE 6

---

### HALLAZGO-F6-01 — Las variables SCSS usadas inicialmente eran inexistentes en el proyecto

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F6-01 |
| Fecha | 2026-05-29 |
| Fase | F6 |
| Tipo | Bug detectado antes del commit — variables SCSS incorrectas |
| Severidad | ALTA — habría roto la compilación SCSS |
| Estado | CORREGIDO antes del commit |

**Descripción:**
La primera versión de `InfoPage.module.scss` usaba variables que no existen
en el proyecto (`$color-body`, `$color-heading`, `$font-heading`, `$font-mono`,
`$color-link`, `$color-muted`). Los nombres correctos en el proyecto son:

| Variable usada (incorrecta) | Variable real en el proyecto |
|-----------------------------|------------------------------|
| `$color-heading` | `$text-primary` |
| `$color-body` | `$text-secondary` |
| `$color-muted` | `$text-muted` |
| `$color-link` | `$text-link` |
| `$font-heading` | `$font-family-display` |
| `$font-mono` | `$font-family-mono` |

**Lección:** Antes de crear un SCSS nuevo, leer un SCSS de página existente
que funcione (ej. `AccountPage.module.scss`) para copiar el patrón exacto
de variables, en lugar de inferir los nombres.

---

### HALLAZGO-F6-02 — Los slugs en/es (/info/terms y /info/privacy) tienen su propio contenido

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F6-02 |
| Fecha | 2026-05-29 |
| Fase | F6 |
| Tipo | Hallazgo de análisis — decisión de diseño |

**Descripción:**
El plan original proponía redirigir `/info/privacy` → `/info/privacidad` y
`/info/terms` → `/info/terminos`. Al analizar el uso en las páginas:

- `RegisterPage` usa `/info/terms` y `/info/privacy` (inglés — coherente con
  el contexto bilingüe del registro)
- `CheckoutPage` usa `/info/terminos` y `/info/privacidad` (español)

**Decisión:** Mantener ambos slugs con contenido propio en inglés y español
en el MSW. `RegisterPage` no requiere cambios — los slugs `terms` y `privacy`
ahora tienen contenido en inglés que es apropiado para ese contexto.

---

### HALLAZGO-F6-03 — InfoPage usa el endpoint de admin, no uno público

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F6-03 |
| Fecha | 2026-05-29 |
| Fase | F6 |
| Tipo | Deuda técnica — endpoint admin usado como endpoint público en el demo |
| Severidad | BAJA — funciona en demo, requiere endpoint público en producción |

**Descripción:**
`InfoPage` usa `fetchAdminPage(slug)` → `GET /api/v1/admin/pages/:slug/`.
En producción debería existir un endpoint público `GET /api/v1/pages/:slug/`
sin autenticación de admin.

Para el demo esto es aceptable — el endpoint de admin devuelve el contenido
publicado y el MSW no verifica credenciales.

**Deuda:** Crear endpoint público + thunk `fetchPublicPage` cuando se integre
el backend real.

---

### RESUMEN EJECUTIVO FASE 6

| Acción | Resultado |
|--------|-----------|
| InfoPage.jsx creada | 64 líneas — carga por slug desde adminSlice.currentPage |
| InfoPage.module.scss creada | 58 líneas — corregida tras detectar variables incorrectas |
| Ruta `info/:slug` en StorefrontLayout | Pública, sin auth |
| Lazy import en AppRouter.jsx | OK |
| MSW: 5 slugs nuevos en GET /admin/pages/:slug/ | ifa, santoral, envios, terms, privacy |
| SCSS: 146 → 147 entries | 0 issues |
| Tests regresionados | 0 |
| Tests totales | 1330 pasando, 0 fallos |

**Las 7 rutas /info/* ahora resuelven correctamente:**

| Ruta | Slug MSW | Idioma |
|------|----------|--------|
| `/info/ifa` | ifa | ES |
| `/info/santoral` | santoral | ES |
| `/info/envios` | envios | ES |
| `/info/privacidad` | privacidad | ES |
| `/info/terminos` | terminos | ES |
| `/info/privacy` | privacy | EN |
| `/info/terms` | terms | EN |

---

## HALLAZGOS DE LA AUDITORÍA DE FASE 6

---

### HALLAZGO-AUD-F6-01 — Footer tenía 5 links /info/* sin cobertura MSW

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F6-01 |
| Fecha | 2026-05-29 |
| Descubierto en | Auditoría post-Fase 6 — búsqueda en components/, no solo en pages/ |
| Tipo | Bug MSW — cobertura incompleta por búsqueda limitada a pages/ |
| Severidad | MEDIA — links del footer devuelven 404 en el demo |
| Estado | CORREGIDO |

**Descripción:**
La auditoría de Fase 6 buscó links `/info/*` solo en `src/pages/`.
La auditoría post-F6 amplió la búsqueda a **todo el proyecto** (`src/`)
y encontró 5 slugs adicionales en el componente `Footer`:

| Slug | Label en Footer | MSW antes | MSW después |
|------|----------------|-----------|-------------|
| `orishas` | Los òrìsà | FALTABA | AGREGADO |
| `pataki` | Pataki | FALTABA | AGREGADO |
| `glosario` | Glosario Yorùbà | FALTABA | AGREGADO |
| `pago` | Formas de pago | FALTABA | AGREGADO |
| `faq` | Preguntas frecuentes | FALTABA | AGREGADO |

**Total de slugs MSW post-corrección:** 13
(`acerca-de`, `terminos`, `privacidad`, `ifa`, `santoral`, `envios`,
`terms`, `privacy`, `orishas`, `pataki`, `glosario`, `pago`, `faq`)

**Lección:** Las auditorías de links deben buscar en `src/` completo
(incluyendo `components/`), no solo en `pages/`. El Footer vive en
`src/components/layout/Footer/` y contiene la mayoría de los links de
navegación informativa.

---

### HALLAZGO-AUD-F6-02 — dangerouslySetInnerHTML: riesgo bajo, origen controlado

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-AUD-F6-02 |
| Fecha | 2026-05-29 |
| Tipo | Auditoría de seguridad — resultado aceptable |

**Descripción:**
`InfoPage` usa `dangerouslySetInnerHTML={{ __html: page.content }}`.
El contenido de `page.content` proviene exclusivamente del CMS admin
(`/api/v1/admin/pages/:slug/`), que solo es modificable por usuarios con
rol admin autenticado.

**Valoración:** El riesgo es bajo para el demo. En producción se recomienda
sanitizar el HTML antes de renderizarlo (ej. DOMPurify) en caso de que
el panel admin sea accesible por múltiples roles con distintos niveles de confianza.

---

### RESUMEN DE LA AUDITORÍA DE FASE 6

| Verificación | Resultado |
|-------------|-----------|
| InfoPage.jsx: guards, imports, estructura | OK |
| InfoPage.module.scss: variables correctas, 0 malas | OK |
| Router: lazy import 1×, ruta en StorefrontLayout público | OK |
| MSW: 8 slugs con title + content + slug | OK |
| 7/7 links en pages/ con slug en MSW | OK |
| SCSS: 147 entries, 0 issues | OK |
| Footer: 5 slugs adicionales sin cobertura | **BUG → CORREGIDO** |
| dangerouslySetInnerHTML de CMS admin | OK — riesgo bajo |
| Tests: 1330 pasando | OK |

**12/12 checks OK. 1 bug adicional (Footer) encontrado y corregido.**
**Total slugs MSW post-auditoría: 13**

---

## HALLAZGOS DE FASE 7 Y SU AUDITORÍA

---

### RESUMEN EJECUTIVO FASE 7 — BUG-CONF-01

**Objetivo:** Eliminar los 14 usos de `window.confirm` distribuidos en 11 archivos.

**Solución:** Componente `ConfirmModal` reutilizable + estado local `useState(confirm)` + patrón `setConfirm({ message, action })` en cada página.

**Archivos nuevos:**
- `src/components/shared/ConfirmModal/ConfirmModal.jsx` (61L)
- `src/components/shared/ConfirmModal/ConfirmModal.module.scss` (19L)
- `src/components/shared/ConfirmModal/__mocks__/ConfirmModal.jsx` — mock con `React.createElement` para tests

**Archivos modificados:** 11 páginas/componentes + 6 tests + `jest.setup.js` (polyfill HTMLDialogElement)

---

### HALLAZGO-F7-01 — add_confirm_modal_jsx() insertó Modal en subcomponente incorrecto

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F7-01 |
| Tipo | Bug de implementación — herramienta de inserción imprecisa |
| Severidad | ALTA — ReferenceError en runtime |
| Estado | CORREGIDO |

**Descripción:**
La función `add_confirm_modal_jsx()` buscaba el último cierre `');\n}'` del archivo
para insertar el Modal. En páginas con subcomponentes internos al final del archivo
(`CategoryFormModal`, `MethodModal`, `ImageGallery`, `OptionInlineForm`), el Modal
se insertaba en la función interna en lugar del componente principal.

**Páginas afectadas:** `AdminCategoriesPage`, `AdminShippingMethodsPage`,
`AdminProductDetailPage`, `AdminVariantTypesPage`.

**Fix:** Mover el Modal al cierre del Fragment `</>` del componente principal.

**Convención permanente:** En páginas con múltiples return o subcomponentes internos,
verificar manualmente que `<ConfirmModal>` está en la función exportada, no en una función interna.

---

### HALLAZGO-F7-02 — SupportTicketActions tiene early returns múltiples

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F7-02 |
| Tipo | Arquitectura especial — componente con múltiples ramas de return |
| Estado | CORREGIDO con variable compartida `confirmModal` |

**Descripción:**
`SupportTicketActions` tiene tres ramas de return: una para `CLOSED`, una para
statuses closables, y `return null`. Cada rama necesitaba incluir el `<ConfirmModal>`.

**Solución:** Variable `confirmModal` definida una vez antes de los returns:
```jsx
const confirmModal = (
  <ConfirmModal open={confirm !== null} message={...} onConfirm={...} onClose={...} />
);
// Cada rama: return (<>...</>{confirmModal}</>)
```

**Convención permanente documentada:** Cuando un componente tiene múltiples early
returns, declarar `const confirmModal = (...)` antes de los returns e incluirlo
en cada rama, o consolidar los returns en uno solo.

---

### HALLAZGO-F7-03 — MockReturnValue de window.confirm residual en test de reabrir

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F7-03 |
| Estado | CORREGIDO |

**Descripción:**
El test "llama al endpoint de reabrir al confirmar" en `SupportTicketActions.test.jsx`
no fue actualizado al patrón Modal. Usaba `jest.spyOn(window, 'confirm').mockReturnValue(true)`.

**Fix:** Reemplazado por `fireEvent.click('Reabrir ticket')` → `waitFor('Confirmar')` → `fireEvent.click('Confirmar')`.

---

### HALLAZGO-F7-04 — AdminProductDiscountsPage sin useState(confirm) por espacios extra

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F7-04 |
| Tipo | Bug de implementación — ancla de reemplazo no encontrada |
| Estado | CORREGIDO |

**Descripción:**
`add_confirm_state()` buscaba `"const dispatch = useDispatch();"` pero
`AdminProductDiscountsPage` tenía `"const dispatch    = useDispatch();"` (4 espacios extra).
El `useState(confirm)` nunca se declaró → `ReferenceError: setConfirm is not defined`.

**Fix:** Búsqueda exacta del texto con espacios y reemplazo manual.

---

### HALLAZGO-F7-05 — Polyfill HTMLDialogElement requerido en jest.setup.js

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F7-05 |
| Estado | IMPLEMENTADO |

**Descripción:**
jsdom no implementa `HTMLDialogElement.prototype.showModal()` ni `close()`.
El Modal usa `<dialog>` nativo — sin el polyfill el componente no abre en tests.

El polyfill se agregó en `jest.setup.js` (aplicado globalmente a todos los tests):
```javascript
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () { this.open = false; };
  }
}
```

---

### HALLAZGO-F7-06 — Mock de ConfirmModal necesita React.createElement (no JSX) en factory

| Campo | Valor |
|-------|-------|
| ID | HALLAZGO-F7-06 |
| Estado | IMPLEMENTADO |

**Descripción:**
Las factories de `jest.mock()` no soportan JSX directamente cuando el factory
se ejecuta antes del transform de Babel. El mock inicial usaba JSX y el componente
se renderizaba vacío.

**Solución:** Usar `React.createElement` en la factory:
```javascript
jest.mock('@components/shared/ConfirmModal/ConfirmModal', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function ConfirmModal({ open, onConfirm, onClose, message }) {
      if (!open) return null;
      return React.createElement('div', { 'data-testid': 'confirm-modal' },
        React.createElement('button', { type: 'button', onClick: onConfirm }, 'Confirmar'),
        React.createElement('button', { type: 'button', onClick: onClose }, 'Cancelar'),
      );
    },
  };
});
```

---

### AUDITORÍA POST-FASE 7 — 9/9 checks OK

| Verificación | Resultado |
|-------------|-----------|
| 0 window.confirm funcionales en el proyecto | OK |
| 0 setConfirm sin useState(null) | OK |
| ConfirmModal en componente principal | OK |
| 0 spyOn(window.confirm) en tests | OK |
| ConfirmModal.jsx: 7 props presentes | OK |
| 148 SCSS entries, 0 issues | OK |
| 6 tests con mock React.createElement | OK |
| SupportTicketActions: confirmModal en ambas ramas | OK |
| Tests: 1330 pasando, 0 fallos | OK |

---

## HALLAZGOS DE FASE 8 Y FASE 9

---

### RESUMEN EJECUTIVO FASE 8 — BUG-MSW-01

**Diagnóstico real tras auditoría:**

De los 6 handlers identificados en el plan original, solo 1 tenía el bug real:

| Handler | count antes | count después | Impacto |
|---------|-------------|--------------|---------|
| admin/users | `_adminUsers.length` (total) | Sin cambio — ya correcto | ninguno |
| admin/vouchers | `vouchers.length` (= 10, sin paginar) | Sin cambio — correcto | ninguno |
| storefront/tickets | `_tickets.length` (total) | Sin cambio — correcto | ninguno |
| **admin/support/tickets** | **`results.length` (filtrado)** | **`_tickets.length` (total)** | **CORREGIDO** |
| storefront/returns | `state.items.length` (total, sin paginar) | Sin cambio — correcto | ninguno |
| admin/returns | `state.items.length` (total, sin paginar) | Sin cambio — correcto | ninguno |

**Fix aplicado:** `support.ts` — `count: results.length` → `count: _tickets.length` en el handler de `GET /api/v1/admin/support/tickets/`. El count ahora refleja el total de tickets del sistema, no el filtrado actual.

**Impacto funcional del bug:** NINGUNO en el demo — ningún componente usa `count` para calcular `totalPages` en estos endpoints.

---

### RESUMEN EJECUTIVO FASE 9 — BUG-LOG-01

**Fix:** `CheckoutPage.jsx` L61 — eliminada la línea `console.error(err)` del bloque `catch`.

El error ya se expone al usuario vía `setOrderError(err?.message || '...')` y se muestra en el componente con un `<Alert>`. El `console.error` era una fuga de debug introducida en una fase anterior.

**Auditoría global de console.error:** El único `console.error` restante en el proyecto está en `ErrorBoundary/index.jsx` dentro de `componentDidCatch` — **intencional y correcto** (estándar de React para logging de errores de renderizado).

---

### BUG-SL-06 — Evaluación

| Campo | Valor |
|-------|-------|
| ID | BUG-SL-06 |
| Estado | CERRADO — DESCARTADO (ya corregido en Fase 4) |

**Descripción:**
BUG-SL-06 fue registrado como un selector incorrecto en una página de admin.
Al revisar para Fase 9, se encontró que el bug ya fue corregido durante la
auditoría proactiva de Fase 4 (HALLAZGO-AUD-F4-01 a F4-04). No hay acción
adicional requerida.

---

### RESUMEN FINAL DE LA INICIATIVA corregir-bugs-detectados

| Fase | Bugs corregidos | Estado |
|------|----------------|--------|
| F1 | BUG-RT-01, BUG-RT-03 | COMPLETADA |
| F2 | BUG-TH-01, BUG-TH-02 | COMPLETADA |
| F3 | BUG-LB-01 | COMPLETADA |
| F4 | BUG-SL-01, SL-02, SL-05 | COMPLETADA |
| F5 | BUG-TH-03, BUG-SL-03, BUG-SL-04 | COMPLETADA |
| F6 | BUG-RT-02 | COMPLETADA |
| F7 | BUG-CONF-01 | COMPLETADA |
| F8 | BUG-MSW-01 | COMPLETADA |
| F9 | BUG-LOG-01 | COMPLETADA |

**16 bugs originales resueltos.**
**30+ hallazgos adicionales detectados y corregidos durante las auditorías.**
**Tests: 1330 pasando, 0 fallos, 109 skipped.**
