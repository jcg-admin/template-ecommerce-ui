# Plan de correcciones — corregir-bugs-detectados

Orden de ejecución por impacto en el flujo demo + agrupación por archivo.

---

## FASE 1 — Rutas rotas (BUG-RT-01, BUG-RT-03)

Tiempo estimado: 10 min. Impacto máximo, mínimo código.

**BUG-RT-01** — Cambiar `confirmacion` → `confirmation` en 3 páginas:
- `src/pages/checkout/CheckoutPage.jsx` L55
- `src/pages/checkout/ExpressCheckoutPage.jsx`
- `src/pages/checkout/PaymentReturnPage.jsx`

**BUG-RT-03** — Cambiar `alertas` → `stock-alerts` en AdminInventoryDashboardPage (2 ocurrencias)

Verificar: navegar `/catalog` → producto → carrito → checkout → pagar
→ confirmar que llega a `/order/:id/confirmation`.

---

## FASE 2 — Thunks en slice equivocado (BUG-TH-01, BUG-TH-02)

**BUG-TH-02 — CheckoutPage** (corregir primero — bloquea el flujo de compra):
```jsx
// Cambiar
import { createOrder, initiatePayment } from '@redux/slices/paymentsSlice';
// Por
import { createOrder }     from '@redux/slices/checkoutSlice';
import { initiatePayment } from '@redux/slices/paymentsSlice';
```

**BUG-TH-01 — AddressesPage** (más complejo — requiere cambio de slice Y de selector):
```jsx
// Cambiar import
import { fetchAddresses }                                    from '@redux/slices/authSlice';
import { createAddress, deleteAddress, setDefaultAddress }   from '@redux/slices/addressesSlice';

// Cambiar selector
// ANTES: useSelector((s) => s.auth?.user?.addresses || [])
// DESPUÉS: useSelector((s) => s.addresses?.items || [])
```

---

## FASE 3 — Import de componente incorrecto (BUG-LB-01)

**AddressesPage:**
```jsx
// Cambiar
import { MetaTag, Button, Field, LoadingButton } from '@components/common/primitives';
// Por
import { MetaTag, Button, Field } from '@components/common/primitives';
import { LoadingButton }           from '@components/common';
```

---

## FASE 4 — Selectores incorrectos (BUG-SL-01..05)

Un fix por página, todos el mismo patrón:

| Bug | Página | Cambio |
|-----|--------|--------|
| BUG-SL-01 | AdminInventoryDashboardPage | `s.admin?.inventory` → `s.admin?.inventoryDashboard` |
| BUG-SL-02 | AdminUsersPage | `s.admin?.isLoadingUsers` → `s.admin?.isLoading` |
| BUG-SL-03 | AdminSiteSettingsPage | Agregar `siteSettings` al initialState + addCase (ver F5) |
| BUG-SL-04 | AdminVoucherDetailPage | Agregar `voucherChangelog` al initialState + thunk (ver F5) |
| BUG-SL-05 | OrderEditPage | `s.orders?.isLoadingDetail` → `s.orders?.isLoading` |

---

## FASE 5 — addCase faltantes y state incompleto (BUG-TH-03, BUG-SL-03, BUG-SL-04)

En `adminSlice.js`:

**BUG-TH-03:**
```javascript
// Agregar a initialState:
isLoadingAlerts: false,

// Agregar a extraReducers:
.addCase(fetchInventoryDashboard.pending,   (s) => { s.isLoadingInventory = true; })
.addCase(fetchInventoryDashboard.fulfilled, (s, a) => {
  s.isLoadingInventory  = false;
  s.inventoryDashboard  = a.payload;
})
.addCase(fetchInventoryDashboard.rejected,  (s) => { s.isLoadingInventory = false; })

.addCase(fetchStockAlerts.pending,   (s) => { s.isLoadingAlerts = true; })
.addCase(fetchStockAlerts.fulfilled, (s, a) => {
  s.isLoadingAlerts = false;
  s.stockAlerts     = a.payload?.results ?? a.payload ?? [];
})
.addCase(fetchStockAlerts.rejected,  (s) => { s.isLoadingAlerts = false; })
```

**BUG-SL-03:**
```javascript
// Agregar a initialState:
siteSettings: null,
isLoadingSettings: false,

// Agregar a extraReducers:
.addCase(fetchSiteSettings.pending,   (s) => { s.isLoadingSettings = true; })
.addCase(fetchSiteSettings.fulfilled, (s, a) => {
  s.isLoadingSettings = false;
  s.siteSettings      = a.payload;
})
.addCase(fetchSiteSettings.rejected,  (s) => { s.isLoadingSettings = false; })
```

