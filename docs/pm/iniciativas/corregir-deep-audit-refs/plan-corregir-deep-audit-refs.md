# Plan — corregir-deep-audit-refs (tareas atómicas)

**Estrategia:** TDD por tarea (rojo→verde), 1 archivo-foco por tarea cuando es
posible. Cada tarea declara: archivos, pasos, criterio de aceptación, riesgo.
Verificación por fase: `npx jest` (suite tocada) + al cierre suite completa +
`check-scss` + `build:demo`.

Leyenda severidad: M=media, B=baja. Estado inicial: todas `[ ]`.

---

## FASE 1 — Must-fix: contrato + navegación

### F1-T01 — `tax_rate` → `iva_rate` en la página de settings (H-01, M)
- **Archivos:** `src/pages/admin/AdminSystemSettingsPage.jsx` (FIELDS, línea ~30).
- **Pasos:** cambiar `key: 'tax_rate'` → `key: 'iva_rate'` (label "Tasa de IVA (%)"
  intacto). `id`/`name` derivan de `key` → quedan `set-iva_rate`.
- **Aceptación:** el input de IVA usa `name="iva_rate"`.
- **Riesgo:** bajo. NO tocar `tax_rate` de carrito/producto (otro dominio —
  verificado aislado: solo settings page + mock lo usan).

### F1-T02 — `iva_rate` en el mock de settings (H-01, M)
- **Archivos:** `src/mocks/handlers/admin.ts` (payload GET `/config/settings/`).
- **Pasos:** `tax_rate: 0.16` → `iva_rate: 0.16`.
- **Aceptación:** `grep -rn "tax_rate" src/mocks` → 0.

### F1-T03 — Test de settings al nuevo campo (H-01, M)
- **Archivos:** `src/pages/admin/AdminSystemSettingsPage.test.jsx`.
- **Pasos (TDD):** en `SETTINGS` mock `tax_rate` → `iva_rate`; si algún assert
  cita `tax_rate`, actualizar. Correr rojo→verde.
- **Aceptación:** suite de la página verde; `grep -rn "tax_rate" src` → 0.

### F1-T04 — Entrada nav "Seguridad" → `/account/security` (H-02, M)
- **Archivos:** `src/layouts/AccountLayout.jsx` (`NAV_ITEMS`).
- **Pasos:** añadir `{ to: '/account/security', label: 'Seguridad' }` (junto a
  change-password). Verificar que la ruta existe en `AppRouter.jsx`.
- **Aceptación:** nav lista Seguridad; coherente con QuickCard de AccountPage.

### F1-T05 — Test de la entrada Seguridad (H-02, M)
- **Archivos:** `src/layouts/AccountLayout.test.jsx`.
- **Pasos (TDD):** +fila it.each `['Seguridad','/account/security']` (rojo) →
  pasa tras F1-T04 (verde).

### F1-T06 — Verificación F1
- `npx jest src/pages/admin/AdminSystemSettingsPage.test.jsx src/layouts/AccountLayout.test.jsx` verde.

---

## FASE 2 — Reconciliación documental + sub-iniciativa + registros

### F2-T01 — Corregir narrativa `cablear-rutas` (H-03, B)
- **Archivos:** `docs/pm/iniciativas/cablear-rutas-huerfanas/analisis-rutas-huerfanas.md`.
- **Pasos:** donde narra repoint a `/admin/config/site`, aclarar que el destino
  final es `/admin/system-settings` (config/site eliminado en DR-02).

### F2-T02 — Abrir sub-iniciativa `alinear-contrato-inventario` (H-09, M)
- **Archivos:** `docs/pm/iniciativas/alinear-contrato-inventario/index.md` (scaffold).
- **Contenido:** premisa (useInventory `/admin/inventory/*` vs canónico
  `/inventory/{product_id}/` + `/inventory/imports/`, `rest-api-conventions.rst:507-518`),
  alcance, estado PLANEADA. No ejecutar aquí (módulo no tocado por las recientes).
- **Aceptación:** sub-iniciativa registrada en el índice global.

