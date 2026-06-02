# Decisiones — cablear-rutas-huerfanas

Cierre: 2026-06-02T19:00:32

## Resumen

Se auditaron 22 rutas supuestamente huérfanas. El Premise Gate por grupo
corrigió el alcance: **3 no eran huérfanas** (ya enlazadas), quedando **19
huérfanas reales**, todas cableadas a la navegación.

## Matriz de rutas (resultado)

| # | Ruta | Grupo | Resolución |
|---|------|-------|------------|
| 1 | account/referral | cuenta | Link en AccountLayout (F1) |
| 2 | account/search-history | cuenta | Link en AccountLayout (F1) |
| — | account/change-password | cuenta | ya en AccountLayout.jsx:23 — NO huérfana |
| — | account/notifications/preferences | cuenta | ya en AccountLayout.jsx:21 — NO huérfana |
| 3 | admin/couriers | admin | AdminSidebar "Mensajeros" (F2) |
| 4 | admin/permissions | admin | AdminSidebar "Permisos" (F2) |
| 5 | admin/backups | admin | AdminSidebar "Respaldos" (F2) |
| 6 | admin/orders-dashboard | admin | AdminSidebar "Panel de pedidos" (F2) |
| 7 | admin/price-sync | admin | AdminSidebar "Sincronizar precios" (F2) |
| 8 | admin/product-discounts | admin | AdminSidebar "Descuentos" (F2) |
| 9 | admin/notifications/compose | admin | AdminSidebar "Enviar notificacion" (F2) |
| 10 | admin/newsletter/subscribers | admin | AdminSidebar "Suscriptores" (F2) |
| 11 | admin/newsletter/compose | admin | AdminSidebar "Redactar boletin" (F2) |
| 12 | admin/questions/answer | admin | AdminSidebar "Responder preguntas" (F2) |
| 13 | admin/questions/moderation | admin | AdminSidebar "Moderar preguntas" (F2) |
| 14 | admin/reviews/moderation | admin | AdminSidebar "Moderar resenas" (F2) |
| 15 | admin/products/import | sub-página | Link "Importar CSV" en AdminProductsPage (F3) |
| 16 | admin/inventory/dashboard | sub-página | Link "Dashboard" en AdminInventoryPage (F3) |
| 17 | admin/config/gateways | sub-página | tarjeta hub "Pasarelas de pago" (F3) |
| 18 | admin/config/shipping | sub-página | tarjeta hub "Metodos y costos de envio" (F3) |
| 19 | admin/config/site | sub-página | tarjeta hub "Ajustes del sitio" (F3) |
| — | admin/variants/:variantId/price | sub-página | ya en AdminVariantsPage.jsx:168 — NO huérfana |

## Decisiones clave

- **D-01 — Nav de cuenta canónica = AccountLayout, no AccountSidebar.** El
  análisis original solo inspeccionó AccountSidebar. La nav real es
  `layouts/AccountLayout.jsx` (a nivel de router, con test). Se cableó allí.
- **D-02 — Hub de config repuntado a páginas de dominio.** Las tarjetas
  CFG-01/02/03 apuntaban a panels operativos (payments/logistics/
  system-settings) dejando huérfanas las páginas de config dedicadas. Se
  repuntaron a `/admin/config/{gateways,shipping,site}`; los panels siguen
  accesibles vía AdminSidebar.
- **D-03 — Bug de enlace corregido.** `AdminProductsPage` enlazaba a
  `/admin/products/nuevo` (404); la ruta es `/admin/products/new`.

## Drifts documentados (fuera de alcance — follow-up)

- **DR-01** Doble nav de cuenta: AccountLayout (canónica) y AccountSidebar
  (embebida en cada página) se renderizan a la vez con listas distintas.
  → iniciativa `unificar-navs-cuenta`.
- **DR-02** Doble implementación de SiteSettings: `/admin/system-settings`
  (UC-ADM-04) y `/admin/config/site` (AdminSiteSettingsPage).

## Verificación de cierre (F4)

| Gate | Resultado |
|------|-----------|
| `npx jest --ci` | 1694 passed, 0 failed, 109 skipped (272/274 suites) |
| `node scripts/check-scss.mjs` | 170 entries compiled clean |
| `DEMO_MODE=true npm run build:demo` | webpack compiled, EXIT=0 (solo warnings de tamaño de asset, pre-existentes) |

## Commits

- `0f833ce` Wire orphan account routes into nav (F1)
- `54baaaf` Wire 12 orphan admin routes into AdminSidebar (F2)
- `e6723d1` Wire 5 orphan admin sub-pages from parents (F3)
