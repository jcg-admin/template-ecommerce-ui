# Auditoría de calidad de vistas — 2026-05-28

## Metodología

Cada vista fue leída en su totalidad. Se evaluaron:

1. **Conectividad** — ¿Despacha thunks reales? ¿Lee del store correcto?
2. **Estados de ciclo de vida** — ¿Tiene loading, error, empty state?
3. **Manejo de 404 de recurso** — ¿Redirige si la API devuelve 404?
4. **SCSS Module** — ¿Existe el archivo y tiene las clases que se usan?
5. **MSW** — ¿Los endpoints que llama están mockeados?
6. **Accesibilidad** — ¿Tiene aria-*, role, labels, keyboard nav?
7. **Flujo completo** — ¿El happy path completo funciona?
8. **Casos borde** — ¿Datos vacíos, red lenta, error de servidor?

Escala de calidad:
- **PRODUCCION** — Lista para producción sin cambios
- **COMPLETA** — Funciona el happy path, faltan casos borde menores
- **PARCIAL** — Funciona lo básico, faltan estados importantes
- **INCOMPLETA** — Existe pero le falta lógica crítica
- **HUERFANA** — Sin ruta en el router (inaccesible desde URL)

---

## GRUPO 1 — TIENDA PÚBLICA (sin autenticación)

---

### G1-01 · HomePage · `/`
**Calidad: COMPLETA**
- Renderiza hero, productos destacados, categorías y CTA al catálogo
- Despacha `fetchFeaturedProducts` y `fetchCategories`
- MSW mockeado: GET /api/v1/catalogue/?is_featured=true ✓, GET /api/v1/categories/ ✓
- Loading state presente
- Sin estado de error visible al usuario
- **Pendiente**: error state cuando featured products falla (muestra pantalla vacía)
- **Pendiente**: los links de categoría del hero van a `/catalog?category=` — verificar en browser

---

### G1-02 · CatalogPage · `/catalog`
**Calidad: COMPLETA**
- Lista productos con paginación, filtros de Chip (órisà/tipo), RangeSlider de precio, checkboxes de disponibilidad, selector de orden
- Todos los filtros pasan parámetros al dispatch de `fetchProducts`
- Lee `?category` del URL para filtrado por navegación ← BUG-BROWSER-04 CORREGIDO
- MSW: GET /api/v1/catalogue/ ✓, GET /api/v1/catalogue/search/ ✓
- Loading, empty state, error state presentes
- **Pendiente**: el RangeSlider funciona visualmente pero `fetchProducts` en el slice no filtra por `price_min`/`price_max` — el handler MSW tampoco lo implementa
- **Pendiente**: los parámetros `availability`, `ordering`, `orishas`, `types` se pasan al dispatch pero el handler MSW de `/api/v1/catalogue/` solo filtra por `category` e `is_featured`

---

### G1-03 · ProductPage · `/catalog/:slug`
**Calidad: COMPLETA**
- Muestra galería, precio, variantes, tabs de descripción/ScrollSpy, botón de carrito, reseñas
- Selector corregido: `s.catalog.currentProduct` ← BUG-BROWSER-01 CORREGIDO
- MSW: GET /api/v1/catalogue/:slug/ ✓ — devuelve 404 si no existe
- `useRef` importado ← BUG-BROWSER-01 CORREGIDO
- **Pendiente**: cuando la API devuelve 404, el componente queda en loading (isLoading=false, product=null) → muestra spinner indefinido. Necesita: `if (!isLoading && !product) return <Navigate to="/404" />`
- **Pendiente**: el botón "Agregar al carrito" llama `addCartItem` pero la ruta es POST /api/cart/items/ — no coincide con POST /api/v1/cart/items/ que es lo que espera el MSW del carrito (el carrito usa `/api/cart/` sin versión)
- **Pendiente**: reseñas inline en ProductPage llaman a una URL que no está en el MSW actual

---

### G1-04 · CategoryListPage · `/categories`
**Calidad: COMPLETA**
- Árbol jerárquico expandible de categorías con conteo de productos
- Usa `useCategories` (react-query) → GET /api/v1/categories/ ✓
- Cada nodo enlaza a `/catalog?category=:slug` ✓
- No usa Redux directamente (patrón correcto para datos de solo lectura)
- Loading y error manejados por react-query
- **Pendiente**: no hay estado de árbol vacío explícito

---

### G1-05 · SearchResultsPage · `/search`
**Calidad: COMPLETA**
- Resultados de búsqueda con SearchBar editable, filtros laterales (CatalogFilters), paginación
- Usa `useSearch` (react-query) → GET /api/v1/catalogue/search/ ✓
- Estado "sin resultados" con sugerencias presentes
- Validación de mínimo 2 caracteres
- No usa Redux — correcto (datos de solo lectura con react-query)
- **Pendiente**: ¿el Header SearchBar navega a `/search?q=...`? Verificar en browser
- **Pendiente**: CatalogFilters en SearchResultsPage — ¿los filtros de precio/categoría se pasan al useSearch?

---

