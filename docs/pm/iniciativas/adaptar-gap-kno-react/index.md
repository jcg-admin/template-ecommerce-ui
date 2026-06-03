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
