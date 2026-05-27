# Tareas: Adaptar sistema de diseno Yoruba

## F0 - Analisis + PM docs

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-001 | Analizar paquete de referencia: inventario, hallazgos, estrategia | (analisis) | Hecha |
| T-002 | Crear documentos PM de la iniciativa | (pm docs) | Hecha |

## F1 - Tokens y tipografia

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-101 | Auditar hex hardcodeados en SCSS — decidir si se reemplazan en F1 o se delegan | (lectura, sin modificacion) | Hecha |
| T-102 | Reemplazar `_variables.scss` con paleta del brazalete | `src/styles/abstracts/_variables.scss` | Hecha |
| T-103 | Agregar `_typography.scss` (Fraunces + IBM Plex) | `src/styles/abstracts/_typography.scss` | Hecha |
| T-104 | Importar `_typography` en `main.scss` | `src/styles/main.scss` | Hecha |
| T-105 | Agregar alias `@assets` en webpack | `webpack.config.js` | Hecha |
| T-106 | Copiar logo a `src/assets/` | `src/assets/practica-yoruba-logo.png` | Hecha |
| T-107 | Verificar build tras cambio de variables | (verificacion) | Hecha |

## F2 - Adaptacion del shape de datos

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-201 | Agregar campo `image_url` en `transform-catalog.mjs` | `scripts/transform-catalog.mjs` | Hecha |
| T-202 | Regenerar `catalog.ts` con el nuevo campo | `src/mocks/data/catalog.ts` | Hecha |
| T-203 | Agregar `toggleWishlist` en `wishlistSlice` | `src/redux/slices/wishlistSlice.js` | Hecha |
| T-204 | Agregar `fetchFeaturedProducts` en `catalogSlice` | `src/redux/slices/catalogSlice.js` | Hecha |
| T-205 | Agregar `fetchCategories` en `catalogSlice` | `src/redux/slices/catalogSlice.js` | Hecha |
| T-206 | Agregar filtro `?is_featured=true` en handler MSW | `src/mocks/handlers/catalog.ts` | Hecha |

## F3 - Componentes base

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-301 | Adaptar `Header/index.jsx` (rutas EN, selectores existentes) | `src/components/layout/Header/index.jsx` | Hecha |
| T-302 | Adaptar `Header.module.scss` con paleta Yoruba | `src/components/layout/Header/Header.module.scss` | Hecha |
| T-303 | Adoptar `Footer/index.jsx` del paquete | `src/components/layout/Footer/index.jsx` | Hecha |
| T-304 | Adoptar `Footer.module.scss` del paquete | `src/components/layout/Footer/Footer.module.scss` | Hecha |
| T-305 | Adaptar `ProductCard.jsx` (image_url, sin orisha_name, rutas EN) | `src/components/catalog/ProductCard.jsx` | Hecha |
| T-306 | Adoptar `ProductCard.module.scss` del paquete | `src/components/catalog/ProductCard.module.scss` | Hecha |
| T-307 | Adoptar `AccountSidebar/index.jsx` | `src/components/account/AccountSidebar/index.jsx` | Hecha |
| T-308 | Adoptar `AccountSidebar.module.scss` | `src/components/account/AccountSidebar/AccountSidebar.module.scss` | Hecha |
| T-309 | Adoptar `primitives/index.jsx` | `src/components/common/primitives/index.jsx` | Hecha |
| T-310 | Adoptar `primitives.module.scss` | `src/components/common/primitives/primitives.module.scss` | Hecha |
| T-311 | Verificar ProductCard en dev server | (verificacion) | Hecha |

