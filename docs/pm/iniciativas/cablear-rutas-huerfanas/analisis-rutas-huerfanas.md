# Análisis — rutas huérfanas (sin enlace en la UI)

Método: se extrajeron las 102 rutas de `src/router/AppRouter.jsx` y se buscó,
para cada una, algún `to=`/`navigate()`/`href=` con su path absoluto en todo
`src`, más su presencia en `AdminSidebar`/`AccountSidebar`. Las que no aparecen
en ninguno son huérfanas de navegación.

## Huérfanas reales (22) — destino propuesto

### Cuenta → AccountLayout (2 reales, no 4)

> **Corrección de Premise Gate (F1, 2026-06-02T18:50:10).** El grep
> original solo inspeccionó `AccountSidebar/index.jsx` y `AdminSidebar`,
> y omitió la nav **a nivel de layout** `src/layouts/AccountLayout.jsx`
> (`NAV_ITEMS`), que es la nav canónica con test (`AccountLayout.test.jsx`)
> montada en el router (`<Route element={<AccountLayout/>}>`). Verificado:
> `grep -nE "change-password|notifications" src/layouts/AccountLayout.jsx`
> → líneas 21 y 23. Por tanto **`change-password` y
> `notifications/preferences` NO eran huérfanas** (ya enlazadas en
> AccountLayout). Huérfanas reales: solo `referral` y `search-history`.

| Ruta | Página | Acción | Estado |
|------|--------|--------|--------|
| account/referral | ReferralPage (UC-PRO-05) | entrada "Referidos" en AccountLayout | HUÉRFANA — cableada F1 |
| account/search-history | SearchHistoryPage | entrada "Historial de busqueda" en AccountLayout | HUÉRFANA — cableada F1 |
| account/change-password | ChangePasswordPage | ya en AccountLayout.jsx:23 | NO huérfana |
| account/notifications/preferences | NotificationPreferencesPage | ya en AccountLayout.jsx:21 | NO huérfana |

> **Drift detectado (fuera de alcance de esta iniciativa):** existen DOS
> navs de cuenta que se renderizan simultáneamente — `AccountLayout`
> (layout, canónica, testeada) y `AccountSidebar` (componente embebido en
> cada página: ProfilePage, OrdersPage, etc.). Listas de enlaces distintas.
> Se cableó en AccountLayout (la canónica). La deduplicación de ambas navs
> requiere iniciativa separada (`unificar-navs-cuenta`).

### Admin nivel superior → AdminSidebar (12)
| Ruta | Acción |
|------|--------|
| admin/couriers | entrada (UC-LOG-06) |
| admin/permissions | entrada (grupo Sistema) |
| admin/backups | entrada (grupo Sistema) |
| admin/orders-dashboard | entrada (grupo Pedidos) — confirmada huérfana en E2E |
| admin/price-sync | entrada (grupo Catálogo/Inventario) |
| admin/product-discounts | entrada (grupo Promociones) |
| admin/notifications/compose | entrada (grupo Comunicación) |
| admin/newsletter/subscribers | entrada (grupo Comunicación) |
| admin/newsletter/compose | entrada (grupo Comunicación) |
| admin/questions/answer | entrada (grupo Contenido/Soporte) |
| admin/questions/moderation | entrada (grupo Contenido/Soporte) |
| admin/reviews/moderation | entrada (grupo Contenido/Soporte) |

### Sub-páginas → enlace desde la página padre (5 reales, no 6)

> **Verificación F3 (2026-06-02).** Antes de cablear cada sub-página se
> confirmó por grep que no hubiera enlace dinámico existente.

| Ruta | Padre / disposición | Estado |
|------|---------------------|--------|
| admin/products/import | "Importar CSV" en AdminProductsPage era `<Button>` muerto → ahora `<Link>` | HUÉRFANA — cableada F3 |
| admin/inventory/dashboard | enlace "Dashboard" en cabecera de AdminInventoryPage | HUÉRFANA — cableada F3 |
| admin/config/gateways | tarjeta "Pasarelas de pago" del hub AdminConfigPage | HUÉRFANA — cableada F3 |
| admin/config/shipping | tarjeta "Metodos y costos de envio" del hub | HUÉRFANA — cableada F3 |
| admin/config/site | tarjeta "Ajustes del sitio" del hub | HUÉRFANA — cableada F3 |
| admin/variants/:variantId/price | `AdminVariantsPage.jsx:168` ya tiene `<Link to={`/admin/variants/${variant.id}/price`}>` | **NO huérfana** — descartada |

> **Repunte del hub de config (decisión RUP).** Las tarjetas CFG-01/02/03
> apuntaban a páginas operativas (`/admin/payments`, `/admin/logistics`,
> `/admin/system-settings`) en vez de a sus páginas de dominio dedicadas
> (`AdminGatewaysPage`, `AdminShippingMethodsPage`, `AdminSiteSettingsPage`),
> que quedaban huérfanas. Se repuntaron al `/admin/config/*` dedicado; las
> páginas operativas siguen accesibles desde el AdminSidebar (Pagos,
> Logística, Sistema), así que no se pierde alcance.

> **Bug colateral corregido:** `AdminProductsPage.jsx:43` enlazaba a
> `/admin/products/nuevo` pero la ruta es `admin/products/new` (404).
> Corregido en el mismo cambio (drift, principio-rector Cláusula 2).

> **Drift pendiente (fuera de alcance):** existen DOS implementaciones de
> SiteSettings — `/admin/system-settings` (UC-ADM-04) y `/admin/config/site`
> (AdminSiteSettingsPage). Unificación → iniciativa separada.

## NO son huérfanas

- **Falsos positivos del regex** (sí están en sidebar, vía `to={config}`):
  admin/products/new, admin/categories, admin/audit-log, admin/system-settings,
  admin/support, admin/logistics, admin/config.
- **Intencionalmente no-navegables**: login, register, forgot-password,
  reset-password/:uid/:token, verify-email (auth por redirect/email),
  checkout/express, checkout/payment/:orderId (programático), categories,
  newsletter, newsletter/unsubscribe (redirect/footer).
