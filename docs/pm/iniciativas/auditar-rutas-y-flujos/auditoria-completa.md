# Auditoría completa de rutas y flujos — 2026-05-28

## 1. Inventario de rutas (88 en router, 99 páginas en disco)

### 1.1 Rutas públicas (sin autenticación)

| Ruta | Página | Estado | Notas |
|------|--------|--------|-------|
| `/` | HomePage | OK | MSW: GET /api/v1/catalogue/?is_featured=true |
| `/catalog` | CatalogPage | OK | MSW: GET /api/v1/catalogue/ + /search/ |
| `/catalog?category=:slug` | CatalogPage | OK — BUG-BROWSER-04 CORREGIDO | Filtra por categoryParam |
| `/catalog/:slug` | ProductPage | OK — BUG-BROWSER-01 CORREGIDO | MSW: GET /api/v1/catalogue/:slug/ |
| `/categories` | CategoryListPage | SIN VERIFICAR | MSW: GET /api/v1/categories/ |
| `/search` | SearchResultsPage | SIN VERIFICAR | MSW: GET /api/v1/catalogue/search/ |
| `/cart` | CartPage | SIN VERIFICAR | MSW: GET /api/v1/cart/ |
| `/contact` | ContactPage | SIN VERIFICAR | MSW: POST /api/v1/contact/ |
| `/newsletter` | NewsletterSubscribePage | SIN VERIFICAR | MSW: POST /api/v1/newsletter/subscribe/ |
| `/newsletter/unsubscribe` | NewsletterUnsubscribePage | SIN VERIFICAR | MSW: POST /api/v1/newsletter/unsubscribe/ |
| `/catalog/:productId/ask` | ProductQuestionAskPage | SIN VERIFICAR | MSW: POST /api/v1/catalogue/questions/ |
| `/catalog/:productId/questions` | ProductQuestionsListPage | SIN VERIFICAR | MSW: GET /api/v1/catalogue/:id/questions/ |
| `/catalog/:productId/reviews` | ProductReviewsListPage | SIN VERIFICAR | MSW: GET /api/v1/catalogue/:id/reviews/ |
| `/checkout` | CheckoutPage | SIN VERIFICAR | MSW: POST /api/v1/checkout/ |
| `/checkout/express` | ExpressCheckoutPage | SIN VERIFICAR | MSW: POST /api/v1/checkout/express/ |
| `/checkout/payment/:orderId` | PaymentSelectionPage | SIN VERIFICAR | MSW: GET /api/v1/payments/gateways/ |
| `/order/:id/payment-return` | PaymentReturnPage | SIN VERIFICAR | MSW: GET /api/v1/payments/:id/status/ |
| `/order/:id/payment-failed` | PaymentFailedPage | SIN VERIFICAR | MSW: GET /api/v1/payments/:id/status/ |
| `/order/:id/confirmation` | OrderSuccessPage | SIN VERIFICAR | MSW: GET /api/v1/orders/:id/ |
| `/auth/login` | LoginPage | SIN VERIFICAR | MSW: POST /api/v1/auth/login/ — creds: comprador@test.mx / Test1234! |
| `/auth/register` | RegisterPage | SIN VERIFICAR | MSW: POST /api/v1/auth/register/ |
| `/auth/forgot-password` | ForgotPasswordPage | SIN VERIFICAR | MSW: POST /api/v1/auth/password-reset/ |
| `/auth/reset-password/:uid/:token` | ResetPasswordPage | SIN VERIFICAR | MSW: POST /api/v1/auth/password-reset/confirm/ |
| `/auth/verify-email` | VerifyEmailPage | SIN VERIFICAR | MSW: POST /api/v1/auth/verify-email/ |
| `/404` | NotFoundPage | RUTA FALTANTE — ver HALLAZGO-ROUTER-01 | path="404" sin slash inicial |
| `*` | Navigate a /404 | OK | Fallback correcto |

### 1.2 Rutas protegidas — cuenta del comprador (requieren sesión)

Credenciales de prueba: `comprador@test.mx` / `Test1234!`

