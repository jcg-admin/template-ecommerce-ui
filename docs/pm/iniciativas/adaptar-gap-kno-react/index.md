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

## Cierre del loop de componentes (2026-06-03)

**15 componentes nativos** adaptados de kno-react (`-progress`) y **cableados** a UCs:
Rating, NumericTextBox, Switch, Badge, Skeleton, Avatar, Checkbox, RadioGroup,
Breadcrumb, TimeLine, Sparkline, LinearGauge, ButtonGroup, DropDownButton, **Card**.

Cableados: Rating→reseñas, NumericTextBox→carrito, Switch→**CABLEADO** (ver abajo),
Badge→header, Skeleton→Wishlist/Orders, Avatar→Header/Profile, Checkbox→Register,
RadioGroup→ReturnCreate, Breadcrumb→Catalog/Product, TimeLine→OrderDetail,
Sparkline/LinearGauge→AdminDashboard, ButtonGroup→AdminOrders filtro,
DropDownButton→AdminOrders acciones, Card→**aún NO cableado** (ver corrección abajo).

## F2 — Cableado de Switch en superficies admin (2026-06-03)

`Switch` (`src/components/common/Switch/index.jsx`, `role="switch"`) reemplaza
checkboxes boolean crudos en admin:

- **CABLEADO (live):** `src/pages/admin/AdminProductDetailPage.jsx:161-174` —
  toggles `is_published` ("Publicado en catálogo") y `is_featured`
  ("Destacar en home"). Setter `setBool` (`:70`). Tests:
  `AdminProductDetailPage.test.jsx` +2 (Switch presente con `aria-checked`
  reflejando estado; alternar dispara el mismo `is_published:false` en el PATCH).
- **CABLEADO (estructural, rama inactiva):**
  `src/pages/admin/AdminSystemSettingsPage.jsx:100-105` — la rama
  `f.type === 'checkbox'` renderiza `Switch`. **Hallazgo H-UI-01:** el
  `SiteSettingsAdminSerializer` real (`apps/settings_app/serializers.py:45-67`)
  NO tiene campos boolean, así que los `FIELDS` actuales no activan esa rama
  (queda lista para un futuro campo boolean de dominio). Test +1: garantiza
  que el formulario nunca emite un `<input type="checkbox">` crudo.

**No convertido (correcto):** el checkbox `auto-slug`
(`AdminProductDetailPage.jsx:142`) NO es un boolean de dominio (controla el
auto-derivado del slug en el cliente) → se mantiene como checkbox.

**Corrección a la nota previa "Card→(disponible)":** la premisa de la tarea
decía que `Card` ya estaba cableado en `SecurityPage.jsx` (3 usos). **Es
incorrecto:** esos 3 usos son un componente `Card` **local** definido en
`src/pages/account/SecurityPage.jsx:152`, no el `Card` compartido de
`@components/common`. El `Card` compartido del barrel **no tiene ningún
consumidor** en `src/` (verificado: 0 imports `from '@components/common'` de
`Card`). Hallazgo H-UI-02. Card sigue pendiente de cableado real.

**Backlog de componentes GAP de alto valor: AGOTADO.** Los restantes del catálogo son:
- **Genéricos de bajo valor** (no perseguidos): AppBar, FloatingLabel, Animation,
  GridLayout, StackLayout, BottomNavigation, Ripple, ActionSheet.
- **PARTIAL / no triviales** (documentados, no adaptados): ContextMenu, Splitter,
  TileLayout, ComboBox, DropDownTree, DateInput, ColorPalette.
- **Pesados — NO conviene nativo** (usar lib dedicada si se necesitan): Chart/StockChart
  engine, Scheduler engine, OrgChart, Map GIS, MaskedTextBox, ColorPicker, Signature,
  SpeechToText, ListView (paging premium).

Verificación de cierre: jest 1858 passed / 0 failed; check-scss 183 clean;
build:demo EXIT=0.

## Revisión de referencias de documentos/datos (Excel/Word/PDF/CSV/ZIP) — 2026-06-03