**BUG-SL-04:**
```javascript
// Agregar a initialState:
voucherChangelog: [],
isLoadingChangelog: false,

// Crear thunk:
export const fetchVoucherChangelog = createAsyncThunk(
  'admin/fetchVoucherChangelog',
  async (id, { rejectWithValue }) => {
    try { return (await apiService.get(`/api/v1/admin/vouchers/${id}/changelog/`)).data; }
    catch (e) { return rejectWithValue(e.message); }
  }
);

// Agregar addCase + handler MSW para /api/v1/admin/vouchers/:id/changelog/
```

---

## FASE 6 — Rutas /info/* (BUG-RT-02)

Registrar en `AppRouter.jsx` bajo `StorefrontLayout` (público):
```jsx
const InfoPage = lazy(() => import('@pages/InfoPage'));  // página genérica CMS
// ...
<Route path="info/:slug" element={<InfoPage />} />
```

O crear `InfoPage` simple que muestre el contenido de `AdminStaticPagesPage`
en modo público según el `:slug`.

---

## FASE 7 — window.confirm (BUG-CONF-01)

10 páginas, 12 ocurrencias. Patrón de reemplazo estándar:

```jsx
// ANTES
if (window.confirm('¿Eliminar?')) {
  dispatch(deleteX(id));
}

// DESPUÉS
const [confirmId, setConfirmId] = useState(null);
// ...
<button onClick={() => setConfirmId(item.id)}>Eliminar</button>

<Modal open={confirmId !== null} onClose={() => setConfirmId(null)}
  centered size="sm" backdrop="static">
  <p>¿Eliminar este elemento? Esta acción no se puede deshacer.</p>
  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
    <Button variant="ghost" onClick={() => setConfirmId(null)}>Cancelar</Button>
    <LoadingButton variant="danger"
      onClick={() => { dispatch(deleteX(confirmId)); setConfirmId(null); }}>
      Eliminar
    </LoadingButton>
  </div>
</Modal>
```

Prioridad dentro de BUG-CONF-01:
1. `AdminVoucherDetailPage` (eliminar voucher — flujo verificado)
2. `AdminProductsPage` (eliminar producto)
3. Resto en orden alfabético

---

## FASE 8 — count en handlers MSW (BUG-MSW-01)

Patrón de fix (igual al aplicado en catalog.ts):
```typescript
// Para cada handler que pagina:
const total   = all.length;
const pages   = Math.ceil(total / PAGE_SIZE);
const start   = (page - 1) * PAGE_SIZE;
const results = all.slice(start, start + PAGE_SIZE);

return HttpResponse.json({
  count:    total,        // ← total, no results.length
  results,
  next:     page < pages ? `.../?page=${page + 1}` : null,
  previous: page > 1    ? `.../?page=${page - 1}` : null,
});
```

Handlers a corregir en orden de impacto en demo:
1. `admin.ts` — `/api/v1/admin/users/`
2. `admin.ts` — `/api/v1/admin/vouchers/`
3. `support.ts` — `/api/v1/admin/support/tickets/`
4. `returns.ts` — `/api/v1/admin/returns/`

---

## FASE 9 — Antipatrones y debug leaks (BUG-SL-06, BUG-LOG-01)

**BUG-SL-06:** Agregar a `catalogSlice.initialState`:
```javascript
searchHistory:          [],
isLoadingSearchHistory: false,
```

**BUG-LOG-01:** Eliminar `console.error(err)` en `CheckoutPage.jsx`.

---

## Estado de fases

| Fase | Bugs | Estado |
|------|------|--------|
| F1 — Rutas rotas | BUG-RT-01, BUG-RT-03 | COMPLETADA |
| F2 — Thunks equivocados | BUG-TH-01, BUG-TH-02 | PENDIENTE |
| F3 — Import incorrecto | BUG-LB-01 | PENDIENTE |
| F4 — Selectores incorrectos | BUG-SL-01..05 | PENDIENTE |
| F5 — addCase + state faltante | BUG-TH-03, BUG-SL-03, BUG-SL-04 | PENDIENTE |
| F6 — Rutas /info/* | BUG-RT-02 | PENDIENTE |
| F7 — window.confirm | BUG-CONF-01 | PENDIENTE |
| F8 — count en MSW | BUG-MSW-01 | PENDIENTE |
| F9 — Antipatrones | BUG-SL-06, BUG-LOG-01 | PENDIENTE |
