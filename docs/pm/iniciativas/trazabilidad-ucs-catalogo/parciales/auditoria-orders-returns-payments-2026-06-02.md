```yml
created_at: 2026-06-02T20:23:36
project: template-ecommerce-ui
author: claude
status: completado
version: 1.0.0
iniciativa: trazabilidad-ucs-catalogo
familia: ORD / RET / PAY
```

.. reporte::
   :agente: auditor-trazabilidad-ucs
   :tarea: Re-auditar claims IMPLEMENTADO/BACKEND-OPS de la familia ORD/RET/PAY contra el código actual (HEAD) y el catálogo canónico de UCs
   :fecha: 2026-06-02
   :herramientas: Read, Bash (ls, grep, sed, git), find
   :basado-en: template-ecommerce-ui@c3e8b98 vs /tmp/references/e-comerce-docs/source/requisitos/casos-uso/{orders,devoluciones,payments}/

# Auditoría — ORD / RET / PAY (2026-06-02)

Re-verificación de la sección "ORD / RET / PAY" de
`matriz-trazabilidad-ucs.md` (filas 108-135) contra el código del repo a
HEAD `c3e8b98` y los `.rst` canónicos del catálogo.

Cada celda "Verificado" cita un archivo realmente inspeccionado en esta
sesión. La columna "Discrepancia" anota cuando el artefacto falta, está
desactualizado, o la aceptación nuclear del UC no se cumple pese a la
clasificación IMPLEMENTADO.

## Contexto del refactor de cuentas

El repo cambió recientemente: se removió `AccountSidebar` de páginas de
cuenta. Verificado que las páginas citadas siguen renderizando su propio
contenido:

- `OrdersPage.jsx:12,34,38` — importa y despacha `fetchOrders` en `useEffect`; sin import de `AccountSidebar`. Renderiza su propio contenido. [PROVEN]
- `OrderDetailPage.jsx:14,34,38` — importa `fetchOrderDetail`, despacha en `useEffect`, renderiza Timeline + tracking. Sin `AccountSidebar`. [PROVEN]
- `grep AccountSidebar` en ambas páginas → 0 coincidencias. No hay referencia colgante al sidebar removido.

## Tabla de verificación

