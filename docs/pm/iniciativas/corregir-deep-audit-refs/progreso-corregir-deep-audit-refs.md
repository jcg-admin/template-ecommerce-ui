# Progreso — corregir-deep-audit-refs

## F1 — Must-fix (contrato + nav) — HECHA
- F1-T01/02/03 (H-01): `tax_rate` → canónico **`iva_rate`** en
  `AdminSystemSettingsPage.jsx`, mock `admin.ts` y test. `grep tax_rate src` → 0.
- F1-T04/05 (H-02): entrada nav **"Seguridad" → `/account/security`** en
  `AccountLayout.NAV_ITEMS` + fila it.each en el test.
- F1-T06: jest settings + AccountLayout → 16 passed.

## Hallazgos para `e-comerce-docs` (F2-T03)
- **H-10:** UC-CFG-05 POST-02 exige visibilidad pública (footer/contacto) pero el
  catálogo solo define `GET/PATCH /api/v1/config/settings/` con `IsAdminUser`
  (auditoria-sprint-1-2.rst:45). No hay endpoint público declarado. En demo el
  mock lo sirve abierto; backend real lo gobernaría `public_read_enabled`.
- **H-11:** UC-AUTH-16 §7.2 nombra `DeactivateAccountPage.jsx`, pero la baja vive
  inline en `SecurityPage`. Drift doc↔código (cosmético).

## F2 — Doc + sub-iniciativa + registros — HECHA
- F2-T01: `analisis-rutas-huerfanas.md` reconciliado (config/site eliminado en
  DR-02, repuntado a /admin/system-settings; endpoint canónico /config/settings/).
- F2-T02: sub-iniciativa `alinear-contrato-inventario` scaffold + en índice (H-09).
- F2-T03: H-10/H-11 registrados arriba.

## F3 — Reuso de componentes adaptados — HECHA (3/5; 2 NO-APLICA)
- F3-T01 (H-05): SecurityPage "Solicitar eliminación" `<button>` → `Button variant="vino"`.
- F3-T02 (H-06): AdminSystemSettingsPage submit → `Button loading={isActioning}`
  (+ import primitives).
- F3-T04 (H-07): AccountPage `completenessBar` crudo → `ProgressBar` adaptado.
- **F3-T03 (H-04) NO-APLICA:** el `DatePicker` adaptado emite un `Date` en
  `onChange` (`DatePicker.jsx:39-42`), no el string ISO `YYYY-MM-DD` que el
  parámetro canónico (`created_after/created_before`) requiere. El `<input
  type=date>` nativo entrega exactamente ese formato y es accesible (el propio
  deep audit lo calificó funcional/accesible). Cambiarlo distorsionaría el
  contrato del query param por valor BAJO. Se conserva el input nativo.
- **F3-T05 (H-08) NO-APLICA:** convertir el overlay inline de UC-LOG-07 a `Modal`
  exige el polyfill `HTMLDialogElement.showModal` (ausente del setup global; solo
  en `Modal.test`). Es código **pre-existente** fuera del alcance de los gaps;
  forzarlo arriesga el test UC-LOG-07 por un ítem BAJA. Diferido como opt-in.

## F4 — Verificación
- `npx jest --ci` → 1703 passed / 0 failed / 107 skipped (274/276 suites) / EXIT=0.
- `node scripts/check-scss.mjs` → 168 clean.
- `DEMO_MODE=true npm run build:demo` → compiled, EXIT=0.
