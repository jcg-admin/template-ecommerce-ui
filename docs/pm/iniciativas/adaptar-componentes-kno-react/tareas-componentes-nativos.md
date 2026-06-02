# Tareas — componentes nativos (adaptar-componentes-kno-react)

Lista plana de tareas atómicas (una por archivo). Detalle en
`plan-componentes-nativos.md`. (C)=componente+test, (D)=datos/mock,
(I)=integración, (T)=test de integración.

| ID | Descripción | UC | Estado |
|----|-------------|----|--------|
| F1-T1 | Componente ProductGallery + test | UC-CAT-GAL | Hecha |
| F1-T2 | Componente FileUpload + test | UC-ADM-IMG/AVATAR | Hecha |
| F1-T3 | Componente GanttChart + test | UC-LOG-GANTT | Hecha |
| F1-T4 | Componente PdfViewer + test | UC-ORD-PDF | Hecha |
| F1-T5 | Integrar ProductGallery en ProductPage | UC-CAT-GAL | Hecha |
| F2-T1 | FileUpload en AdminProductDetailPage | UC-ADM-IMG | Pendiente |
| F2-T2 | FileUpload en ProfilePage (avatar) | UC-ACC-AVATAR | Pendiente |
| F2-T3 | Test AdminProductDetailPage upload | UC-ADM-IMG | Pendiente |
| F2-T4 | Test ProfilePage avatar | UC-ACC-AVATAR | Pendiente |
| F3-T1 | Asset public/mock/factura-demo.pdf | UC-ORD-PDF | Pendiente |
| F3-T2 | webpack copia public/mock a dist/mock | UC-ORD-PDF | Pendiente |
| F3-T3 | order mock invoice_url | UC-ORD-PDF | Pendiente |
| F3-T4 | PdfViewer en OrderDetailPage | UC-ORD-PDF | Pendiente |
| F3-T5 | Test OrderDetailPage visor factura | UC-ORD-PDF | Pendiente |
| F4-T1 | order mock fulfillment_stages | UC-LOG-GANTT | Pendiente |
| F4-T2 | GanttChart en AdminOrderDetailPage | UC-LOG-GANTT | Pendiente |
| F4-T3 | Test AdminOrderDetailPage gantt | UC-LOG-GANTT | Pendiente |
| F5-T1 | (C) SortableList + test | UC-ADM-SORT | Pendiente |
| F5-T2 | (I) SortableList en AdminProductDetailPage | UC-ADM-SORT | Pendiente |
| F5-T3 | (T) reorderProductImages | UC-ADM-SORT | Pendiente |
| F5-T4 | (C) RichTextEditor + test | UC-ADM-RTE | Pendiente |
| F5-T5 | (I) RTE en AdminProductForm | UC-ADM-RTE | Pendiente |
| F5-T6 | (I) RTE en AdminStaticPageEditorPage | UC-ADM-RTE | Pendiente |
| F5-T7 | (T) tests RTE en ambas páginas | UC-ADM-RTE | Pendiente |
| F5-T8 | (C) utils/exportSheet (CSV) + test | UC-ADM-XLSX | Pendiente |
| F5-T9 | (I) Export en AdminOrdersPage | UC-ADM-XLSX | Pendiente |
| F5-T10 | (I) Export en AdminReportPage | UC-ADM-XLSX | Pendiente |
| F5-T11 | (T) tests export | UC-ADM-XLSX | Pendiente |
| F5-T12 | (C) KanbanBoard + test | UC-ADM-KANBAN | Pendiente |
| F5-T13 | (I) Kanban en AdminOrdersDashboardPage | UC-ADM-KANBAN | Pendiente |
| F5-T14 | (T) mover tarjeta cambia estado | UC-ADM-KANBAN | Pendiente |
| F5-T15 | (C) TreeView + test | UC-CAT-TREE | Pendiente |
| F5-T16 | (D) jerarquía categorías en mock | UC-CAT-TREE | Pendiente |
| F5-T17 | (I) TreeView en CatalogFilters | UC-CAT-TREE | Pendiente |
| F5-T18 | (T) seleccionar nodo actualiza ?category | UC-CAT-TREE | Pendiente |
| F6-T1 | (C) ViewToggle + test | UC-CAT-LIST | Pendiente |
| F6-T2 | (I) toggle lista/grid en CatalogPage | UC-CAT-LIST | Pendiente |
| F6-T3 | (T) cambio de layout | UC-CAT-LIST | Pendiente |
| F6-T4 | (C) ProgressBar + test | UC-CHT-FREESHIP | Pendiente |
| F6-T5 | (I) envío gratis en CartPage | UC-CHT-FREESHIP | Pendiente |
| F6-T6 | (T) mensaje/relleno por subtotal | UC-CHT-FREESHIP | Pendiente |
| F6-T7 | (C) DeliveryScheduler + test | UC-CHT-SCHED | Pendiente |
| F6-T8 | (D) slots de entrega mock | UC-CHT-SCHED | Pendiente |
| F6-T9 | (I) paso fecha en CheckoutPage | UC-CHT-SCHED | Pendiente |
| F6-T10 | (T) elegir slot | UC-CHT-SCHED | Pendiente |
| F6-T11 | (C) Accordion + test | UC-CAT-FAQ | Pendiente |
| F6-T12 | (I) FAQ en ProductPage | UC-CAT-FAQ | Pendiente |
| F6-T13 | (T) expandir muestra respuesta | UC-CAT-FAQ | Pendiente |
| F6-T14 | (C) DataGrid + test | UC-ADM-GRID | Pendiente |
| F6-T15 | (I) DataGrid en AdminTablePage/listado | UC-ADM-GRID | Pendiente |
| F6-T16 | (T) orden/filtro/página | UC-ADM-GRID | Pendiente |
| F6-T17 | (C) TreeList + test | UC-ADM-TREELIST | Pendiente |
| F6-T18 | (I) TreeList en AdminCategoriesPage | UC-ADM-TREELIST | Pendiente |
| F6-T19 | (T) árbol + acción fila | UC-ADM-TREELIST | Pendiente |
| F7-T1 | (C) Gauge + test | UC-ADM-GAUGE | Pendiente |
| F7-T2 | (I) Gauges en AdminDashboardPage | UC-ADM-GAUGE | Pendiente |
| F7-T3 | (T) render por valor | UC-ADM-GAUGE | Pendiente |
| F7-T4 | (C) CoverageMap (SVG) + test | UC-LOG-MAP | Pendiente |
| F7-T5 | (D) zonas mock | UC-LOG-MAP | Pendiente |
| F7-T6 | (I) mapa en AdminLogisticsPage | UC-LOG-MAP | Pendiente |
| F7-T7 | (T) render de zonas | UC-LOG-MAP | Pendiente |
| F7-T8 | (C) ChatWidget + test | UC-SUP-CHAT | Pendiente |
| F7-T9 | (D) endpoint chat mock | UC-SUP-CHAT | Pendiente |
| F7-T10 | (I) widget en layout/SupportPage | UC-SUP-CHAT | Pendiente |
| F7-T11 | (T) enviar mensaje | UC-SUP-CHAT | Pendiente |
| F7-T12 | Generación PDF en cliente | UC-ORD-PDFGEN | Bloqueada (decisión: lib) |
| F7-T13 | (C) PivotTable + test | UC-ADM-PIVOT | Pendiente |
| F7-T14 | (I) pivote en AdminReportPage | UC-ADM-PIVOT | Pendiente |
| F7-T15 | (T) suma por celda | UC-ADM-PIVOT | Pendiente |
| F7-T16 | (C) DataSheet + test | UC-ADM-SHEET | Pendiente |
| F7-T17 | (I) hoja en AdminPriceSyncPage | UC-ADM-SHEET | Pendiente |
| F7-T18 | (T) editar celda | UC-ADM-SHEET | Pendiente |
| F7-T19 | (C) DualListBox + test | UC-ADM-LISTBOX | Pendiente |
| F7-T20 | (I) tags en AdminProductForm | UC-ADM-LISTBOX | Pendiente |
| F7-T21 | (T) mover ítem | UC-ADM-LISTBOX | Pendiente |
| F8-T1..T21 | Checks E2E (07–27), uno por integración | todos | Pendiente |
| F9-T1..T6 | Verificación final + docs + commits/push + decisiones | — | Pendiente |
