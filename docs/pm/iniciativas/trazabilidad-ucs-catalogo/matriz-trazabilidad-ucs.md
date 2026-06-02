# Matriz de trazabilidad — catálogo de UCs vs template UI

Mapea cada caso de uso del catálogo (repositorio de documentación de e-commerce,
Sphinx) contra su implementación en `template-ecommerce-ui`. Generada clasificando
las familias en paralelo (5 agentes) con evidencia de código.

> Nomenclatura: el término correcto es **e-commerce**. El repositorio de
> documentación de referencia conserva un typo histórico en su nombre de GitHub.

## Resumen

| Estado | Total | Significado |
|--------|-------|-------------|
| IMPLEMENTADO | 123 | Existe en el UI (con evidencia: componente/página/slice/test) |
| BACKEND-OPS | 23 | No es asunto del UI (emails, webhooks, cron, SSL/SSH, reportes DB) → `template-ecommerce-server` |
| AUSENTE-UI | 8 | Hueco real de UI → alcance de esta iniciativa |

**Huecos AUSENTE-UI (8):** UC-AUTH-16, UC-SRCH-02, UC-PRO-04, UC-PRO-05,
UC-LOG-01, UC-LOG-02, UC-LOG-06, UC-LOG-07.


## AUTH / CART / WISH / SRCH / COM