### G1-06 · CartPage · `/cart`
**Calidad: PARCIAL**
- Lista items, cantidades editables, subtotal, aplicar voucher, botón checkout
- Despacha `fetchCart`, `updateCartItem`, `removeCartItem`, `applyVoucher`, `removeVoucher`
- **PROBLEMA CRÍTICO**: cartSlice usa `/api/cart/items/` pero el MSW mockea ese mismo path ✓ — sin embargo `fetchCart` usa GET /api/cart/ y el MSW tiene GET /api/cart/ ✓
- Imagen del producto: si no hay `image_url`, muestra placeholder div — correcto
- **Pendiente**: sin estado de carrito vacío explícito con CTA al catálogo
- **Pendiente**: no maneja el error cuando `fetchCart` falla (pantalla en blanco)
- **Pendiente**: el resumen de precio no muestra impuestos separados

---

### G1-07 · CheckoutPage · `/checkout`
**Calidad: PARCIAL**
- Formulario completo: dirección, método de envío, resumen de orden, botón pagar
- Despacha `fetchAddresses`, `createOrder`, `initiatePayment`
- MSW: POST /api/v1/checkout/ ✓, GET /api/v1/auth/addresses/ ✓
- **PROBLEMA**: `fetchAddresses` usa `/api/v1/auth/addresses/` pero el slice de addresses puede usar otra ruta — verificar
- **Pendiente**: sin validación de campos vacíos antes de submit
- **Pendiente**: cuando `createOrder` falla, no muestra el error al usuario
- **Pendiente**: el flujo post-checkout (→ PaymentSelectionPage o → OrderSuccessPage) no está verificado
- **Pendiente**: checkout de invitado vs autenticado — ¿maneja ambos casos?

---

### G1-08 · ExpressCheckoutPage · `/checkout/express`
**Calidad: COMPLETA**
- Verifica eligibilidad (dirección guardada + método de pago guardado), one-click submit
- MSW: GET /api/v1/checkout/eligibility/ ✓, POST /api/v1/checkout/express/ ✓
- Maneja estado "no elegible" con CTA a checkout normal
- Loading y error presentes

---

### G1-09 · PaymentSelectionPage · `/checkout/payment/:orderId`
**Calidad: PARCIAL**
- Muestra gateways disponibles para elegir método de pago
- MSW: POST /api/v1/payments/mercadopago/create/ ✓, POST /api/v1/payments/paypal/create/ ✓
- **Pendiente**: ¿cómo obtiene la lista de gateways? No hay GET /api/v1/payments/gateways/ en MSW
- **Pendiente**: el flujo de redirect externo (MercadoPago/PayPal) no está simulado en MSW

---

### G1-10 · PaymentReturnPage · `/order/:id/payment-return`
**Calidad: COMPLETA**
- Polling del status del pago, maneja APPROVED/FAILED/TIMEOUT
- MSW: POST /api/v1/payments/mercadopago/checkout ✓, POST /api/v1/payments/paypal/checkout ✓
- Redirige a confirmación o a payment-failed según resultado

---

### G1-11 · PaymentFailedPage · `/order/:id/payment-failed`
**Calidad: COMPLETA**
- Muestra razón de rechazo, CTA a reintentar y a historial
- MSW: POST /api/v1/payments/retry ✓
- Maneja timeout distinto de rechazo explícito

---

### G1-12 · OrderSuccessPage · `/order/:id/confirmation`
**Calidad: COMPLETA**
- Confirmación post-pago con resumen de orden, CTA a cuenta y catálogo
- MSW: GET /api/v1/orders/:orderNumber/ ✓
- **Pendiente**: si el orderNumber no existe, queda en loading (mismo bug que ProductPage)

---

### G1-13 · ContactPage · `/contact`
**Calidad: COMPLETA**
- Formulario de contacto con nombre, email, asunto, mensaje
- MSW: POST /api/v1/contact/messages/ ✓
- Estado de envío exitoso y error presentes

---

### G1-14 · NewsletterSubscribePage · `/newsletter`
**Calidad: COMPLETA**
- Formulario de suscripción con email
- MSW: POST /api/v1/newsletter/subscribe/ ✓

---

### G1-15 · NewsletterUnsubscribePage · `/newsletter/unsubscribe`
**Calidad: COMPLETA**
- Desuscripción vía token firmado en query string
- MSW: POST /api/v1/newsletter/unsubscribe/ ✓

---

### G1-16 · ProductQuestionAskPage · `/catalog/:productId/ask`
**Calidad: COMPLETA**
- Formulario para hacer pregunta pública sobre un producto
- MSW: presente en storefront.ts

---

### G1-17 · ProductQuestionsListPage · `/catalog/:productId/questions`
**Calidad: COMPLETA**
- Lista pública de preguntas con respuesta aprobada
- **Pendiente**: verificar que el MSW tiene el handler correcto

---

### G1-18 · ProductReviewsListPage · `/catalog/:productId/reviews`
**Calidad: COMPLETA**
- Lista pública de reseñas aprobadas con estrellas y texto
- **Pendiente**: verificar que el MSW tiene el handler correcto

