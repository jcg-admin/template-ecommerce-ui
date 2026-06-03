```yml
created_at: 2026-06-02 20:22:33
project: template-ecommerce-ui
author: claude
status: Aprobado
version: 1.0.0
```

> .. reporte::
>    :agente: general-purpose (auditoria UC)
>    :tarea: Auditar claims de la matriz de trazabilidad para la familia ADM/SYS/INV/REP/RPT/OPS/DASH/INC/DB-RPT contra el catalogo canonico de casos de uso
>    :fecha: 2026-06-02
>    :herramientas: Bash (ls/grep/find), Read
>    :basado-en: matriz-trazabilidad-ucs.md (seccion ADM/...) + /tmp/references/e-comerce-docs/source/requisitos/casos-uso/

# Auditoria — familia ADM / SYS / INV / REP / RPT / OPS / DASH / INC / DB-RPT

Verificacion uno a uno de los claims de la seccion "ADM / SYS / INV / REP /
RPT / OPS / DASH / INC / DB-RPT" de `matriz-trazabilidad-ucs.md` contra el
estado actual del codigo (`/home/user/template-ecommerce-ui`) y el catalogo
canonico de UCs (`/tmp/references/e-comerce-docs/.../casos-uso/`).

Metodo: para cada fila IMPLEMENTADO se verifico la existencia NOW del
artefacto citado (`ls`/`grep`). Para las filas BACKEND-OPS se leyo el `.rst`
del catalogo (spot-check de SYS/OPS/DB-RPT) confirmando actor no-UI. Para
INV y REP se leyeron los `.rst` para validar titulo/actor (aceptacion).

## Foco critico — UC-ADM-04 (cambio reciente)

PROVEN. El claim sigue valido tras el cambio reciente:

- `src/pages/admin/AdminSystemSettingsPage.jsx` existe (4289 bytes,
  mtime 2026-06-02 20:03). Cabecera `AdminSystemSettingsPage — UC-ADM-04`
  (linea 2).
- Los 4 campos de contrato anadidos estan presentes en el array `FIELDS`:
  `site_description` (linea 25), `shipping_fee_default` (linea 30),
  `free_shipping_threshold` (linea 31), `allow_guest_checkout` (linea 32).
- `src/redux/slices/settingsSlice.js` y `src/hooks/domain/useSystemSettings.js`
  existen (ambos mtime 2026-06-02 05:59).
- La pagina duplicada `src/pages/admin/AdminSiteSettingsPage.jsx` ya NO
  existe (`ls` -> "No such file or directory"), consistente con su borrado.
- `src/pages/admin/AdminConfigPage.jsx` existe; es un hub de configuracion
  (UC-CFG-01..05) cuya tarjeta "Ajustes del sitio" enlaza a
  `/admin/system-settings` y la documenta como `UC-CFG-03 ... (UC-ADM-04)`
  (lineas 23-27). No consume endpoints propios (comentario lineas 14-16);
  la logica de settings vive en AdminSystemSettingsPage. Citacion correcta.

Nota cruzada (fuera de scope, seccion CFG): UC-CFG-03 y UC-CFG-05 de la
seccion "LOG/NOT/CFG/SUPP/CHT" siguen citando `AdminSiteSettingsPage.jsx`
(matriz lineas 164, 166), pagina que fue borrada. Eso es un drift de OTRA
seccion, no de la que se audita aqui; se reporta como observacion para que
el responsable de esa seccion lo concilie.

## Tabla de verificacion

