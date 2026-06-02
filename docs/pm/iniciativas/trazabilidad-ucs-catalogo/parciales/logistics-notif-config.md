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