| UC | Claim (matriz) | Verificado | Evidencia file:line | Discrepancia |
|----|----------------|------------|---------------------|--------------|
| UC-ORD-01 | IMPLEMENTADO — CheckoutPage + thunk `checkout` | SÍ | `src/pages/checkout/CheckoutPage.jsx` existe; `ordersSlice.js:31` `checkoutOrder` (action `orders/checkout`, marcado UC-ORD-01 en :30) | Ninguna (matriz dice thunk `checkout`; el export real es `checkoutOrder`, action type `orders/checkout` — shorthand) |
| UC-ORD-01-EXT | IMPLEMENTADO — ExpressCheckoutPage + `fetchExpressEligibility`/`submitExpress` | SÍ | `ExpressCheckoutPage.jsx:14,28,34`; `paymentsSlice.js:270` `fetchExpressEligibility`, `:288` `submitExpress` | Ninguna |
| UC-ORD-02 | IMPLEMENTADO — OrderDetailPage + `fetchOrderDetail` | SÍ | `OrderDetailPage.jsx:14,38`; `ordersSlice.js:184-191` extraReducers `fetchOrderDetail` (UC-ORD-02 :183) | Ninguna |
| UC-ORD-03 | IMPLEMENTADO — OrdersPage dispatch `fetchOrders`; useOrders | SÍ | `OrdersPage.jsx:12,38`; `ordersSlice.js:196-204` extraReducers `fetchOrders`; `hooks/domain/useOrders.js` existe | Ninguna |
| UC-ORD-04 | IMPLEMENTADO — thunk `cancelOrder` + tests; **botón cancelación cliente no cableado**; UI "Solicitar reembolso" presente | PARCIAL | thunk `ordersSlice.js:44` `cancelOrder` (UC-ORD-04 :43); test `tests/unit/reducers/ordersSlice.cancel.test.js` existe; `OrderDetailPage.jsx:14` SOLO importa `fetchOrderDetail` (NO `cancelOrder`); botón "Solicitar reembolso" `:290` SIN `onClick` | **SÍ — aceptación no cumplida.** El `.rst` `uc-ord-04...rst:81` define Actor=**Comprador** y flujo principal `:149` "Desde el detalle de la orden, solicita cancelarla". La capa redux existe y está testeada, pero el UI del comprador NO dispara la cancelación: `OrderDetailPage` no importa ni despacha `cancelOrder`, y "Solicitar reembolso" (`:290`) no tiene handler. El caveat de la matriz SIGUE VIGENTE; la clasificación IMPLEMENTADO sobre-representa el estado (es PARCIAL: redux sí, UI comprador no). |
| UC-ORD-05 | IMPLEMENTADO — OrderEditPage tab address; thunk `updateAddress` | SÍ | `OrderEditPage.jsx:15,35` (tab `address`); `ordersSlice.js:56` thunk `updateOrderAddress` (action `orders/updateAddress`, UC-ORD-05 :56) | Ninguna (matriz dice `updateAddress`; export real `updateOrderAddress`) |
| UC-ORD-06 | IMPLEMENTADO — OrderEditPage `updateOrderShipping`, SHIPPING_OPTIONS; thunk `updateShipping` | SÍ | `OrderEditPage.jsx:15,22` (`SHIPPING_OPTIONS`); `ordersSlice.js:71` thunk (action `orders/updateShipping`, UC-ORD-06 :69) | Ninguna |
| UC-ORD-07 | IMPLEMENTADO — AdminOrderDetailPage + thunk `adminTransition` | SÍ | `AdminOrderDetailPage.jsx:16` importa `updateOrderStatus`; `ordersSlice.js:85` `adminTransitionOrderStatus` (action `orders/adminTransition`, UC-ORD-07 :84) | Ninguna (thunk real `adminTransitionOrderStatus`; matriz usa shorthand `adminTransition`) |
| UC-ORD-08 | IMPLEMENTADO — thunk `adminCancel`; test; AdminOrderDetailPage | SÍ | `ordersSlice.js:102` `adminCancelOrder` (action `orders/adminCancel`, UC-ORD-08 :101); test `ordersSlice.adminCancel.test.js` existe; `AdminOrderDetailPage.jsx:16,91` despacha `adminCancelOrder` | Ninguna |
| UC-ORD-09 | IMPLEMENTADO — AdminOrdersPage (estado search + filtros) | SÍ | `AdminOrdersPage.jsx:47,54` (`search`, `fetchAdminOrders({filter,search,dateStart,dateEnd})`) | Ninguna |
| UC-ORD-10 | IMPLEMENTADO — AdminOrdersDashboardPage (UC-ORD-10) | SÍ | `AdminOrdersDashboardPage.jsx:3` "UC-ORD-10: Dashboard transaccional", `:11` useAdminDashboard | Ninguna |
| UC-PAY-01 | IMPLEMENTADO — PaymentSelectionPage + `initiateMercadoPago` | SÍ | `PaymentSelectionPage.jsx:18` import `initiateMercadoPagoPayment` (UC-PAY-01 :3); `paymentsSlice.js:47` `initiateMercadoPagoPayment` | Ninguna |
| UC-PAY-01-EXT | IMPLEMENTADO — PaymentSelectionPage cuotas/MSI | SÍ | `PaymentSelectionPage.jsx:25` `MSI_OPTIONS`, `:37,48` `installments`; `paymentsSlice.js:44` installments en payload MP | Ninguna |
| UC-PAY-02 | IMPLEMENTADO — PaymentSelectionPage + `initiatePayPal` | SÍ | `PaymentSelectionPage.jsx:19` import `initiatePayPalPayment`; `paymentsSlice.js:73` `initiatePayPalPayment` (UC-PAY-02 :70) | Ninguna |
| UC-PAY-03 | BACKEND-OPS — webhook server-side; ref config en AdminGatewaysPage | SÍ | `.rst` `uc-pay-03...rst:36` Actor="Sistema (proceso automatico disparado por el gateway)"; `AdminGatewaysPage.jsx:81` muestra Webhook URL `/api/v1/payments/webhooks/{key}/` (config, no flujo) | Ninguna — clasificación correcta (server-side, sin UI esperada) |
| UC-PAY-04 | BACKEND-OPS — webhook server-side; ref config en AdminGatewaysPage | SÍ | `.rst` `uc-pay-04...rst:36` Actor="Sistema (proceso automatico disparado por PayPal)"; `AdminGatewaysPage.jsx:81,22` (`webhook_id`) | Ninguna — correcta. Nota: matriz cita rutas literales `webhooks/mercadopago/` y `webhooks/paypal/`; en código es plantilla `{key}` que resuelve a esas. Imprecisión menor de redacción, no discrepancia. |
| UC-PAY-05 | IMPLEMENTADO — PaymentStatusPage | SÍ | `PaymentStatusPage.jsx:3` "UC-PAY-05: Ver el estado actual del pago"; `:5` usePaymentStatus | Ninguna |
| UC-PAY-06 | IMPLEMENTADO — PaymentHistoryPage + `fetchPaymentHistory` | SÍ | `PaymentHistoryPage.jsx:3` "UC-PAY-06", `:7,39` consume `usePaymentHistory` (hook); thunk `fetchPaymentHistory` existe en `paymentsSlice.js:252` | Ninguna funcional. Imprecisión menor: la página consume datos vía el hook React Query `usePaymentHistory`, no el thunk redux `fetchPaymentHistory` directamente; ambos existen. |
| UC-PAY-07 | BACKEND-OPS — Actor=Sistema (reembolso automático server-side) | SÍ | `.rst` `uc-pay-07...rst:73` Actor="**Sistema** (proceso iniciado automaticamente por cancelacion o devolucion aprobada)" | Ninguna — clasificación correcta (sin flujo UI; la acción admin equivalente es UC-PAY-09) |
| UC-PAY-08 | IMPLEMENTADO — PaymentRetryPage + thunk `retry` | SÍ | `PaymentRetryPage.jsx:3` "UC-PAY-08", `:11,37` despacha `retryPayment`; `paymentsSlice.js:90` `retryPayment` (action `payments/retry`) | Ninguna |
| UC-PAY-09 | IMPLEMENTADO — AdminPaymentRefundPage + RefundModal (`adminCreateRefund`); thunk `adminRefund` | SÍ | `AdminPaymentRefundPage.jsx:3,14,63` despacha `requestAdminRefund`; `paymentsSlice.js:115` `requestAdminRefund` (action `payments/adminRefund`); `RefundModal/index.jsx:11,40` usa `adminCreateRefund` (adminSlice) | Ninguna funcional. Nota: matriz mezcla dos thunks (`requestAdminRefund` en paymentsSlice + `adminCreateRefund` en adminSlice); ambos existen, "adminRefund" es shorthand del action type. |
| UC-PAY-11 | IMPLEMENTADO — AdminPaymentsPage (filtros + totales) | SÍ | `AdminPaymentsPage.jsx:3-4` "UC-PAY-11 ... filtros por estado, gateway y rango de fechas + totales", `:53` filters state | Ninguna |
| UC-RET-01 | IMPLEMENTADO — ReturnCreatePage + thunk `create` | SÍ | `ReturnCreatePage.jsx:3,9` import `createReturnRequest`; `returnsSlice.js:36` `createReturnRequest` (action `returns/create`, UC-RET-01 :24) | Ninguna |
| UC-RET-02 | IMPLEMENTADO — AdminReturnReviewPanel + AdminReturnDetailPage; `approve`/`reject`/`requestInfo` | SÍ | `AdminReturnReviewPanel.jsx:3,9,10` (`approveReturnRequest`,`rejectReturnRequest`); `returnsSlice.js:117,133,148` thunks; `AdminReturnDetailPage.jsx` existe | Ninguna |
| UC-RET-03 | IMPLEMENTADO — AdminReturnReceptionPanel; thunk `registerReception` | SÍ | `AdminReturnReceptionPanel.jsx:3` "UC-RET-03"; `returnsSlice.js:164` `registerReception` | Ninguna |
| UC-RET-04 | IMPLEMENTADO — ReturnDetailPage + ReturnsPage; useReturns | SÍ | `ReturnDetailPage.jsx:3`, `ReturnsPage.jsx:3` ("UC-RET-04"); `returnsSlice.js:61,74` `fetchCustomerReturns`/`fetchCustomerReturnDetail`; `hooks/domain/useReturns.js` existe | Ninguna |
| UC-RET-05 | IMPLEMENTADO — AdminReturnsPage + thunk `fetchAdmin` | SÍ | `AdminReturnsPage.jsx:3` "UC-RET-05"; `returnsSlice.js:91` `fetchAdminReturns` (action `returns/fetchAdmin`) | Ninguna |
| UC-RET-06 | IMPLEMENTADO — AdminReturnRefundPanel + AdminReturnDetailPage; thunk `processRefund` | SÍ | `AdminReturnRefundPanel.jsx:3` "UC-RET-06"; `returnsSlice.js:180` `processRefund` (action `returns/processRefund`) | Ninguna |