| Ruta | Página | Estado | Notas |
|------|--------|--------|-------|
| `/account` | AccountPage | SIN VERIFICAR | Resumen de cuenta |
| `/account/orders` | OrdersPage | SIN VERIFICAR | MSW: GET /api/v1/orders/ |
| `/account/orders/:id` | OrderDetailPage | SIN VERIFICAR | MSW: GET /api/v1/orders/:id/ |
| `/account/orders/:id/edit` | OrderEditPage | SIN VERIFICAR | MSW: PATCH /api/v1/orders/:id/ |
| `/account/security` | SecurityPage | SIN VERIFICAR | MSW: POST /api/v1/auth/change-password/ |
| `/account/wishlist` | WishlistPage | SIN VERIFICAR | MSW: GET /api/v1/wishlist/ |
| `/account/profile` | ProfilePage | SIN VERIFICAR | MSW: GET+PATCH /api/v1/auth/profile/ |
| `/account/change-password` | ChangePasswordPage | SIN VERIFICAR | MSW: POST /api/v1/auth/change-password/ |
| `/account/addresses` | AddressesPage | SIN VERIFICAR | MSW: GET /api/v1/addresses/ |
| `/account/search-history` | SearchHistoryPage | SIN VERIFICAR | MSW: GET /api/v1/search/history/ |
| `/account/returns` | ReturnsPage | SIN VERIFICAR | MSW: GET /api/v1/returns/ |
| `/account/returns/new` | ReturnCreatePage | SIN VERIFICAR | MSW: POST /api/v1/returns/ |
| `/account/returns/:id` | ReturnDetailPage | SIN VERIFICAR | MSW: GET /api/v1/returns/:id/ |
| `/account/orders/:orderId/products/:productId/review` | ProductReviewCreatePage | SIN VERIFICAR | MSW: POST /api/v1/catalogue/reviews/ |
| `/account/notifications/preferences` | NotificationPreferencesPage | SIN VERIFICAR | MSW: GET+PATCH /api/v1/notifications/preferences/ |
| `/account/orders/:orderId/payment` | PaymentStatusPage | SIN VERIFICAR | MSW: GET /api/v1/payments/:id/status/ |
| `/account/orders/:orderId/payments` | PaymentHistoryPage | SIN VERIFICAR | MSW: GET /api/v1/payments/history/ |
| `/account/orders/:orderId/payment/retry` | PaymentRetryPage | SIN VERIFICAR | MSW: POST /api/v1/payments/:id/retry/ |
| `/support/tickets` | SupportTicketsPage | SIN VERIFICAR | MSW: GET /api/v1/support/tickets/ |
| `/support/tickets/new` | SupportTicketCreatePage | SIN VERIFICAR | MSW: POST /api/v1/support/tickets/ |
| `/support/tickets/:id` | SupportTicketDetailPage | SIN VERIFICAR | MSW: GET /api/v1/support/tickets/:id/ |

### 1.3 Rutas protegidas — admin (requieren is_staff=true)

Credenciales de prueba: `admin@e-comerce.example.com` / `Admin1234!`