| UC | Claim | Verificado | Evidencia file:line | Discrepancia |
|----|-------|------------|---------------------|--------------|
| UC-ADM-01 | IMPLEMENTADO | Si | `src/pages/admin/AdminUsersPage.jsx`, `AdminUserDetailPage.jsx`, `src/hooks/domain/useAdminUsers.js`, `src/redux/slices/adminUsersSlice.js` (ls OK) | Ninguna |
| UC-ADM-02 | IMPLEMENTADO | Si | `src/pages/admin/AdminPermissionsPage.jsx`, `src/hooks/domain/usePermissions.js`, `src/redux/slices/permissionsSlice.js` (ls OK) | Ninguna |
| UC-ADM-03 | IMPLEMENTADO | Si | `src/pages/admin/AdminAuditLogPage.jsx`, `src/hooks/domain/useAuditLog.js` (ls OK) | Ninguna |
| UC-ADM-04 | IMPLEMENTADO | Si | `AdminSystemSettingsPage.jsx:2,25,30,31,32` + `AdminConfigPage.jsx:23-27` + `useSystemSettings.js` + `settingsSlice.js` (ls OK); `AdminSiteSettingsPage.jsx` borrado (ls fail) | Ninguna |
| UC-ADM-05 | IMPLEMENTADO | Si | `src/pages/admin/AdminBackupsPage.jsx`, `src/hooks/domain/useBackups.js`, `src/redux/slices/backupsSlice.js` (ls OK) | Ninguna |
| UC-SYS-01 | BACKEND-OPS | Si | `sistema/uc-sys-01-cancelar-orden-timeout.rst` (catalogo, familia SYS = cron) | Ninguna |
| UC-SYS-02 | BACKEND-OPS | Si | `sistema/uc-sys-02-desactivar-vouchers-expirados.rst` (cron) | Ninguna |
| UC-SYS-03 | BACKEND-OPS | Si | `sistema/uc-sys-03-notificar-stock-minimo.rst:34` Actor principal = "Sistema (evento post-venta) y Tiempo (revision periodica)" | Ninguna |
| UC-SYS-04 | BACKEND-OPS | Si | `sistema/uc-sys-04-reenviar-emails-fallidos.rst` (reintento server-side, BR-019) | Ninguna |
| UC-SYS-05 | BACKEND-OPS | Si | `sistema/uc-sys-05-soft-delete-historial.rst` (persistencia server-side) | Ninguna |
| UC-SYS-06 | BACKEND-OPS | Si | `sistema/uc-sys-06-loud-errors.rst` (manejo de errores server-side) | Ninguna |
| UC-INV-01 | IMPLEMENTADO | Si | UI `src/pages/admin/AdminInventoryPage.jsx` (grep `UC-INV-01` OK); cat `inventario/uc-inv-01-ver-stock.rst:12,64` "Ver Stock Actual" / Actor=Administrador | Ninguna |
| UC-INV-02 | IMPLEMENTADO | Si | `src/pages/admin/AdminInventoryMovementsPage.jsx`, `useInventory.js`, `inventorySlice.js` (ls OK) | Ninguna |
| UC-INV-03 | IMPLEMENTADO | Si | `src/pages/admin/AdminInventoryMovementsPage.jsx`, `inventorySlice.js` (ls OK) | Ninguna |
| UC-INV-04 | IMPLEMENTADO | Si | UI `AdminInventoryAdjustPage.jsx` + `src/components/admin/StockAdjustModal` (ls OK); cat `inventario/uc-inv-04-ajustar-stock-manual.rst:12,63` "Ajustar Stock Manualmente" / Actor=Administrador | Ninguna |
| UC-INV-05 | IMPLEMENTADO | Si | `src/pages/admin/AdminInventoryImportPage.jsx`, `inventorySlice.js` (ls OK) | Ninguna |
| UC-REP-01 | IMPLEMENTADO | Si | UI `AdminReportSalesPage.jsx`, `useReports.js` (ls OK); cat `reportes/uc-rep-01-reporte-ingresos-ventas.rst:12,36` "Reporte de Ingresos y Ventas" / Actor=Administrador (is_staff) | Ninguna |
| UC-REP-02 | IMPLEMENTADO | Si | `src/pages/admin/AdminReportTopSellersPage.jsx`, `useReports.js` (ls OK) | Ninguna |
| UC-REP-03 | IMPLEMENTADO | Si | `src/pages/admin/AdminReportDashboardPage.jsx`, `useReports.js` (ls OK) | Ninguna |
| UC-REP-04 | IMPLEMENTADO | Si | UI `AdminReportCustomersRfmPage.jsx` (grep `UC-REP-04` OK); cat `reportes/uc-rep-04-reporte-clientes-rfm.rst:12,34` "Reporte de Clientes (RFM)" / Actor=Administrador | Ninguna |
| UC-REP-05 | IMPLEMENTADO | Si | `AdminReportSalesPage.jsx`/`AdminReportTopSellersPage.jsx`/`AdminReportCustomersRfmPage.jsx` + `useReports.js` (ls OK) | Ninguna |
| UC-RPT-01 | IMPLEMENTADO | Si | `src/pages/admin/AdminReportSalesPage.jsx` (ls OK); cat `reportes/uc-rpt-01-ver-reporte-ventas.rst:17` "Ver Reporte de Ventas" | Ninguna |
| UC-RPT-02 | IMPLEMENTADO | Si | `src/pages/admin/AdminReportTopSellersPage.jsx` (ls OK) | Ninguna |
| UC-RPT-03 | IMPLEMENTADO | Si | `src/pages/admin/AdminReportCustomersRfmPage.jsx` (ls OK) | Ninguna |
| UC-RPT-04 | IMPLEMENTADO | Si | `AdminReport*Page.jsx` + `src/hooks/domain/useReports.js` (ls OK) | Ninguna |
| UC-OPS-01 | BACKEND-OPS | Si | `operaciones/uc-ops-01-configurar-fail2ban.rst` (operacion de servidor) | Ninguna |
| UC-OPS-02 | BACKEND-OPS | Si | `operaciones/uc-ops-02-aplicar-hardening-ssh.rst` (hardening SSH) | Ninguna |
| UC-OPS-03 | BACKEND-OPS | Si | `operaciones/uc-ops-03-configurar-ssl.rst:30,36` "Infra/SSL (fuera de Django)" / Actor=Administrador de infraestructura (provisioner) | Ninguna |
| UC-OPS-04 | BACKEND-OPS | Si | `operaciones/uc-ops-04-renovar-certificado-ssl.rst` (renovacion server-side) | Ninguna |
| UC-DASH-01 | IMPLEMENTADO | Si | UI `src/components/admin/ProductDiscountCreateForm.jsx` (grep `UC-DASH-01` OK) + `AdminProductDiscountsPage.jsx` + `productDiscountsSlice.js` (ls OK) | Ninguna |
| UC-DASH-02 | IMPLEMENTADO | Si | `src/components/admin/ProductDiscountEditForm.jsx` + `AdminProductDiscountsPage.jsx` (ls OK) | Ninguna |
| UC-DASH-03 | IMPLEMENTADO | Si | `AdminProductDiscountsPage.jsx` + `productDiscountsSlice.js` (ls OK) | Ninguna |
| UC-DASH-04 | IMPLEMENTADO | Si | `AdminProductDiscountsPage.jsx` + `src/hooks/domain/useProductDiscounts.js` (ls OK) | Ninguna |
| UC-INC-01 | BACKEND-OPS | Si | `casos-uso/includes/uc-inc-01-verificar-propiedad-orden.rst` (partial include; guard server-side) | Ninguna |
| UC-INC-02 | BACKEND-OPS | Si | `casos-uso/includes/uc-inc-02-recuperar-carrito-sesion.rst` (server-side) | Ninguna |
| UC-INC-03 | BACKEND-OPS | Si | `casos-uso/includes/uc-inc-03-enviar-email-con-plantilla.rst` (email server-side) | Ninguna |
| UC-DB-RPT-01 | BACKEND-OPS | Si | `reportes/uc-db-rpt-01-reporte-catalogo-por-categoria.rst` (SP a nivel BD) | Ninguna |
| UC-DB-RPT-02 | BACKEND-OPS | Si | `reportes/uc-db-rpt-02-reporte-stock-critico.rst:42,64` ejecuta `sp_rpt_low_stock()` + `fn_stock_status()` (SP/BD) | Ninguna |
| UC-DB-RPT-03 | BACKEND-OPS | Si | `reportes/uc-db-rpt-03-resumen-ejecutivo-catalogo.rst` (SP a nivel BD) | Ninguna |

