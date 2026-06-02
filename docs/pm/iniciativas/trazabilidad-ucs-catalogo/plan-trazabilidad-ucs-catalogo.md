# Plan — trazabilidad-ucs-catalogo

**Estrategia:** TDD por UC (test→red→green), handler MSW para el flujo demo,
integración en la página/flujo real, una tarea atómica por archivo. Verificación
por fase: jest + check-scss + build:demo. Agentes en paralelo por dominio
(archivos disjuntos).

## FASE 1 — Documentación (HECHA)

- [x] Matriz de trazabilidad de los 158 UCs (5 agentes clasificadores).
- [x] Premise Gate 0c → COLAPSAR (8 huecos UI reales).

## FASE 2 — Cuenta y búsqueda (storefront)

| UC | Tarea | Integración |
|----|-------|-------------|
| UC-AUTH-16 | Baja de cuenta: `deleteAccount` thunk + MSW + cablear botón en `SecurityPage` con confirmación + test | `authSlice`, `SecurityPage.jsx`, `auth.ts` |
| UC-SRCH-02 | Autocomplete: endpoint de sugerencias (MSW) + `useSearchSuggestions` con debounce + conectar `Autocomplete` en `SearchBar`/`SearchModal` + test | `catalog.ts` (mock), `SearchBar.jsx` |

## FASE 3 — Promociones

| UC | Tarea | Integración |
|----|-------|-------------|
| UC-PRO-04 | Reporte de uso de vouchers: vista admin con métricas (usos, descuento otorgado) + MSW + test | `AdminVoucherUsagePage` (o sección en `AdminVouchersPage`) |
| UC-PRO-05 | Código de referido: página "Referidos" en la cuenta (mostrar/compartir código) + thunk + MSW + test | `ReferralPage`, `referralSlice` o `authSlice`, ruta |

## FASE 4 — Logística

| UC | Tarea | Integración |
|----|-------|-------------|
| UC-LOG-01 | Crear guía de envío (admin): form + `createShipmentGuide` thunk + MSW + test | `AdminOrderDetailPage`, `logisticsSlice` |
| UC-LOG-02 | Registrar número de rastreo (admin): input + `setTrackingNumber` thunk + MSW + test | `AdminOrderDetailPage`, `logisticsSlice` |
| UC-LOG-06 | Gestionar couriers (admin CRUD): página + slice + MSW + ruta + test | `AdminCouriersPage`, `logisticsSlice`/`couriersSlice` |
| UC-LOG-07 | Reportar problema de envío (comprador): UI en `OrderDetailPage` + `reportShippingIssue` thunk + MSW + test | `OrderDetailPage`, `ordersSlice`/`logisticsSlice` |

## FASE 5 — Verificación y cierre

- [ ] `npm test` 0 fallos; `check-scss` clean; `build:demo` OK.
- [ ] (Opcional) checks E2E de los flujos nuevos.
- [ ] `decisiones-*.md` + actualizar matriz (los 8 pasan a IMPLEMENTADO) + índice.

## Notas

- Cada UC nuevo se etiqueta con su `UC-XXX-NN` en el código (trazabilidad), como
  el resto del template.
- BACKEND-OPS (23) fuera de alcance: pertenecen a `template-ecommerce-server`.