Más allá de los componentes UI, `-progress` incluye librerías de documentos:
`kno-csv`, `kno-react-pdf`, `kno-react-excel-export`, `kno-ooxml`, `jszip-esm`,
`pako-esm`, `kno-drawing`, `kno-file-saver`, `kno-data-query`.

Veredicto tras cruzar con el contrato real (UCs + backend Django):

- **CSV** — ✅ cubierto: `src/utils/exportSheet.js` (client, `text/csv`) +
  `useReports.buildReportExportUrl(format=csv)` (server). Alineado con UC-REP-05.
- **PDF** — ✅ cubierto: `generateInvoicePdf` (jsPDF) + `PdfViewer` +
  `format=pdf` (server `_placeholder_pdf`). UC-REP-05 / UC-ORD-PDF.
- **Excel / XLSX** — ⚠️ NO implementar en el UI:
  1. `kno-react-excel-export` es **componente PREMIUM/licenciado** (license key);
     no se puede vendorizar.
  2. El contrato (UC-RPT-04) define XLSX como export **server-side** que devuelve
     una **URL firmada**; NO es un motor de cliente.
  3. El **backend real NO genera XLSX**: `apps/reports/exports.py::export_sales`
     retorna `None` para `fmt='xlsx'` (solo CSV real + PDF placeholder).
  → **Deuda del backend/catálogo**, no del UI. Registrado como gap para
  `e-comerce-api`/`e-comerce-docs` (implementar export XLSX real con openpyxl y
  exponer `format=xlsx`); el UI ya delega vía `buildReportExportUrl` y solo
  añadiría la opción "XLSX" cuando el servidor la soporte.
- **Word / .docx** (`kno-ooxml`) — ❌ **ningún UC** lo requiere → fuera de alcance.
- **ZIP** (`jszip-esm`/`pako-esm`) — infra interna de los engines OOXML/xlsx; el
  UI no la consume directamente.

Conclusión: **0 trabajo de UI**; el export del UI está completo y alineado. XLSX
queda como deuda del backend (documentada, no fabricada en el cliente).

## CORRECCIÓN — XLSX nativo implementado (2026-06-03)

El ejecutor corrigió el criterio anterior: el banner "premium/license key" es del
paquete npm original; **nosotros NO instalamos el paquete, adaptamos la técnica
nativamente** desde el `dist` de referencia (igual que DataGrid/Gauge/etc.). El
"premium" NO es un límite.

Implementado **export `.xlsx` nativo, sin dependencias nuevas**, adaptando OOXML
de `kno-ooxml/dist/es/` + el contenedor ZIP de `jszip-esm`:
- `src/utils/zipStore.js` — escritor ZIP STORE-only (CRC32 propio, polinomio
  `0xEDB88320`; headers local/central + EOCD). Vector verificado:
  `crc32("123456789") = 0xCBF43926`.
- `src/utils/exportWorkbook.js` — `exportXlsx({filename, sheetName, columns, rows})`
  (misma API que el CSV `exportSheet`). Genera las 5 partes OOXML
  (`[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`,
  `xl/_rels/workbook.xml.rels`, `xl/worksheets/sheet1.xml`); números `t="n"`,
  strings `t="inlineStr"`. MIME `...spreadsheetml.sheet`. Bytes inician en `PK`.
- Cableado "Exportar Excel" (aditivo, junto a CSV) en `AdminReportSalesPage` y
  `AdminVoucherReportPage`. 31 tests del bloque verde.

Esto **cierra el gap XLSX del lado UI** (UC-RPT-04 formato XLSX) de forma
client-side real. (El backend sigue sin generar XLSX server-side — eso queda como
deuda independiente del backend si se prefiere la ruta de URL firmada.)

**Word/.docx:** `kno-ooxml` también cubre docx; la base ZIP+OOXML aquí creada lo
habilita, pero **sigue sin UC** que lo justifique → no implementado.

Lección general: "premium/licencia" en un paquete de referencia **no** es un
bloqueante — se adapta la técnica nativamente.
