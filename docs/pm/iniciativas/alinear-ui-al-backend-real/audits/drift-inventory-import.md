```yml
created_at: 2026-06-03T02:50:16
project: template-ecommerce-ui
author: claude
status: Borrador
version: 1.0.0
```

<!--
.. reporte::
   :agente: drift-audit + implementacion
   :tarea: Alinear import CSV de productos del UI al contrato real UC-INV-05
   :fecha: 2026-06-03
   :herramientas: Read, Grep, Bash (sed, git rev-parse), jest, check-scss
   :basado-en: api develop @ d0cba50 (git -C /tmp/references/e-comerce/api rev-parse --short HEAD)
-->

# Drift — Importación de inventario / productos (UI vs backend real)

**Backend de referencia:** `/tmp/references/e-comerce/api/practicayoruba`, rama
`develop`, short SHA **`d0cba50`**.

**Contrato real (UC-INV-05)** — `apps/inventory/urls.py` montado bajo
`api/v1/admin/` (`config/urls.py:40`):

- `POST inventory/import/` → `ProductImportView` (`apps/inventory/views.py:443`).
  Multipart `file` + `initial_state` opcional (default `'BORRADOR'`;
  `'ACTIVO'` publica). Respuesta 200 con
  `{created, failed, products_created, products_failed, error_report, download_url}`
  (`apps/inventory/views.py:483,508`; `_process_import_csv` retorna esas keys en
  `:426-428`). Headers CSV requeridos: `{name, sku, base_price, category_slug}`
  (`apps/inventory/views.py:369`).
- `GET inventory/import/<job_id>/` → `ProductImportStatusView` (`:509`).
- `GET inventory/import-reports/<report_id>.csv` → `ProductImportReportView`
  (`:527`), columnas `row,field,reason` (`:538`).

No existe preview, ni confirm, ni descarga de plantilla en el backend real.

--------

H-UI-01 — AdminProductImportPage usaba 4 endpoints inventados
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **Severidad:** ALTA
- **Archivo:** `src/redux/slices/adminSlice.js` (thunks `uploadProductCSV`,
  `confirmProductImport`, `fetchImportStatus`, `downloadImportTemplate`) +
  `src/pages/admin/AdminProductImportPage.jsx`
- **Descripción:** la página implementaba un flujo preview → confirm →
  poll-status → done sobre `/admin/products/import/`, `.../<id>/confirm/`,
  `.../<id>/`, `.../template/`. Ninguna existe en el backend real
  (`grep -rn "products/import" → 0 hits`). El import real es single-shot bajo
  `/admin/inventory/import/`.
- **Estado:** RESUELTO en `template-ecommerce-ui@3299584`. La página se reescribió
  a single-shot delegando en `inventorySlice.importProductsCsv` (endpoint real);
  se eliminaron los thunks y mocks inventados.

H-UI-02 — Handler mock `inventory/alerts/` huérfano (no registrado)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **Severidad:** MEDIA
- **Archivo:** `src/mocks/handlers/inventory.ts`
- **Descripción:** desde el commit `16d5d93` ("Fase 5 completada — MSW handlers
  faltantes"), el handler `GET /api/v1/admin/inventory/alerts/` quedó colocado
  dentro del array literal de `__resetInventoryState` (`state.importReports = [...]`),
  fuera del array exportado `inventoryHandlers` (que cerraba antes). Efecto: el
  endpoint de alertas de stock (consumido por `AdminStockAlertsPage`, UC-INV-01)
  no se registraba en MSW → 404 en `DEMO_MODE`; y el reset asignaba un handler a
  `importReports` en vez de `[]`. La suite no lo detectó porque los tests de esa
  página mockean `apiService` directamente.
- **Estado:** RESUELTO en `template-ecommerce-ui@3299584`. El handler se reubicó
  dentro de `inventoryHandlers` y `__resetInventoryState` restaura
  `importReports = []`. Verificado: balance de brackets 18/18; suite completa
  `1878 passed, 0 failed`.

--------

## Verificación

- `npx jest --ci --watchAll=false` → `Test Suites: 290 passed`,
  `Tests: 1878 passed` (105 skipped), `EXIT=0`.
- `node scripts/check-scss.mjs` → `183 SCSS entries compiled clean; EXIT=0`.
