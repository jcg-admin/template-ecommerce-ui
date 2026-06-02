# Decisiones — corregir-deep-audit-refs

Cierre: 2026-06-02T22:12:01

## Resumen

Corregidos los hallazgos del deep audit (4 iniciativas vs `/tmp/references/*`).
Must-fix de contrato/nav resueltos; reuso de componentes aplicado donde aporta
valor sin riesgo; drift de inventario derivado a sub-iniciativa; gaps de catálogo
registrados.

## Decisiones

- **D-01 (H-01)** — `tax_rate` → canónico **`iva_rate`** en la página de settings
  y el mock. Solo el campo de SiteSettings; el `tax_rate` de carrito/producto es
  otro dominio y no se toca.
- **D-02 (H-02)** — Restaurada la entrada de nav **"Seguridad" → `/account/security`**
  en `AccountLayout` (se había perdido al borrar `AccountSidebar` en DR-01).
- **D-03 (H-09)** — El drift de endpoints de inventario (`/admin/inventory/*` vs
  canónico `/inventory/*`) se deriva a **`alinear-contrato-inventario`** (módulo
  ajeno a las recientes; requiere backend real, hoy no disponible).
- **D-04 (H-04, NO-APLICA)** — No se migra a `DatePicker`: emite `Date`, no el
  string ISO que el query param canónico exige; el `<input type=date>` nativo es
  accesible y correcto. Cambio net-negativo.
- **D-05 (H-08, NO-APLICA)** — No se migra el sub-modal UC-LOG-07 a `Modal`:
  requiere polyfill de `<dialog>` ausente en el suite; es código pre-existente
  fuera del alcance; riesgo > valor (BAJA). Diferido como opt-in.
- **D-06 (H-10/H-11)** — Gaps del catálogo `e-comerce-docs` (endpoint público
  para POST-02; `DeactivateAccountPage` doc↔código): registrados como hallazgos
  para el repo de docs, no se fabrica código en el UI.

## Cambios de código (F1+F3)

| Archivo | Cambio |
|---------|--------|
| `AdminSystemSettingsPage.jsx` + mock + test | `tax_rate`→`iva_rate`; submit → `Button` |
| `AccountLayout.jsx` + test | +nav "Seguridad" |
| `SecurityPage.jsx` | "Solicitar eliminación" → `Button variant="vino"` |
| `AccountPage.jsx` | `completenessBar` → `ProgressBar` |

## Verificación de cierre (F4)

| Gate | Resultado |
|------|-----------|
| `npx jest --ci` | 1703 passed, 0 failed, 107 skipped (274/276 suites) |
| `node scripts/check-scss.mjs` | 168 entries compiled clean |
| `DEMO_MODE=true npm run build:demo` | compiled, EXIT=0 |

## Resultado

Must-fix (contrato + nav) cerrados; 3/5 reusos de componentes aplicados, 2
NO-APLICA con razón técnica PROVEN; 1 sub-iniciativa abierta; 2 gaps de catálogo
registrados. Endpoints de las 4 iniciativas verificados contra el contrato
canónico de `e-comerce-docs`.
