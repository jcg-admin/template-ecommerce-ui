# Iniciativa: corregir-deep-audit-refs

**Estado:** PLANEADA (sin ejecutar)
**Creada:** 2026-06-02
**Origen:** Deep audit (4 agentes) de las iniciativas recientes contra las
referencias `/tmp/references/*` (contrato `e-comerce-docs` + componentes
`-progress`/`ui-core`). Reportes en
`docs/pm/iniciativas/<slug>/audits/deep-audit-refs-2026-06-02.md`.

## Premisa verificada (Premise Gate)

| Campo | Valor |
|-------|-------|
| Nivel de gate | 0c (4 deep audits con `file:line` + verificación cruzada del contrato) |
| Red flags | RF-1 (drift documentado), RF-3 (contrato), RF-7 (cierres previos) |
| Resultado | **CONFIRMAR** |
| Evidencia | `iva_rate` canónico (uc-cfg-03:425,451; uc-cfg-05:430); `tax_rate` aislado en `AdminSystemSettingsPage.jsx:30` + `admin.ts:189`. `/account/security` sin entrada en `AccountLayout.NAV_ITEMS`. |

## Consolidado de hallazgos (todo lo pendiente)

| ID | Hallazgo | Sev | Tipo | Fase |
|----|----------|-----|------|------|
| H-01 | `tax_rate` → canónico **`iva_rate`** (settings page + mock + tests) | MEDIA | Contrato | F1 |
| H-02 | Falta entrada nav **"Seguridad" → `/account/security`** en AccountLayout | MEDIA | Nav/UX | F1 |
| H-03 | `analisis-rutas-huerfanas.md` narra `/admin/config/site` (inexistente) | BAJA | Doc | F2 |
| H-04 | Filtros de fecha de `AdminVoucherReportPage` → `DatePicker` adaptado | BAJA | Componente | F3 |
| H-05 | `SecurityPage` "Solicitar eliminación" `<button>` crudo → `Button` | BAJA | Componente | F3 |
| H-06 | `AdminSystemSettingsPage` inputs/button crudos → `Field`/`Button` | BAJA | Componente | F3 |
| H-07 | `AccountPage` `completenessBar` crudo → `ProgressBar` adaptado | BAJA | Componente (pre-exist.) | F3 |
| H-08 | `OrderDetailPage` sub-modal UC-LOG-07 con overlay inline → `Modal` | BAJA | Componente (pre-exist.) | F3 |
| H-09 | `useInventory.js` usa `/admin/inventory/*` vs canónico `/inventory/*` | MEDIA | Contrato (pre-exist.) | sub-iniciativa |
| H-10 | UC-CFG-05 POST-02 sin endpoint público en el catálogo | — | Gap de spec (docs) | registro |
| H-11 | `DeactivateAccountPage.jsx` nombrado en UC pero inline en SecurityPage | BAJA | Doc↔código | registro |

## Decisión de alcance

- **F1–F2** (must-fix contrato + nav + doc) y **F3** (reuso de componentes que
  aportan valor real) entran en esta iniciativa.
- **H-09** abre **sub-iniciativa `alinear-contrato-inventario`** (drift de
  endpoints en módulo no tocado por las recientes; principio-rector Cláusula 4).
- **H-10/H-11** se **registran** como gaps del catálogo `e-comerce-docs` (repo
  de docs, fuera de este UI) — no se fabrica código.

## Índice

| Archivo | Descripción |
|---------|-------------|
| `plan-corregir-deep-audit-refs.md` | Fases F1-F4 con tareas atómicas TDD |
| `progreso-*.md` / `decisiones-*.md` | Log y cierre (al ejecutar) |
