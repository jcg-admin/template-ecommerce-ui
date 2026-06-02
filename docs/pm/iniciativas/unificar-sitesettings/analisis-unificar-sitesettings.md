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

## Reconciliación F1 — resultado PROVEN (2026-06-02)

**Hallazgo decisivo:** `template-ecommerce-server` en disco es un repo de
**infraestructura** (config/provisioners/scripts), **sin app Django** (`find
. -name "*.py"` → vacío). Por tanto el **único contrato disponible es el mock
MSW** `src/mocks/handlers/admin.ts:181`, que es contra lo que el UI está
construido y testeado.

Campos del contrato MSW (GET `/api/v1/admin/settings/`):
`site_name, site_description, currency, tax_rate, shipping_fee_default,
free_shipping_threshold, maintenance_mode, allow_guest_checkout`.

| Página | Esquema de campos | ¿Alineado al mock? |
|--------|-------------------|--------------------|
| AdminSystemSettingsPage | `tax_rate`, `site_name`, `currency`, `maintenance_mode`, `contact_email`, `support_phone` | **SÍ** (usa `tax_rate`) |
| AdminSiteSettingsPage | `vat_rate`, `support_email`, `country_default`, `return_days`, `facebook_url`, … | **NO** (usa `vat_rate`, y ~12 campos especulativos que no están en el contrato; la propia página admite "añadir `shipping_zones` al backend") |

**Conclusión:** AdminSiteSettingsPage no tenía "más config real" — tenía
campos **no respaldados por el contrato**. No hay config que preservar de esos
campos especulativos. Lo único que faltaba a la canónica y **sí** está en el
contrato: `site_description`, `shipping_fee_default`, `free_shipping_threshold`,
`allow_guest_checkout` → **esos 4 se migran** a `AdminSystemSettingsPage.FIELDS`.

## Decisión

Canónica = `AdminSystemSettingsPage`. Migrar SOLO los 4 campos del contrato MSW
que le faltaban. Eliminar `AdminSiteSettingsPage` (página + ruta + test + código
muerto `adminSlice.siteSettings`). Repuntar la tarjeta del hub a
`/admin/system-settings`.
