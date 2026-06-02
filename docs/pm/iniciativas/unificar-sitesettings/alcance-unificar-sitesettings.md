# Alcance — unificar-sitesettings (DR-02)

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0c (trazado de endpoints + slices + tests) |
| Red flags activos | RF-5 (doble implementación de la misma config), RF-2 (`settings`/`state`) |
| Resultado | **CONFIRMAR** (con reconciliación de campos previa al borrado) |
| Evidencia | Ambas páginas documentan `GET/PATCH /api/v1/admin/settings/` (`AdminSystemSettingsPage.jsx:6-7`, `AdminSiteSettingsPage.jsx:6`). System: `useSelector(s.settings)` + `useSystemSettings` (`AdminSystemSettingsPage.jsx:35,37`), CON test (`AdminSystemSettingsPage.test.jsx`). Site: `useSelector(s.admin?.siteSettings)` (`AdminSiteSettingsPage.jsx:25`), SIN test, 4 tabs (`:17-20`). `adminSlice.siteSettings` solo lo consume esa página (`adminSlice.js:155,363,373,757`). |
| Iniciativas previas revisadas | `cablear-rutas-huerfanas` @ `f6391a7` (F3 repuntó el hub a `/admin/config/site`; DR-02 lo revierte) |

## Qué cubre

- Definir `AdminSystemSettingsPage` como **única** página de configuración del
  singleton.
- **Reconciliar campos:** mapear los campos de las 4 tabs de
  `AdminSiteSettingsPage` (commerce/shipping/returns/comms) contra los 6 del
  form de `AdminSystemSettingsPage`; portar los que falten usando
  `settingsSlice` (no `adminSlice.siteSettings`).
- Repuntar la tarjeta "Ajustes del sitio" del hub `AdminConfigPage` de
  `/admin/config/site` a `/admin/system-settings`.
- Eliminar `AdminSiteSettingsPage` + ruta `admin/config/site` + lazy import +
  el código muerto de `adminSlice.siteSettings` (estado + thunk).
- Actualizar tests: `AdminConfigPage.test.jsx` (nuevo target), ampliar
  `AdminSystemSettingsPage.test.jsx` con los campos migrados.

## Fuera de alcance

- Cambios en el backend (`template-ecommerce-server`): se asume que el modelo
  `settings` ya tiene los campos de las 4 tabs (verificable en F1).

## Criterio de completitud

- 0 referencias a `AdminSiteSettingsPage` / `admin/config/site` en `src/`.
- Ningún campo de configuración perdido (reconciliación PROVEN en el análisis).
- Gates verdes: jest completo, check-scss, build:demo.
