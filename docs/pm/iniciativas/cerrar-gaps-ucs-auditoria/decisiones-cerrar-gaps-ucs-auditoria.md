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
