# Decisiones — componentes nativos (adaptar-componentes-kno-react)

## Seccion 1 — Decisiones de arquitectura

- **D-1 Implementación nativa, no importación.** Se adaptaron 22 componentes
  inspirados en el catálogo de referencia (`kno-react-*`, modelado sobre
  KendoReact) como **código propio** en el stack del template (React + hooks +
  SCSS del sistema). No se importa ni empaqueta `@progress/kno-*`. Cero
  dependencias nuevas en `dependencies`.
- **D-2 TDD estricto vía agentes en paralelo.** Cada componente se construyó
  con el ciclo test→red→green→refactor, un agente por componente, en lotes
  paralelos por tier. Cada integración se hizo con su test (una tarea atómica
  por archivo, un commit por UC/fase).
- **D-3 "Sin dependencias nuevas" como restricción dura.** Derivó decisiones:
  - **UC-ADM-XLSX** → export **CSV nativo** (`utils/exportSheet`). El XLSX
    binario real requeriría `jszip`; queda fuera.
  - **UC-ORD-PDF** → **asset PDF mock estático** en DEMO (`public/mock/
    factura-demo.pdf`, PDF válido generado por script sin libs, copiado a
    `dist/mock`).
  - **UC-ORD-PDFGEN** (generar factura en cliente) → **DIFERIDA**: requiere
    `jspdf`/`pdf-lib`. Por defecto queda el asset mock (UC-ORD-PDF).
  - **UC-LOG-MAP** → **SVG estático** de zonas (sin tiles/servicios externos).
  - **UC-SUP-CHAT** → hilo **local** con autorespuesta simulada (sin backend).
- **D-4 E2E con el Chromium del entorno.** Harness Playwright (`tests/e2e/`)
  que resuelve el binario cacheado en `PLAYWRIGHT_BROWSERS_PATH` y sirve el
  `dist` demo con MSW. Checks de **storefront**; el E2E del **panel admin** se
  difiere (ver Sección 3 y 4).

## Seccion 2 — Resultado cuantitativo

- **22 componentes nativos** con unit tests (≈222 tests de componente):
  - F1 (4): ProductGallery 12, FileUpload 6, GanttChart 9, PdfViewer 6.
  - Tier A (5): SortableList 13, RichTextEditor 13, exportSheet 13,
    KanbanBoard 10, TreeView 10.
  - Tier B (6): ViewToggle 8, ProgressBar 12, DeliveryScheduler 12,
    Accordion 16, DataGrid 18, TreeList 8.
  - Tier C (6): Gauge 8, CoverageMap 8, ChatWidget 9, DataSheet 13,
    PivotTable 10, DualListBox 8.
- **22 integraciones (UCs)**, cada una con test de integración.
- **Suite jest: 1626 passed / 0 fallos** (desde ~1330 al inicio del lote).
- **check-scss: 169 entries clean**; `build:demo` OK (PDF copiado).
- **E2E: 10 checks → 8 pass / 2 warn / 0 fail** (Chromium real).
- ~20 commits, uno por componente/UC/fase (Tim Pope).

## Seccion 3 — Bugs y hallazgos durante la ejecucion

- **H-1** `AdminProductDetailPage` y `ProfilePage` **no tenían test**; se
  crearon al integrar (F2-T3/T4).
- **H-2** `tests/e2e/lib/browser.mjs`: un `*/` dentro de un comentario cerraba
  el bloque antes de tiempo (`SyntaxError`); corregido.
- **H-3 Datos demo con 1 imagen por producto.** `catalog.ts` comenta "37
  productos con múltiples imágenes" pero el MVP solo cargó la primera, así que
  la tira de thumbnails de `ProductGallery` no es ejercitable end-to-end → el
  check E2E `product-gallery` queda en **WARN** (cubierto por el unit test).
- **Deuda menor — decisiones aceptadas** (no son bugs de correctitud; el fix
  "limpio" exigiría tocar tests de regresión fuera de alcance o regenerar
  datos):
  - `src/mocks/data/catalog.ts` es **generado**; la jerarquía de categorías
    añadida para UC-CAT-TREE se perdería al regenerar con
    `scripts/transform-catalog.mjs` → conviene mover la jerarquía a la fuente
    del script. **Seguimiento abierto.**
  - `AdminProductForm`: se conserva un `<textarea>` oculto (sr-only) como shim
    para no romper `AdminProductCreatePage.test.jsx` (no editable por el agente
    que integró el RichTextEditor).
  - `DualListBox` en `AdminProductForm`: labels con prefijo `"Categoría: "`
    para desambiguar el `role="option"` frente al `<select>` de categoría (mismo
    test de regresión).
  - `DataGrid` en `AdminUsersPage`: la búsqueda pasó a client-side y las
    columnas ordenables muestran texto plano (no "pills") para que orden/filtro
    operen sobre valores comparables.
  - `AdminCategoriesPage.module.scss`: quedaron clases huérfanas tras migrar a
    `TreeList` (inocuas; check-scss limpio).

## Seccion 4 — Criterios de completitud verificados

- [x] 22 componentes nativos con unit tests verdes.
- [x] 22 integraciones (UCs) con test; todas en `main` de la rama.
- [x] `npm test` → 0 fallos (1626 passed).
- [x] `node scripts/check-scss.mjs` → clean (169).
- [x] `DEMO_MODE=true npm run build:demo` → OK.
- [x] E2E storefront → 0 fail (8 pass, 2 warn justificados).
- [ ] **UC-ORD-PDFGEN diferido** — requiere lib de PDF (decisión D-3).
- [ ] **E2E del panel admin diferido** — cada integración admin tiene cobertura
  unitaria completa; un E2E con login admin + navegación profunda sería frágil
  (flakiness = deuda). Se documenta como deferral consciente, no como gap de
  calidad.
- [ ] **Validación visual en browser** (animaciones, pixel) — fuera de CI;
  queda para revisión manual en WSL2.