## Conteo

Conteos PROVEN (grep sobre la matriz, ejecutado 2026-06-02):

```
grep -cE "^\| UC-(ADM|INV|REP|RPT|DASH)-" matriz  -> 23  (IMPLEMENTADO)
grep -cE "^\| UC-(SYS|OPS|INC|DB-RPT)-"   matriz  -> 16  (BACKEND-OPS)
```

- Filas auditadas en la seccion: **39**.
- CONFIRMED: **39** (artefacto UI existe NOW para las 23 IMPLEMENTADO;
  actor no-UI confirmado para las 16 BACKEND-OPS).
- DISCREPANCIES (dentro de scope): **0**.

Desglose por prefijo (verificado con grep -cE por prefijo):

| Prefijo | Filas | Estado | Resultado |
|---------|-------|--------|-----------|
| ADM | 5 | IMPLEMENTADO | 5/5 CONFIRMED |
| INV | 5 | IMPLEMENTADO | 5/5 CONFIRMED |
| REP | 5 | IMPLEMENTADO | 5/5 CONFIRMED |
| RPT | 4 | IMPLEMENTADO | 4/4 CONFIRMED |
| DASH | 4 | IMPLEMENTADO | 4/4 CONFIRMED |
| SYS | 6 | BACKEND-OPS | 6/6 CONFIRMED |
| OPS | 4 | BACKEND-OPS | 4/4 CONFIRMED |
| INC | 3 | BACKEND-OPS | 3/3 CONFIRMED |
| DB-RPT | 3 | BACKEND-OPS | 3/3 CONFIRMED |
| **Total** | **39** | — | **39/39 CONFIRMED** |

IMPLEMENTADO = 5+5+5+4+4 = 23. BACKEND-OPS = 6+4+3+3 = 16. 23+16 = 39.

## Observaciones (drift fuera de scope, para conciliacion)

- O-1: UC-CFG-03 y UC-CFG-05 (seccion LOG/NOT/CFG/SUPP/CHT, matriz lineas
  164 y 166) citan `src/pages/admin/AdminSiteSettingsPage.jsx`, archivo que
  fue borrado en el cambio reciente (verificado: `ls` -> No such file).
  El destino canonico de SiteSettings es ahora `AdminSystemSettingsPage.jsx`
  (UC-ADM-04). Recomendacion: actualizar esas dos filas. No es parte de la
  familia auditada aqui, por eso no cuenta como discrepancia de scope.
