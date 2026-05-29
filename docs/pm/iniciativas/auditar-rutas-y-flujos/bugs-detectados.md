# Bugs detectados — auditoría completa 2026-05-29

Auditoría sistemática de 13 categorías sobre las 99 páginas, 25 slices,
y los handlers MSW. Metodología: lectura de código + cruce automatizado
de selectores vs initialState vs exports de cada slice.

---

## CRÍTICOS — crash en browser al navegar

---

### BUG-RT-01 — /confirmacion (typo) vs /confirmation en el router

| Campo | Valor |
|-------|-------|
| Severidad | CRÍTICA |
| Afecta | CheckoutPage, ExpressCheckoutPage, PaymentReturnPage |
| Síntoma | Después de pagar el usuario es redirigido a /404 |

El router registra `order/:id/confirmation` (inglés).
Tres páginas navegan a `/order/.../confirmacion` (español con typo):

```jsx
// CheckoutPage.jsx L55
navigate(`/order/${order.order_number}/confirmacion`);

// ExpressCheckoutPage.jsx
navigate(`/order/${result.order_number}/confirmacion`);

// PaymentReturnPage.jsx
navigate(`/order/${id}/confirmacion`);
```

**Fix:** Unificar — cambiar las 3 páginas a `/confirmation` (lo que dice el router),
o cambiar el router a `confirmacion`. Preferible cambiar las páginas por consistencia
con el router existente.

---

## ALTOS — página funciona pero devuelve datos vacíos o undefined

---

### BUG-SL-01 — AdminInventoryDashboardPage usa s.admin?.inventory (no existe)

| Selector incorrecto | Selector correcto |
|--------------------|-------------------|
| `s.admin?.inventory` | `s.admin?.inventoryDashboard` |

`adminSlice.initialState` tiene `inventoryDashboard: null`, no `inventory`.
Adicionalmente, `fetchInventoryDashboard` no tiene `addCase` en el slice
→ aunque se dispache, nunca actualiza el estado.

---

### BUG-SL-02 — AdminUsersPage usa s.admin?.isLoadingUsers (no existe)

| Selector incorrecto | Selector correcto |
|--------------------|-------------------|
| `s.admin?.isLoadingUsers` | `s.admin?.isLoading` |

El reducer de `fetchAdminUsers.pending` setea `state.isLoading = true`,
no `state.isLoadingUsers`.

---

### BUG-SL-03 — AdminSiteSettingsPage usa s.admin?.siteSettings (no existe)

`adminSlice` no tiene `siteSettings` en su initialState.
El thunk `fetchSiteSettings` usa `GET /api/v1/admin/settings/`
y actualiza el estado genérico — revisar en qué clave lo guarda.

---

### BUG-SL-04 — AdminVoucherDetailPage usa s.admin?.voucherChangelog (no existe)

`adminSlice.initialState` no tiene `voucherChangelog`.
La página lo usa para mostrar el historial de cambios del voucher.

---

### BUG-SL-05 — OrderEditPage usa s.orders?.isLoadingDetail (no existe)

| Selector incorrecto | Selector correcto |
|--------------------|-------------------|
| `s.orders?.isLoadingDetail` | `s.orders?.isLoading` |

Mismo bug que existía en OrderDetailPage (corregido en Fase 4).

---

### BUG-SL-06 — SearchHistoryPage usa s.catalog?.searchHistory (no existe)

`catalogSlice.initialState` no tiene `searchHistory` ni `isLoadingSearchHistory`.
Los thunks `fetchSearchHistory`, `clearSearchHistory`, `deleteSearchTerm`
probablemente pertenecen a un slice propio que no existe aún.

---

### BUG-TH-01 — AddressesPage importa createAddress/deleteAddress/setDefaultAddress de authSlice

`authSlice` no exporta esos thunks. Están en `addressesSlice`.
Las acciones de crear, eliminar y establecer predeterminada son silenciosamente no-ops.