---

## GRUPO 2 — AUTH

---

### G2-01 · LoginPage · `/auth/login`
**Calidad: PRODUCCION**
- Formulario email + contraseña, toggle de visibilidad, loading en submit
- MSW: POST /api/v1/auth/login/ ✓
- Credenciales válidas: `comprador@test.mx / Test1234!`, `admin@e-comerce.example.com / Admin1234!`
- Redirige a `/admin` si is_staff, a `/account` si comprador
- Lee `?next=` del state de location para redirección post-login
- Error inline cuando credenciales son incorrectas
- **Pendiente**: verificar en browser que el botón del Header navega a /auth/login y que el redirect post-login funciona

---

### G2-02 · RegisterPage · `/auth/register`
**Calidad: COMPLETA**
- Formulario con nombre, email, contraseña, confirmar contraseña
- MSW: POST /api/v1/auth/register/ ✓ — devuelve usuario con id 99
- Validación de contraseñas coincidentes
- **Pendiente**: sin indicador de fuerza de contraseña visible (usePasswordStrength existe pero no está integrado aquí)
- **Pendiente**: post-registro debería mostrar mensaje de verificar email o redirigir a /auth/verify-email

---

### G2-03 · ForgotPasswordPage · `/auth/forgot-password`
**Calidad: COMPLETA**
- Formulario de email, muestra confirmación de envío
- MSW: POST /api/v1/auth/password-reset/ ✓

---

### G2-04 · ResetPasswordPage · `/auth/reset-password/:uid/:token`
**Calidad: COMPLETA**
- Formulario de nueva contraseña + confirmación, usa uid y token del URL
- MSW: POST /api/v1/auth/password-reset/confirm/ ✓
- **Pendiente**: sin validación del token antes de mostrar el formulario (token expirado mostraría formulario que luego falla)

---

### G2-05 · VerifyEmailPage · `/auth/verify-email`
**Calidad: COMPLETA**
- Verifica token de email desde query string `?token=`
- MSW: POST /api/v1/auth/verify-email/ ✓

---

## GRUPO 3 — CUENTA DEL COMPRADOR (requiere sesión)

---

### G3-01 · AccountPage · `/account`
**Calidad: PARCIAL**
- Dashboard con tarjetas de acceso rápido: pedidos, direcciones, wishlist, seguridad
- Lee datos del perfil del store
- **Pendiente**: sin loading state (asume que el perfil ya está en el store desde el login)
- **Pendiente**: sin estado de error
- **Pendiente**: las tarjetas de resumen (últimos pedidos, items en wishlist) son estáticas — no cargan datos reales

---

### G3-02 · ProfilePage · `/account/profile`
**Calidad: COMPLETA**
- Formulario de nombre, apellido, email, avatar
- MSW: GET /api/v1/auth/profile/ ✓, PATCH /api/v1/auth/profile/ ✓, POST /api/v1/auth/profile/avatar/ ✓
- Loading y error presentes
- Upload de avatar con preview

---

### G3-03 · AddressesPage · `/account/addresses`
**Calidad: COMPLETA**
- Lista de direcciones con formulario inline para crear/editar, toggle de dirección predeterminada
- MSW: GET /api/v1/auth/addresses/ ✓, POST /api/v1/auth/addresses/ ✓
- **PROBLEMA**: `deleteAddress` y `setDefaultAddress` despachan a endpoints que no están en el MSW (`DELETE /api/v1/auth/addresses/:id/`, `PATCH /api/v1/auth/addresses/:id/`)
- **Pendiente**: sin estado de error visible

---

### G3-04 · OrdersPage · `/account/orders`
**Calidad: COMPLETA**
- Lista de pedidos con estado, fecha, total y enlace al detalle
- MSW: GET /api/v1/orders/ ✓
- Loading, empty state, error presentes
- Paginación implementada

---

### G3-05 · OrderDetailPage · `/account/orders/:id`
**Calidad: COMPLETA**
- Detalle completo: items, dirección, método de pago, estado, timeline
- MSW: GET /api/v1/orders/:orderNumber/ ✓
- **Pendiente**: sin manejo de 404 cuando la orden no existe (queda en loading)
- CTA a cancelar orden llama POST /api/v1/orders/:orderNumber/cancel/ ✓

---

### G3-06 · OrderEditPage · `/account/orders/:id/edit`
**Calidad: COMPLETA**
- Edición de dirección de envío y método para pedidos en estado PENDING
- MSW: PATCH /api/v1/orders/:orderNumber/address/ ✓, PATCH /api/v1/orders/:orderNumber/shipping/ ✓
- **Pendiente**: sin verificación de que el pedido está en estado editable antes de mostrar el formulario

---

### G3-07 · SecurityPage · `/account/security`
**Calidad: COMPLETA**
- Cambio de contraseña, lista de sesiones activas, opción de eliminar cuenta
- MSW: POST /api/v1/auth/change-password/ ✓
- **Pendiente**: "sesiones activas" y "eliminar cuenta" son UI sin endpoints mockeados

