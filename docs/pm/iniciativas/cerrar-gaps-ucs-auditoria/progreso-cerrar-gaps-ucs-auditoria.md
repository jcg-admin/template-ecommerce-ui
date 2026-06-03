# Progreso — cerrar-gaps-ucs-auditoria

## F1 — UC-ORD-04 cancelar orden (cliente) — HECHA
- Reactivados 2 tests it.skip en `OrderDetailPage.test.jsx` (TDD rojo→verde).
- `OrderDetailPage.jsx`: import `cancelOrder` + `ConfirmModal`; en `SupportCard`
  botón "Cancelar pedido" gateado por `status ∈ {PENDING, PROCESSING}` →
  ConfirmModal "Confirmar cancelacion" → `cancelOrder({orderNumber, reason:''})`
  (`POST /api/v1/orders/<n>/cancel/`, ya canónico + mockeado).
- Verde: OrderDetailPage 9 passed / 2 skipped (ORD-05/06 siguen pendientes por diseño).

## Pendiente
- F2 AUTH-16, F3 PRO-04, F4 CFG-05, F5 verificación + cierre.

## F2 — UC-AUTH-16 baja de cuenta con reautenticación — HECHA
- Thunk `deleteAccount({password})` → `POST /api/v1/auth/me/deactivate/` (antes
  `DELETE /auth/account/` sin password). `authSlice.js:155`.
- `SecurityPage`: campo "Confirma tu contraseña" en el card de baja; botón
  deshabilitado sin password; `handleDeleteAccount` envía `{password}`.
- MSW `auth.ts`: handler `POST /auth/me/deactivate/` valida `Test1234!`
  (incorrecto → 400, AC-02); limpia sesión en éxito.
- Tests alineados (TDD): `SecurityPage.test.jsx` (colocado) + `authSlice.
  deleteAccount.test.js` al nuevo contrato. Verde: 11 passed / 3 suites.

## F3 — UC-PRO-04 reporte agregado de vouchers — HECHA
- `vouchersSlice`: thunk `fetchVoucherReport(params)` → `GET /admin/vouchers/report/`
  + estado `report/isLoadingReport/reportError` + reducers.
- `AdminVoucherReportPage.jsx` (nueva): tabla agregada (código, tipo, usos,
  descuento, órdenes, ingresos, ROI) ordenada por -usos; filtros estado + rango
  fechas; botón Exportar CSV (Blob+createObjectURL); estado vacío → crear voucher.
- Ruta `admin/vouchers/report` (estática, antes de `:id`) + lazy import.
- AdminSidebar: entrada "Reporte de vouchers".
- MSW `admin.ts`: handler `GET /admin/vouchers/report/` (filtra por estado,
  ranking por -usos, ROI calculado).
- `.filter`/`.empty` añadidos a `AdminTablePage.module.scss`.
- TDD verde: slice 2 + page 4 = 6 passed; check-scss 168 clean.

## F4 — UC-CFG-05 datos de contacto (admin + mock + footer) — HECHA
- `usePublicSettings` (nuevo, sin React Query — robusto a mocks): GET
  `/api/v1/settings/public/` con fallback.
- MSW: `GET /settings/public/` + campos de contacto/redes añadidos al GET admin.
- `AdminSystemSettingsPage`: FIELDS alineados al sub-contrato UC-CFG-05
  (`support_email`, `phone`, `address`) + sección "Redes sociales"
  (`social_links{facebook,instagram,youtube}`) con handler anidado.
- `Footer`: consume usePublicSettings → email/horario/teléfono dinámicos +
  enlaces de redes (fallback = valores por defecto, sin regresión).
- `ContactPage`: bloque `ContactInfo` (email/teléfono/dirección/redes).
- Tests: Footer.test.jsx (nuevo), AdminSystemSettingsPage (UC-CFG-05),
  ContactPage sin romper; `vouchersSlice.test.js` INITIAL_STATE actualizado.
- Hallazgo evitado: el hook usa `await` para no romper los muchos tests que
  renderizan Footer con `apiService.get` mockeado devolviendo undefined.

## F5 — Verificación
- `npx jest --ci` → 1702 passed, 0 failed, 107 skipped (274/276 suites) / EXIT=0.
- `node scripts/check-scss.mjs` → 168 clean.
- `DEMO_MODE=true npm run build:demo` → compiled, EXIT=0.
