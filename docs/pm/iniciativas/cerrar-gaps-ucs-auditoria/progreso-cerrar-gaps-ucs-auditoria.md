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