---

### G3-08 · ChangePasswordPage · `/account/change-password`
**Calidad: COMPLETA**
- Formulario de cambio de contraseña (contraseña actual + nueva + confirmación)
- MSW: POST /api/v1/auth/change-password/ ✓

---

### G3-09 · WishlistPage · `/account/wishlist`
**Calidad: COMPLETA**
- Lista de productos deseados, botón de mover al carrito, botón de eliminar
- MSW: GET /api/v1/wishlist/ ✓, POST /api/v1/wishlist/:id/move-to-cart/ ✓, DELETE /api/v1/wishlist/:id/ ✓
- Imagen: placeholder si no hay `image_url` — correcto
- **Pendiente**: sin error state cuando la wishlist falla

---

### G3-10 · SearchHistoryPage · `/account/search-history`
**Calidad: COMPLETA**
- Lista de búsquedas recientes con opción de limpiar historial
- MSW: GET /api/v1/search/history/ ✓, DELETE /api/v1/search/history/ ✓

---

### G3-11 · ReturnsPage · `/account/returns`
**Calidad: COMPLETA**
- Lista de devoluciones con estado y enlace al detalle
- MSW: GET /api/v1/returns/ ✓

---

### G3-12 · ReturnCreatePage · `/account/returns/new`
**Calidad: COMPLETA**
- Formulario de solicitud de devolución (seleccionar pedido, producto, motivo)
- MSW: POST /api/v1/returns/ ✓

---

### G3-13 · ReturnDetailPage · `/account/returns/:id`
**Calidad: COMPLETA**
- Detalle de devolución con timeline de estados y documentos adjuntos
- MSW: GET /api/v1/returns/:id/ ✓

---

### G3-14 · ProductReviewCreatePage · `/account/orders/:orderId/products/:productId/review`
**Calidad: COMPLETA**
- Formulario de reseña con estrellas y texto, solo para productos comprados
- MSW: verificar en storefront/catalog handlers

---

### G3-15 · NotificationPreferencesPage · `/account/notifications/preferences`
**Calidad: COMPLETA**
- Toggles de preferencias de email y push por tipo de notificación
- MSW: GET /api/v1/notifications/preferences/ ✓, PATCH /api/v1/notifications/preferences/ ✓

---

### G3-16 · PaymentStatusPage · `/account/orders/:orderId/payment`
**Calidad: COMPLETA**
- Estado actual del pago de una orden
- MSW: payments.ts ✓

---

### G3-17 · PaymentHistoryPage · `/account/orders/:orderId/payments`
**Calidad: COMPLETA**
- Historial de intentos de pago de una orden

---

### G3-18 · PaymentRetryPage · `/account/orders/:orderId/payment/retry`
**Calidad: COMPLETA**
- Reintentar pago fallido con opción de cambiar método
- MSW: POST /api/v1/payments/retry ✓

---

### G3-19 · SupportTicketsPage · `/support/tickets`
**Calidad: COMPLETA**
- Lista de tickets de soporte con estado y prioridad
- MSW: GET /api/v1/support/tickets/ ✓

---

### G3-20 · SupportTicketCreatePage · `/support/tickets/new`
**Calidad: COMPLETA**
- Formulario de nuevo ticket con asunto, categoría y descripción
- MSW: POST /api/v1/support/tickets/ ✓

---

### G3-21 · SupportTicketDetailPage · `/support/tickets/:id`
**Calidad: COMPLETA**
- Chat de ticket con historial de mensajes, formulario de respuesta
- MSW: GET /api/v1/support/tickets/:id/ ✓, POST /api/v1/support/tickets/:id/reply/ ✓

---

## GRUPO 4 — ADMINISTRACIÓN (requiere is_staff=true)

---

### G4-01 · AdminDashboardPage · `/admin`
**Calidad: PARCIAL**
- KPIs de ventas, órdenes, usuarios, inventario con gráficos básicos
- MSW: GET /api/v1/admin/metrics/ ✓
- **Pendiente**: sin loading state explícito (datos se muestran como 0 mientras cargan)
- **Pendiente**: los gráficos son decorativos, sin datos reales conectados
- **Pendiente**: sin error state

---

### G4-02 · AdminProductsPage · `/admin/products`
**Calidad: PARCIAL**
- Tabla de productos con búsqueda, filtro de etiquetas (ChipInput), toggle featured, eliminar
- MSW: GET /api/v1/admin/products/ ✓
- ChipInput conectado a `tagFilters` → dispatch ✓
- **Pendiente**: sin estado de error
- **Pendiente**: la eliminación de producto (`deleteProduct`) llama a un endpoint que no está en el MSW admin handler

---

### G4-03 · AdminProductCreatePage · `/admin/products/new`
**Calidad: INCOMPLETA**
- Solo 56 líneas — contiene el wrapper que renderiza `AdminProductForm` con mode='create'
- Delega toda la lógica al formulario compartido
- **PROBLEMA**: importa de `@redux/slices/productsSlice` pero `productsSlice.js` existe solo si se creó — verificar
- **Pendiente**: sin feedback visual de éxito tras crear el producto
- **Pendiente**: `clearProductsActionState` importado pero ¿existe en productsSlice?

