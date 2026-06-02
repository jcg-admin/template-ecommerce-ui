# Progreso — unificar-sitesettings (DR-02)

## 2026-06-02T20:06:46 — Ejecución F1-F4

### F1 — Reconciliación de campos (PROVEN)
- `template-ecommerce-server` en disco = repo de infra (sin Django; `find
  -name "*.py"` vacío) → el contrato real es el **mock MSW**
  (`src/mocks/handlers/admin.ts:181`).
- Contrato MSW usa `tax_rate` (= AdminSystemSettingsPage), no `vat_rate`
  (= AdminSiteSettingsPage). Los ~12 campos extra de AdminSiteSettingsPage
  (`vat_rate`, `country_default`, `return_days`, `facebook_url`, …) **no están
  en el contrato** → especulativos, sin config real que preservar.
- Campos del contrato que la canónica NO tenía: `site_description`,
  `shipping_fee_default`, `free_shipping_threshold`, `allow_guest_checkout`.

### F2 — Migrar los 4 campos de contrato (TDD)
- `AdminSystemSettingsPage.test.jsx`: +test que afirma los 4 labels (rojo).
- `AdminSystemSettingsPage.jsx`: +4 entradas en `FIELDS` (verde: 3/3).

### F3 — Repuntar hub + eliminar duplicada
- `AdminConfigPage.jsx`: tarjeta "Ajustes del sitio" → `/admin/system-settings`
  (antes `/admin/config/site`). Test actualizado.
- `AppRouter.jsx`: removidos lazy import + `Route admin/config/site`.
- Borrados `AdminSiteSettingsPage.jsx` + `.module.scss` +
  `tests/unit/pages/AdminSiteSettingsPage.test.jsx`.
- `adminSlice.js`: removido código muerto — estado (`siteSettings`,
  `isLoadingSettings`), 6 `addCase` de fetch/updateSiteSettings, y los 2 thunks.
  Verificado sin otros consumidores (`grep` → 0).
- Gate: `grep -rn "AdminSiteSettingsPage|config/site|siteSettings" src/ tests/`
  → solo un comentario en el test canónico (documenta la migración).

### F4 — Verificación
- `node scripts/check-scss.mjs` → `168 SCSS entries compiled clean` (uno menos
  tras borrar el .module.scss de la página duplicada).
- `npx jest --ci` → `Test Suites: 2 skipped, 271 passed` / `Tests: 109 skipped,
  1691 passed, 1800 total` / `EXIT=0`. Sin regresiones.
- `DEMO_MODE=true npm run build:demo` → `compiled with 2 warnings` (tamaño,
  pre-existentes) / `EXIT=0`.

Iniciativa CERRADA. Una sola página de configuración del singleton
(AdminSystemSettingsPage). Ver `decisiones-unificar-sitesettings.md`.