| UC | Título | Estado | Evidencia / Motivo |
| --- | --- | --- | --- |
| UC-AUTH-01 | registrar | IMPLEMENTADO | `src/pages/auth/RegisterPage.jsx` + `registerUser` en `src/redux/slices/authSlice.js`; tests `tests/unit/pages/RegisterPage.test.jsx`. |
| UC-AUTH-02 | login | IMPLEMENTADO | `src/pages/auth/LoginPage.jsx` + `loginUser` en `src/redux/slices/authSlice.js`; test `tests/unit/pages/LoginPage.test.jsx`. |
| UC-AUTH-03 | logout | IMPLEMENTADO | `logoutUser` en `src/redux/slices/authSlice.js`; disparado desde `src/components/layout/Header/index.jsx` (DropdownItem "Cerrar sesión"). |
| UC-AUTH-04 | renovar sesion | IMPLEMENTADO | `src/hooks/domain/useAuth.js` (`refresh` -> `getCurrentUser`) y manejo de 401 en `src/services/apiService.js`; tokens JWT en cookies httpOnly gestionados por backend (parte server es BACKEND). El gancho de revalidación de sesión sí existe en UI. |
| UC-AUTH-05 | ver perfil | IMPLEMENTADO | `src/pages/account/ProfilePage.jsx` + `fetchProfile` en `authSlice.js`; test `tests/unit/pages/ProfilePage.test.jsx`. |
| UC-AUTH-06 | editar perfil | IMPLEMENTADO | `updateProfile`/`uploadAvatar` en `authSlice.js`; `ProfilePage.jsx` y test asociado. |
| UC-AUTH-07 | gestionar direcciones | IMPLEMENTADO | `src/pages/account/AddressesPage.jsx`, `src/hooks/domain/useAddresses.js`, `src/redux/slices/addressesSlice.js`; ruta en `src/router/AppRouter.jsx`. |
| UC-AUTH-08 | cambiar contrasena | IMPLEMENTADO | `src/pages/account/ChangePasswordPage.jsx` + `changePassword` en `authSlice.js`; ruta en `AppRouter.jsx`. |
| UC-AUTH-09 | recuperar contrasena | IMPLEMENTADO | `src/pages/auth/ForgotPasswordPage.jsx` y `ResetPasswordPage.jsx` + `requestPasswordReset`/`confirmPasswordReset` en `authSlice.js`; tests `tests/unit/pages/ForgotPasswordPage.test.jsx` y `ResetPasswordPage.test.jsx`. |
| UC-AUTH-10 | verificar email | IMPLEMENTADO | `src/pages/auth/VerifyEmailPage.jsx` + `verifyEmail`/`resendVerificationEmail` en `authSlice.js`; ruta en `AppRouter.jsx`. (Envío real del correo = BACKEND.) |
| UC-AUTH-11 | ver usuarios admin | IMPLEMENTADO | `src/pages/admin/AdminUsersPage.jsx` + `src/redux/slices/adminSlice.js` (listado); test `AdminUsersPage.test.jsx`. |
| UC-AUTH-12 | ver perfil usuario admin | IMPLEMENTADO | `src/pages/admin/AdminUserDetailPage.jsx` + `adminSlice.js`; test `AdminUserDetailPage.test.jsx`. |
| UC-AUTH-13 | suspender usuario | IMPLEMENTADO | `suspendUser` en `src/redux/slices/adminUsersSlice.js`/`adminSlice.js`; acción desde `AdminUserDetailPage.jsx`. |
| UC-AUTH-14 | reactivar usuario | IMPLEMENTADO | `reactivateUser` en `adminUsersSlice.js`/`adminSlice.js`; `AdminUserDetailPage.jsx`. |
| UC-AUTH-15 | crear usuario admin | IMPLEMENTADO | `createUser` en `src/redux/slices/adminSlice.js`; flujo en `AdminUsersPage.jsx`; test `AdminUsersPage.test.jsx`. |
| UC-AUTH-16 | dar de baja cuenta | AUSENTE-UI | `src/pages/account/SecurityPage.jsx` muestra una tarjeta "Eliminar cuenta" con botón "Solicitar eliminación" pero sin `onClick`/thunk; no existe acción `deleteAccount`/`deactivateAccount` en `authSlice.js`. Faltaría: cablear el botón a un thunk de baja + confirmación. |
| UC-CART-01 | agregar producto | IMPLEMENTADO | `addToCart` en `src/redux/slices/cartSlice.js`; usado en `src/pages/cart/CartPage.jsx`; tests `cartSlice.test.js`. |
| UC-CART-02 | ver carrito | IMPLEMENTADO | `src/pages/cart/CartPage.jsx` + `fetchCart` en `cartSlice.js`; test `CartPage.test.jsx`. |
| UC-CART-03 | eliminar item | IMPLEMENTADO | `removeCartItem` en `cartSlice.js`; cubierto en `CartPage.test.jsx`. |
| UC-CART-04 | aplicar cupon | IMPLEMENTADO | `applyVoucher`/`removeVoucher` en `cartSlice.js` (equivalencia cupon=voucher); test `CartPage.test.jsx`. |
| UC-CART-05 | guardar carrito | IMPLEMENTADO | `saveCartForLater` en `cartSlice.js` (marcado UC-CART-05); test `CartPage.test.jsx`. |
| UC-CART-06 | sincronizar carrito | IMPLEMENTADO | `syncCartOnLogin` en `cartSlice.js`; test `cartSlice.test.js`. |
| UC-WISH-01 | agregar a wishlist | IMPLEMENTADO | `src/components/wishlist/AddToWishlistButton.jsx` + `wishlistSlice.js`; tests asociados. |
| UC-WISH-02 | ver lista deseos | IMPLEMENTADO | `src/pages/account/WishlistPage.jsx`, `src/hooks/domain/useWishlist.js`, `wishlistSlice.js`; tests `WishlistPage.test.jsx`, `useWishlist.test.jsx`. |
| UC-WISH-03 | mover wishlist carrito | IMPLEMENTADO | Acción de mover a carrito en `wishlistSlice.js`; cubierto en `WishlistPage.test.jsx` y `wishlistSlice.test.js`. |
| UC-SRCH-01 | fulltext search | IMPLEMENTADO | `src/components/catalog/SearchBar.jsx` + `src/hooks/domain/useSearch.js` (GET `/api/v1/catalogue/search/`). |
| UC-SRCH-02 | autocomplete | AUSENTE-UI | Existe el primitivo genérico `src/components/common/Autocomplete/Autocomplete.jsx` y se importa en `SearchBar.jsx`, pero el campo real es un `<input type="search">` con búsqueda solo al submit; ni `SearchBar` ni `SearchModal` cablean sugerencias en vivo a un endpoint. Faltaría: conectar el Autocomplete a un thunk/endpoint de sugerencias con debounce. |
| UC-SRCH-03 | historial busquedas | IMPLEMENTADO | `src/pages/account/SearchHistoryPage.jsx`, `src/hooks/domain/useSearchHistory.js`, `src/redux/slices/searchHistorySlice.js`; ruta en `AppRouter.jsx`. |
| UC-COM-01 | formulario contacto | IMPLEMENTADO | `src/pages/ContactPage.jsx` + `src/redux/slices/contactSlice.js`; ruta en `AppRouter.jsx`; test `ContactPage.test.jsx`. |
| UC-COM-02 | ver mensajes contacto | IMPLEMENTADO | `src/pages/admin/AdminContactMessagesPage.jsx` + `src/hooks/domain/useContactMessages.js` + `contactSlice.js`; test asociado. |
| UC-COM-03 | responder mensaje contacto | IMPLEMENTADO | `src/pages/admin/AdminContactMessageDetailPage.jsx` + `useContactMessages.js` + `contactSlice.js`; test asociado. (Envío real del correo de respuesta = BACKEND.) |


