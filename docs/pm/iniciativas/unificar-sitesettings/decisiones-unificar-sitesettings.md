# Decisiones — unificar-sitesettings (DR-02)

Cierre: 2026-06-02T20:06:46

## Resumen

El drift DR-02 (dos páginas admin para el mismo singleton
`/api/v1/admin/settings/`) queda resuelto: la única página es
`AdminSystemSettingsPage` (`/admin/system-settings`). `AdminSiteSettingsPage`
y su código asociado fueron eliminados.

## Decisiones

- **D-01 — Canónica = AdminSystemSettingsPage.** Tiene UC (UC-ADM-04), test, y
  usa la capa de datos dedicada (`settingsSlice` + `useSystemSettings`). Además
  su esquema de campos (`tax_rate`, `site_name`, …) coincide con el **único
  contrato disponible** (mock MSW), a diferencia de AdminSiteSettingsPage
  (`vat_rate`, …).
- **D-02 — El backend real no está en disco.** `template-ecommerce-server` es
  infra (sin Django). El contrato es el mock MSW; toda decisión de campos se
  ancla a él.
- **D-03 — Migrar solo campos de contrato.** Los ~12 campos extra de
  AdminSiteSettingsPage eran especulativos (no en el contrato). Solo se
  migraron los 4 del contrato que faltaban en la canónica:
  `site_description`, `shipping_fee_default`, `free_shipping_threshold`,
  `allow_guest_checkout`.
- **D-04 — Repunte del hub.** La tarjeta "Ajustes del sitio" de
  `AdminConfigPage` ahora apunta a `/admin/system-settings`. Esto **revierte**
  el repunte que hizo F3 de `cablear-rutas-huerfanas` (que la había llevado a
  `/admin/config/site` para hacerla alcanzable) — correcto, porque esa página
  era el duplicado.

## Cambios

| Área | Cambio |
|------|--------|
| `pages/admin/AdminSystemSettingsPage.jsx` | +4 campos de contrato en `FIELDS` |
| `pages/admin/AdminSystemSettingsPage.test.jsx` | +test de los 4 campos |
| `pages/admin/AdminConfigPage.jsx` + test | tarjeta site → `/admin/system-settings` |
| `router/AppRouter.jsx` | -lazy import y -`Route admin/config/site` |
| `pages/admin/AdminSiteSettingsPage.{jsx,module.scss}` | **eliminados** |
| `tests/unit/pages/AdminSiteSettingsPage.test.jsx` | **eliminado** |
| `redux/slices/adminSlice.js` | -estado/-reducers/-thunks de siteSettings (código muerto) |

## Verificación de cierre (F4)

| Gate | Resultado |
|------|-----------|
| `npx jest --ci` | 1691 passed, 0 failed, 109 skipped (271/273 suites) |
| `node scripts/check-scss.mjs` | 168 entries compiled clean |
| `DEMO_MODE=true npm run build:demo` | compiled, EXIT=0 (warnings de tamaño pre-existentes) |

## Drift cerrado

DR-02 (doble SiteSettings) — **RESUELTO**.