---

### G4-04 · AdminProductEditPage · `/admin/products/:id/edit`
**Calidad: PARCIAL**
- Wrapper que carga el producto y renderiza `AdminProductForm` con mode='edit'
- **PROBLEMA CRÍTICO**: importa `AdminProductEditPage.module.scss` que NO EXISTE en disco → crash en build
- MSW: no hay GET /api/v1/admin/products/:id/ en el handler admin — solo GET /api/v1/admin/products/

---

### G4-05 · AdminProductDetailPage · `/admin/products/:id` — HUÉRFANA
**Calidad: COMPLETA (pero inaccesible)**
- Vista de solo lectura de un producto: galería, variantes, métricas de venta
- 226 líneas con galería, variantes, información completa
- **Pendiente**: no está en el router → no es accesible por URL
- **Pendiente**: sin SCSS Module propio — usa estilos inline

---

### G4-06 · AdminProductImportPage · `/admin/products/import` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- Flujo de 3 pasos: subir CSV → previsualizar → confirmar
- 277 líneas con zona de drop, tabla de preview, manejo de errores
- **PROBLEMA**: importa `AdminProductImportPage.module.scss` que NO EXISTE
- No está en el router

---

### G4-07 · AdminVariantsPage · `/admin/products/:productId/variants` — EN ROUTER
**Calidad: COMPLETA**
- Gestiona variantes existentes: tipo, opción, stock, precio, toggle activo/inactivo
- UC-CHT-03 + UC-CHT-04 (enlace a precio diferenciado por variante)
- MSW: GET /api/v1/admin/inventory/ ✓ (proxy)
- **Pendiente**: los endpoints específicos de variantes no están en el MSW admin handler

---

### G4-08 · AdminProductVariantsPage · `/admin/products/:id/variants` — HUÉRFANA + CONFLICTO
**Calidad: PARCIAL (e inaccesible)**
- Tabla de combinaciones generadas (Talla × Color) con bulk update y regeneración
- **PROBLEMA**: mismo path que AdminVariantsPage — conflicto de ruta
- **PROBLEMA**: importa `AdminProductVariantsPage.module.scss` que NO EXISTE
- Resolución: asignar path `/admin/products/:id/variants/matrix` o fusionar con AdminVariantsPage

---

### G4-09 · AdminVariantTypesPage · `/admin/products/:id/variant-types` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- CRUD de tipos de variante (Talla, Color, Material) y sus opciones
- 234 líneas con formularios de tipo y opción
- **PROBLEMA**: importa `AdminVariantTypesPage.module.scss` que NO EXISTE
- No está en el router

---

### G4-10 · AdminOrdersPage · `/admin/orders`
**Calidad: PARCIAL**
- Tabla de órdenes con búsqueda y filtro de fecha (DateRangePicker)
- MSW: GET /api/v1/admin/orders/ ✓
- DateRangePicker conectado a `dateStart/dateEnd` → dispatch
- **Pendiente**: sin estado de error
- **Pendiente**: `fetchAdminOrders` en adminSlice — verificar que acepta `date_start`/`date_end`

---

### G4-11 · AdminOrderDetailPage · `/admin/orders/:id`
**Calidad: PARCIAL**
- Detalle de orden con timeline, items, transición de estado, cancelación, nota interna
- MSW: PATCH /api/v1/orders/:orderNumber/status/ ✓
- **Pendiente**: sin estado de error
- **Pendiente**: la transición de estado debería ser a `/api/v1/admin/orders/:id/` no a `/api/v1/orders/:orderNumber/`

---

### G4-12 · AdminOrdersDashboardPage · `/admin/orders-dashboard`
**Calidad: COMPLETA**
- Dashboard transaccional con métricas de órdenes por estado

---

### G4-13 · AdminUsersPage · `/admin/users`
**Calidad: PARCIAL**
- Tabla de usuarios con búsqueda y filtros de rol/estado
- MSW: GET /api/v1/admin/users/ ✓
- **Pendiente**: sin estado de error

---

### G4-14 · AdminUserDetailPage · `/admin/users/:pk`
**Calidad: PARCIAL**
- Perfil del usuario con datos, órdenes recientes, acciones (suspender, reactivar, hacer admin)
- MSW: GET /api/v1/admin/users/:id/ ✓, POST /api/v1/admin/users/:id/suspend/ ✓, POST /api/v1/admin/users/:id/reactivate/ ✓
- **Pendiente**: sin estado de error

---

### G4-15 · AdminVouchersPage · `/admin/vouchers`
**Calidad: PARCIAL**
- Lista de vouchers con búsqueda, toggle activo, duplicar
- MSW: GET /api/v1/admin/vouchers/ ✓
- **Pendiente**: sin estado de error
- **Pendiente**: `duplicateVoucher` y `toggleVoucherActive` — verificar endpoints en MSW