## CAT / PRO / QST / REV / NEW

| UC | Título | Estado | Evidencia / Motivo |
| --- | --- | --- | --- |
| UC-CAT-01 | Ver catálogo | IMPLEMENTADO | `src/pages/catalog/CatalogPage.jsx`, `src/redux/slices/catalogSlice.js` (grid + `fetchProducts`). |
| UC-CAT-02 | Ver detalle | IMPLEMENTADO | `src/pages/catalog/ProductPage.jsx` (galería, variantes, descripción). |
| UC-CAT-03 | Buscar productos | IMPLEMENTADO | `src/components/catalog/SearchBar.jsx`, `src/pages/catalog/SearchResultsPage.jsx`, `src/hooks/domain/useSearch.js`. |
| UC-CAT-03-EXT | Ext: buscar con filtros avanzados | IMPLEMENTADO | `src/components/catalog/CatalogFilters.jsx` (categoría + rango de precio sobre la búsqueda, estado en URL). |
| UC-CAT-04 | Filtrar por categoría | IMPLEMENTADO | `src/components/catalog/CatalogFilters.jsx` (selección de slug del árbol), thunk `fetchProducts({ category })`. |
| UC-CAT-05 | Filtrar por precio | IMPLEMENTADO | `src/components/catalog/CatalogFilters.jsx` (`price_min` / `price_max`). |
| UC-CAT-06 | Gestionar categorías (admin) | IMPLEMENTADO | `src/pages/admin/AdminCategoriesPage.jsx`, `src/hooks/domain/useCategories.js`, ruta `admin/categories`. |
| UC-CAT-07 | Ver productos relacionados | IMPLEMENTADO | `src/components/catalog/RelatedProductsSection.jsx`, `src/hooks/domain/useRelatedProducts.js`. |
| UC-CAT-08 | Listar categorías | IMPLEMENTADO | `src/pages/catalog/CategoryListPage.jsx` (árbol público), ruta `categories`. |
| UC-CAT-09 | Crear producto (admin) | IMPLEMENTADO | `src/pages/admin/AdminProductCreatePage.jsx` + `AdminProductForm.jsx`, ruta `admin/products/new`. |
| UC-CAT-10 | Editar producto (admin) | IMPLEMENTADO | `src/pages/admin/AdminProductEditPage.jsx` + `AdminProductForm.jsx`, ruta `admin/products/:id/edit`. |
| UC-CAT-11 | Desactivar producto (admin) | IMPLEMENTADO | `src/pages/admin/AdminProductForm.jsx` / `AdminProductsPage.jsx` (estado activo del producto), `src/hooks/domain/useAdminProducts.js`. |
| UC-CAT-12 | Sincronizar precios | IMPLEMENTADO | `src/pages/admin/AdminPriceSyncPage.jsx` (carga CSV, preview de diffs, confirmación), ruta `admin/price-sync`. |
| UC-CAT-13 | Asignar múltiples categorías | IMPLEMENTADO | `src/pages/admin/AdminProductForm.jsx` (`DualListBox`, campo `category_ids`). |
| UC-PRO-01 | Crear voucher (admin) | IMPLEMENTADO | `src/components/admin/VoucherCreateForm.jsx` (`createVoucher`), `src/pages/admin/AdminVoucherDetailPage.jsx`. |
| UC-PRO-02 | Editar voucher (admin) | IMPLEMENTADO | `src/pages/admin/AdminVoucherDetailPage.jsx` (`updateVoucher` / PATCH). |
| UC-PRO-03 | Desactivar voucher (admin) | IMPLEMENTADO | `src/pages/admin/AdminVoucherDetailPage.jsx` (toggle `is_active` + `deleteVoucher`). |
| UC-PRO-04 | Reporte de uso de vouchers | AUSENTE-UI | Sólo se muestran contadores inline (`current_uses / max_uses`) en `AdminVouchersPage.jsx` / `AdminVoucherDetailPage.jsx`. No existe vista de métricas (usos totales, descuento otorgado, impacto en ventas); ningún `AdminReport*` referencia vouchers. |
| UC-PRO-05 | Código referral | AUSENTE-UI | Sin coincidencias de `referral`/`referido` en lógica de promociones; los únicos matches son no relacionados (PdfViewer, securityConfig, páginas de orden). No hay UI ni hook de referidos. |
| UC-QST-01 | Hacer pregunta | IMPLEMENTADO | `src/pages/catalog/ProductQuestionAskPage.jsx`, `src/hooks/domain/useProductQuestions.js`, ruta `catalog/:productId/ask`. |
| UC-QST-02 | Ver preguntas | IMPLEMENTADO | `src/pages/catalog/ProductQuestionsListPage.jsx`, `useProductQuestions`, ruta `catalog/:productId/questions`. |
| UC-QST-03 | Responder pregunta (admin) | IMPLEMENTADO | `src/pages/admin/AdminQuestionsAnswerPage.jsx`, `useAdminQuestionsPendingAnswer`, ruta `admin/questions/answer`. |
| UC-QST-04 | Moderar preguntas (admin) | IMPLEMENTADO | `src/pages/admin/AdminQuestionsModerationPage.jsx` (approve/reject), `useAdminQuestionsModeration`. |
| UC-REV-01 | Dejar reseña | IMPLEMENTADO | `src/pages/account/ProductReviewCreatePage.jsx`, `src/hooks/domain/useReviews.js`, ruta `account/orders/:orderId/products/:productId/review`. |
| UC-REV-02 | Ver reseñas | IMPLEMENTADO | `src/pages/catalog/ProductReviewsListPage.jsx`, `useProductReviews`, `src/components/catalog/Rating/Rating.jsx`. |
| UC-REV-03 | Moderar reseñas (admin) | IMPLEMENTADO | `src/pages/admin/AdminReviewsModerationPage.jsx`, `useAdminReviewsModeration`, ruta `admin/reviews/moderation`. |
| UC-NEW-01 | Suscribirse | IMPLEMENTADO | `src/pages/NewsletterSubscribePage.jsx`, `src/redux/slices/newsletterSlice.js`, ruta `newsletter`. |
| UC-NEW-02 | Desuscribirse | IMPLEMENTADO | `src/pages/NewsletterUnsubscribePage.jsx`, ruta `newsletter/unsubscribe`. |
| UC-NEW-03 | Gestionar suscriptores | IMPLEMENTADO | `src/pages/admin/AdminNewsletterSubscribersPage.jsx`, `useNewsletterSubscribers`, ruta `admin/newsletter/subscribers`. |
| UC-NEW-04 | Enviar campaña newsletter | IMPLEMENTADO | `src/pages/admin/AdminNewsletterComposePage.jsx` (compone/programa/envía vía `sendNewsletterBroadcast`), ruta `admin/newsletter/compose`. El envío de emails es backend, pero la composición/disparo en UI existe. |


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


