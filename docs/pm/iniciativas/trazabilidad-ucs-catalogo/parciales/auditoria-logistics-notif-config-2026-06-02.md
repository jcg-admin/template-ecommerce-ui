```yml
created_at: 2026-06-02 20:23:08
project: template-ecommerce-ui
iniciativa: trazabilidad-ucs-catalogo
fase: auditoria parcial — re-verificacion familia LOG / NOT / CFG / SUPP / CHT
author: claude
status: Aprobado
version: 1.0.0
```

> .. reporte::
>    :agente: subagente-auditor-trazabilidad
>    :tarea: Re-verificar claims de la familia LOG/NOT/CFG/SUPP/CHT contra el codigo actual del UI
>    :fecha: 2026-06-02
>    :herramientas: Read, Bash (ls/grep/sed/date), find
>    :basado-en: HEAD de template-ecommerce-ui (working tree, 2026-06-02) + catalogo /tmp/references/e-comerce-docs/source/requisitos/casos-uso/

# Auditoria — Familia LOG / NOT / CFG / SUPP / CHT

Re-verificacion de cada fila de la seccion "LOG / NOT / CFG / SUPP / CHT" de
`matriz-trazabilidad-ucs.md` contra el estado **actual** del codigo. Motivada por
una iniciativa reciente que elimino `AdminSiteSettingsPage.jsx` (y su ruta
`admin/config/site` + thunks `adminSlice.siteSettings`), reemplazando la pagina
canonica de SiteSettings por `AdminSystemSettingsPage.jsx` (ruta `admin/system-settings`).

## Contexto critico verificado

| Hecho | Verificacion | Resultado |
|-------|--------------|-----------|
| `AdminSiteSettingsPage.jsx` eliminada | `ls src/pages/admin/AdminSiteSettingsPage.jsx` | **No existe** (No such file) |
| Ruta `admin/config/site` eliminada | `grep -rn "config/site" src/router/` | **0 coincidencias** |
| `AdminSystemSettingsPage.jsx` es la pagina nueva | `ls` → existe (4289 bytes) | Existe |
| Ruta `admin/system-settings` activa | `AppRouter.jsx:274` | Presente |

Las filas **UC-CFG-03** y **UC-CFG-05** de la matriz aun citan `AdminSiteSettingsPage.jsx`
→ **evidencia obsoleta (STALE)** confirmada. El UC sigue satisfecho por la pagina
canonica nueva (con un matiz en CFG-05, ver tabla).

## Tabla de verificacion