## Conteos

- **Filas auditadas (ORD/RET/PAY):** 26
- **CONFIRMED:** 25 (clasificación de la matriz sostenida con evidencia en código; incluye 3 BACKEND-OPS con Actor=Sistema confirmado en `.rst`)
- **DISCREPANCIES:** 1

### DISCREPANCIES (1)

1. **UC-ORD-04 — "Cancelar orden (cliente)" clasificado IMPLEMENTADO pero la
   aceptación nuclear no se cumple en el UI.**
   - Severidad: MEDIA.
   - El `.rst` canónico (`uc-ord-04-cancelar-orden.rst:81` Actor=Comprador;
     `:149` "Desde el detalle de la orden, solicita cancelarla") exige una
     acción de cancelación del comprador desde el detalle de la orden.
   - La capa redux SÍ existe y está testeada: `ordersSlice.js:44`
     `cancelOrder` + `tests/unit/reducers/ordersSlice.cancel.test.js`.
   - Pero `OrderDetailPage.jsx:14` importa **solo** `fetchOrderDetail`; NO
     importa ni despacha `cancelOrder`. El único botón cercano,
     "Solicitar reembolso" (`OrderDetailPage.jsx:290`), no tiene `onClick`.
   - El caveat que la matriz ya anotaba ("botón de cancelación del cliente
     no cableado") **sigue vigente** tras el refactor de cuentas. El estado
     real es PARCIAL (redux/estado implementado; UI comprador ausente), no
     IMPLEMENTADO pleno.

### Notas sin discrepancia (imprecisiones menores de redacción)

- UC-ORD-01/05/06/07, UC-PAY-09: la matriz usa nombres-shorthand de thunks
  (`checkout`, `updateAddress`, `updateShipping`, `adminTransition`,
  `adminRefund`); los exports reales son
  `checkoutOrder`/`updateOrderAddress`/`updateOrderShipping`/
  `adminTransitionOrderStatus`/`requestAdminRefund` (los action-type
  coinciden con el shorthand). Funcionalidad presente; no afecta el estado.
- UC-PAY-06: la página consume `usePaymentHistory` (hook React Query); el
  thunk `fetchPaymentHistory` citado existe en el slice pero la página usa
  el hook. Sin impacto funcional.
- UC-PAY-04: rutas de webhook se renderizan vía plantilla `{key}` en
  `AdminGatewaysPage.jsx:81`, no como literales `mercadopago/`/`paypal/`.

## Verificación de aterrizaje

Todos los archivos `src/...` y `tests/...` citados fueron confirmados con
`ls` (existencia) y `grep`/`sed` (contenido) en esta sesión, contra HEAD
`c3e8b98`. Los `.rst` se leyeron desde
`/tmp/references/e-comerce-docs/source/requisitos/casos-uso/`.
