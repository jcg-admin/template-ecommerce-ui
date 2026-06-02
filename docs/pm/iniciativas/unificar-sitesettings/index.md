# Iniciativa: unificar-sitesettings (DR-02)

**Estado:** PLANEADA (sin ejecutar)
**Creada:** 2026-06-02
**Origen:** Drift DR-02 documentado al cerrar `cablear-rutas-huerfanas`.

## Motivo

Existen **dos páginas admin** que editan el **mismo singleton** de
configuración (mismo endpoint `GET/PATCH /api/v1/admin/settings/`):

- `AdminSystemSettingsPage` (`/admin/system-settings`, UC-ADM-04) — con test,
  usa `settingsSlice` + hook `useSystemSettings`. Form plano de 6 campos.
  En el AdminSidebar como "Sistema".
- `AdminSiteSettingsPage` (`/admin/config/site`) — sin test, usa
  `adminSlice.siteSettings`. 4 tabs (Comercio, Envíos, Devoluciones,
  Comunicación) → más campos. Estuvo huérfana hasta F3 de
  `cablear-rutas-huerfanas`.

## Recomendación (investigación)

**Página canónica = `AdminSystemSettingsPage`** (UC + test + capa de datos
canónica). La consolidación implica **migrar los campos extra** de las 4 tabs
de `AdminSiteSettingsPage` a la canónica antes de borrarla — no es un borrado
directo, porque la tab-page expone más campos.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `alcance-unificar-sitesettings.md` | Premisa verificada + alcance |
| `analisis-unificar-sitesettings.md` | Comparación + reconciliación de campos |
| `plan-unificar-sitesettings.md` | Fases F1-F4 con tareas atómicas |
