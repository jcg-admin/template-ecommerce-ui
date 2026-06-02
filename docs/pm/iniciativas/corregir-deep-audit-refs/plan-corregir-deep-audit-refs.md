# Plan — corregir-deep-audit-refs

**Estrategia:** TDD por tarea (rojo→verde). Verificación por fase: jest + check-scss
+ build:demo. Orden por severidad: contrato/nav primero, reuso de componentes
después, sub-iniciativa y registros al cierre.

## FASE 1 — Must-fix (contrato + navegación)

### F1-T1 — `tax_rate` → `iva_rate` (H-01)
- `AdminSystemSettingsPage.jsx:30`: `key: 'tax_rate'` → `'iva_rate'` (label igual
  "Tasa de IVA (%)").
- `src/mocks/handlers/admin.ts`: payload GET `/config/settings/` `tax_rate` →
  `iva_rate`.
- Tests: `AdminSystemSettingsPage.test.jsx` SETTINGS `tax_rate` → `iva_rate`.
- Verificar que NO se toca el `tax_rate` de carrito/producto (otro dominio).
- TDD: ajustar test (rojo) → renombrar (verde).

### F1-T2 — Entrada nav "Seguridad" → `/account/security` (H-02)
- `AccountLayout.jsx` `NAV_ITEMS`: añadir `{ to: '/account/security', label:
  'Seguridad' }` (la nav lista change-password pero no la página hub Security).
- `AccountLayout.test.jsx`: +fila it.each (`Seguridad` → `/account/security`).
- Verificar coherencia con la QuickCard de `AccountPage` (ya apunta allí).
- TDD: fila de test (rojo) → entrada NAV (verde).

## FASE 2 — Reconciliación documental

### F2-T1 — `analisis-rutas-huerfanas.md` (H-03)
- Corregir la narrativa que dice repoint a `/admin/config/site`; el código
  apunta a `/admin/system-settings` (y DR-02 borró config/site). Alinear texto.

### F2-T2 — Registrar gaps de catálogo / sub-iniciativa
- Crear sub-iniciativa **`alinear-contrato-inventario`** (H-09:
  `useInventory.js` `/admin/inventory/*` vs canónico `/inventory/*`).
- Registrar H-10 (sin endpoint público para POST-02) y H-11
  (`DeactivateAccountPage` doc↔código) como hallazgos para `e-comerce-docs`.

## FASE 3 — Reuso de componentes (valor real primero)

### F3-T1 — `Button` primitive donde hay `<button>` crudo (H-05, H-06)
- `SecurityPage.jsx:126` "Solicitar eliminación" y submit de
  `AdminSystemSettingsPage.jsx:144` → `Button`. Mantener labels/`disabled`.
- Tests existentes deben seguir verdes (roles/labels iguales).

### F3-T2 — `DatePicker` adaptado en filtros de fecha (H-04)
- `AdminVoucherReportPage.jsx:99,103` `<input type=date>` → `DatePicker`
  adaptado (verificar API del componente y que el filtro siga re-consultando).

### F3-T3 — `ProgressBar` adaptado (H-07) — opcional
- `AccountPage.jsx:60-62` `completenessBar` → `ProgressBar`. Pre-existente; solo
  si no añade riesgo.

### F3-T4 — `Modal` adaptado para sub-modal UC-LOG-07 (H-08) — opcional
- `OrderDetailPage.jsx:320-346` overlay inline → `Modal`. Pre-existente; evaluar
  que no rompa el test UC-LOG-07.

> Nota: el `<select>` de Estado (AdminVoucherReportPage) y los `<input
> type=checkbox>` NO se cambian — no existe un Select/Checkbox adaptado
> equivalente (confirmado en el deep audit). El `<table>` crudo es convención del
> proyecto (33/105 admin pages); no se fuerza DataGrid salvo donde ya se usó.

## FASE 4 — Verificación y cierre
- jest completo 0 fallos; check-scss clean; build:demo EXIT=0.
- Actualizar matriz si algún campo/UC cambia de evidencia.
- decisiones-*.md + índice → Cerrada.

## Resumen de tareas
- F1: 2 must-fix (TDD). F2: 1 doc + 1 sub-iniciativa + 2 registros.
- F3: 2 de valor (Button, DatePicker) + 2 opcionales (ProgressBar, Modal).
- F4: verificación + cierre.
