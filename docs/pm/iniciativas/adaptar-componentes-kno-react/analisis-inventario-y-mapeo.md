# Análisis — inventario `kno-react-*` y mapeo al dominio ecommerce

Repo de referencia: `/tmp/references/-progress` (no versionado).
41 paquetes `kno-react-*`. Se clasifican por relevancia a un ecommerce y se
cruzan con lo que el template **ya tiene** (para no duplicar). La columna
"referencia" es solo inspiración de API/UX; la implementación es nativa.

## Lo que el template ya tiene (no se re-crea)

`common/`: Alert, Autocomplete, Carousel, Chip, Collapse, DatePicker, Dropdown,
LoadingButton, Modal, MultiSelect, Offcanvas, Popover, RangeSlider, ScrollSpy,
SearchModal, Stepper, Tabs, TimePicker, Toast, Tooltip + `primitives`.
`catalog/`: ProductCard, Rating, SearchBar, VariantSelector, CatalogFilters,
RelatedProductsSection. Deps: `recharts` (charts), `framer-motion` (animación).

## Clasificación

### ALTA — gap real con encaje directo en storefront

| Paquete kno-react | Qué aporta | Estado en template | UC propuesto (nativo) |
|-------------------|-----------|--------------------|------------------------|
| `scrollview` | Galería/carrusel de imágenes con thumbnails, swipe móvil, paginación | Hay `Carousel` genérico; falta galería de producto dedicada (zoom + thumbnails) | UC-CAT-GAL: galería en ProductPage |
| `pdf-viewer` + `pdf` | Visor de PDF embebido + generación de PDF | No existe | UC-ORD-PDF: ver/descargar factura; UC-PROD-DOC: ficha técnica |
| `upload` | Upload con drag-drop, preview, barra de progreso, validación | Inputs `file` básicos (ProfilePage, AdminProductDetail) | UC-ADM-IMG: subir imágenes de producto con preview; avatar |

### MEDIA — admin / logística / analítica

| Paquete | Qué aporta | Estado | UC propuesto |
|---------|-----------|--------|--------------|
| `gantt` | Timeline de tareas/etapas con dependencias | OrderDetailPage tiene timeline simple | UC-LOG-GANTT: línea de tiempo de fulfillment (admin) |
| `taskboard` | Kanban por columnas | No existe | UC-ADM-KANBAN: pedidos por estado |
| `scheduler` | Calendario con slots | No existe | UC-LOG-SLOTS: agenda de entregas |
| `grid` / `treelist` | Tabla avanzada (sort/filter/page/group) | Tablas admin propias (`AdminTablePage`) | Mejora incremental, no UC nuevo |
| `editor` | Rich text | No existe | UC-ADM-DESC: descripción rica de producto |
| `excel-export` | Export a XLSX | No existe (hay CSV) | UC-ADM-EXPORT: reportes a Excel |

### BAJA / CUBIERTO — ya resuelto o poco encaje

- Cubiertos por el template: `buttons`, `inputs`, `dropdowns`, `dialogs`
  (Modal), `tooltip`, `popup` (Popover), `dateinputs` (DatePicker/TimePicker),
  `form`, `layout`, `notification` (Toast), `progressbars`/`indicators`
  (Stepper/LoadingButton), `charts`/`gauges` (recharts), `animation`
  (framer-motion), `listview` (ProductCard grids).
- Poco/nulo encaje ecommerce: `spreadsheet`, `map`, `orgchart`,
  `conversational-ui`, `pivotgrid`, `ripple`, `sortable`, `listbox`,
  `treeview`, `intl`, `labels`, `data-tools`, `common`.

## Prioridad recomendada (sujeta a decisión del usuario)

1. **UC-CAT-GAL** — galería de producto (scrollview). Alto impacto storefront,
   bajo riesgo, encaja con ProductPage existente.
2. **UC-ORD-PDF** — factura PDF del pedido (pdf-viewer/pdf). Valor claro en
   cuenta/pedidos; requiere decidir generación (cliente vs mock).
3. **UC-ADM-IMG** — upload de imágenes con preview (upload). Mejora el panel
   admin que ya sube imágenes con inputs básicos.
4. **UC-LOG-GANTT** — timeline de fulfillment (gantt). El ejemplo del usuario;
   admin/logística.

## Pendiente de decisión del usuario

- Confirmar el subconjunto inicial (p.ej. los 4 anteriores o solo los 3
  ejemplos: scrollview, pdf-viewer, gantt).
- Para PDF: ¿generación en cliente, assets mock en DEMO_MODE, o backend real?
- Tras elegir, se redacta `plan-*.md` (fases) y `tareas-*.md`, y la iniciativa
  pasa a **En ejecución**.