---

### G4-16 · AdminVoucherDetailPage · `/admin/vouchers/:id` — HUÉRFANA
**Calidad: COMPLETA (pero inaccesible)**
- Formulario completo de voucher: código, tipo de descuento, límites, fechas, historial de cambios
- 169 líneas — bien estructurada con breadcrumb, formulario y sección de historial
- **Pendiente**: no está en el router → inaccesible desde la lista de vouchers
- **Pendiente**: el botón de "Ver detalle" en AdminVouchersPage probablemente falla (ruta inexistente)

---

### G4-17 · AdminGatewaysPage · `/admin/config/gateways` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- Lista de pasarelas de pago con formulario de configuración modal
- 162 líneas con modal, formulario de credenciales, toggle activo
- MSW: GET /api/v1/admin/settings/ ✓ (genérico, puede no devolver gateways)
- **Pendiente**: no está en el router
- **Pendiente**: sin loading state

---

### G4-18 · AdminShippingMethodsPage · `/admin/config/shipping` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- Lista de métodos de envío con modal de creación/edición
- 144 líneas con modal inline
- **PROBLEMA**: importa `AdminShippingMethodsPage.module.scss` que NO EXISTE
- No está en el router

---

### G4-19 · AdminSiteSettingsPage · `/admin/config/site` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- Formulario de configuración global: nombre del sitio, moneda, impuestos, envío gratis
- 143 líneas bien estructuradas con secciones
- MSW: GET /api/v1/admin/settings/ ✓, PATCH /api/v1/admin/settings/ ✓
- **Pendiente**: sin loading state

---

### G4-20 · AdminStaticPagesPage · `/admin/pages` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- Lista de páginas CMS con estado publicado/borrador y botón de editar
- 79 líneas — estructura OK pero corta
- **PROBLEMA**: importa `AdminStaticPagesPage.module.scss` que NO EXISTE
- No está en el router
- MSW: no hay handler para GET /api/v1/admin/pages/

---

### G4-21 · AdminStaticPageEditorPage · `/admin/pages/:slug/edit` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- Editor de página CMS: título, slug, contenido HTML, meta SEO, publicar/borrador
- 163 líneas con formulario y secciones de meta
- No está en el router
- MSW: no hay handler para GET /api/v1/admin/pages/:slug/

---

### G4-22 · AdminInventoryPage · `/admin/inventory`
**Calidad: COMPLETA**
- Tabla de variantes con stock actual, umbrales de alerta, movimientos
- MSW: GET /api/v1/admin/inventory/ ✓

---

### G4-23 · AdminInventoryDashboardPage · `/admin/inventory/dashboard` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- KPIs de inventario: total SKUs, bajo stock, agotado, movimientos recientes
- 115 líneas con tarjetas y tabla de movimientos
- **Pendiente**: no está en el router
- **Pendiente**: sin loading state, sin error state
- MSW: no hay handler para GET /api/v1/admin/inventory/dashboard/

---

### G4-24 · AdminStockAlertsPage · `/admin/inventory/stock-alerts` — HUÉRFANA
**Calidad: PARCIAL (e inaccesible)**
- Tabla de SKUs con stock bajo o agotado, filtros de severidad
- 96 líneas
- **PROBLEMA**: importa `AdminStockAlertsPage.module.scss` que NO EXISTE
- No está en el router
- MSW: no hay handler para GET /api/v1/admin/inventory/stock-alerts/

---

### G4-25 · AdminInventoryImportPage · `/admin/inventory/import`
**Calidad: COMPLETA**
- Importación masiva de stock vía CSV
- MSW: POST /api/v1/admin/inventory/import/ ✓

---

### G4-26 · AdminInventoryMovementsPage · `/admin/inventory/:variantId/movements`
**Calidad: COMPLETA**
- Historial de movimientos de una variante
- MSW: GET /api/v1/admin/inventory/variants/:id/movements/ ✓

---

### G4-27 · AdminInventoryAdjustPage · `/admin/inventory/:variantId/adjust`
**Calidad: COMPLETA**
- Formulario de ajuste manual de stock con motivo
- MSW: POST /api/v1/admin/inventory/variants/:id/adjust/ ✓

---

### G4-28 · AdminCategoriesPage · `/admin/categories`
**Calidad: COMPLETA**
- Árbol de categorías drag-and-drop con CRUD inline
- MSW: GET /api/v1/admin/categories/ ✓

---

### G4-29 · AdminVariantPricePage · `/admin/variants/:variantId/price`
**Calidad: COMPLETA**
- Formulario de precio diferenciado para una variante específica

---

### G4-30 · AdminPriceSyncPage · `/admin/price-sync`
**Calidad: COMPLETA**
- Sync masivo de precios: CSV o ajuste porcentual, previsualización antes de aplicar
- MSW: POST /api/v1/admin/price-sync/preview-csv/ ✓, POST /api/v1/admin/price-sync/apply-csv/ ✓
- POST /api/v1/admin/price-sync/preview-percentage/ ✓, POST /api/v1/admin/price-sync/apply-percentage/ ✓

