# Plan de tareas — auditar-rutas-y-flujos

Orden de ejecución: F1 → F4 → F5 → F2 → F3 → F6 → F7

---

## FASE 1 — SCSS Modules (COMPLETADA)

**Estado:** COMPLETADA — commits 9251a4f + eccdd4b
**Resultado:** 0 archivos creados. 33 clases agregadas en 10 archivos.
1 variable incorrecta corregida ($bg-dark → $bg-page).

Ver hallazgos detallados: HALLAZGO-FASE1-01 al HALLAZGO-FASE1-06.

---

## FASE 2 — Registrar páginas huérfanas en el router

**T2-01** — Resolver conflicto AdminVariantsPage vs AdminProductVariantsPage

AdminVariantsPage (en router) gestiona variantes individuales (UC-CHT-03).
AdminProductVariantsPage (huérfana) gestiona la tabla de combinaciones con bulk update.
Decisión: paths distintos.
- `/admin/products/:id/variants` → AdminVariantsPage (ya registrada)
- `/admin/products/:id/variants/matrix` → AdminProductVariantsPage (registrar)

**T2-02** — Agregar rutas en AppRouter.jsx bajo AdminRoute

| Prioridad | Ruta | Página |
|-----------|------|--------|
| 1 | `/admin/vouchers/:id` | AdminVoucherDetailPage |
| 2 | `/admin/products/:id` | AdminProductDetailPage |
| 3 | `/admin/products/import` | AdminProductImportPage (antes de `:id`) |
| 4 | `/admin/products/:id/variant-types` | AdminVariantTypesPage |
| 5 | `/admin/products/:id/variants/matrix` | AdminProductVariantsPage |
| 6 | `/admin/pages` | AdminStaticPagesPage |
| 7 | `/admin/pages/:slug/edit` | AdminStaticPageEditorPage |
| 8 | `/admin/config/gateways` | AdminGatewaysPage |
| 9 | `/admin/config/shipping` | AdminShippingMethodsPage |
| 10 | `/admin/config/site` | AdminSiteSettingsPage |
| 11 | `/admin/inventory/dashboard` | AdminInventoryDashboardPage |
| 12 | `/admin/inventory/stock-alerts` | AdminStockAlertsPage |

**T2-03** — Agregar lazy imports correspondientes al inicio de AppRouter.jsx

---

## FASE 3 — Habilitar AdminConfigPage (depende de F2)

**T3-01** — Quitar `aria-disabled="true"` de las 3 tarjetas de config y
convertirlas de `<div>` a `<Link>` apuntando a las rutas registradas en F2.

---

## FASE 4 — Corregir loading infinito en recursos no encontrados

**T4-01** — ProductPage: `/catalog/:slug`
```jsx
if (isLoading) return <div className={styles.loading}>Cargando...</div>;
if (!product)  return <Navigate to="/404" replace />;
```

**T4-02** — OrderSuccessPage: `/order/:id/confirmation`
```jsx
if (isLoading) return <div className={styles.loading}>Cargando...</div>;
if (!order)    return <Navigate to="/" replace />;
```

**T4-03** — OrderDetailPage: `/account/orders/:id`
```jsx
if (isLoading) return <div className={styles.loading}>Cargando...</div>;
if (!order)    return <Navigate to="/account/orders" replace />;
```

---

## FASE 5 — MSW handlers faltantes

**T5-01** — `DELETE /api/v1/auth/addresses/:id/` + `PATCH /api/v1/auth/addresses/:id/`
En: `src/mocks/handlers/storefront.ts`

**T5-02** — `GET /api/v1/admin/products/:id/` + `PATCH /api/v1/admin/products/:id/`
En: `src/mocks/handlers/admin.ts`

**T5-03** — `GET /api/v1/payments/gateways/`
En: `src/mocks/handlers/payments.ts`

**T5-04** — `GET /api/v1/admin/pages/` + `GET /api/v1/admin/pages/:slug/` + `PATCH /api/v1/admin/pages/:slug/`
En: `src/mocks/handlers/admin.ts`

**T5-05** — `GET /api/v1/admin/inventory/dashboard/` + `GET /api/v1/admin/inventory/stock-alerts/`
En: `src/mocks/handlers/inventory.ts`

**T5-06** — `GET /api/v1/admin/vouchers/:id/` + `POST /api/v1/admin/vouchers/` + `PATCH /api/v1/admin/vouchers/:id/` + `DELETE /api/v1/admin/vouchers/:id/`
En: `src/mocks/handlers/admin.ts`

**T5-07** — `GET /api/v1/admin/config/gateways/` + `PATCH /api/v1/admin/config/gateways/:id/` + `POST /api/v1/admin/config/gateways/:id/test/`
En: `src/mocks/handlers/admin.ts`

---

## FASE 6 — Mejoras UX en páginas existentes

**T6-01** — CartPage: Alert de error + LoadingButton + empty state con CTA
**T6-02** — CheckoutPage: Alert cuando createOrder falla
**T6-03** — AddressesPage: LoadingButton en formulario + MSW DELETE/PATCH address
**T6-04** — RegisterPage: integrar usePasswordStrength en campo de contraseña
**T6-05** — AccountPage: cargar resumen real de últimos pedidos e items en wishlist

---

## FASE 7 — Verificación de flujos en browser

| ID | Flujo | Credenciales |
|----|-------|-------------|
| F-01 | / → catalog → producto → cart → checkout | ninguna |
| F-02 | /auth/login comprador → /account | comprador@test.mx / Test1234! |
| F-03 | /auth/login admin → /admin | admin@e-comerce.example.com / Admin1234! |
| F-04 | /account sin sesión → /auth/login | ninguna |
| F-05 | /admin con comprador → / | comprador |
| F-06 | /ruta-inexistente → /404 | ninguna |
| F-07 | /catalog/slug-inventado → /404 | ninguna |
| F-08 | Nav categoría → /catalog?category=akoses-medicinas filtra | ninguna |
| F-09 | Header SearchBar → /search?q=eleke | ninguna |
| F-10 | /admin/vouchers → /admin/vouchers/:id | admin |
| F-11 | /admin/config → tarjeta Gateways → /admin/config/gateways | admin |
| F-12 | /admin/products/import → Stepper 3 pasos | admin |
| F-13 | /admin/pages → /admin/pages/about/edit | admin |
| F-14 | /admin/inventory/dashboard → KPIs cargan | admin |
| F-15 | /admin/inventory/stock-alerts → tabla de alertas | admin |

---

## Estado de fases

| Fase | Estado | Resultado |
|------|--------|-----------|
| F1 — SCSS Modules | **COMPLETADA** | 33 clases en 10 archivos. 1 variable. 0 regressions. |
| F2 — Rutas huérfanas | PENDIENTE | 12 páginas + AppRouter.jsx |
| F3 — AdminConfigPage | PENDIENTE | Depende de F2 |
| F4 — Loading infinito | PENDIENTE | 3 páginas |
| F5 — MSW handlers | PENDIENTE | 7 grupos de endpoints |
| F6 — Mejoras UX | PENDIENTE | 5 páginas |
| F7 — Verificación browser | EN CURSO | 15 flujos |