## F4 - Paginas del storefront

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-401 | Adaptar `CatalogPage.jsx` (sidebar, rutas EN) | `src/pages/catalog/CatalogPage.jsx` | Hecha |
| T-402 | Adoptar `CatalogPage.module.scss` | `src/pages/catalog/CatalogPage.module.scss` | Hecha |
| T-403 | Adaptar `ProductPage.jsx` (images[0].url) | `src/pages/catalog/ProductPage.jsx` | Hecha |
| T-404 | Adoptar `ProductPage.module.scss` | `src/pages/catalog/ProductPage.module.scss` | Hecha |
| T-405 | Adaptar `HomePage.jsx` (fetchFeaturedProducts, rutas EN) | `src/pages/home/HomePage.jsx` | Hecha |
| T-406 | Adoptar `HomePage.module.scss` | `src/pages/home/HomePage.module.scss` | Hecha |
| T-407 | Adaptar `CartPage.jsx` (slices existentes) | `src/pages/cart/CartPage.jsx` | Hecha |
| T-408 | Adoptar `CartPage.module.scss` | `src/pages/cart/CartPage.module.scss` | Hecha |
| T-409 | Adaptar `CheckoutPage.jsx` | `src/pages/checkout/CheckoutPage.jsx` | Hecha |
| T-410 | Adoptar `CheckoutPage.module.scss` | `src/pages/checkout/CheckoutPage.module.scss` | Hecha |
| T-411 | Adoptar `OrderSuccessPage.jsx` | `src/pages/checkout/OrderSuccessPage.jsx` | Hecha |
| T-412 | Adoptar `OrderSuccessPage.module.scss` | `src/pages/checkout/OrderSuccessPage.module.scss` | Hecha |
| T-413 | Agregar `PaymentReturnPage.jsx` (nueva) | `src/pages/checkout/PaymentReturnPage.jsx` | Hecha |
| T-414 | Agregar `PaymentReturnPage.module.scss` (nueva) | `src/pages/checkout/PaymentReturnPage.module.scss` | Hecha |
| T-415 | Agregar `PaymentFailedPage.jsx` (nueva) | `src/pages/checkout/PaymentFailedPage.jsx` | Hecha |
| T-416 | Agregar `PaymentFailedPage.module.scss` (nueva) | `src/pages/checkout/PaymentFailedPage.module.scss` | Hecha |
| T-417 | Agregar `ExpressCheckoutPage.jsx` (nueva) | `src/pages/checkout/ExpressCheckoutPage.jsx` | Hecha |
| T-418 | Agregar `ExpressCheckoutPage.module.scss` (nueva) | `src/pages/checkout/ExpressCheckoutPage.module.scss` | Hecha |

## F5 - Cuenta y auth

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-501 | Adaptar `LoginPage.jsx` (split editorial) | `src/pages/auth/LoginPage.jsx` | Hecha |
| T-502 | Adoptar `LoginPage.module.scss` | `src/pages/auth/LoginPage.module.scss` | Hecha |
| T-503 | Adoptar `RegisterPage.jsx` | `src/pages/auth/RegisterPage.jsx` | Hecha |
| T-504 | Adoptar `ForgotPasswordPage.jsx` | `src/pages/auth/ForgotPasswordPage.jsx` | Hecha |
| T-505 | Adoptar `ResetPasswordPage.jsx` | `src/pages/auth/ResetPasswordPage.jsx` | Hecha |
| T-506 | Agregar `AuthSimplePage.module.scss` (nueva) | `src/pages/auth/AuthSimplePage.module.scss` | Hecha |
| T-507 | Adoptar `VerifyEmailPage.jsx` | `src/pages/auth/VerifyEmailPage.jsx` | Hecha |
| T-508 | Adaptar `AccountPage.jsx` | `src/pages/account/AccountPage.jsx` | Hecha |
| T-509 | Adoptar `AccountPage.module.scss` | `src/pages/account/AccountPage.module.scss` | Hecha |
| T-510 | Adoptar `ProfilePage.jsx` | `src/pages/account/ProfilePage.jsx` | Hecha |
| T-511 | Adoptar `ProfilePage.module.scss` | `src/pages/account/ProfilePage.module.scss` | Hecha |
| T-512 | Adoptar `OrdersPage.jsx` | `src/pages/account/OrdersPage.jsx` | Hecha |
| T-513 | Adoptar `OrdersPage.module.scss` | `src/pages/account/OrdersPage.module.scss` | Hecha |
| T-514 | Adoptar `OrderDetailPage.jsx` | `src/pages/account/OrderDetailPage.jsx` | Hecha |
| T-515 | Adoptar `OrderDetailPage.module.scss` | `src/pages/account/OrderDetailPage.module.scss` | Hecha |
| T-516 | Agregar `OrderEditPage.jsx` (nueva) | `src/pages/account/OrderEditPage.jsx` | Hecha |
| T-517 | Agregar `OrderEditPage.module.scss` (nueva) | `src/pages/account/OrderEditPage.module.scss` | Hecha |
| T-518 | Adoptar `WishlistPage.jsx` | `src/pages/account/WishlistPage.jsx` | Hecha |
| T-519 | Adoptar `WishlistPage.module.scss` | `src/pages/account/WishlistPage.module.scss` | Hecha |
| T-520 | Agregar `AddressesPage.jsx` (nueva) | `src/pages/account/AddressesPage.jsx` | Hecha |
| T-521 | Agregar `AddressesPage.module.scss` (nueva) | `src/pages/account/AddressesPage.module.scss` | Hecha |
| T-522 | Agregar `SecurityPage.jsx` (nueva) | `src/pages/account/SecurityPage.jsx` | Hecha |
| T-523 | Agregar `SecurityPage.module.scss` (nueva) | `src/pages/account/SecurityPage.module.scss` | Hecha |
| T-524 | Agregar `SearchHistoryPage.jsx` (nueva) | `src/pages/account/SearchHistoryPage.jsx` | Hecha |
| T-525 | Agregar `SearchHistoryPage.module.scss` (nueva) | `src/pages/account/SearchHistoryPage.module.scss` | Hecha |