---

### G4-31 · AdminProductDiscountsPage · `/admin/product-discounts`
**Calidad: COMPLETA**
- CRUD de descuentos de producto: porcentaje, precio especial, fechas de vigencia
- MSW: GET /api/v1/admin/product-discounts/ ✓, POST /api/v1/admin/product-discounts/ ✓

---

### G4-32 · AdminReportDashboardPage · `/admin/reports`
**Calidad: INCOMPLETA**
- Hub de reportes con navegación a los 3 reportes específicos
- **PROBLEMA**: importa `AdminReportDashboardPage.module.scss` que NO EXISTE

---

### G4-33 · AdminReportSalesPage · `/admin/reports/sales`
**Calidad: INCOMPLETA**
- Reporte de ingresos y ventas con gráfico de línea
- **PROBLEMA**: importa `AdminReportSalesPage.module.scss` que NO EXISTE

---

### G4-34 · AdminReportTopSellersPage · `/admin/reports/top-sellers`
**Calidad: INCOMPLETA**
- Reporte de productos más vendidos con ranking
- **PROBLEMA**: importa `AdminReportTopSellersPage.module.scss` que NO EXISTE

---

### G4-35 · AdminReportCustomersRfmPage · `/admin/reports/customers-rfm`
**Calidad: INCOMPLETA**
- Reporte de segmentación RFM de clientes
- **PROBLEMA**: importa `AdminReportCustomersRfmPage.module.scss` que NO EXISTE

---

### G4-36 · AdminSupportPage · `/admin/support`
**Calidad: COMPLETA**
- Bandeja de tickets de soporte con filtros de estado y prioridad
- MSW: GET /api/v1/admin/support/tickets/ ✓, PATCH /api/v1/admin/support/tickets/:id/ ✓

---

### G4-37 · AdminReturnsPage · `/admin/returns`
**Calidad: COMPLETA**
- Lista de solicitudes de devolución con filtros de estado
- MSW: GET /api/v1/admin/returns/ ✓

---

### G4-38 · AdminReturnDetailPage · `/admin/returns/:id`
**Calidad: COMPLETA**
- Gestión de devolución: aprobar, rechazar, solicitar info adicional, procesar reembolso
- MSW: GET /api/v1/admin/returns/:id/ ✓, POST /api/v1/admin/returns/:id/approve/ ✓
- POST /api/v1/admin/returns/:id/reject/ ✓, POST /api/v1/admin/returns/:id/refund/ ✓

---

### G4-39 · AdminPaymentsPage · `/admin/payments`
**Calidad: COMPLETA**
- Reporte de transacciones de pago con filtros y export
- MSW: GET /api/v1/admin/payments ✓

---

### G4-40 · AdminPaymentRefundPage · `/admin/payments/:paymentId/refund`
**Calidad: COMPLETA**
- Formulario de reembolso manual con monto, motivo y confirmación

---

### G4-41 · AdminContactMessagesPage · `/admin/contact/messages`
**Calidad: COMPLETA**
- Bandeja de mensajes de contacto con filtros

---

### G4-42 · AdminContactMessageDetailPage · `/admin/contact/messages/:id`
**Calidad: COMPLETA**
- Detalle del mensaje con formulario de respuesta

---

### G4-43 · AdminNewsletterSubscribersPage · `/admin/newsletter/subscribers`
**Calidad: COMPLETA**
- Lista de suscriptores con filtros y export CSV

---

### G4-44 · AdminNewsletterComposePage · `/admin/newsletter/compose`
**Calidad: COMPLETA**
- Compositor de campaña de newsletter con editor de contenido

---

### G4-45 · AdminQuestionsAnswerPage · `/admin/questions/answer`
**Calidad: COMPLETA**
- Cola de preguntas sin responder con formulario de respuesta inline

---

### G4-46 · AdminQuestionsModerationPage · `/admin/questions/moderation`
**Calidad: COMPLETA**
- Cola de moderación de preguntas pendientes

---

### G4-47 · AdminReviewsModerationPage · `/admin/reviews/moderation`
**Calidad: COMPLETA**
- Cola de moderación de reseñas pendientes: aprobar, rechazar, responder

---

### G4-48 · AdminNotificationComposePage · `/admin/notifications/compose`
**Calidad: PARCIAL**
- Compositor de notificación manual con segmentación de destinatarios
- MSW: GET /api/v1/admin/notifications/ ✓
- **Pendiente**: sin loading state

---

### G4-49 · AdminLogisticsPage · `/admin/logistics`
**Calidad: COMPLETA**
- Panel operacional de logística con órdenes listas para despachar

---

### G4-50 · AdminPermissionsPage · `/admin/permissions`
**Calidad: COMPLETA**
- Matriz de permisos por rol

---

### G4-51 · AdminAuditLogPage · `/admin/audit-log`
**Calidad: COMPLETA**
- Log de auditoría con filtros de usuario, acción y rango de fechas

---

