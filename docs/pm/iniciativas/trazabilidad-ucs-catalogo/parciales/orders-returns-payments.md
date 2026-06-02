## ORD / RET / PAY

| UC | Título | Estado | Evidencia / Motivo |
| --- | --- | --- | --- |
| UC-ORD-01 | Crear orden | IMPLEMENTADO | `src/pages/checkout/CheckoutPage.jsx` + thunk `checkout` en `src/redux/slices/ordersSlice.js` |
| UC-ORD-01-EXT | Checkout express | IMPLEMENTADO | `src/pages/checkout/ExpressCheckoutPage.jsx` + `fetchExpressEligibility`/`submitExpress` en `src/redux/slices/paymentsSlice.js` |
| UC-ORD-02 | Ver detalle orden | IMPLEMENTADO | `src/pages/account/OrderDetailPage.jsx`; thunk `fetchOrderDetail` en `ordersSlice.js` |
| UC-ORD-03 | Listar órdenes | IMPLEMENTADO | `src/pages/account/OrdersPage.jsx` (dispatch `fetchOrders`); `src/hooks/domain/useOrders.js` |
| UC-ORD-04 | Cancelar orden (cliente) | IMPLEMENTADO | Thunk `cancelOrder` (UC-ORD-04) + reducers en `ordersSlice.js`, con tests `tests/unit/reducers/ordersSlice.cancel.test.js`. Nota: capa redux/estado implementada; botón de cancelación del cliente no cableado en `OrderDetailPage.jsx`. UI "Solicitar reembolso" presente en página de detalle |
| UC-ORD-05 | Editar dirección orden | IMPLEMENTADO | `src/pages/account/OrderEditPage.jsx` (tab address, `updateOrderAddress`); thunk `updateAddress` en `ordersSlice.js` |
| UC-ORD-06 | Cambiar método envío | IMPLEMENTADO | `src/pages/account/OrderEditPage.jsx` (`updateOrderShipping`, SHIPPING_OPTIONS); thunk `updateShipping` en `ordersSlice.js` |
| UC-ORD-07 | Procesar orden (admin) | IMPLEMENTADO | `src/pages/admin/AdminOrderDetailPage.jsx` + thunk `adminTransition` (UC-ORD-07) en `ordersSlice.js`; `useOrders.js` |
| UC-ORD-08 | Cancelar orden (admin) | IMPLEMENTADO | Thunk `adminCancel` (UC-ORD-08) en `ordersSlice.js`; test `tests/unit/reducers/ordersSlice.adminCancel.test.js`; `src/pages/admin/AdminOrderDetailPage.jsx` |
| UC-ORD-09 | Buscar orden (admin) | IMPLEMENTADO | `src/pages/admin/AdminOrdersPage.jsx` (estado `search` + filtros); `useOrders.js` |
| UC-ORD-10 | Dashboard transaccional (admin) | IMPLEMENTADO | `src/pages/admin/AdminOrdersDashboardPage.jsx` (anotado UC-ORD-10); `useOrders.js` |
| UC-PAY-01 | Mercado Pago | IMPLEMENTADO | `src/pages/checkout/PaymentSelectionPage.jsx` + `initiateMercadoPago` en `paymentsSlice.js`; `usePayments.js` |
| UC-PAY-01-EXT | Cuotas MSI | IMPLEMENTADO | `src/pages/checkout/PaymentSelectionPage.jsx` (UC-PAY-01-EXT, cuotas/MSI) + lógica en `paymentsSlice.js` |
| UC-PAY-02 | PayPal | IMPLEMENTADO | `src/pages/checkout/PaymentSelectionPage.jsx` + `initiatePayPal` en `paymentsSlice.js`; `usePayments.js` |
| UC-PAY-03 | Webhook Mercado Pago | BACKEND-OPS | Webhook server-side (regla clave). Solo referencia de config `/api/v1/payments/webhooks/mercadopago/` en `AdminGatewaysPage.jsx`; sin flujo UI |
| UC-PAY-04 | Webhook PayPal | BACKEND-OPS | Webhook server-side (regla clave). Solo referencia de config `/api/v1/payments/webhooks/paypal/` en `AdminGatewaysPage.jsx`; sin flujo UI |
| UC-PAY-05 | Ver estado pago | IMPLEMENTADO | `src/pages/account/PaymentStatusPage.jsx` (UC-PAY-05); `usePayments.js` |
| UC-PAY-06 | Ver historial pagos | IMPLEMENTADO | `src/pages/account/PaymentHistoryPage.jsx` (UC-PAY-06) + `fetchPaymentHistory` en `paymentsSlice.js` |
| UC-PAY-07 | Solicitar reembolso | BACKEND-OPS | Actor = **Sistema** (proceso automático disparado por cancelación/devolución aprobada, server-side); no es flujo de UI. La acción admin equivalente se cubre en UC-PAY-09 |
| UC-PAY-08 | Reintentar pago | IMPLEMENTADO | `src/pages/account/PaymentRetryPage.jsx` (UC-PAY-08) + thunk `retry` en `paymentsSlice.js` |
| UC-PAY-09 | Procesar reembolso (admin) | IMPLEMENTADO | `src/pages/admin/AdminPaymentRefundPage.jsx` (UC-PAY-09) + `RefundModal` (`src/components/admin/RefundModal/index.jsx`, `adminCreateRefund`); thunk `adminRefund` en `paymentsSlice.js` |
| UC-PAY-11 | Reporte transacciones (admin) | IMPLEMENTADO | `src/pages/admin/AdminPaymentsPage.jsx` (UC-PAY-11, filtros estado/gateway/fechas + totales); `usePayments.js` |
| UC-RET-01 | Solicitar devolución | IMPLEMENTADO | `src/pages/account/ReturnCreatePage.jsx` (UC-RET-01) + thunk `create` en `returnsSlice.js` |
| UC-RET-02 | Revisar solicitud devolución | IMPLEMENTADO | `src/components/returns/AdminReturnReviewPanel.jsx` + `src/pages/admin/AdminReturnDetailPage.jsx` (UC-RET-02); thunks `approve`/`reject`/`requestInfo` |
| UC-RET-03 | Registrar recepción devolución | IMPLEMENTADO | `src/components/returns/AdminReturnReceptionPanel.jsx` (UC-RET-03) + `AdminReturnDetailPage.jsx`; thunk `registerReception` |
| UC-RET-04 | Ver estado devolución | IMPLEMENTADO | `src/pages/account/ReturnDetailPage.jsx` + `ReturnsPage.jsx` (UC-RET-04); `useReturns.js` |
| UC-RET-05 | Ver devoluciones pendientes | IMPLEMENTADO | `src/pages/admin/AdminReturnsPage.jsx` (UC-RET-05) + thunk `fetchAdmin`; `useReturns.js` |
| UC-RET-06 | Procesar reembolso devolución | IMPLEMENTADO | `src/components/returns/AdminReturnRefundPanel.jsx` (UC-RET-06) + `AdminReturnDetailPage.jsx`; thunk `processRefund` en `returnsSlice.js` |