### F2-T03 — Registrar gaps de catálogo para `e-comerce-docs` (H-10, H-11)
- **Archivos:** sección "Hallazgos para docs" en el `progreso-` de esta iniciativa.
- **Contenido:** H-10 (UC-CFG-05 POST-02 sin endpoint público declarado; el UI usa
  `/config/settings/` admin en demo), H-11 (`DeactivateAccountPage.jsx` nombrado en
  UC-AUTH-16 §7.2 pero la baja vive inline en `SecurityPage`).

---

## FASE 3 — Reuso de componentes adaptados

### F3-T01 — `Button` en `SecurityPage` "Solicitar eliminación" (H-05, B)
- **Archivos:** `src/pages/account/SecurityPage.jsx:~126`.
- **Pasos:** `<button className={styles.deleteBtn} disabled={!deletePwd} ...>` →
  `<Button variant="danger" disabled={!deletePwd} onClick={...}>`. Mantener el
  texto "Solicitar eliminación →".
- **Aceptación:** tests de SecurityPage (ambos archivos) verdes; el botón sigue
  con name accesible "Solicitar eliminación".
- **Riesgo:** verificar que `Button` soporta `variant="danger"`; si no, usar
  `secondary` + clase. Verificar antes de editar.

### F3-T02 — `Button` en submit de `AdminSystemSettingsPage` (H-06, B)
- **Archivos:** `src/pages/admin/AdminSystemSettingsPage.jsx:~144`.
- **Pasos:** `<button type="submit" disabled={isActioning}>Guardar cambios</button>`
  → `<Button type="submit" loading={isActioning}>Guardar cambios</Button>`.
- **Aceptación:** test asserts `getByRole('button',{name:/Guardar cambios/i})` verde.

### F3-T03 — `DatePicker` en filtros de fecha del reporte de vouchers (H-04, B)
- **Archivos:** `src/pages/admin/AdminVoucherReportPage.jsx:~99,103`.
- **Pre-paso:** verificar API: `DatePicker({value,onChange})` y el FORMATO que
  emite `onChange` (Date vs 'YYYY-MM-DD'). Adaptar a `created_after/created_before`
  string ISO. Si el formato no es string ISO, normalizar en el handler.
- **Pasos (TDD):** ajustar test para el nuevo control (o mantener consulta por
  param); `<input type=date>` → `<DatePicker>`.
- **Aceptación:** el filtro de fecha sigue re-consultando con el param correcto.
- **Riesgo:** medio (formato de valor). Si el DatePicker complica el contrato del
  param, dejar el `<input type=date>` y marcar H-04 como NO-APLICA documentado.

### F3-T04 — `ProgressBar` en `AccountPage` completeness (H-07, B)
- **Archivos:** `src/pages/account/AccountPage.jsx:~60-62` + su `.module.scss`.
- **Pasos:** `completenessBar` crudo → `<ProgressBar value={pct} max={100} ariaLabel="Perfil completo" />`.
- **Aceptación:** AccountPage tests verdes; barra muestra el %.

### F3-T05 — `Modal` en sub-modal UC-LOG-07 de `OrderDetailPage` (H-08, B)
- **Archivos:** `src/pages/account/OrderDetailPage.jsx:~320-346`.
- **Pasos:** overlay con estilos inline → `<Modal open={showIssue} onClose=...>`.
  Conservar el form de reporte + el test UC-LOG-07 (label "Describe el problema",
  botón "Enviar reporte").
- **Aceptación:** test UC-LOG-07 verde sin cambios de aserción (o ajuste mínimo).
- **Riesgo:** medio (Modal usa <dialog> + showModal — jsdom polyfill ya existe en
  Modal.test). Verificar que el form queda dentro del Modal.

---

## FASE 4 — Verificación y cierre
- F4-T01: `npx jest --ci` completo → 0 fallos (baseline 1702 passed).
- F4-T02: `node scripts/check-scss.mjs` → clean.
- F4-T03: `DEMO_MODE=true npm run build:demo` → EXIT=0.
- F4-T04: actualizar matriz si cambia evidencia (iva_rate; nav Seguridad).
- F4-T05: `decisiones-*.md` + índice → Cerrada.

## Orden / dependencias
F1 (must-fix) → F2 (doc/sub-iniciativa, sin código de app) → F3 (componentes,
independientes entre sí; F3-T01..05 paralelizables) → F4 (gate único al final).
Cada F3-Tnn corre su test focal; la suite completa solo en F4.
