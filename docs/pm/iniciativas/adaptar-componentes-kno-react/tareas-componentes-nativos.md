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
| F2-T3 | Test AdminProductDetailPage upload (crear, no existía) | UC-ADM-IMG | Pendiente |
| F2-T4 | Test ProfilePage avatar (crear, no existía) | UC-ACC-AVATAR | Pendiente |
| F3-T1 | Asset public/mock/factura-demo.pdf | UC-ORD-PDF | Hecha |
| F3-T2 | webpack copia public/mock a dist/mock | UC-ORD-PDF | Hecha |
| F3-T3 | order mock invoice_url (+ tipo Order) | UC-ORD-PDF | Hecha |
| F3-T4 | PdfViewer en OrderDetailPage | UC-ORD-PDF | Hecha |
| F3-T5 | Test OrderDetailPage visor factura | UC-ORD-PDF | Hecha |
| F4-T1 | order mock fulfillment_stages (+ tipo) | UC-LOG-GANTT | Hecha |
| F4-T2 | GanttChart en AdminOrderDetailPage | UC-LOG-GANTT | Hecha |
| F4-T3 | Test AdminOrderDetailPage gantt | UC-LOG-GANTT | Hecha |
| F5-T1 | (C) SortableList + test | UC-ADM-SORT | Hecha |
| F5-T2 | (I) SortableList en AdminProductDetailPage | UC-ADM-SORT | Pendiente |
| F5-T3 | (T) reorderProductImages | UC-ADM-SORT | Pendiente |
| F5-T4 | (C) RichTextEditor + test | UC-ADM-RTE | Hecha |
| F5-T5 | (I) RTE en AdminProductForm | UC-ADM-RTE | Pendiente |
| F5-T6 | (I) RTE en AdminStaticPageEditorPage | UC-ADM-RTE | Pendiente |
| F5-T7 | (T) tests RTE en ambas páginas | UC-ADM-RTE | Pendiente |
| F5-T8 | (C) utils/exportSheet (CSV) + test | UC-ADM-XLSX | Hecha |
| F5-T9 | (I) Export en AdminOrdersPage | UC-ADM-XLSX | Pendiente |
| F5-T10 | (I) Export en AdminReportPage | UC-ADM-XLSX | Pendiente |
| F5-T11 | (T) tests export | UC-ADM-XLSX | Pendiente |
| F5-T12 | (C) KanbanBoard + test | UC-ADM-KANBAN | Hecha |
| F5-T13 | (I) Kanban en AdminOrdersDashboardPage | UC-ADM-KANBAN | Pendiente |
| F5-T14 | (T) mover tarjeta cambia estado | UC-ADM-KANBAN | Pendiente |
| F5-T15 | (C) TreeView + test | UC-CAT-TREE | Hecha |
| F5-T16 | (D) jerarquía categorías en mock | UC-CAT-TREE | Pendiente |
| F5-T17 | (I) TreeView en CatalogFilters | UC-CAT-TREE | Pendiente |
| F5-T18 | (T) seleccionar nodo actualiza ?category | UC-CAT-TREE | Pendiente |
| F6-T1..T19 | Tier B: 6 UCs (componente+integración+test) | varios | Pendiente |
| F7-T1..T21 | Tier C: 7 UCs (componente+integración+test) | varios | Pendiente |
| F8-T1..T21 | Checks E2E (07–27), uno por integración | todos | Pendiente |
| F9-T1..T6 | Verificación final + docs + commits/push + decisiones | — | Pendiente |

## Resumen de avance

- **Componentes nativos (C):** 9 de ~25 hechos — F1 (4) + Tier A (5), todos con TDD.
- **Integraciones:** ProductGallery (F1-T5), PdfViewer (F3), GanttChart (F4) hechas.
- **Suite:** 1447 passed / 0 fallos. check-scss 157 clean. build:demo OK.
- **Siguiente:** F2 (FileUpload), luego integrar Tier A (F5-I/T), Tier B (F6), Tier C (F7).
