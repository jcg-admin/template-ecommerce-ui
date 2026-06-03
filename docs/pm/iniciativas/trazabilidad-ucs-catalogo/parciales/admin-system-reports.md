## ADM / SYS / INV / REP / RPT / OPS / DASH / INC / DB-RPT

| UC | Título | Estado | Evidencia / Motivo |
| --- | --- | --- | --- |
| UC-ADM-01 | Gestionar usuarios | IMPLEMENTADO | `src/pages/admin/AdminUsersPage.jsx`, `src/pages/admin/AdminUserDetailPage.jsx`, `src/hooks/domain/useAdminUsers.js` (ref. UC-ADM-01), `src/redux/slices/adminUsersSlice.js` |
| UC-ADM-02 | Gestionar permisos | IMPLEMENTADO | `src/pages/admin/AdminPermissionsPage.jsx` (ref. UC-ADM-02), `src/hooks/domain/usePermissions.js`, `src/redux/slices/permissionsSlice.js` |
| UC-ADM-03 | Auditoría | IMPLEMENTADO | `src/pages/admin/AdminAuditLogPage.jsx` (ref. UC-ADM-03), `src/hooks/domain/useAuditLog.js` |
| UC-ADM-04 | Configuración sistema | IMPLEMENTADO | `src/pages/admin/AdminSystemSettingsPage.jsx` + `src/pages/admin/AdminConfigPage.jsx` (ref. UC-ADM-04), `src/hooks/domain/useSystemSettings.js`, `src/redux/slices/settingsSlice.js` |
| UC-ADM-05 | Backup automático | IMPLEMENTADO | `src/pages/admin/AdminBackupsPage.jsx` (ref. UC-ADM-05), `src/hooks/domain/useBackups.js`, `src/redux/slices/backupsSlice.js` |
| UC-SYS-01 | Cancelar orden por timeout | BACKEND-OPS | Job/cron server-side de cancelación por timeout; sin UI en template (regla clave UC-SYS-*) |
| UC-SYS-02 | Desactivar vouchers expirados | BACKEND-OPS | Tarea cron server-side; sin UI en template (regla clave UC-SYS-*) |
| UC-SYS-03 | Notificar stock mínimo | BACKEND-OPS | Notificación server-side / job; sin UI (regla clave UC-SYS-*) |
| UC-SYS-04 | Reenviar emails fallidos | BACKEND-OPS | Reintento server-side de emails; sin UI (regla clave UC-SYS-*; ver BR-019) |
| UC-SYS-05 | Soft delete historial | BACKEND-OPS | Comportamiento de persistencia server-side; sin UI (regla clave UC-SYS-*) |
| UC-SYS-06 | Loud errors | BACKEND-OPS | Manejo/registro de errores server-side; sin UI (regla clave UC-SYS-*) |
| UC-INV-01 | Ver stock | IMPLEMENTADO | `src/pages/admin/AdminInventoryPage.jsx` (ref. UC-INV-01), `src/hooks/domain/useInventory.js`, `src/redux/slices/inventorySlice.js` |
| UC-INV-02 | Decrementar stock | IMPLEMENTADO | `src/pages/admin/AdminInventoryMovementsPage.jsx` (ref. UC-INV-02), `src/hooks/domain/useInventory.js`, `src/redux/slices/inventorySlice.js` |
| UC-INV-03 | Restaurar stock | IMPLEMENTADO | `src/pages/admin/AdminInventoryMovementsPage.jsx` (ref. UC-INV-03), `src/redux/slices/inventorySlice.js` |
| UC-INV-04 | Ajustar stock manual | IMPLEMENTADO | `src/pages/admin/AdminInventoryAdjustPage.jsx` (ref. UC-INV-04), `src/components/admin/StockAdjustModal`, `src/redux/slices/inventorySlice.js` |
| UC-INV-05 | Importar productos CSV | IMPLEMENTADO | `src/pages/admin/AdminInventoryImportPage.jsx` (ref. UC-INV-05), `src/redux/slices/inventorySlice.js` |
| UC-REP-01 | Reporte ingresos ventas | IMPLEMENTADO | `src/pages/admin/AdminReportSalesPage.jsx` (ref. UC-REP-01), `src/hooks/domain/useReports.js` |
| UC-REP-02 | Reporte top sellers | IMPLEMENTADO | `src/pages/admin/AdminReportTopSellersPage.jsx` (ref. UC-REP-02), `src/hooks/domain/useReports.js` |
| UC-REP-03 | Dashboard analítico | IMPLEMENTADO | `src/pages/admin/AdminReportDashboardPage.jsx` (ref. UC-REP-03), `src/hooks/domain/useReports.js` |
| UC-REP-04 | Reporte clientes RFM | IMPLEMENTADO | `src/pages/admin/AdminReportCustomersRfmPage.jsx` (ref. UC-REP-04), `src/hooks/domain/useReports.js` |
| UC-REP-05 | Exportar reportes | IMPLEMENTADO | Exportación en `AdminReportSalesPage.jsx`, `AdminReportTopSellersPage.jsx`, `AdminReportCustomersRfmPage.jsx` (ref. UC-REP-05), `src/hooks/domain/useReports.js` |
| UC-RPT-01 | Ver reporte ventas | IMPLEMENTADO | `src/pages/admin/AdminReportSalesPage.jsx` (página admin de reporte de ventas) |
| UC-RPT-02 | Ver reporte productos | IMPLEMENTADO | `src/pages/admin/AdminReportTopSellersPage.jsx` (reporte de productos/top sellers) |
| UC-RPT-03 | Ver reporte compradores | IMPLEMENTADO | `src/pages/admin/AdminReportCustomersRfmPage.jsx` (reporte de compradores/RFM) |
| UC-RPT-04 | Exportar reporte | IMPLEMENTADO | Exportación en páginas `AdminReport*Page.jsx` vía `src/hooks/domain/useReports.js` |
| UC-OPS-01 | Configurar fail2ban | BACKEND-OPS | Operación de servidor (fail2ban); sin UI (regla clave UC-OPS-*) |
| UC-OPS-02 | Aplicar hardening SSH | BACKEND-OPS | Hardening SSH server-side; sin UI (regla clave UC-OPS-*) |
| UC-OPS-03 | Configurar SSL | BACKEND-OPS | Configuración SSL del servidor; sin UI (regla clave UC-OPS-*) |
| UC-OPS-04 | Renovar certificado SSL | BACKEND-OPS | Renovación de certificado server-side; sin UI (regla clave UC-OPS-*) |
| UC-DASH-01 | Crear descuento producto | IMPLEMENTADO | `src/components/admin/ProductDiscountCreateForm.jsx` + `src/pages/admin/AdminProductDiscountsPage.jsx` (ref. UC-DASH-01), `src/redux/slices/productDiscountsSlice.js` |
| UC-DASH-02 | Editar descuento producto | IMPLEMENTADO | `src/components/admin/ProductDiscountEditForm.jsx` + `src/pages/admin/AdminProductDiscountsPage.jsx` (ref. UC-DASH-02) |
| UC-DASH-03 | Desactivar descuento producto | IMPLEMENTADO | `src/pages/admin/AdminProductDiscountsPage.jsx` (acción deactivate, ref. UC-DASH-03), `src/redux/slices/productDiscountsSlice.js` |
| UC-DASH-04 | Ver descuentos activos | IMPLEMENTADO | `src/pages/admin/AdminProductDiscountsPage.jsx` + `src/hooks/domain/useProductDiscounts.js` (ref. UC-DASH-04, is_active=True) |
| UC-INC-01 | Verificar propiedad orden | BACKEND-OPS | Guard server-side de verificación de propiedad; sin UI (regla clave UC-INC-*) |
| UC-INC-02 | Recuperar carrito sesión | BACKEND-OPS | Recuperación de carrito server-side; sin UI (regla clave UC-INC-*) |
| UC-INC-03 | Enviar email con plantilla | BACKEND-OPS | Envío de email con plantilla server-side; sin UI (regla clave UC-INC-*) |
| UC-DB-RPT-01 | Reporte catálogo por categoría | BACKEND-OPS | Reporte a nivel de base de datos; sin UI (regla clave UC-DB-RPT-*) |
| UC-DB-RPT-02 | Reporte stock crítico | BACKEND-OPS | Reporte a nivel de base de datos; sin UI (regla clave UC-DB-RPT-*) |
| UC-DB-RPT-03 | Resumen ejecutivo catálogo | BACKEND-OPS | Reporte a nivel de base de datos; sin UI (regla clave UC-DB-RPT-*) |
