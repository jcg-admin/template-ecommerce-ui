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
| Estado | PARCIAL — selector OK, pendiente addCase en Fase 5 |
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
| Estado | PARCIAL — currentVoucher OK en init, voucherChangelog pendiente Fase 5 |
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
