# Plan de tareas — auditar-rutas-y-flujos

## Tarea 1 — Resolver HALLAZGO-ROUTER-02 (duplicado Variants)
Decidir entre Opción A (paths distintos) u Opción B (tabs).
Recomendacion: Opcion A — paths distintos, roles distintos.
  - AdminVariantsPage → `/admin/products/:id/variants` (ya en router)
  - AdminProductVariantsPage → `/admin/products/:id/variants/matrix`

## Tarea 2 — Registrar las 12 páginas huérfanas en AppRouter

Orden de prioridad por impacto en flujos de negocio:

| Prioridad | Página | Ruta | Bloque router |
|-----------|--------|------|---------------|
| 1 | AdminVoucherDetailPage | `/admin/vouchers/:id` | AdminRoute |
| 2 | AdminProductDetailPage | `/admin/products/:id` | AdminRoute |
| 3 | AdminProductImportPage | `/admin/products/import` | AdminRoute |
| 4 | AdminVariantTypesPage | `/admin/products/:id/variant-types` | AdminRoute |
| 5 | AdminProductVariantsPage | `/admin/products/:id/variants/matrix` | AdminRoute |
| 6 | AdminStaticPagesPage | `/admin/pages` | AdminRoute |
| 7 | AdminStaticPageEditorPage | `/admin/pages/:slug/edit` | AdminRoute |
| 8 | AdminGatewaysPage | `/admin/config/gateways` | AdminRoute |
| 9 | AdminShippingMethodsPage | `/admin/config/shipping` | AdminRoute |
| 10 | AdminSiteSettingsPage | `/admin/config/site` | AdminRoute |
| 11 | AdminInventoryDashboardPage | `/admin/inventory/dashboard` | AdminRoute |
| 12 | AdminStockAlertsPage | `/admin/inventory/stock-alerts` | AdminRoute |

## Tarea 3 — Verificar flujos críticos en browser

| Flujo | Credenciales | Pasos a verificar |
|-------|-------------|-------------------|
| F-01 Compra invitado | ninguna | / → catalog → producto → cart → checkout |
| F-02 Login | comprador@test.mx / Test1234! | /auth/login → redirect correcto |
| F-03 Login admin | admin@e-comerce.example.com / Admin1234! | /auth/login → /admin |
| F-04 Recuperar contraseña | ninguna | /auth/forgot-password → mensaje |
| F-05 Búsqueda global | ninguna | Header SearchBar → /search?q=eleke |
| F-06 Categoría | ninguna | Nav → /catalog?category=collares-y-pulseras |
| F-07 Admin crud producto | admin | /admin/products → /admin/products/:id/edit |
| F-08 404 directo | ninguna | /ruta-inexistente → /404 |

## Tarea 4 — Verificar comportamiento de 404 de recurso

Para cada ruta con :slug/:id dinámico, verificar que al recibir 404 de la API:
- La página no queda en estado "Cargando..." indefinidamente
- Redirige o muestra mensaje de "no encontrado"
- No crashea con error de JS

## Tarea 5 — Verificar ProtectedRoute y AdminRoute

- Acceder a /account sin sesión → debe redirigir a /auth/login
- Acceder a /admin sin sesión → debe redirigir a /auth/login
- Acceder a /admin con cuenta de comprador → debe redirigir a /
- Verificar que después del login redirige al destino correcto

## Estado

| Tarea | Estado |
|-------|--------|
| T1 — Resolver duplicado Variants | Pendiente |
| T2 — Registrar 12 páginas huérfanas | Pendiente |
| T3 — Verificar flujos en browser | En curso |
| T4 — Verificar 404 de recurso | Pendiente |
| T5 — Verificar ProtectedRoute | Pendiente |