| Ruta | Página | Estado | Notas |
|------|--------|--------|-------|
| `/admin` | AdminDashboardPage | SIN VERIFICAR | MSW: GET /api/v1/admin/metrics/ |
| `/admin/products` | AdminProductsPage | SIN VERIFICAR | MSW: GET /api/v1/admin/products/ |
| `/admin/products/new` | AdminProductCreatePage | SIN VERIFICAR | MSW: POST /api/v1/admin/products/ |
| `/admin/products/:id/edit` | AdminProductEditPage | SIN VERIFICAR | MSW: GET+PATCH /api/v1/admin/products/:id/ |
| `/admin/products/:productId/variants` | AdminVariantsPage | EN ROUTER — ver HALLAZGO-ROUTER-02 | Duplicado con AdminProductVariantsPage |
| `/admin/categories` | AdminCategoriesPage | SIN VERIFICAR | |
| `/admin/price-sync` | AdminPriceSyncPage | SIN VERIFICAR | |
| `/admin/permissions` | AdminPermissionsPage | SIN VERIFICAR | |
| `/admin/audit-log` | AdminAuditLogPage | SIN VERIFICAR | |
| `/admin/system-settings` | AdminSystemSettingsPage | SIN VERIFICAR | |
| `/admin/backups` | AdminBackupsPage | SIN VERIFICAR | |
| `/admin/orders` | AdminOrdersPage | SIN VERIFICAR | |
| `/admin/orders/:id` | AdminOrderDetailPage | SIN VERIFICAR | |
| `/admin/orders-dashboard` | AdminOrdersDashboardPage | SIN VERIFICAR | |
| `/admin/users` | AdminUsersPage | SIN VERIFICAR | |
| `/admin/users/:pk` | AdminUserDetailPage | SIN VERIFICAR | |
| `/admin/vouchers` | AdminVouchersPage | SIN VERIFICAR | Lista de vouchers |
| `/admin/support` | AdminSupportPage | SIN VERIFICAR | |
| `/admin/returns` | AdminReturnsPage | SIN VERIFICAR | |
| `/admin/returns/:id` | AdminReturnDetailPage | SIN VERIFICAR | |
| `/admin/inventory` | AdminInventoryPage | SIN VERIFICAR | |
| `/admin/inventory/import` | AdminInventoryImportPage | SIN VERIFICAR | |
| `/admin/inventory/:variantId/movements` | AdminInventoryMovementsPage | SIN VERIFICAR | |
| `/admin/inventory/:variantId/adjust` | AdminInventoryAdjustPage | SIN VERIFICAR | |
| `/admin/variants/:variantId/price` | AdminVariantPricePage | SIN VERIFICAR | |
| `/admin/notifications/compose` | AdminNotificationComposePage | SIN VERIFICAR | |
| `/admin/product-discounts` | AdminProductDiscountsPage | SIN VERIFICAR | |
| `/admin/reports/sales` | AdminReportSalesPage | SIN VERIFICAR | |
| `/admin/reports/top-sellers` | AdminReportTopSellersPage | SIN VERIFICAR | |
| `/admin/reports/customers-rfm` | AdminReportCustomersRfmPage | SIN VERIFICAR | |
| `/admin/reports` | AdminReportDashboardPage | SIN VERIFICAR | |
| `/admin/contact/messages` | AdminContactMessagesPage | SIN VERIFICAR | |
| `/admin/contact/messages/:id` | AdminContactMessageDetailPage | SIN VERIFICAR | |
| `/admin/newsletter/subscribers` | AdminNewsletterSubscribersPage | SIN VERIFICAR | |
| `/admin/newsletter/compose` | AdminNewsletterComposePage | SIN VERIFICAR | |
| `/admin/questions/answer` | AdminQuestionsAnswerPage | SIN VERIFICAR | |
| `/admin/questions/moderation` | AdminQuestionsModerationPage | SIN VERIFICAR | |
| `/admin/reviews/moderation` | AdminReviewsModerationPage | SIN VERIFICAR | |
| `/admin/payments` | AdminPaymentsPage | SIN VERIFICAR | |
| `/admin/payments/:paymentId/refund` | AdminPaymentRefundPage | SIN VERIFICAR | |
| `/admin/logistics` | AdminLogisticsPage | SIN VERIFICAR | |
| `/admin/config` | AdminConfigPage | SIN VERIFICAR | Hub de config — ¿enlaza a gateways/shipping/site? |

### 1.4 Páginas en disco SIN ruta en el router (12 huérfanas)

| Página | Ruta sugerida | Conflicto con router |
|--------|--------------|----------------------|
| AdminGatewaysPage | `/admin/config/gateways` | Ninguno — falta en router |
| AdminInventoryDashboardPage | `/admin/inventory/dashboard` | Ninguno — falta en router |
| AdminProductDetailPage | `/admin/products/:id` | Ninguno — router tiene :id/edit pero no :id |
| AdminProductImportPage | `/admin/products/import` | Ninguno — falta en router |
| AdminProductVariantsPage | `/admin/products/:id/variants` | CONFLICTO — router ya tiene ese path con AdminVariantsPage |
| AdminShippingMethodsPage | `/admin/config/shipping` | Ninguno — falta en router |
| AdminSiteSettingsPage | `/admin/config/site` | Ninguno — falta en router |
| AdminStaticPageEditorPage | `/admin/pages/:slug/edit` | Ninguno — falta en router |
| AdminStaticPagesPage | `/admin/pages` | Ninguno — falta en router |
| AdminStockAlertsPage | `/admin/inventory/stock-alerts` | Ninguno — falta en router |
| AdminVariantTypesPage | `/admin/products/:id/variant-types` | Ninguno — falta en router |
| AdminVoucherDetailPage | `/admin/vouchers/:id` | Ninguno — falta en router |

