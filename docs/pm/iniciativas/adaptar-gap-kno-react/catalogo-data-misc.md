```yml
created_at: 2026-06-03T00:10:27
project: template-ecommerce-ui
iniciativa: adaptar-gap-kno-react
author: claude
status: Borrador
version: 1.0.0
type: Catalogo de componentes (analisis READ-ONLY)
```

# Catalogo kno-react — Data & Misc (16 paquetes)

Analisis READ-ONLY de 16 paquetes en `/tmp/references/-progress/`.
Para cada paquete se enumeran los componentes exportados (via
`index.d.ts`), se cruza contra lo ya adaptado en
`src/components/common/` y se marca **COVERED** o **GAP**.

## Metodologia

- **Exports:** extraidos de `<paquete>/index.d.ts` (re-export blocks).
  Solo se listan los identificadores que son Componentes React
  (Capitalizados, no `*Props/*Event/*Settings/*Context`).
- **Adaptable:** YES = pequeno/factible portar a SCSS Modules + RTK;
  PARTIAL = portable solo un subset/wrapper fino; NO = motor pesado
  (engine completo de grid/charts/scheduler/spreadsheet) cuya
  adaptacion nativa no compensa.
- **Estado:** COVERED (existe equivalente local, nombre citado) o GAP.
- **UC:** caso de uso de `requisitos/casos-uso/` o `generico`.

## Componentes ya adaptados en `src/components/common/` (49 dirs)

Accordion, Alert, Autocomplete, Avatar, Badge, Carousel, ChatWidget,
Chip, Collapse, **CoverageMap**, **DataGrid**, **DataSheet**, DatePicker,
DeliveryScheduler, Dropdown, **DualListBox**, **FileUpload**,
**GanttChart**, **Gauge**, **KanbanBoard**, LoadingButton, Modal,
MultiSelect, NumericTextBox, Offcanvas, **PdfViewer**, **PivotTable**,
Popover, ProductGallery, ProgressBar, RangeSlider, Rating,
RichTextEditor, ScrollSpy, SearchModal, Skeleton, **SortableList**,
Stepper, Switch, Tabs, TimePicker, Toast, Tooltip, **TreeList**,
**TreeView**, ViewToggle.

En **negrita** los 13 que mapean a los paquetes pesados de este lote.

## Tabla principal