| UC | Claim (matriz) | Verificado | Evidencia file:line | Discrepancia |
|----|----------------|-----------|---------------------|--------------|
| UC-LOG-01 | AUSENTE-UI (sin form de creacion de guia) | SI — IMPLEMENTADO | `src/redux/slices/logisticsSlice.js:37` `createShipmentGuide`; `src/pages/admin/AdminOrderDetailPage.jsx:96` `handleCreateGuide`, `:210` form "Envío — guía (UC-LOG-01)" | **SI** — fila tabla dice AUSENTE-UI; ya implementado (cubierto por nota de cierre lineas 17-18). Snapshot desactualizado |
| UC-LOG-02 | AUSENTE-UI (sin UI/thunk de tracking manual) | SI — IMPLEMENTADO | `logisticsSlice.js:53` `setTrackingNumber`; `AdminOrderDetailPage.jsx:106-110` `handleSetTracking` (UC-LOG-02) | **SI** — fila tabla dice AUSENTE-UI; ya implementado. Snapshot desactualizado |
| UC-LOG-03 | IMPLEMENTADO (OrderDetailPage + AdminLogisticsPage) | SI | `src/pages/account/OrderDetailPage.jsx` existe; `src/pages/admin/AdminLogisticsPage.jsx` existe | No |
| UC-LOG-04 | BACKEND-OPS (webhook server-side) | SI (regla clave) | `uc-log-04-webhook-actualizacion-envio.rst` (actor sistema externo) | No |
| UC-LOG-05 | IMPLEMENTADO (`confirmDelivery` + boton) | SI | `logisticsSlice.js:22` `confirmDelivery`; `AdminLogisticsPage.jsx` existe | No |
| UC-LOG-06 | AUSENTE-UI (sin CRUD couriers ni ruta) | SI — IMPLEMENTADO | `src/pages/admin/AdminCouriersPage.jsx:1` (UC-LOG-06, CRUD); ruta `AppRouter.jsx:266` `admin/couriers`; nav `AdminSidebar/index.jsx:44` "Mensajeros"; thunks `logisticsSlice.js:71-107` (fetch/create/update/deleteCourier) | **SI** — fila tabla dice AUSENTE-UI; ya implementado (CRUD + ruta + nav). Snapshot desactualizado |
| UC-LOG-07 | AUSENTE-UI (sin UI de reportar problema) | SI — IMPLEMENTADO | `logisticsSlice.js:120` `reportShippingIssue`; `OrderDetailPage.jsx:264-272` `handleReport` (UC-LOG-07), `:306` form "Reportar problema de envío" | **SI** — fila tabla dice AUSENTE-UI; ya implementado. Snapshot desactualizado |
| UC-LOG-08 | IMPLEMENTADO (AdminLogisticsPage + useLogistics) | SI | `AdminLogisticsPage.jsx` + `src/hooks/domain/useLogistics.js`; ruta `admin/logistics` | No |
| UC-LOG-10 | BACKEND-OPS (guia remision server-side) | SI | `uc-log-10-crear-guia-remision.rst` | No |
| UC-NOT-01..05 | BACKEND-OPS (emails transaccionales) | SI (regla clave) | specs `notifications/uc-not-0{1..5}-*.rst` (envio server-side) | No |
| UC-NOT-06 | IMPLEMENTADO (prefs + hook + slice) | SI | `src/pages/account/NotificationPreferencesPage.jsx`; `src/hooks/domain/useNotifications.js`; `notificationsSlice.js:39` `updateNotificationPreferences` (UC-NOT-06) | No |
| UC-NOT-07 | IMPLEMENTADO (`sendManualNotification`) | SI | `src/pages/admin/AdminNotificationComposePage.jsx`; `notificationsSlice.js:78` `sendManualNotification` (UC-NOT-07) | No |
| UC-CFG-01 | IMPLEMENTADO (AdminGatewaysPage, ruta config/gateways) | SI | `src/pages/admin/AdminGatewaysPage.jsx`; ruta `AppRouter.jsx:336` `admin/config/gateways` | No |
| UC-CFG-02 | IMPLEMENTADO (AdminShippingMethodsPage, ruta config/shipping) | SI | `src/pages/admin/AdminShippingMethodsPage.jsx`; ruta `AppRouter.jsx:337` `admin/config/shipping` | No |
| UC-CFG-03 | IMPLEMENTADO via `AdminSiteSettingsPage.jsx` (ruta `admin/config/site`) | UC satisfecho — evidencia STALE | Pagina citada **NO existe**; cobertura real en `AdminSystemSettingsPage.jsx:28` `tax_rate` (IVA), `:29` `currency`, `:33` `maintenance_mode`; thunk `updateSettings` (`:60`); ruta `admin/system-settings` (`AppRouter.jsx:274`) | **SI (STALE)** — cita pagina/ruta/thunk eliminados. UC-CFG-03 sigue cubierto por la pagina nueva (IVA/currency/maintenance_mode presentes) |
| UC-CFG-04 | IMPLEMENTADO (AdminStaticPagesPage + Editor, rutas admin/pages) | SI | `src/pages/admin/AdminStaticPagesPage.jsx`; `AdminStaticPageEditorPage.jsx`; rutas `AppRouter.jsx:333-334` | No |
| UC-CFG-05 | IMPLEMENTADO via `AdminSiteSettingsPage.jsx` (`support_email`, `support_phone`, `facebook_url`, `instagram_url`) | UC parcialmente cubierto — evidencia STALE | Pagina citada **NO existe**; cobertura real en `AdminSystemSettingsPage.jsx:26` `contact_email`, `:27` `support_phone`. `grep facebook\|instagram\|support_email` → **0 coincidencias** en la pagina nueva | **SI (STALE + drift de campos)** — cita pagina eliminada y campos `support_email`/`facebook_url`/`instagram_url` que NO existen en la pagina nueva. Datos de contacto basicos (email + telefono) SI cubiertos; redes sociales NO |
| UC-SUPP-01 | IMPLEMENTADO (SupportTicketCreatePage) | SI | `src/pages/account/SupportTicketCreatePage.jsx`; ruta `AppRouter.jsx:242` `support/tickets/new` | No |
| UC-SUPP-02 | IMPLEMENTADO (Detail comprador + AdminSupportPage) | SI | `src/pages/account/SupportTicketDetailPage.jsx`; `src/pages/admin/AdminSupportPage.jsx` (ruta `:287`) | No |
| UC-SUPP-03 | IMPLEMENTADO (SupportTicketReplyForm) | SI | `src/components/support/SupportTicketReplyForm.jsx` | No |
| UC-SUPP-04 | IMPLEMENTADO (SupportTicketActions close/reopen) | SI | `src/components/support/SupportTicketActions.jsx` | No |
| UC-SUPP-05 | IMPLEMENTADO (AdminSupportPage bandeja+filtros) | SI | `src/pages/admin/AdminSupportPage.jsx` | No |
| UC-CHT-01 | IMPLEMENTADO (ProductPage renderiza variants) | SI | `src/pages/catalog/ProductPage.jsx` | No |
| UC-CHT-02 | IMPLEMENTADO (VariantSelector + hook) | SI | `src/components/catalog/VariantSelector/`; `src/hooks/useAddProductWithVariant.js` | No |
| UC-CHT-03 | IMPLEMENTADO (AdminVariantsPage CRUD) | SI | `src/pages/admin/AdminVariantsPage.jsx`; ruta `AppRouter.jsx:299` | No |
| UC-CHT-04 | IMPLEMENTADO (AdminVariantPricePage) | SI | `src/pages/admin/AdminVariantPricePage.jsx`; ruta `AppRouter.jsx:300` | No |