## 2. Cuándo debe responder 404

### 2.1 404 de aplicación (Navigate a /404)
Cualquier path no registrado en el router → `<Route path="*" element={<Navigate to="/404" replace />}>`

Ejemplos que DEBEN ir a 404:
- `/catalogo` (con acento o en español — la ruta es `/catalog`)
- `/admin/gateways` (sin el prefijo `/admin/config/`)
- `/account/pagos` (ruta en español que no existe)
- `/shop`, `/tienda`, `/products`

### 2.2 404 de recurso (dentro de la página)
Las páginas con slug/id dinámico deben detectar 404 de la API y redirigir:

| Ruta | Condición de 404 | Comportamiento esperado |
|------|-----------------|------------------------|
| `/catalog/:slug` | Slug no existe en catálogo | Mostrar NotFoundPage o redirigir a /404 |
| `/catalog/:productId/ask` | Producto no existe | Redirigir a /404 |
| `/catalog/:productId/questions` | Producto no existe | Redirigir a /404 |
| `/catalog/:productId/reviews` | Producto no existe | Redirigir a /404 |
| `/account/orders/:id` | Orden no existe o no pertenece al usuario | Redirigir a /account/orders |
| `/account/orders/:id/edit` | Orden no editable (status != PENDING) | Mostrar error |
| `/account/returns/:id` | Devolución no existe | Redirigir a /account/returns |
| `/support/tickets/:id` | Ticket no existe | Redirigir a /support/tickets |
| `/admin/products/:id/edit` | Producto no existe | Redirigir a /admin/products |
| `/admin/orders/:id` | Orden no existe | Redirigir a /admin/orders |
| `/admin/users/:pk` | Usuario no existe | Redirigir a /admin/users |
| `/admin/returns/:id` | Devolución no existe | Redirigir a /admin/returns |
| `/admin/contact/messages/:id` | Mensaje no existe | Redirigir a /admin/contact/messages |
| `/admin/payments/:paymentId/refund` | Pago no existe | Redirigir a /admin/payments |
| `/admin/inventory/:variantId/movements` | Variante no existe | Redirigir a /admin/inventory |
| `/admin/inventory/:variantId/adjust` | Variante no existe | Redirigir a /admin/inventory |
| `/order/:id/confirmation` | Orden no existe | Redirigir a / |
| `/order/:id/payment-return` | Orden no existe | Redirigir a / |

### 2.3 Redirecciones de protección
| Situación | Comportamiento |
|-----------|---------------|
| No autenticado intenta entrar a /account/* | ProtectedRoute redirige a /auth/login?next=/account/... |
| No autenticado intenta entrar a /admin/* | AdminRoute redirige a /auth/login |
| Autenticado sin is_staff intenta entrar a /admin/* | AdminRoute redirige a / |
| Autenticado intenta entrar a /auth/login | LoginPage redirige a / o a ?next= |

## 3. Flujos críticos a verificar

### F-01 — Compra completa (invitado)
`/ → /catalog → /catalog/:slug → /cart → /checkout → /checkout/payment/:orderId → /order/:id/confirmation`

### F-02 — Compra completa (autenticado)
`/ → /auth/login → /catalog → /catalog/:slug → /cart → /checkout → /order/:id/confirmation`

### F-03 — Registro de cuenta
`/auth/register → /auth/verify-email → /account`

### F-04 — Recuperación de contraseña
`/auth/forgot-password → (email) → /auth/reset-password/:uid/:token → /auth/login`

### F-05 — Gestión de cuenta
`/account → /account/profile → /account/addresses → /account/orders → /account/orders/:id`

### F-06 — Devolución
`/account/orders/:id → /account/returns/new → /account/returns/:id`

### F-07 — Admin gestión de producto
`/admin → /admin/products → /admin/products/:id/edit → /admin/products/:productId/variants`

### F-08 — Admin gestión de orden
`/admin/orders → /admin/orders/:id → (transición) → /admin/payments/:paymentId/refund`

### F-09 — Admin configuración
`/admin/config → /admin/config/gateways → /admin/config/shipping → /admin/config/site`

### F-10 — Búsqueda de productos
`Header (SearchBar) → /search?q=... → /catalog/:slug`