```jsx
// AddressesPage.jsx L13-15 — INCORRECTO
import {
  fetchAddresses, createAddress, deleteAddress, setDefaultAddress,
} from '@redux/slices/authSlice';

// CORRECTO debería ser:
import { fetchAddresses } from '@redux/slices/authSlice';
import { createAddress, deleteAddress, setDefaultAddress } from '@redux/slices/addressesSlice';
```

---

### BUG-TH-02 — CheckoutPage importa createOrder de paymentsSlice (no existe ahí)

`createOrder` está en `checkoutSlice`, no en `paymentsSlice`.

```jsx
// CheckoutPage.jsx L18 — INCORRECTO
import { createOrder, initiatePayment } from '@redux/slices/paymentsSlice';

// CORRECTO:
import { createOrder }     from '@redux/slices/checkoutSlice';
import { initiatePayment } from '@redux/slices/paymentsSlice';
```

---

### BUG-TH-03 — fetchInventoryDashboard y fetchStockAlerts sin addCase en adminSlice

Los dos thunks están definidos y exportados, pero no tienen `.addCase()` en el
`extraReducers` del slice → cuando resuelven, el estado nunca se actualiza.
`inventoryDashboard` y `stockAlerts` permanecen en sus valores iniciales (`null` y `[]`).

---

### BUG-TH-04 — clearXxxActionState faltante en 15+ slices

Patrón repetido: las páginas importan `clearXxxActionState` para limpiar el error
de la acción anterior al desmontar. Ninguno de estos existe en sus slices:

| Página | Thunk faltante | Slice |
|--------|---------------|-------|
| ContactPage | `clearContactActionState` | contactSlice |
| NewsletterSubscribePage | `clearNewsletterActionState` | newsletterSlice |
| NotificationPreferencesPage | `clearNotificationsActionState` | notificationsSlice |
| PaymentRetryPage | `clearPaymentsActionState` | paymentsSlice |
| ProductReviewCreatePage | `clearReviewsActionState` | reviewsSlice |
| ReturnCreatePage | `clearReturnsActionState` | returnsSlice |
| SupportTicketCreatePage | `clearSupportTicketActionState` | supportTicketsSlice |
| AdminBackupsPage | `clearBackupsActionState` | backupsSlice |
| AdminInventoryAdjustPage | `clearInventoryActionState` | inventorySlice |
| AdminInventoryImportPage | `clearImportReport` | inventorySlice |
| AdminLogisticsPage | `clearLogisticsActionState` | logisticsSlice |
| AdminPermissionsPage | `clearPermissionsActionState` | permissionsSlice |
| AdminProductCreatePage | `clearProductsActionState` | productsSlice |
| AdminProductDiscountsPage | `clearProductDiscountsActionState` | productDiscountsSlice |
| AdminQuestionsAnswerPage | `clearQuestionsActionState` | questionsSlice |
| AdminSystemSettingsPage | `clearSettingsActionState` | settingsSlice |
| AdminVariantPricePage | `clearVariantActionState` | productVariantsSlice |

**Fix patrón:** Agregar en cada slice un reducer:
```javascript
clearActionState(state) {
  state.isActioning = false;
  state.actionError = null;
  state.lastAction  = null;
}
```
Y exportarlo. Alternativamente, usar `useEffect(() => () => dispatch(clearXxx()))`.

---

## MEDIOS — UX degradada pero no crash

---

### BUG-LB-01 — AddressesPage importa LoadingButton de primitives (undefined)

```jsx
// AddressesPage.jsx — INCORRECTO
import { MetaTag, Button, Field, LoadingButton } from '@components/common/primitives';

// CORRECTO
import { MetaTag, Button, Field } from '@components/common/primitives';
import { LoadingButton }           from '@components/common';
```

`LoadingButton` no está en el barrel de `primitives`, está en `@components/common`.

---

### BUG-RT-02 — 7 rutas /info/* usadas pero no registradas en el router