## F6 - Panel administrativo

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-601 | Adoptar `AdminSidebar/index.jsx` (nuevo) | `src/components/admin/AdminSidebar/index.jsx` | Hecha |
| T-602 | Adoptar `AdminSidebar.module.scss` (nuevo) | `src/components/admin/AdminSidebar/AdminSidebar.module.scss` | Hecha |
| T-603 | Adoptar `AdminLayout/index.jsx` (nuevo) | `src/layouts/AdminLayout/index.jsx` | Hecha |
| T-604 | Adoptar `AdminLayout.module.scss` (nuevo) | `src/layouts/AdminLayout/AdminLayout.module.scss` | Hecha |
| T-605 | Adoptar `AdminDashboardPage.jsx` | `src/pages/admin/AdminDashboardPage.jsx` | Hecha |
| T-606 | Adoptar `AdminDashboardPage.module.scss` | `src/pages/admin/AdminDashboardPage.module.scss` | Hecha |
| T-607 | Adoptar `AdminProductsPage.jsx` | `src/pages/admin/AdminProductsPage.jsx` | Hecha |
| T-608 | Adoptar `AdminOrdersPage.jsx` | `src/pages/admin/AdminOrdersPage.jsx` | Hecha |
| T-609 | Adoptar `AdminUsersPage.jsx` | `src/pages/admin/AdminUsersPage.jsx` | Hecha |
| T-610 | Adoptar `AdminUsersPage.module.scss` | `src/pages/admin/AdminUsersPage.module.scss` | Hecha |
| T-611 | Adoptar `AdminUserDetailPage.jsx` | `src/pages/admin/AdminUserDetailPage.jsx` | Hecha |
| T-612 | Adoptar `AdminUserDetailPage.module.scss` | `src/pages/admin/AdminUserDetailPage.module.scss` | Hecha |
| T-613 | Adoptar `AdminTablePage.module.scss` (nuevo) | `src/pages/admin/AdminTablePage.module.scss` | Hecha |
| T-614 | Agregar `AdminOrderDetailPage.jsx` (nueva) | `src/pages/admin/AdminOrderDetailPage.jsx` | Hecha |
| T-615 | Agregar `AdminOrderDetailPage.module.scss` (nueva) | `src/pages/admin/AdminOrderDetailPage.module.scss` | Hecha |
| T-616 | Agregar `AdminProductDetailPage.jsx` (nueva) | `src/pages/admin/AdminProductDetailPage.jsx` | Hecha |
| T-617 | Agregar `AdminProductDetailPage.module.scss` (nueva) | `src/pages/admin/AdminProductDetailPage.module.scss` | Hecha |
| T-618 | Agregar `AdminCategoriesPage.jsx` (nueva) | `src/pages/admin/AdminCategoriesPage.jsx` | Hecha |
| T-619 | Agregar `AdminCategoriesPage.module.scss` (nueva) | `src/pages/admin/AdminCategoriesPage.module.scss` | Hecha |
| T-620 | Agregar `AdminInventoryDashboardPage.jsx` (nueva) | `src/pages/admin/AdminInventoryDashboardPage.jsx` | Hecha |
| T-621 | Agregar `AdminInventoryDashboardPage.module.scss` (nueva) | `src/pages/admin/AdminInventoryDashboardPage.module.scss` | Hecha |
| T-622 | Agregar `AdminStockAlertsPage.jsx` (nueva) | `src/pages/admin/AdminStockAlertsPage.jsx` | Hecha |
| T-623 | Agregar `StockAdjustModal/index.jsx` (nuevo) | `src/components/admin/StockAdjustModal/index.jsx` | Hecha |
| T-624 | Agregar `StockAdjustModal.module.scss` (nuevo) | `src/components/admin/StockAdjustModal/StockAdjustModal.module.scss` | Hecha |
| T-625 | Agregar `AdminVouchersPage.jsx` (nueva) | `src/pages/admin/AdminVouchersPage.jsx` | Hecha |
| T-626 | Agregar `AdminVoucherDetailPage.jsx` (nueva) | `src/pages/admin/AdminVoucherDetailPage.jsx` | Hecha |
| T-627 | Agregar `AdminVoucherDetailPage.module.scss` (nueva) | `src/pages/admin/AdminVoucherDetailPage.module.scss` | Hecha |
| T-628 | Agregar `AdminSiteSettingsPage.jsx` (nueva) | `src/pages/admin/AdminSiteSettingsPage.jsx` | Hecha |
| T-629 | Agregar `AdminSiteSettingsPage.module.scss` (nueva) | `src/pages/admin/AdminSiteSettingsPage.module.scss` | Hecha |
| T-630 | Agregar `AdminGatewaysPage.jsx` (nueva) | `src/pages/admin/AdminGatewaysPage.jsx` | Hecha |
| T-631 | Agregar `AdminGatewaysPage.module.scss` (nueva) | `src/pages/admin/AdminGatewaysPage.module.scss` | Hecha |
| T-632 | Agregar `AdminShippingMethodsPage.jsx` (nueva) | `src/pages/admin/AdminShippingMethodsPage.jsx` | Hecha |
| T-633 | Agregar `AdminStaticPagesPage.jsx` (nueva) | `src/pages/admin/AdminStaticPagesPage.jsx` | Hecha |
| T-634 | Agregar `AdminStaticPageEditorPage.jsx` (nueva) | `src/pages/admin/AdminStaticPageEditorPage.jsx` | Hecha |
| T-635 | Agregar `AdminStaticPageEditorPage.module.scss` (nueva) | `src/pages/admin/AdminStaticPageEditorPage.module.scss` | Hecha |
| T-636 | Agregar `RefundModal/index.jsx` (nuevo) | `src/components/admin/RefundModal/index.jsx` | Hecha |
| T-637 | Agregar `RefundModal.module.scss` (nuevo) | `src/components/admin/RefundModal/RefundModal.module.scss` | Hecha |
| T-638 | Agregar `AdminProductImportPage.jsx` (nueva) | `src/pages/admin/AdminProductImportPage.jsx` | Hecha |
| T-639 | Agregar `AdminPriceSyncPage.jsx` (nueva) | `src/pages/admin/AdminPriceSyncPage.jsx` | Hecha |
| T-640 | Agregar `AdminBulkPage.module.scss` (nuevo) | `src/pages/admin/AdminBulkPage.module.scss` | Hecha |
| T-641 | Agregar `AdminVariantTypesPage.jsx` (nueva) | `src/pages/admin/AdminVariantTypesPage.jsx` | Hecha |
| T-642 | Agregar `AdminProductVariantsPage.jsx` (nueva) | `src/pages/admin/AdminProductVariantsPage.jsx` | Hecha |
| T-643 | Agregar `AdminVariantsPage.module.scss` (nuevo) | `src/pages/admin/AdminVariantsPage.module.scss` | Hecha |
| T-644 | Agregar thunks faltantes en `adminSlice` (adjustStock, createRefund, settings, gateways) | `src/redux/slices/adminSlice.js` | Hecha |
| T-645 | Merge manual del AppRouter (rutas nuevas con convencion EN) | `src/router/AppRouter.jsx` | Hecha |

## F7 - Verificacion y cierre

| ID | Descripcion | Archivo | Estado |
|----|-------------|---------|--------|
| T-701 | Ejecutar build demo sin errores (patron R-2.0) | (verificacion) | Pendiente |
| T-702 | Verificar paleta, imagenes y navegacion en dev server | (verificacion) | Pendiente |
| T-703 | Ejecutar `npm test` — 0 regresiones | (verificacion) | Pendiente |
| T-704 | Crear `decisiones-adaptar-sistema-diseno-yoruba.md` | `docs/pm/iniciativas/adaptar-sistema-diseno-yoruba/decisiones-*.md` | Pendiente |
| T-705 | Cerrar index, tareas e indice; ejecutar I-015; commit de cierre | (cierre) | Pendiente |
