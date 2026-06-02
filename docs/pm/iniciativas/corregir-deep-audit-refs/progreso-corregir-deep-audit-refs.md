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
