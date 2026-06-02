# Análisis — unificar-sitesettings (DR-02)

## Las dos páginas (mismo endpoint, distinta capa)

| Dimensión | AdminSystemSettingsPage | AdminSiteSettingsPage |
|-----------|-------------------------|------------------------|
| Ruta | `/admin/system-settings` | `/admin/config/site` |
| UC | UC-ADM-04 | (ninguno) |
| Endpoint | `GET/PATCH /api/v1/admin/settings/` | igual |
| Estado redux | `settingsSlice` (`s.settings`) | `adminSlice.siteSettings` |
| Data fetch | hook `useSystemSettings` (React Query) | thunk `admin/siteSettings` |
| Test | ✅ `AdminSystemSettingsPage.test.jsx` | ❌ |
| Entrada nav | AdminSidebar "Sistema" | hub config (desde F3) |
| UX / campos | form plano: site_name, contact_email, support_phone, tax_rate, currency, maintenance_mode | 4 tabs: Comercio, Envíos, Devoluciones, Comunicación |

## Por qué la canónica es AdminSystemSettingsPage

1. Tiene **UC** (UC-ADM-04) y **test**.
2. Usa la **capa de datos dedicada** (`settingsSlice` + `useSystemSettings`),
   no un slice genérico (`adminSlice`).
3. Ya era **navegable** (sidebar); la otra era huérfana.

## Pero NO es un borrado directo: reconciliación de campos

`AdminSiteSettingsPage` expone **más** campos (4 dominios). Antes de borrarla
hay que **mapear cada campo** de sus tabs y portar a la canónica los que no
estén:

| Tab (site) | Campos (verificar en código + backend) | ¿En system? |
|------------|----------------------------------------|-------------|
| Comercio (commerce) | moneda, IVA, … | parcial (currency, tax_rate) |
| Envíos (shipping) | costos/umbral envío gratis, … | a verificar |
| Devoluciones (returns) | ventana de devolución, … | a verificar |
| Comunicación (comms) | emails/teléfono, … | parcial (contact_email, support_phone) |

> El detalle exacto de campos por tab se completa en F1 leyendo
> `AdminSiteSettingsPage.jsx` línea por línea y el serializer del backend.

## Impacto de borrar AdminSiteSettingsPage

- `adminSlice.siteSettings` (estado `:155`, reducers `:363,:373`, thunk `:757`)
  queda **muerto** → limpiar en la misma iniciativa (o documentar si el thunk
  se reusa; verificado: solo lo consume esta página).
- Ruta `admin/config/site` + lazy import (`AppRouter.jsx:136,339`) se eliminan.
- Hub `AdminConfigPage`: la tarjeta "Ajustes del sitio" se repunta a
  `/admin/system-settings` (revierte el repunte de F3 de cablear-rutas).

## Decisión

Consolidar en `AdminSystemSettingsPage` migrando los campos faltantes. Si la
reconciliación revela que el form plano queda muy largo, evaluar agrupar por
secciones (no tabs) dentro de la página canónica — decisión de F2.