## Conteos

- **Filas auditadas:** 27 (LOG: 9 · NOT: 7 · CFG: 5 · SUPP: 5 · CHT: 4 — NOT-01..05 contadas como 5 individuales = 9 NOT en matriz; aqui agrupadas en 1 fila, ver nota).
  - Contando NOT-01..05 como filas individuales: **31 UCs** de la familia.
- **CONFIRMED (claim de la matriz coincide con el codigo actual):** 20 filas
  (LOG-03,04,05,08,10 · NOT-01..05,06,07 · CFG-01,02,04 · SUPP-01..05 · CHT-01..04).
- **DISCREPANCIES:** 7
  - **4 snapshot desactualizado (AUSENTE-UI → ya IMPLEMENTADO):** UC-LOG-01, UC-LOG-02, UC-LOG-06, UC-LOG-07.
    Estas 4 estan reconocidas en la nota de cierre de la matriz (lineas 12-19) pero las
    filas por-familia (lineas 146,147,151,152) conservan el snapshot "AUSENTE-UI".
  - **2 evidencia STALE (pagina/ruta/thunk eliminados):** UC-CFG-03, UC-CFG-05.
  - **1 drift de campos adicional (subsumido en CFG-05):** la pagina nueva no expone
    `support_email`/`facebook_url`/`instagram_url`; solo `contact_email` + `support_phone`.

## Estado de CFG-03 / CFG-05 (foco del contexto critico)

- **UC-CFG-03 (SiteSettings / IVA):** UC **satisfecho** por `AdminSystemSettingsPage.jsx`.
  Campos verificados: `tax_rate` (`:28`), `currency` (`:29`), `maintenance_mode` (`:33`),
  guardado via `updateSettings` (`:60`). La fila de la matriz es **STALE**: cita
  `AdminSiteSettingsPage.jsx` + `adminSlice.updateSiteSettings` + ruta `admin/config/site`,
  todos eliminados.
- **UC-CFG-05 (datos de contacto):** UC **parcialmente satisfecho**. La pagina nueva
  expone `contact_email` (`:26`) y `support_phone` (`:27`). La matriz cita
  `support_email`, `support_phone`, `facebook_url`, `instagram_url` — de los cuales
  `support_email`/`facebook_url`/`instagram_url` **no existen** en la pagina nueva
  (grep = 0). La fila es **STALE** y ademas hay drift real: las redes sociales
  (facebook/instagram) ya no se editan desde el UI.

## Recomendaciones (no aplicadas — auditoria de solo lectura)

1. Actualizar filas LOG-01/02/06/07 de la tabla por-familia a IMPLEMENTADO con la
   evidencia de esta auditoria (alinear el snapshot con la nota de cierre).
2. Reescribir evidencia de UC-CFG-03 → `AdminSystemSettingsPage.jsx` (`tax_rate`,
   `currency`, `maintenance_mode`) + ruta `admin/system-settings`.
3. Reescribir evidencia de UC-CFG-05 → `contact_email` + `support_phone` en
   `AdminSystemSettingsPage.jsx`; revisar si `facebook_url`/`instagram_url` deben
   reincorporarse al UI o el UC debe acotarse (decision de producto, fuera de scope).
