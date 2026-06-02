# Alcance — cablear-rutas-huerfanas

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0b (lectura sistemática del router + sidebars + grep de enlaces en todo `src`) |
| Red flags activos | RF-7 (existe `auditar-rutas-y-flujos` en ejecución; ¿solapa?) |
| Resultado | **CONFIRMAR** |
| Evidencia | `analisis-rutas-huerfanas.md`: de 102 rutas declaradas en `AppRouter`, **22 no tienen ningún enlace en la UI** (ni `to=`/`navigate()`/`href=` ni entrada en `AdminSidebar`/`AccountSidebar`). Incluye 2 que acabo de añadir (`account/referral`, `admin/couriers`) y `admin/orders-dashboard` (confirmado sin link en el E2E de la sesión anterior). |
| Iniciativas previas revisadas | `auditar-rutas-y-flujos` @ En ejecución — su F2 registró **páginas sin ruta** (12 huérfanas → router). Esta iniciativa es **complementaria**: conecta **rutas sin enlace** → navegación. No solapa. |

**Conclusión:** premisa confirmada. Hay 22 rutas alcanzables solo tecleando la
URL. Se conectan a su punto de entrada natural (sidebar para herramientas de
nivel superior; enlace desde la página padre para sub-páginas).

## Por qué existe

Una ruta sin enlace es código muerto desde la UX: el usuario no puede llegar a
ella. Esto degrada el descubrimiento de funciones (varias del panel admin) y
deja sin entrada las páginas nuevas (referral, couriers).

## Qué cubre

Cablear las 22 rutas huérfanas a navegación, clasificadas por destino:
1. **AccountSidebar** (cuenta): `account/referral`, `account/change-password`,
   `account/search-history`, `account/notifications/preferences`.
2. **AdminSidebar** (herramientas admin de nivel superior): `admin/couriers`,
   `admin/permissions`, `admin/backups`, `admin/orders-dashboard`,
   `admin/price-sync`, `admin/product-discounts`, `admin/notifications/compose`,
   `admin/newsletter/subscribers`, `admin/newsletter/compose`,
   `admin/questions/answer`, `admin/questions/moderation`,
   `admin/reviews/moderation`.
3. **Enlace desde la página padre** (sub-páginas, no van en sidebar):
   `admin/products/import` (← AdminProductsPage), `admin/inventory/dashboard`
   (← inventario), `admin/variants/:variantId/price` (← matriz de variantes),
   `admin/config/{gateways,shipping,site}` (tabs dentro de AdminConfigPage).

## Criterio de completitud

- Cada ruta huérfana tiene un punto de entrada navegable (sidebar o página padre).
- Tests de navegación de las sidebars cubren las entradas nuevas.
- `npm test` 0 fallos; `check-scss` clean; `build:demo` OK.

## Fuera de alcance

- Rutas **intencionalmente no-navegables** (no son huérfanas): auth
  (`login`, `register`, `forgot-password`, `reset-password`, `verify-email`),
  checkout programático (`checkout/express`, `checkout/payment/:orderId`),
  redirects (`categories`, `newsletter*`).
- Páginas sin ruta (eso es `auditar-rutas-y-flujos` F2).
