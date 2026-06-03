# Iniciativa: adaptar-gap-kno-react

**Estado:** EN EJECUCIÓN
**Creada:** 2026-06-03
**Origen:** Petición del ejecutor — analizar qué módulos de `-progress`
(`/tmp/references/-progress`, librería kno-react) faltan por adaptar y, dado el
catálogo de UCs, implementarlos.

## Análisis del gap

`-progress` expone ~40 paquetes `kno-react-*`. La mayoría ya están adaptados
nativamente en `src/components/common/` (grid→DataGrid, treelist, treeview,
upload→FileUpload, dropdowns, dateinputs, gantt, gauges, pivotgrid→PivotTable,
spreadsheet→DataSheet, taskboard→KanbanBoard, dialogs→Modal, editor→RichTextEditor,
conversational→ChatWidget, sortable, tooltip, popup→Popover, progressbars→ProgressBar,
listbox→DualListBox, scrollview→ScrollSpy, notification→Toast/Alert).

**Gap detectado (no adaptados) con encaje en UCs:**

| Componente | Paquete kno | UC respaldo |
|---|---|---|
| Rating (estrellas) | kno-react-inputs | UC-REV-01/02 (dejar/ver reseñas) |
| NumericTextBox | kno-react-inputs | UC-CART (cantidades), UC-INV (stock/precio) |
| Switch (toggle) | kno-react-inputs | toggles admin (voucher/producto activo, settings) |
| Badge (contador) | kno-react-indicators | UC-NOT, contador carrito/header |
| Skeleton (loading) | kno-react-indicators | estados de carga (cross-cutting) |
| Avatar | kno-react-layout | UC-AUTH perfil/header |

Sin encaje inmediato / nicho (no implementados): OrgChart, Splitter, ListView,
ColorPicker, MaskedTextBox, RadioGroup, Checkbox (cubierto por inputs nativos).

## Ejecución

6 agentes en paralelo implementaron adaptaciones **nativas** (sin dependencia
kno), cada una con componente + SCSS module (tokens del design-system) + test RTL:

| Componente | Tests |
|---|---|
| Rating | 8 |
| NumericTextBox | 12 |
| Switch | 7 |
| Badge | 12 |
| Skeleton | 16 |
| Avatar | 10 |

Total 65 tests, todos verdes. Exportados en el barrel `src/components/common/index.js`.

## Verificación
- `npx jest` completo: 1768 passed / 0 failed.
- `node scripts/check-scss.mjs`: 174 limpio.
- `DEMO_MODE=true npm run build:demo`: (ver progreso).

## Siguiente (opcional)
Cablear a UCs: Rating → ProductReviewCreatePage/ProductReviewsListPage;
Badge → contador de carrito en header; NumericTextBox → selector de cantidad en
CartPage; Switch → toggles en AdminVouchers/AdminProducts/Settings.

## 2ª ola (mapeo ampliado — 3 catálogos por agentes)

Catálogos completos en `catalogo-inputs-forms.md`, `catalogo-layout-indicators.md`,
`catalogo-data-misc.md`. Segunda tanda implementada (8 componentes nativos):

| Componente | Paquete | UC | Tests |
|---|---|---|---|
| Checkbox | inputs | UC-AUTH-01/CFG/ADM | 8 |
| RadioGroup (+RadioButton) | inputs | UC-CFG-01/02, pago | 7 |
| Breadcrumb | layout | UC-CAT nav | 10 |
| TimeLine | layout | UC-ORD/LOG tracking | 11 |
| Sparkline | charts | UC-REP-01 | 13 |
| LinearGauge | gauges | UC-INV-01 | 13 |
| ButtonGroup | buttons | toolbars/filtros | 10 |
| DropDownButton | buttons | UC-ADM acciones | 10 |

Total 2ª ola: 82 tests. Acumulado componentes nuevos: 14 (6+8), 147 tests.

## Pesados descartados (no nativo)
Chart/StockChart engine, Scheduler engine, OrgChart, Map GIS, MaskedTextBox,
ColorPicker/ColorGradient, Signature, SpeechToText, ListView (paging premium).
Ya cubiertos por adaptaciones previas: DataGrid, TreeList, TreeView, PivotTable,
DataSheet, KanbanBoard, Gantt, Gauge, SortableList, FileUpload, PdfViewer,
DualListBox, CoverageMap, Modal, Dropdown, MultiSelect, DatePicker, etc.

## Verificación 2ª ola
jest 1850 passed / 0 failed; check-scss 182 clean; build:demo (ver commit).
