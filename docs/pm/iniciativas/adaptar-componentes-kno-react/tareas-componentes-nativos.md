# Tareas — componentes nativos (adaptar-componentes-kno-react)

Lista plana de tareas atómicas. Detalle en `plan-componentes-nativos.md`.
(C)=componente+test, (D)=datos/mock, (I)=integración, (T)=test de integración.

## Componentes (todos con TDD red→green)

| Tier | Componentes | Estado |
|------|-------------|--------|
| F1 | ProductGallery, FileUpload, GanttChart, PdfViewer | Hecha |
| Tier A | SortableList, RichTextEditor, exportSheet, KanbanBoard, TreeView | Hecha |
| Tier B | ViewToggle, ProgressBar, DeliveryScheduler, Accordion, DataGrid, TreeList | Hecha |
| Tier C | Gauge, CoverageMap, ChatWidget, DataSheet, PivotTable, DualListBox | Hecha |

## Integraciones (22 UCs)

| UC | Componente → Página | Estado |
|----|----------------------|--------|
| UC-CAT-GAL | ProductGallery → ProductPage | Hecha |
| UC-ADM-IMG | FileUpload → AdminProductDetailPage | Hecha |
| UC-ACC-AVATAR | FileUpload → ProfilePage | Hecha |
| UC-LOG-GANTT | GanttChart → AdminOrderDetailPage | Hecha |
| UC-ORD-PDF | PdfViewer → OrderDetailPage (+ asset PDF mock) | Hecha |
| UC-ADM-SORT | SortableList → AdminProductDetailPage | Hecha |
| UC-ADM-RTE | RichTextEditor → AdminProductForm + AdminStaticPageEditorPage | Hecha |
| UC-ADM-XLSX | exportSheet → AdminOrdersPage + AdminReportSalesPage | Hecha |
| UC-ADM-KANBAN | KanbanBoard → AdminOrdersDashboardPage | Hecha |
| UC-CAT-TREE | TreeView → CatalogFilters | Hecha |
| UC-CAT-LIST | ViewToggle → CatalogPage | Hecha |
| UC-CHT-FREESHIP | ProgressBar → CartPage | Hecha |
| UC-CHT-SCHED | DeliveryScheduler → CheckoutPage | Hecha |
| UC-CAT-FAQ | Accordion → ProductPage | Hecha |
| UC-ADM-GRID | DataGrid → AdminUsersPage | Hecha |
| UC-ADM-TREELIST | TreeList → AdminCategoriesPage | Hecha |
| UC-ADM-GAUGE | Gauge → AdminDashboardPage | Hecha |
| UC-LOG-MAP | CoverageMap → AdminLogisticsPage | Hecha |
| UC-SUP-CHAT | ChatWidget → ContactPage | Hecha |
| UC-ADM-PIVOT | PivotTable → AdminReportSalesPage | Hecha |
| UC-ADM-SHEET | DataSheet → AdminPriceSyncPage | Hecha |
| UC-ADM-LISTBOX | DualListBox → AdminProductForm | Hecha |
| UC-ORD-PDFGEN | generateInvoicePdf (jsPDF) → OrderDetailPage | Hecha (lib jspdf aprobada) |

(Las 23 UCs integradas; ninguna diferida.)

## F8 — E2E (browser real) · HECHA

| Tarea | Estado |
|-------|--------|
| Checks storefront (login, wishlist, cart, search, paginator, gallery, list-toggle, freeship, faq, support-chat, checkout-scheduler) | Hecha |
| Checks admin (gauge, export, users, kanban, treelist, price-sheet, report-pivot, rte, duallist, sort, logistics-map) | Hecha (navegación client-side `navigateInApp`) |
| **Total: 23 checks → 17 pass / 6 warn / 0 fail** | Los 6 WARN son límites de datos/demo |

## F9 — Cierre · HECHA

| Tarea | Estado |
|-------|--------|
| Docs (ucs/tareas/progreso/index) | Hecha |
| decisiones-componentes-nativos.md (4 secciones) | Hecha |
| Saldar deuda menor (documentada como decisiones aceptadas) | Hecha |
| Verificación final + push | Hecha (jest verde, scss 169 clean, build OK, E2E 0 fail) |

**Plan completo: 22 componentes + 23 integraciones (incl. UC-ORD-PDFGEN),
E2E storefront + admin, sin diferidos.**
