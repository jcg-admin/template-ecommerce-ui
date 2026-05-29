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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
| Estado | PENDIENTE |
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
