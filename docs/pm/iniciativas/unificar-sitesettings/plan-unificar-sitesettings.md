# Plan — unificar-sitesettings (DR-02)

**Estrategia:** primero reconciliar campos (no perder configuración), luego
migrar, repuntar el hub y borrar la duplicada. TDD en cada paso.

## FASE 1 — Reconciliación de campos (análisis PROVEN)
- F1-T1 leer `AdminSiteSettingsPage.jsx` línea por línea: listar cada campo de
  las 4 tabs (key + label + tipo).
- F1-T2 verificar contra el modelo/serializer en `template-ecommerce-server`
  (`/api/v1/admin/settings/`) qué campos existen realmente.
- F1-T3 producir tabla `campo → ¿ya en AdminSystemSettingsPage? → acción`
  (mantener / añadir). Sin esta tabla PROVEN no se avanza (I-012).

## FASE 2 — Migrar campos faltantes a la canónica
- F2-T1 `AdminSystemSettingsPage.test.jsx`: asserts para los campos nuevos
  (rojo).
- F2-T2 `AdminSystemSettingsPage.jsx`: añadir los campos faltantes a `FIELDS`
  (verde); si el form crece mucho, agrupar por secciones.
- F2-T3 confirmar que `settingsSlice`/`useSystemSettings` cubren esos campos
  (PATCH del delta).

## FASE 3 — Repuntar hub y eliminar la duplicada
- F3-T1 `AdminConfigPage.jsx` + test: tarjeta "Ajustes del sitio" →
  `/admin/system-settings` (revierte repunte de F3 de cablear-rutas).
- F3-T2 borrar ruta `admin/config/site` + lazy import (`AppRouter.jsx`).
- F3-T3 borrar `AdminSiteSettingsPage.jsx` + `.module.scss`.
- F3-T4 limpiar código muerto `adminSlice.siteSettings` (estado :155,
  reducers :363/:373, thunk :757) + sus tests si existen.
- F3-T5 gate: `grep -rn "AdminSiteSettingsPage\|config/site\|siteSettings" src/`
  → 0 resultados.

## FASE 4 — Verificación y cierre
- jest completo 0 fallos; check-scss clean; build:demo EXIT=0.
- decisiones-*.md + actualizar índice → Cerrada.

## Dependencia con cablear-rutas-huerfanas
F3 de aquí **revierte** el repunte que hizo F3 de `cablear-rutas-huerfanas`
(tarjeta site → config/site). Es intencional: aquélla hacía la huérfana
alcanzable; ésta resuelve que la huérfana no debía existir (era duplicado).