## LOG / NOT / CFG / SUPP / CHT

> Nota: en este catalogo la familia **UC-CHT** corresponde a **variantes de producto**
> (ver/seleccionar/gestionar variantes y precio diferenciado), no a checkout.
> Se clasifica segun el contenido real de los .rst del catalogo.

| UC | Título | Estado | Evidencia / Motivo |
|----|--------|--------|--------------------|
| UC-LOG-01 | Crear guía de envío | AUSENTE-UI | Flujo admin. `AdminLogisticsPage.jsx` solo lista ordenes pendientes y enlaza «Crear guia» a `/admin/orders/:id`, pero `pages/admin/AdminOrderDetailPage.jsx` no tiene formulario de creacion de guia (solo transiciones de estado, cancelar, reembolso). No existe componente ni thunk para crear ShipmentGuide. |
| UC-LOG-02 | Registrar número de rastreo | AUSENTE-UI | Flujo admin. No existe UI ni thunk para registrar tracking number manual; `logisticsSlice.js` solo expone `confirmDelivery`. |
| UC-LOG-03 | Ver estado de envío | IMPLEMENTADO | Actor comprador. `pages/account/OrderDetailPage.jsx` muestra `status_label`, enlace `tracking_url` y `Timeline`. Vista admin en `AdminLogisticsPage.jsx` grupo B (courier, tracking, ultimo estado). |
| UC-LOG-04 | Procesar webhook actualización envío | BACKEND-OPS | Procesamiento server-side de webhook del courier (transportista = sistema externo). Sin contraparte UI. |
| UC-LOG-05 | Confirmar entrega manual | IMPLEMENTADO | `redux/slices/logisticsSlice.js` `confirmDelivery` → POST `/api/v1/logistics/guides/:id/confirm-delivery/`; boton «Confirmar entrega» en `AdminLogisticsPage.jsx` (grupo B). |
| UC-LOG-06 | Gestionar couriers (admin) | AUSENTE-UI | Flujo admin de configuracion de couriers. No existe pagina/CRUD de couriers; `AdminLogisticsPage` solo muestra `courier_name` en lectura. Ninguna ruta `admin/.../couriers`. |
| UC-LOG-07 | Reportar problema de envío | AUSENTE-UI | Actor comprador. No existe UI de «reportar problema/incidencia de envio» (grep sin coincidencias en `pages/`/`components/`). |
| UC-LOG-08 | Ver envíos pendientes despacho (admin) | IMPLEMENTADO | `pages/admin/AdminLogisticsPage.jsx` + `hooks/domain/useLogistics.js` (grupos A/B); ruta `admin/logistics` en `router/AppRouter.jsx`. |
| UC-LOG-10 | Crear guía de remisión | BACKEND-OPS | Documento de acompanamiento generado server-side (modulo ORDERS). Sin UI de emision; `remision` no aparece en el codigo. |
| UC-NOT-01 | Email confirmación orden | BACKEND-OPS | Envio transaccional server-side (regla). |
| UC-NOT-02 | Email estado orden | BACKEND-OPS | Envio transaccional server-side (regla). |
| UC-NOT-03 | Email actualización envío | BACKEND-OPS | Envio transaccional server-side (regla). |
| UC-NOT-04 | Email devolución procesada | BACKEND-OPS | Envio transaccional server-side (regla). |
| UC-NOT-05 | Email reembolso | BACKEND-OPS | Envio transaccional server-side (regla). |
| UC-NOT-06 | Preferencias de notificación | IMPLEMENTADO | `pages/account/NotificationPreferencesPage.jsx` + `hooks/domain/useNotifications.js` + `notificationsSlice.updateNotificationPreferences`; ruta `account/notifications/preferences`. |
| UC-NOT-07 | Notificación manual (admin) | IMPLEMENTADO | `pages/admin/AdminNotificationComposePage.jsx` (`sendManualNotification`, audiencia EMAIL/ORDER/PRODUCT); ruta `admin/notifications/compose`. |
| UC-CFG-01 | Configurar gateways de pago | IMPLEMENTADO | `pages/admin/AdminGatewaysPage.jsx` (CRUD MercadoPago/PayPal, test conexion); ruta `admin/config/gateways`. |
| UC-CFG-02 | Configurar métodos y costos de envío | IMPLEMENTADO | `pages/admin/AdminShippingMethodsPage.jsx` (CRUD metodos de envio); ruta `admin/config/shipping`. |
| UC-CFG-03 | Configurar SiteSettings / IVA | IMPLEMENTADO | `pages/admin/AdminSiteSettingsPage.jsx` (singleton, tabs, IVA via `adminSlice.updateSiteSettings`); ruta `admin/config/site`. |
| UC-CFG-04 | Gestionar contenido estático | IMPLEMENTADO | `pages/admin/AdminStaticPagesPage.jsx` + `AdminStaticPageEditorPage.jsx` (about/terms/faq...); rutas `admin/pages` y `admin/pages/:slug`. |
| UC-CFG-05 | Gestionar datos de contacto | IMPLEMENTADO | `pages/admin/AdminSiteSettingsPage.jsx` edita `support_email`, `support_phone`, `facebook_url`, `instagram_url` (datos de contacto/redes). |
| UC-SUPP-01 | Crear ticket | IMPLEMENTADO | `pages/account/SupportTicketCreatePage.jsx`; ruta `account/support/...`. |
| UC-SUPP-02 | Ver ticket (comprador y admin) | IMPLEMENTADO | `pages/account/SupportTicketDetailPage.jsx` (comprador) y `pages/admin/AdminSupportPage.jsx` (bandeja admin). |
| UC-SUPP-03 | Responder ticket | IMPLEMENTADO | `components/support/SupportTicketReplyForm.jsx` (`replySupportTicket`, modo admin/comprador). |
| UC-SUPP-04 | Cerrar ticket | IMPLEMENTADO | `components/support/SupportTicketActions.jsx` (`closeSupportTicket`/`reopenSupportTicket`). |
| UC-SUPP-05 | Reporte de tickets | IMPLEMENTADO | `pages/admin/AdminSupportPage.jsx` (bandeja con filtros estado + busqueda `q`, `useAdminSupportTickets`). |
| UC-CHT-01 | Ver variantes | IMPLEMENTADO | `pages/catalog/ProductPage.jsx` renderiza `product.variants` (seccion Variants). |
| UC-CHT-02 | Seleccionar variante | IMPLEMENTADO | `components/catalog/VariantSelector/` + estado `variant`/`setVariant` en `ProductPage.jsx`; `hooks/useAddProductWithVariant.js`. |
| UC-CHT-03 | Gestionar variantes (admin) | IMPLEMENTADO | `pages/admin/AdminVariantsPage.jsx` (CRUD variantes, activar/desactivar). |
| UC-CHT-04 | Precio diferenciado por variante | IMPLEMENTADO | `pages/admin/AdminVariantPricePage.jsx` (asigna/quita `price_override`; consumido en `ProductPage.jsx` via `variant.price_override`). |