| Componente | Paquete | Adaptable | Estado | UC | Nota |
|---|---|---|---|---|---|
| ListBox | kno-react-listbox | PARTIAL | COVERED | UC-ADM-02 | Cubierto por `DualListBox` local (transfer/select entre listas). ListBox simple = subset trivial. |
| ListBoxToolbar | kno-react-listbox | YES | COVERED | UC-ADM-02 | Toolbar de transfer (move/all); incluido en `DualListBox`. |
| ColumnResize / ColumnResizer | kno-react-data-tools | NO | COVERED | generico | Helpers de resize de columnas; ya internos a `DataGrid`/`TreeList`. |
| DragClue / DropClue / CommonDragLogic | kno-react-data-tools | NO | COVERED | generico | Primitivos drag-drop; cubiertos por `SortableList`/`KanbanBoard`/`TreeList`. |
| Pager | kno-react-data-tools | YES | COVERED | generico | Paginacion; ya implementada en `DataGrid` (y patron `ViewToggle`). |
| Chart | kno-react-charts | NO | GAP | UC-REP-03 | Motor de charts completo (axes/series/legends/zoom). NO adaptable nativo: usar Recharts/Chart.js. |
| Sparkline | kno-react-charts | YES | GAP | UC-REP-01 | Mini-grafico inline sin ejes; pequeno, factible con SVG nativo. |
| StockChart | kno-react-charts | NO | GAP | UC-REP-01 | Chart financiero (candlestick/navigator). Pesado, no nativo. |
| DonutCenter / SeriesLabels / CrosshairTooltip | kno-react-charts | NO | GAP | UC-REP-03 | Subpiezas del engine de charts; sin valor fuera de el. |
| ArcGauge | kno-react-gauges | YES | COVERED | UC-INV-01 | Cubierto por `Gauge` local (arc/radial). |
| CircularGauge / RadialGauge | kno-react-gauges | YES | COVERED | UC-INV-01 | Cubierto por `Gauge` local. |
| LinearGauge | kno-react-gauges | YES | PARTIAL/GAP | UC-INV-01 | Variante lineal (barra con escala); `Gauge` local es radial. Subset pequeno si se requiere. |
| Scheduler | kno-react-scheduler | NO | PARTIAL | UC-LOG-08 | Engine de calendario (Day/Week/Month/Agenda/Timeline, recurrencia, drag). Local `DeliveryScheduler` cubre el caso logistico acotado; engine completo NO adaptable nativo. |
| AgendaView / DayView / WeekView / MonthView / TimelineView | kno-react-scheduler | NO | GAP | UC-LOG-08 | Vistas del engine Scheduler; solo con el motor completo. |
| ServerOrgChart | kno-react-orgchart | NO | GAP | UC-ADM-02 | Organigrama jerarquico (layout de arbol + edges). Pesado; mejor lib dedicada o D3. No nativo. |
| MapWrapper (Map) | kno-react-map | NO | GAP | UC-LOG-03 | Mapa GIS (capas, shapes, tiles). Local `CoverageMap` cubre cobertura de envio acotada. Engine GIS completo NO nativo. |
| TreeView | kno-react-treeview | PARTIAL | COVERED | UC-CAT-09 | Cubierto por `TreeView` local. |
| TreeViewDragClue / TreeViewDragAnalyzer | kno-react-treeview | NO | COVERED | generico | Helpers drag; internos a `TreeView` local. |
| TreeList (+ Cell/Editor/Row/Toolbar) | kno-react-treelist | NO | COVERED | UC-INV-01 | Cubierto por `TreeList` local (grid jerarquico). |
| Sortable | kno-react-sortable | YES | COVERED | generico | Cubierto por `SortableList` local. |
| Upload (+ DropZone/List/ActionButtons/...) | kno-react-upload | PARTIAL | COVERED | UC-INV-05 | Cubierto por `FileUpload` local (drop + restricciones + progreso). |
| ExternalDropZone | kno-react-upload | YES | PARTIAL/GAP | UC-INV-05 | Dropzone externo desacoplado del Upload; subset pequeno si se necesita. |
| PDFViewer | kno-react-pdf-viewer | NO | COVERED | UC-RPT-04 | Cubierto por `PdfViewer` local. |
| PivotGrid (+ Configurator/Editors) | kno-react-pivotgrid | NO | COVERED | UC-REP-03 | Cubierto por `PivotTable` local. |
| PivotLocalDataService / PivotOLAPService | kno-react-pivotgrid | NO | GAP | UC-REP-03 | Servicios de datos OLAP; solo con el engine PivotGrid completo. |
| Spreadsheet | kno-react-spreadsheet | NO | COVERED | UC-INV-05 | Cubierto por `DataSheet` local (grid editable tipo hoja). |
| CalcError / Matrix / Context | kno-react-spreadsheet | NO | COVERED | generico | Internos del motor de formulas del Spreadsheet. |
| TaskBoard (+ Card/Column/EditCard/Toolbar) | kno-react-taskboard | NO | COVERED | UC-OPS-01 | Cubierto por `KanbanBoard` local (columnas + cards + drag). |
| Grid (+ Column/Cell/Toolbar/Filter/Menu/...) | kno-react-grid | NO | COVERED | UC-INV-01 | Cubierto por `DataGrid` local. |
| GridAIAssistant* / GridWebMcpTools* / McpTool* | kno-react-grid | NO | GAP | generico | Capa AI/MCP del Grid (prompts, tool-calling). Fuera de alcance del template; no adaptable nativo. |

## Resumen GAP + Adaptable=YES (factibles, pequenos)

| Componente | Paquete | UC | Por que es factible |
|---|---|---|---|
| Sparkline | kno-react-charts | UC-REP-01 | Mini-grafico SVG sin ejes; ~1 componente, sin engine. |
| LinearGauge | kno-react-gauges | UC-INV-01 | Variante lineal del `Gauge`; barra + escala, subset pequeno. |
| ExternalDropZone | kno-react-upload | UC-INV-05 | Dropzone HTML5 desacoplado; reutiliza logica de `FileUpload`. |

## Pesados — NO adaptar nativo (usar lib externa o no portar)

- **Chart / StockChart** (kno-react-charts): motor de charting completo
  -> Recharts / Chart.js para UC-REP-03.
- **Scheduler engine** (kno-react-scheduler): calendario con vistas,
  recurrencia y drag. El caso logistico ya lo cubre `DeliveryScheduler`.
- **ServerOrgChart** (kno-react-orgchart): organigrama con layout de
  arbol; lib dedicada o D3 si se requiere.
- **Map / MapWrapper** (kno-react-map): GIS multi-capa; `CoverageMap`
  cubre el caso acotado, no el engine.
- **GridAIAssistant / WebMcpTools** (kno-react-grid): capa AI/MCP,
  fuera de alcance del template.

## Calibracion

- Paquetes analizados: 16 (verificado: lista de directorios en
  `/tmp/references/-progress/`).
- Componentes COVERED por equivalente local: 13 motores confirmados
  como dirs en `src/components/common/` (DataGrid, TreeList, TreeView,
  PivotTable, DataSheet, KanbanBoard, GanttChart, Gauge, SortableList,
  FileUpload, PdfViewer, DualListBox, CoverageMap — verificado con
  `[ -d ]`).
- GAP + Adaptable=YES (pequenos): 3 (Sparkline, LinearGauge,
  ExternalDropZone).
- GAP pesados NO recomendados nativos: 5 familias (Chart engine,
  Scheduler engine, OrgChart, Map/GIS, Grid-AI/MCP).
