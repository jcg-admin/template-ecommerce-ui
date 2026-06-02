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
| UC-ORD-PDFGEN | (generación PDF en cliente) | Diferida (requiere lib; decisión) |

## F8 — E2E (browser real)

| Tarea | Estado |
|-------|--------|
| Checks 01-06 (storefront, bugs previos) | Hecha (5 pass, 1 warn, 0 fail) |
| Checks 07-10 (gallery, list-toggle, freeship, faq) | En curso |
| Checks admin (kanban, gauge, pivot, sheet, treelist, grid, rte, sort, map, chat, duallist, scheduler, export) | Diferidos — ver decisiones (cobertura unitaria completa; E2E admin frágil) |

## F9 — Cierre

| Tarea | Estado |
|-------|--------|
| Docs (ucs/tareas/progreso/index) | En curso |
| decisiones-componentes-nativos.md | Pendiente |
| Saldar deuda menor documentada | Pendiente |
| Verificación final + push | En curso (1626 passed, scss 169 clean, build OK) |