## ADM / SYS / INV / REP / RPT / OPS / DASH / INC / DB-RPT

| UC | Título | Estado | Evidencia / Motivo |
| --- | --- | --- | --- |
| UC-ADM-01 | Gestionar usuarios | IMPLEMENTADO | `src/pages/admin/AdminUsersPage.jsx`, `src/pages/admin/AdminUserDetailPage.jsx`, `src/hooks/domain/useAdminUsers.js` (ref. UC-ADM-01), `src/redux/slices/adminUsersSlice.js` |
| UC-ADM-02 | Gestionar permisos | IMPLEMENTADO | `src/pages/admin/AdminPermissionsPage.jsx` (ref. UC-ADM-02), `src/hooks/domain/usePermissions.js`, `src/redux/slices/permissionsSlice.js` |
| UC-ADM-03 | Auditoría | IMPLEMENTADO | `src/pages/admin/AdminAuditLogPage.jsx` (ref. UC-ADM-03), `src/hooks/domain/useAuditLog.js` |
| UC-ADM-04 | Configuración sistema | IMPLEMENTADO | `src/pages/admin/AdminSystemSettingsPage.jsx` + `src/pages/admin/AdminConfigPage.jsx` (ref. UC-ADM-04), `src/hooks/domain/useSystemSettings.js`, `src/redux/slices/settingsSlice.js` |
| UC-ADM-05 | Backup automático | IMPLEMENTADO | `src/pages/admin/AdminBackupsPage.jsx` (ref. UC-ADM-05), `src/hooks/domain/useBackups.js`, `src/redux/slices/backupsSlice.js` |
| UC-SYS-01 | Cancelar orden por timeout | BACKEND-OPS | Job/cron server-side de cancelación por timeout; sin UI en template (regla clave UC-SYS-*) |
| UC-SYS-02 | Desactivar vouchers expirados | BACKEND-OPS | Tarea cron server-side; sin UI en template (regla clave UC-SYS-*) |
| UC-SYS-03 | Notificar stock mínimo | BACKEND-OPS | Notificación server-side / job; sin UI (regla clave UC-SYS-*) |
| UC-SYS-04 | Reenviar emails fallidos | BACKEND-OPS | Reintento server-side de emails; sin UI (regla clave UC-SYS-*; ver BR-019) |
| UC-SYS-05 | Soft delete historial | BACKEND-OPS | Comportamiento de persistencia server-side; sin UI (regla clave UC-SYS-*) |
| UC-SYS-06 | Loud errors | BACKEND-OPS | Manejo/registro de errores server-side; sin UI (regla clave UC-SYS-*) |
| UC-INV-01 | Ver stock | IMPLEMENTADO | `src/pages/admin/AdminInventoryPage.jsx` (ref. UC-INV-01), `src/hooks/domain/useInventory.js`, `src/redux/slices/inventorySlice.js` |
| UC-INV-02 | Decrementar stock | IMPLEMENTADO | `src/pages/admin/AdminInventoryMovementsPage.jsx` (ref. UC-INV-02), `src/hooks/domain/useInventory.js`, `src/redux/slices/inventorySlice.js` |
| UC-INV-03 | Restaurar stock | IMPLEMENTADO | `src/pages/admin/AdminInventoryMovementsPage.jsx` (ref. UC-INV-03), `src/redux/slices/inventorySlice.js` |
| UC-INV-04 | Ajustar stock manual | IMPLEMENTADO | `src/pages/admin/AdminInventoryAdjustPage.jsx` (ref. UC-INV-04), `src/components/admin/StockAdjustModal`, `src/redux/slices/inventorySlice.js` |
| UC-INV-05 | Importar productos CSV | IMPLEMENTADO | `src/pages/admin/AdminInventoryImportPage.jsx` (ref. UC-INV-05), `src/redux/slices/inventorySlice.js` |
| UC-REP-01 | Reporte ingresos ventas | IMPLEMENTADO | `src/pages/admin/AdminReportSalesPage.jsx` (ref. UC-REP-01), `src/hooks/domain/useReports.js` |
| UC-REP-02 | Reporte top sellers | IMPLEMENTADO | `src/pages/admin/AdminReportTopSellersPage.jsx` (ref. UC-REP-02), `src/hooks/domain/useReports.js` |
| UC-REP-03 | Dashboard analítico | IMPLEMENTADO | `src/pages/admin/AdminReportDashboardPage.jsx` (ref. UC-REP-03), `src/hooks/domain/useReports.js` |
| UC-REP-04 | Reporte clientes RFM | IMPLEMENTADO | `src/pages/admin/AdminReportCustomersRfmPage.jsx` (ref. UC-REP-04), `src/hooks/domain/useReports.js` |
| UC-REP-05 | Exportar reportes | IMPLEMENTADO | Exportación en `AdminReportSalesPage.jsx`, `AdminReportTopSellersPage.jsx`, `AdminReportCustomersRfmPage.jsx` (ref. UC-REP-05), `src/hooks/domain/useReports.js` |
| UC-RPT-01 | Ver reporte ventas | IMPLEMENTADO | `src/pages/admin/AdminReportSalesPage.jsx` (página admin de reporte de ventas) |
| UC-RPT-02 | Ver reporte productos | IMPLEMENTADO | `src/pages/admin/AdminReportTopSellersPage.jsx` (reporte de productos/top sellers) |
| UC-RPT-03 | Ver reporte compradores | IMPLEMENTADO | `src/pages/admin/AdminReportCustomersRfmPage.jsx` (reporte de compradores/RFM) |
| UC-RPT-04 | Exportar reporte | IMPLEMENTADO | Exportación en páginas `AdminReport*Page.jsx` vía `src/hooks/domain/useReports.js` |
| UC-OPS-01 | Configurar fail2ban | BACKEND-OPS | Operación de servidor (fail2ban); sin UI (regla clave UC-OPS-*) |
| UC-OPS-02 | Aplicar hardening SSH | BACKEND-OPS | Hardening SSH server-side; sin UI (regla clave UC-OPS-*) |
| UC-OPS-03 | Configurar SSL | BACKEND-OPS | Configuración SSL del servidor; sin UI (regla clave UC-OPS-*) |
| UC-OPS-04 | Renovar certificado SSL | BACKEND-OPS | Renovación de certificado server-side; sin UI (regla clave UC-OPS-*) |
| UC-DASH-01 | Crear descuento producto | IMPLEMENTADO | `src/components/admin/ProductDiscountCreateForm.jsx` + `src/pages/admin/AdminProductDiscountsPage.jsx` (ref. UC-DASH-01), `src/redux/slices/productDiscountsSlice.js` |
| UC-DASH-02 | Editar descuento producto | IMPLEMENTADO | `src/components/admin/ProductDiscountEditForm.jsx` + `src/pages/admin/AdminProductDiscountsPage.jsx` (ref. UC-DASH-02) |
| UC-DASH-03 | Desactivar descuento producto | IMPLEMENTADO | `src/pages/admin/AdminProductDiscountsPage.jsx` (acción deactivate, ref. UC-DASH-03), `src/redux/slices/productDiscountsSlice.js` |
| UC-DASH-04 | Ver descuentos activos | IMPLEMENTADO | `src/pages/admin/AdminProductDiscountsPage.jsx` + `src/hooks/domain/useProductDiscounts.js` (ref. UC-DASH-04, is_active=True) |
| UC-INC-01 | Verificar propiedad orden | BACKEND-OPS | Guard server-side de verificación de propiedad; sin UI (regla clave UC-INC-*) |
| UC-INC-02 | Recuperar carrito sesión | BACKEND-OPS | Recuperación de carrito server-side; sin UI (regla clave UC-INC-*) |
| UC-INC-03 | Enviar email con plantilla | BACKEND-OPS | Envío de email con plantilla server-side; sin UI (regla clave UC-INC-*) |
| UC-DB-RPT-01 | Reporte catálogo por categoría | BACKEND-OPS | Reporte a nivel de base de datos; sin UI (regla clave UC-DB-RPT-*) |
| UC-DB-RPT-02 | Reporte stock crítico | BACKEND-OPS | Reporte a nivel de base de datos; sin UI (regla clave UC-DB-RPT-*) |
| UC-DB-RPT-03 | Resumen ejecutivo catálogo | BACKEND-OPS | Reporte a nivel de base de datos; sin UI (regla clave UC-DB-RPT-*) |

