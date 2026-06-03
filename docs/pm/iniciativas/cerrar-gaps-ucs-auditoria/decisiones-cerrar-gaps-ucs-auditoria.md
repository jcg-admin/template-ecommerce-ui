# Decisiones — cerrar-gaps-ucs-auditoria

Cierre: 2026-06-02T21:39:45

## Resumen

Los 4 gaps funcionales MEDIA de la auditoría de UCs quedan cerrados con TDD,
alineando el contrato MSW a la spec canónica donde aplicaba. Las 4 filas de la
matriz pasan de PARCIAL a IMPLEMENTADO.

## Decisiones

- **D-01 (ORD-04)** — El thunk `cancelOrder` y el mock ya eran canónicos
  (`POST /orders/<n>/cancel/`); solo faltaba UI. Botón "Cancelar pedido" en
  `OrderDetailPage`, gateado a estados `PENDING/PROCESSING` (H-ORD-002), con
  ConfirmModal.
- **D-02 (AUTH-16)** — Alineado a la spec: `DELETE /auth/account/` →
  `POST /auth/me/deactivate/` con `{password}` (baja **lógica** + reautenticación,
  AC-02). El mock valida la contraseña (`Test1234!`, incorrecto → 400).
- **D-03 (PRO-04)** — Añadido el reporte **agregado** que faltaba
  (`/admin/vouchers/report/`): ranking por -usos, ROI, filtros, export CSV. La
  vista per-voucher se conserva.
- **D-04 (CFG-05)** — Alcance elegido por el ejecutor: **admin + mock + footer**.
  Se añadió un endpoint/hook **público** (`usePublicSettings` →
  `GET /settings/public/`) para que el storefront (Footer + ContactPage) consuma
  los datos sin usar el endpoint admin (POST-02). Campos alineados al
  sub-contrato (`support_email`/`phone`/`address`/`social_links{}`).
- **D-05 (hook sin React Query)** — `usePublicSettings` se implementó con
  `useEffect` + `await` (no React Query) para no exigir `QueryClientProvider` en
  los muchos tests que renderizan `Footer`, y para tolerar `apiService.get`
  mockeado devolviendo `undefined`.

## Verificación de cierre (F5)

| Gate | Resultado |
|------|-----------|
| `npx jest --ci` | 1702 passed, 0 failed, 107 skipped (274/276 suites) |
| `node scripts/check-scss.mjs` | 168 entries compiled clean |
| `DEMO_MODE=true npm run build:demo` | compiled, EXIT=0 (warnings de tamaño pre-existentes) |

## Commits

- `6ecd96d` ORD-04 (F1) · `d95c5ab` AUTH-16 (F2) · `bb76fca` PRO-04 (F3) ·
  `7c0a553` CFG-05 (F4)

## Resultado

4/4 gaps cerrados. La matriz de trazabilidad queda **131 IMPLEMENTADO /
23 BACKEND-OPS / 0 PARCIAL / 0 AUSENTE-UI**.

## Corrección de uso de referencias (2026-06-02T21:52:02)

El ejecutor señaló que `/tmp/references/*` no se estaba usando del todo bien.
Verificación: los submódulos `api/` y `ui/` de `/tmp/references/e-comerce` están
**vacíos** (0 archivos); la fuente canónica disponible es `e-comerce-docs`
(specs UC + `source/backend/rest-api-conventions.rst`). Además, `-progress`
(kno-react) y `ui-core-5.25.0` son las referencias de componentes, ya adaptadas
nativamente en `src/components/common/` (DataGrid, TreeList, …).

Dos correcciones aplicadas:

- **C1 — Componente:** `AdminVoucherReportPage` usaba una `<table>` cruda →
  reescrita con el **`DataGrid`** adaptado (consistente con `AdminUsersPage` /
  `AdminVoucherDetailPage`). Reuso de la referencia de componentes en vez de
  HTML ad-hoc.
- **C2 — Contrato:** el endpoint de settings se alineó al **canónico
  `/api/v1/config/settings/`** (singleton, `rest-api-conventions.rst:92`) en
  `useSystemSettings`, `settingsSlice`, `AdminSystemSettingsPage`, `mock` y
  `usePublicSettings`. Se **eliminó** el endpoint inventado
  `/api/v1/settings/public/`. Esto corrige además un drift preexistente del UI
  (UC-ADM-04/CFG-03 usaban `/admin/settings/`).

**Hallazgo de spec (documentado, no inventado):** UC-CFG-05 POST-02 exige
visibilidad pública (footer/contacto) pero el contrato canónico solo define
`/api/v1/config/settings/` con `IsAdminUser` (auditoria-sprint-1-2.rst:45) — no
hay endpoint público declarado. En el template/demo el mock sirve ese endpoint
abiertamente; en backend real el flag `public_read_enabled` debería gobernarlo.
Queda como gap del catálogo, no como endpoint fabricado por el UI.

Re-verificación: jest 1702 passed / 0 failed; check-scss 168 clean;
build:demo EXIT=0.

Endpoints verificados contra el contrato canónico: AUTH-16
`POST /auth/me/deactivate/` ✓, ORD-04 `POST /orders/<n>/cancel/` ✓, PRO-04
`GET /admin/vouchers/report/` ✓, CFG-05 `GET/PATCH /config/settings/` ✓.
