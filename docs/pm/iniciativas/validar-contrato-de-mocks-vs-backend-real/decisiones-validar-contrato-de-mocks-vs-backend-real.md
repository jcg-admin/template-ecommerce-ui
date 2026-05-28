# Decisiones: validar-contrato-de-mocks-vs-backend-real

| Campo | Valor |
|-------|-------|
| Iniciativa | validar-contrato-de-mocks-vs-backend-real |
| Fecha apertura | 2026-05-28 |
| Fecha cierre | 2026-05-28 |

## Seccion 1 — Decisiones de arquitectura

### dec-msw-typed-con-factories
Los handlers MSW se escriben en TypeScript con tipos de `domain.ts`
y usan las factories Faker existentes (`createOrder`, `createProduct`,
`createUser`, `createVoucher`). No se adoptó zod/ajv ni generación
desde OpenAPI porque el template no garantiza que el backend los exponga.

### dec-handlers-por-dominio
Cada dominio tiene su propio archivo de handler:
`orders.ts`, `wishlist.ts`, `checkout.ts`, `support.ts`,
`admin.ts`, `storefront.ts`. Se registran en `handlers/index.ts`.

### dec-thunks-antes-del-slice
Los thunks que son referenciados en los `addCase` del builder
deben declararse **antes** del `createSlice`. Los thunks declarados
después generan forward references — `addCase(undefined)` — y el
reducer nunca se ejecuta. Patrón correcto documentado en BUG-SH01.

## Seccion 2 — Resultado cuantitativo

| Métrica | Antes | Después |
|---------|-------|---------|
| Tests pasando | 669 (baseline original) | 827 |
| Tests fallando | 50 (línea base inicio sesión) | 0 |
| Suites fallando | 9 | 0 |
| Endpoints sin handler MSW | 39 de 66 | 2 de 66 |
| Thunks faltantes en slices | 12 | 0 |
| SCSS entries | 135 | 135 |

## Seccion 3 — Bugs encontrados durante la ejecución

### Handlers MSW faltantes
| Bug | Endpoints cubiertos |
|-----|---------------------|
| BUG-MOCK-01 | 37 endpoints en 6 handlers nuevos |
| BUG-URL-01 | /api/orders/ legacy (checkoutSlice @deprecated) |
| BUG-URL-02 | cancel, address, shipping, status de orders |

### Bugs en slices (estado Redux)
| Bug | Slice | Descripción |
|-----|-------|-------------|
| BUG-OR-01 | ordersSlice | fetchOrders sin addCase → state.list nunca actualizado |
| BUG-ADM-01 | adminSlice | fetchAdminMetrics sin addCase + metrics sin initialState |
| BUG-ADM-02 | adminSlice | fetchAdminOrder no definido |
| BUG-ADM-03 | adminSlice | fetchAdminVouchers no definido |
| BUG-ADM-04 | adminSlice | fetchAdminCategories no definido |
| BUG-ADM-05 | adminSlice | fetchAdminOrders sin addCase + orders sin initialState |
| BUG-PS02 | adminSlice | uploadPriceCSV, confirmPriceSync, downloadPriceTemplate no definidos |
| BUG-SH01 | catalogSlice | fetchSearchHistory declarado después del slice (forward ref) |
| BUG-OD02 | adminSlice | NEXT_STATES usa 'PENDING' pero domain usa 'PENDING_PAYMENT' |

### Bugs en tests (desactualización)
| Bug | Suite | Descripción |
|-----|-------|-------------|
| BUG-TEST-OP01 | OrdersPage | Sin redux Provider |
| BUG-TEST-AD01 | AdminDashboardPage | Shape de métricas desactualizada |
| BUG-TEST-ADMIN-01 | AdminVouchersPage, AdminCategoriesPage | Reducers incorrectos en store de test |
| BUG-TEST-V01 | AdminVouchersPage | Títulos y botones divergentes |
| BUG-TEST-CAT01 | AdminCategoriesPage | Árbol div, no tabla |
| BUG-TEST-SH01 | SearchHistoryPage | searchHistorySlice no existe |
| BUG-TEST-OD01 | AdminOrderDetailPage | Heading /Pedido X/ vs solo X |
| BUG-TEST-PS01 | AdminPriceSyncPage | priceSyncSlice no existe, Tabs inexistentes |
| BUG-ACC01 | AccountPage | fetchProfile y fetchOrders comparten mock → crash |
| BUG-REG01 | RegisterPage | Labels y textos de botón desactualizados |
| BUG-OR-02 | OrdersPage | STATUS_TONE label incorrecto |
| BUG-OR-03 | OrdersPage | Params del endpoint incorrectos en test |

## Seccion 4 — Criterios de completitud verificados

| Criterio | Resultado |
|----------|-----------|
| 0 tests fallando | PASA (0 de 827) |
| SCSS compile 135 entries | PASA |
| Handlers MSW para endpoints críticos | PASA |
| Todos los thunks importados están definidos | PASA |
| Todos los addCase tienen su thunk declarado | PASA |
