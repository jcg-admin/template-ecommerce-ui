# Análisis — inventario `kno-react-*` y mapeo al dominio ecommerce

Repo de referencia: `/tmp/references/-progress` (clonado, **no versionado**;
efímero entre sesiones). **41 paquetes `kno-react-*`**. Cada paquete se cruza
con lo que el template **ya tiene** (para no duplicar) y, cuando hay gap real,
se propone un UC con su **punto de integración concreto** (con evidencia de
código). La columna "ref." es solo inspiración de API/UX; la implementación es
**nativa** (código propio, sin importar `@progress/kno-*`).

## Método (Premise Gate 0b)

Cada UC propuesto cita el archivo/endpoint donde se integraría, verificado por
`grep` contra `src/`. Los puntos marcados "✓ evidencia" están confirmados; los
marcados "vista nueva" requieren crear una página/sección.

---

## 1. Ya implementado (componentes nativos — F1)

| UC | Ref. | Componente | Integración | Estado |
|----|------|-----------|-------------|--------|
| UC-CAT-GAL | `scrollview` | `common/ProductGallery` | `ProductPage.jsx` ✓ | Componente + integración HECHOS |
| UC-ADM-IMG | `upload` | `common/FileUpload` | `AdminProductDetailPage` (ImageGallery) | Componente HECHO; integración F2 |
| UC-ACC-AVATAR | `upload` | `common/FileUpload` | `ProfilePage.jsx` (avatar) | Componente HECHO; integración F2 |
| UC-LOG-GANTT | `gantt` | `common/GanttChart` | `AdminOrderDetailPage` | Componente HECHO; integración F4 |
| UC-ORD-PDF | `pdf-viewer` | `common/PdfViewer` | `OrderDetailPage` (`invoice_url`) ✓ | Componente HECHO; integración F3 |

---

## 2. UCs nuevos propuestos (18) — por tier

### Tier A — alto valor, datos/endpoint ya existen

| UC | Ref. | Qué aporta | Punto de integración |
|----|------|-----------|----------------------|
| **UC-ADM-SORT** | `sortable` | Reordenar imágenes de producto arrastrando | `AdminProductDetailPage` — thunk `reorderProductImages` ✓ (`adminSlice.js:681`) |
| **UC-ADM-RTE** | `editor` | Editor de texto enriquecido | `AdminProductForm.jsx` (descripción) y `AdminStaticPageEditorPage.jsx` ✓ — hoy textarea plano |
| **UC-ADM-XLSX** | `excel-export` | Exportar a Excel/XLSX | `AdminOrdersPage.jsx` ✓, `AdminReportPage`, `AdminInventory*` — hoy solo CSV |
| **UC-ADM-KANBAN** | `taskboard` | Tablero kanban de pedidos por estado | `AdminOrdersDashboardPage.jsx` ✓ (vista alterna de fulfillment) |
| **UC-CAT-TREE** | `treeview` | Filtro de catálogo por árbol de categorías | `CatalogFilters.jsx` ✓ — hoy "selección de un slug del árbol público" plano |

### Tier B — buen valor storefront, vista/sección nueva

| UC | Ref. | Qué aporta | Punto de integración |
|----|------|-----------|----------------------|
| **UC-CAT-LIST** | `listview` | Toggle vista lista ↔ grid del catálogo | `CatalogPage.jsx` (vista nueva) |
| **UC-CHT-FREESHIP** | `progressbars` | Barra "te faltan $X para envío gratis" | `CartPage.jsx` ✓ / mini-cart |
| **UC-CHT-SCHED** | `scheduler` | Agendar fecha/hora de entrega preferida | `ExpressCheckoutPage.jsx` / `CheckoutPage.jsx` ✓ |
| **UC-CAT-FAQ** | `layout` (PanelBar) | Acordeón de FAQ / preguntas en la ficha | `ProductPage.jsx` (sección Q&A) |
| **UC-ADM-GRID** | `grid` | Tabla avanzada (orden/filtro/página/columnas) | `AdminTablePage` y listados admin |
| **UC-ADM-TREELIST** | `treelist` | Árbol editable de categorías | `AdminCategoriesPage.jsx` ✓ |

### Tier C — analítica / soporte / niche (mayor esfuerzo o solapamiento)

| UC | Ref. | Qué aporta | Nota |
|----|------|-----------|------|
| **UC-ADM-GAUGE** | `gauges` | KPIs tipo dial (stock, meta de ventas) | dashboard admin; solapa parcial con `recharts` |
| **UC-LOG-MAP** | `map` | Mapa de cobertura / puntos de entrega | `AdminLogisticsPage`; requiere tiles/lib de mapa |
| **UC-SUP-CHAT** | `conversational-ui` | Widget de chat de soporte en vivo | hay tickets (`SupportTicket*`), no chat UI |
| **UC-ORD-PDFGEN** | `pdf` | Generar la factura PDF en cliente | complementa UC-ORD-PDF (alternativa a asset mock) |
| **UC-ADM-PIVOT** | `pivotgrid` | Reporte pivote de ventas | `AdminReportPage`; avanzado |
| **UC-ADM-SHEET** | `spreadsheet` | Edición masiva tipo hoja (import/precios) | `AdminProductImportPage`/`AdminPriceSyncPage`; avanzado |
| **UC-ADM-LISTBOX** | `listbox` | Asignar tags/categorías (dual-list) | niche |

---

## 3. Descartados por redundancia (el template ya lo tiene)

| Paquete kno-react | Equivalente en el template |
|-------------------|----------------------------|
| `buttons` | `primitives` (Button), `LoadingButton` |
| `inputs` | inputs nativos + `useForm` |
| `dropdowns` | `Dropdown`, `MultiSelect`, `Autocomplete` |
| `dialogs` | `Modal` |
| `popup` | `Popover` |
| `tooltip` | `Tooltip` |
| `notification` | `Toast` / `ToastContainer` |
| `dateinputs` | `DatePicker`, `TimePicker` |
| `form` | `useForm` |
| `indicators` | badges/spinners + `Chip` |
| `labels` | labels nativos |
| `animation` / `ripple` | `framer-motion` + SCSS |
| `charts` | `recharts` (dashboards admin) |
| `intl` | fuera de alcance (i18n) |
| `common` / `data-tools` | utilidades internas del paquete, no UI |

`orgchart` no tiene encaje en el dominio ecommerce.

---

## 4. Resumen

- **41 paquetes** inventariados. **4 UCs implementados** (componentes nativos).
- **18 UCs nuevos** propuestos (5 Tier A, 6 Tier B, 7 Tier C).
- **~16 paquetes** descartados por redundancia o no aplicables.
- Decisión: hacemos **todos** los UCs nuevos; orden por tiers (A → B → C). El
  plan detalla las fases y tareas atómicas (`plan-componentes-nativos.md`).

### Decisiones abiertas por UC

- **UC-ORD-PDF vs UC-ORD-PDFGEN**: asset PDF mock estático en DEMO (sin libs)
  por defecto; la generación en cliente (`pdf`) es alternativa si se quiere
  factura derivada de datos (sumaría dependencia).
- **UC-LOG-MAP**: requiere decidir proveedor de tiles (o un SVG estático de
  cobertura) para mantener DEMO sin llamadas externas.
- **UC-SUP-CHAT**: definir si el chat es mock local (MSW) o se difiere a backend.
