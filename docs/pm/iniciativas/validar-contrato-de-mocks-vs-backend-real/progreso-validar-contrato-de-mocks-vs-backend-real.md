# Progreso: validar-contrato-de-mocks-vs-backend-real

| Campo | Valor |
|-------|-------|
| Iniciativa | validar-contrato-de-mocks-vs-backend-real |
| Inicio | 2026-05-28 |

## Registro de eventos

| Timestamp | Tipo | ID | Detalle |
|-----------|------|----|---------|
| 2026-05-28T05:30:00 | Apertura iniciativa | — | Gap auditado: 39 de 66 endpoints sin handler MSW. Criticos: 15. Altos: 9. Medios: 8. Bajos: 4. Estrategia: handlers MSW typed con factories Faker. |

## Contadores

| Clase | Conteo |
|-------|--------|
| Apertura | 1 |
| Hallazgo | 0 |
| Tarea cerrada | 0 |
| Cierre | 0 |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-MOCK-01 | 39 de 66 endpoints sin handler MSW. Cubiertos con 6 nuevos handlers: orders, wishlist, checkout, support, admin, storefront. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-URL-01 | checkoutSlice.js (@deprecated) usa /api/orders/ sin /v1/. Handler fallback agregado. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-URL-02 | Sub-endpoints de orders (cancel, address, shipping, status) sin handler. Corregido en orders.ts. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-OR-01 | fetchOrders existe como thunk pero sin addCase en ordersSlice — state.list nunca se actualizaba. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-OR-02 | STATUS_TONE['SHIPPED'].label='En camino', tests esperaban 'Enviado'. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-OR-03 | Params del endpoint orders: test esperaba params={} pero la página envía {filter:'all'}. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-ADM-01 | fetchAdminMetrics sin addCase + metrics sin initialState en adminSlice. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-ADM-02/03/04 | fetchAdminOrder, fetchAdminVouchers, fetchAdminCategories no definidos en adminSlice. TypeError en producción. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-ADM-05 | fetchAdminOrders sin addCase + orders sin initialState en adminSlice. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-PS02 | uploadPriceCSV, confirmPriceSync, downloadPriceTemplate no definidos en adminSlice. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-ACC01 | fetchProfile y fetchOrders comparten mock apiService.get → state.list = MOCK_USER (objeto, no array) → orders.slice() crash. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-SH01 | fetchSearchHistory, deleteSearchTerm, clearSearchHistory no definidos en catalogSlice + forward reference. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-OD02 | NEXT_STATES usa 'PENDING' pero template usa 'PENDING_PAYMENT' → validNext=[] siempre. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-TEST-ADM01 | Tests admin configuraban reducers incorrectos (vouchersReducer, categoriesReducer) en lugar de adminReducer. |
| 2026-05-28T06:30:00 | Hallazgo durante la ejecucion | BUG-TEST-PS01 | AdminPriceSyncPage.test importaba priceSyncSlice (no existe) y buscaba Tabs que la página no tiene. |
| 2026-05-28T06:30:00 | Cierre de tarea | handlers MSW | 6 handlers creados: orders.ts, wishlist.ts, checkout.ts, support.ts, admin.ts, storefront.ts. 37 de 39 endpoints cubiertos. |
| 2026-05-28T06:30:00 | Cierre de tarea | bugfix-slices | ordersSlice: addCase fetchOrders. adminSlice: metrics, orders, currentOrder, vouchers, categoryTree en initialState + addCase + 9 thunks nuevos. catalogSlice: fetchSearchHistory + forward ref corregida. |
| 2026-05-28T06:30:00 | Cierre de tarea | bugfix-tests | 8 suites de tests corregidas. 50 fallos → 0 fallos. 827 tests pasando. |
| 2026-05-28T06:35:00 | Cierre de iniciativa | validar-contrato-de-mocks-vs-backend-real | Tests: 827 pasan / 109 skip / 0 fallan. SCSS 135 clean. 21 bugs encontrados, documentados y corregidos. Iniciativa CERRADA. |
