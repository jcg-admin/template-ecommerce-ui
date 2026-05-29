# Plan de tareas — auditar-rutas-y-flujos

Orden de ejecución: primero los crashes, luego los inaccesibles, luego los UX.

---

## FASE 1 — Eliminar crashes de build (SCSS faltantes)

**T1-01** — Crear 11 archivos SCSS Module faltantes
- Leer cada página y extraer las clases CSS que usa (`styles.xxx`)
- Crear el archivo SCSS con esas clases y estilos coherentes con el sistema de diseño
- Verificar con `node scripts/check-scss.mjs` tras cada archivo

P�ginas afectadas:
- AdminProductEditPage.module.scss
- AdminProductImportPage.module.scss
- AdminProductVariantsPage.module.scss
- AdminReportDashboardPage.module.scss
- AdminReportSalesPage.module.scss
- AdminReportTopSellersPage.module.scss
- AdminReportCustomersRfmPage.module.scss
- AdminShippingMethodsPage.module.scss
- AdminStaticPagesPage.module.scss
- AdminStockAlertsPage.module.scss
- AdminVariantTypesPage.module.scss

---

## FASE 2 — Registrar páginas huérfanas en el router

**T2-01** — Resolver conflicto AdminVariantsPage vs AdminProductVariantsPage
- Decisión: AdminVariantsPage en `/admin/products/:id/variants` (gestión)
- AdminProductVariantsPage en `/admin/products/:id/variants/matrix` (combinaciones)

**T2-02** — Agregar rutas a AppRouter.jsx bajo AdminRoute:

| Prioridad | Ruta | Página |
|-----------|------|--------|
| 1 | `/admin/vouchers/:id` | AdminVoucherDetailPage |
| 2 | `/admin/products/:id` | AdminProductDetailPage |
| 3 | `/admin/products/import` | AdminProductImportPage |
| 4 | `/admin/products/:id/variant-types` | AdminVariantTypesPage |
| 5 | `/admin/products/:id/variants/matrix` | AdminProductVariantsPage |
| 6 | `/admin/pages` | AdminStaticPagesPage |
| 7 | `/admin/pages/:slug/edit` | AdminStaticPageEditorPage |
| 8 | `/admin/config/gateways` | AdminGatewaysPage |
| 9 | `/admin/config/shipping` | AdminShippingMethodsPage |
| 10 | `/admin/config/site` | AdminSiteSettingsPage |
| 11 | `/admin/inventory/dashboard` | AdminInventoryDashboardPage |
| 12 | `/admin/inventory/stock-alerts` | AdminStockAlertsPage |

**T2-03** — Habilitar tarjetas de AdminConfigPage
- Quitar `aria-disabled="true"` de las 3 tarjetas de config tras registrar sus rutas

---

## FASE 3 — Corregir loading infinito en recursos no encontrados

**T3-01** — ProductPage
```jsx
if (isLoading) return <div className={styles.loading}>Cargando…</div>;
if (!product)  return <Navigate to="/404" replace />;
```

**T3-02** — OrderSuccessPage
Mismo patrón: si `!isLoading && !order` → Navigate a /404

**T3-03** — OrderDetailPage
Mismo patrón: si `!isLoading && !order` → Navigate a /account/orders

---

## FASE 4 — Agregar MSW handlers faltantes

**T4-01** — addresses (editar y eliminar)
```typescript
// En storefront.ts
http.patch('/api/v1/auth/addresses/:id/', ...),
http.delete('/api/v1/auth/addresses/:id/', ...),
```

**T4-02** — admin products detalle
```typescript
// En admin.ts
http.get('/api/v1/admin/products/:id/', ({ params }) => {
  const p = ADMIN_PRODUCTS.find(p => String(p.id) === params.id);
  if (!p) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 });
  return HttpResponse.json(p);
}),
```

**T4-03** — payment gateways
```typescript
// En payments.ts
http.get('/api/v1/payments/gateways/', () =>
  HttpResponse.json({ results: MOCK_GATEWAYS })
),
```

**T4-04** — admin pages CMS
```typescript
// En admin.ts
http.get('/api/v1/admin/pages/', ...),
http.get('/api/v1/admin/pages/:slug/', ...),
```

**T4-05** — inventory dashboard y stock alerts
```typescript
// En inventory.ts
http.get('/api/v1/admin/inventory/dashboard/', ...),
http.get('/api/v1/admin/inventory/stock-alerts/', ...),
```

---

## FASE 5 — Mejoras de UX

**T5-01** — RegisterPage: integrar usePasswordStrength en el campo de contraseña
**T5-02** — CheckoutPage: validar campos antes de submit + mostrar error de createOrder
**T5-03** — AccountPage: cargar resumen real de últimos pedidos e items en wishlist
**T5-04** — AdminDashboardPage: loading state visible en KPIs mientras carga metrics
**T5-05** — Resolver HALLAZGO-SLICE-CONFLICT-01: unificar createProduct en adminSlice

---

## FASE 6 — Verificación de flujos completos en browser

| Flujo | Credenciales | Pasos |
|-------|-------------|-------|
| F-01 | ninguna | / → catalog → producto → carrito → checkout |
| F-02 | comprador@test.mx / Test1234! | login → redirect correcto → account |
| F-03 | admin@e-comerce.example.com / Admin1234! | login → /admin → vouchers/:id |
| F-04 | ninguna | /ruta-inexistente → /404 |
| F-05 | ninguna | /catalog/slug-que-no-existe → /404 |
| F-06 | admin | /admin/config → gateways → shipping → site |
| F-07 | admin | /admin/products → /admin/products/import |
| F-08 | admin | /admin/reports → sales → top-sellers → customers-rfm |
| F-09 | admin | /admin/inventory → dashboard → stock-alerts |
| F-10 | admin | /admin/vouchers → /admin/vouchers/:id → editar |

---

## Estado de las fases

| Fase | Estado | Tickets |
|------|--------|---------|
| F1 — SCSS faltantes | PENDIENTE | T1-01 (11 archivos) |
| F2 — Rutas huérfanas | PENDIENTE | T2-01..03 (13 acciones) |
| F3 — Loading infinito | PENDIENTE | T3-01..03 |
| F4 — MSW handlers | PENDIENTE | T4-01..05 |
| F5 — Mejoras UX | PENDIENTE | T5-01..05 |
| F6 — Verificación browser | EN CURSO | F-01..F-10 |
