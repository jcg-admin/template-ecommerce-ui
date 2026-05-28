# Analisis: validar-contrato-de-mocks-vs-backend-real

| Campo | Valor |
|-------|-------|
| Iniciativa | validar-contrato-de-mocks-vs-backend-real |
| Fecha | 2026-05-28 |

## Gap auditado

| Metrica | Valor |
|---------|-------|
| Endpoints totales en el template | 66 |
| Cubiertos por handlers MSW | 27 |
| Sin handler MSW | 39 |

## Clasificacion de gaps por impacto

### Critico — el template falla en modo mock si no tienen handler

| Endpoint | Slice/Componente que lo llama |
|----------|------------------------------|
| GET  /api/v1/orders/ | ordersSlice — OrdersPage |
| GET  /api/v1/orders/:order_number/ | ordersSlice — OrderDetailPage |
| GET  /api/v1/wishlist/ | wishlistSlice — WishlistPage |
| POST /api/v1/wishlist/ | wishlistSlice — AddToWishlistButton |
| DELETE /api/v1/wishlist/:id/ | wishlistSlice |
| POST /api/v1/wishlist/:id/move-to-cart/ | wishlistSlice |
| POST /api/v1/checkout/ | paymentsSlice — CheckoutPage |
| GET  /api/v1/checkout/eligibility/ | checkoutSlice |
| GET  /api/v1/admin/metrics/ | adminSlice — AdminDashboardPage |
| GET  /api/v1/admin/orders/ | adminSlice — AdminOrdersPage |
| GET  /api/v1/admin/products/ | adminSlice — AdminProductsPage |
| GET  /api/v1/admin/users/ | adminSlice — AdminUsersPage |
| GET  /api/v1/admin/vouchers/ | adminSlice — AdminVouchersPage |
| GET  /api/v1/admin/categories/ | adminSlice — AdminCategoriesPage |
| GET  /api/v1/admin/returns/ | adminSlice — AdminReturnsPage |

### Alto — el template muestra pantalla vacía o error

| Endpoint | Impacto |
|----------|---------|
| GET  /api/v1/auth/addresses/ | CheckoutPage sin direcciones |
| GET  /api/v1/support/tickets/ | SupportPage sin tickets |
| POST /api/v1/support/tickets/ | SupportPage no puede crear |
| GET  /api/v1/support/tickets/:id/ | SupportTicketDetailPage vacía |
| GET  /api/v1/admin/support/tickets/ | AdminSupportPage vacía |
| GET  /api/v1/admin/payments | AdminPaymentsPage vacía |
| GET  /api/v1/admin/settings/ | AdminSettingsPage vacía |
| POST /api/v1/admin/price-sync/* | AdminPriceSyncPage sin funcionar |
| GET  /api/v1/notifications/preferences/ | NotificationsPage vacía |

### Medio — funcionalidad secundaria

| Endpoint | Impacto |
|----------|---------|
| POST /api/v1/auth/profile/avatar/ | Subida de avatar sin feedback |
| POST /api/v1/auth/resend-verification/ | Botón reenviar sin respuesta |
| POST /api/v1/checkout/express/ | Checkout express sin funcionar |
| POST /api/v1/payments/retry | Reintento de pago sin respuesta |
| GET  /api/v1/search/history/ | SearchHistoryPage vacía |
| GET  /api/v1/admin/product-discounts/ | AdminDiscountsPage vacía |
| POST /api/v1/admin/backups/trigger/ | Backups sin funcionar |
| POST /api/v1/notifications/read-all/ | Marcar leídas sin respuesta |

### Bajo — features opcionales

| Endpoint | Impacto |
|----------|---------|
| POST /api/v1/contact/messages/ | ContactPage sin confirmacion |
| POST /api/v1/newsletter/subscribe/ | Newsletter sin confirmacion |
| POST /api/v1/newsletter/unsubscribe/ | Igual |
| GET  /api/v1/admin/notifications/ | Panel admin notificaciones |

## Estrategia de mitigacion elegida

Handlers MSW con datos typed contra domain.ts usando factories Faker
ya disponibles. No se adopta zod/ajv ni generacion desde OpenAPI
(requieren backend con OpenAPI, que el template no garantiza).

Las factories existentes (product, cart, order, user, voucher) ya
cubren los tipos del dominio con `@faker-js/faker`. Los nuevos
handlers seguiran el mismo patron.

El objetivo de esta iniciativa es que ningún endpoint del template
quede sin handler, de modo que el modo demo/mock sea completamente
funcional sin backend.