Páginas que enlazan a rutas inexistentes (van a /404):

| Ruta | Usada en |
|------|---------|
| `/info/ifa` | HomePage |
| `/info/santoral` | OrderSuccessPage |
| `/info/envios` | CheckoutPage |
| `/info/privacidad` | CheckoutPage |
| `/info/terminos` | CheckoutPage |
| `/info/terms` | RegisterPage |
| `/info/privacy` | RegisterPage |

**Opciones:** Registrar páginas estáticas en `/info/*` usando `AdminStaticPagesPage`,
o cambiar los links a `/admin/pages` en modo demo.

---

### BUG-RT-03 — AdminInventoryDashboardPage enlaza a /admin/inventory/alertas (typo)

```jsx
<Link to="/admin/inventory/alertas">  {/* incorrecto */}
// La ruta registrada es:
// /admin/inventory/stock-alerts
```

---

### BUG-CONF-01 — window.confirm en 10 páginas

`window.confirm` bloquea el hilo principal y no se puede personalizar visualmente.
Páginas afectadas:

`SearchHistoryPage`, `AdminCategoriesPage`, `AdminProductDetailPage`,
`AdminProductDiscountsPage`, `AdminProductVariantsPage`, `AdminProductsPage`,
`AdminShippingMethodsPage`, `AdminStaticPageEditorPage`, `AdminVariantTypesPage`,
`AdminVoucherDetailPage`.

**Fix:** Reemplazar por el componente `Modal` de ui-core con botones Confirmar/Cancelar.

---

### BUG-MSW-01 — count = results.length en 19 handlers (debería ser total)

Cuando un handler pagina internamente pero devuelve `count: results.length`
(los items de la página) en lugar de `count: total` (todos los registros),
los componentes que calculan `totalPages = Math.ceil(count / pageSize)` obtienen 1
y el paginador nunca aparece. Este fue el bug del CatalogPage (corregido).

Handlers afectados con paginación real que devolverían count incorrecto:
`/api/v1/admin/users/`, `/api/v1/admin/vouchers/`, `/api/v1/support/tickets/`,
`/api/v1/admin/support/tickets/`, `/api/v1/returns/`, `/api/v1/admin/returns/`,
`/api/v1/wishlist/`.

---

## BAJOS — cosmético o no impacta flujo demo

---

### BUG-LOG-01 — console.error en CheckoutPage

Fuga de debug introducida en Fase 6 al capturar el error de createOrder.
No impacta funcionamiento pero es ruido en producción.

---

## RESUMEN EJECUTIVO

| Severidad | Bugs | Impacto |
|-----------|------|---------|
| CRÍTICO | 1 | El flujo de compra completo falla al confirmar el pedido |
| ALTO | 9 | Páginas con datos vacíos, acciones silenciosas, states no actualizados |
| MEDIO | 5 | UX degradada, links rotos, confirm nativo |
| BAJO | 1 | Console.error en producción |
| **Total** | **16** | |

## ORDEN DE CORRECCIÓN RECOMENDADO

1. **BUG-RT-01** — /confirmacion vs /confirmation (1 línea en router o 3 páginas)
2. **BUG-TH-02** — createOrder en checkoutSlice, no paymentsSlice
3. **BUG-TH-01** — AddressesPage importa de authSlice en lugar de addressesSlice
4. **BUG-LB-01** — LoadingButton de primitives en AddressesPage
5. **BUG-RT-03** — /admin/inventory/alertas → /admin/inventory/stock-alerts
6. **BUG-SL-01..06** — selectores incorrectos (página por página)
7. **BUG-TH-03** — addCase de fetchInventoryDashboard y fetchStockAlerts
8. **BUG-TH-04** — clearXxxActionState en 17 slices (patrón repetible)
9. **BUG-CONF-01** — Modal en lugar de window.confirm (10 páginas)
10. **BUG-MSW-01** — count=total en handlers con paginación real
