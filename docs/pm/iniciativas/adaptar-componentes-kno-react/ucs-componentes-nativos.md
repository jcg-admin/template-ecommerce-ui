# UCs — componentes nativos adaptados (kno-react como referencia)

Cada UC se implementa con **código propio** en el stack del template; la
columna "referencia" indica el componente KendoReact que inspiró la API/UX
(no se importa ni se copia su código).

---

## UC-CAT-GAL — Galería de imágenes de producto

| Campo | Valor |
|-------|-------|
| Actor | Comprador |
| Referencia | KendoReact ScrollView (`kno-react-scrollview`) |
| Componente | `src/components/common/ProductGallery/` |
| Integrado en | `src/pages/catalog/ProductPage.jsx` (reemplaza la galería manual con thumbnails + `activeImg`) |
| Estado | HECHO e INTEGRADO |

**Descripción:** en la ficha de producto, el comprador ve una imagen principal
grande con tira de thumbnails clicables, navega con botones anterior/siguiente
(con wrap) y con flechas del teclado cuando la galería tiene foco. Accesible
(`role="group"`, `aria-current` en el thumbnail activo, `alt` propagado).
Render seguro sin imágenes.

**API:** `<ProductGallery images={[{id,url,alt}]} initialIndex={0} className />`.
**Tests:** `ProductGallery.test.jsx` (12) + el suite de `ProductPage` sigue verde.

---

## UC-ADM-IMG — Subida de imágenes con preview

| Campo | Valor |
|-------|-------|
| Actor | Staff/Admin (y comprador para avatar) |
| Referencia | KendoReact Upload (`kno-react-upload`) |
| Componente | `src/components/common/FileUpload/` |
| Integración prevista | `AdminProductDetailPage` (imágenes de producto), `ProfilePage` (avatar) |
| Estado | COMPONENTE HECHO; integración en páginas: PENDIENTE |

**Descripción:** zona drag-and-drop + selector nativo accesible, lista de
archivos con miniatura (imágenes), tamaño y botón quitar, validación por
`accept`/`maxSizeMB` con error `role="alert"`, barra de progreso opcional
controlada por prop (sin inventar una subida real). Revoca object URLs al
desmontar.

**API:** `<FileUpload accept multiple maxSizeMB onFiles progress label className />`.
**Tests:** `FileUpload.test.jsx` (6).

---

## UC-LOG-GANTT — Línea de tiempo de fulfillment

| Campo | Valor |
|-------|-------|
| Actor | Staff/Admin (logística) |
| Referencia | KendoReact Gantt (`kno-react-gantt`) |
| Componente | `src/components/common/GanttChart/` |
| Integración prevista | Vista de logística/pedido en el panel admin |
| Estado | COMPONENTE HECHO; integración en páginas: PENDIENTE |

**Descripción:** timeline horizontal con una fila por tarea/etapa; barras
posicionadas por porcentajes según `start`/`end` dentro del rango, relleno de
`progress`, eje temporal con marcas y marcador de "hoy". Accesible
(`role="figure"`, barras `role="img"` con `aria-label`). Render seguro vacío.

**API:** `<GanttChart tasks={[{id,name,start,end,progress}]} rangeStart rangeEnd ticks showToday className />`.
**Tests:** `GanttChart.test.jsx` (9).

---

## UC-ORD-PDF — Ver/descargar factura o ficha en PDF

| Campo | Valor |
|-------|-------|
| Actor | Comprador (factura), Staff (fichas) |
| Referencia | KendoReact PDF Viewer (`kno-react-pdf-viewer`) |
| Componente | `src/components/common/PdfViewer/` |
| Integración prevista | `OrderDetailPage` (factura del pedido), fichas técnicas de producto |
| Estado | COMPONENTE HECHO; integración + fuente del PDF: PENDIENTE |

**Descripción:** visor nativo que embebe un PDF por URL en un `<iframe>` con
toolbar (abrir en pestaña nueva, descargar), overlay de carga y estado vacío
accesible. Sin librerías (no parsea el PDF; lo muestra por URL).

**Decisión pendiente (fuente del PDF en DEMO_MODE):** generación en cliente
(requeriría una lib), asset PDF mock servido por MSW/estático, o backend real.
Hasta decidir, el componente queda disponible para recibir una `url`.

**API:** `<PdfViewer url title height className />`.
**Tests:** `PdfViewer.test.jsx` (6).