### G4-52 · AdminSystemSettingsPage · `/admin/system-settings`
**Calidad: COMPLETA**
- Configuración del sistema: parámetros técnicos, integraciones, debug
- MSW: GET /api/v1/admin/settings/ ✓, PATCH /api/v1/admin/settings/ ✓

---

### G4-53 · AdminBackupsPage · `/admin/backups`
**Calidad: COMPLETA**
- Lista de backups con opción de trigger manual
- MSW: POST /api/v1/admin/backups/trigger/ ✓

---

### G4-54 · AdminConfigPage · `/admin/config`
**Calidad: PARCIAL**
- Hub de configuración con tarjetas hacia gateways, envío y site settings
- 99 líneas — solo navegación, sin redux
- **PROBLEMA CRÍTICO**: las 3 tarjetas de configuración tienen `aria-disabled="true"` y están deshabilitadas porque las rutas a las que enlazan NO EXISTEN en el router
- Al registrar AdminGatewaysPage, AdminShippingMethodsPage y AdminSiteSettingsPage en el router, estas tarjetas deben habilitarse

---

### G4-55 · NotFoundPage · `/404`
**Calidad: COMPLETA**
- Página 404 con código animado, mensaje explicativo, CTA al catálogo
- 31 líneas — correcto para una 404 (no necesita ser compleja)
- Sin redux — correcto
- **Pendiente**: verificar en browser que `https://localhost/404` la carga (path="404" sin slash puede ser relativo)

---

## RESUMEN EJECUTIVO

| Grupo | Total | Producción | Completa | Parcial | Incompleta | Huérfana |
|-------|-------|-----------|---------|---------|-----------|---------|
| Tienda pública | 18 | 1 | 12 | 4 | 0 | 0 |
| Auth | 5 | 1 | 4 | 0 | 0 | 0 |
| Cuenta comprador | 21 | 0 | 18 | 3 | 0 | 0 |
| Admin | 55 | 0 | 30 | 12 | 4 | 12 |
| **Total** | **99** | **2** | **64** | **19** | **4** | **12** |

---

## PROBLEMAS CRÍTICOS POR PRIORIDAD

### Prioridad ALTA — Crashes en producción

| ID | Página | Problema |
|----|--------|---------|
| C-01 | AdminProductEditPage | Importa `.module.scss` que no existe → crash en build |
| C-02 | AdminProductImportPage | Importa `.module.scss` que no existe → crash en build |
| C-03 | AdminProductVariantsPage | Importa `.module.scss` que no existe → crash en build |
| C-04 | AdminReportDashboardPage | Importa `.module.scss` que no existe → crash en build |
| C-05 | AdminReportSalesPage | Importa `.module.scss` que no existe → crash en build |
| C-06 | AdminReportTopSellersPage | Importa `.module.scss` que no existe → crash en build |
| C-07 | AdminReportCustomersRfmPage | Importa `.module.scss` que no existe → crash en build |
| C-08 | AdminShippingMethodsPage | Importa `.module.scss` que no existe → crash en build |
| C-09 | AdminStaticPagesPage | Importa `.module.scss` que no existe → crash en build |
| C-10 | AdminStockAlertsPage | Importa `.module.scss` que no existe → crash en build |
| C-11 | AdminVariantTypesPage | Importa `.module.scss` que no existe → crash en build |

### Prioridad ALTA — Páginas inaccesibles (huérfanas)

12 páginas sin ruta — ver HALLAZGO-ROUTER-01 en hallazgos.md

### Prioridad MEDIA — Loading infinito cuando recurso no existe

| Página | Condición | Fix requerido |
|--------|-----------|---------------|
| ProductPage | slug no existe | `if (!isLoading && !product) return <Navigate to="/404" />` |
| OrderSuccessPage | orden no existe | Mismo patrón |
| OrderDetailPage | orden no existe | Mismo patrón |

### Prioridad MEDIA — Endpoints sin mock MSW

| Endpoint | Usado por |
|----------|-----------|
| DELETE /api/v1/auth/addresses/:id/ | AddressesPage |
| PATCH /api/v1/auth/addresses/:id/ | AddressesPage |
| GET /api/v1/admin/products/:id/ | AdminProductEditPage |
| GET /api/v1/payments/gateways/ | PaymentSelectionPage |
| GET /api/v1/admin/pages/ | AdminStaticPagesPage |
| GET /api/v1/admin/pages/:slug/ | AdminStaticPageEditorPage |
| GET /api/v1/admin/inventory/dashboard/ | AdminInventoryDashboardPage |
| GET /api/v1/admin/inventory/stock-alerts/ | AdminStockAlertsPage |

### Prioridad BAJA — Mejoras de UX

| Página | Mejora |
|--------|--------|
| AccountPage | Cargar datos reales en tarjetas de resumen |
| RegisterPage | Integrar usePasswordStrength |
| CheckoutPage | Validación de campos antes de submit |
| AdminDashboardPage | Loading state visible en KPIs |
| AdminConfigPage | Habilitar tarjetas cuando se registren las rutas |
