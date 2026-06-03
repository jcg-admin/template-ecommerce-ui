## CAT / PRO / QST / REV / NEW

| UC | Título | Estado | Evidencia / Motivo |
| --- | --- | --- | --- |
| UC-CAT-01 | Ver catálogo | IMPLEMENTADO | `src/pages/catalog/CatalogPage.jsx`, `src/redux/slices/catalogSlice.js` (grid + `fetchProducts`). |
| UC-CAT-02 | Ver detalle | IMPLEMENTADO | `src/pages/catalog/ProductPage.jsx` (galería, variantes, descripción). |
| UC-CAT-03 | Buscar productos | IMPLEMENTADO | `src/components/catalog/SearchBar.jsx`, `src/pages/catalog/SearchResultsPage.jsx`, `src/hooks/domain/useSearch.js`. |
| UC-CAT-03-EXT | Ext: buscar con filtros avanzados | IMPLEMENTADO | `src/components/catalog/CatalogFilters.jsx` (categoría + rango de precio sobre la búsqueda, estado en URL). |
| UC-CAT-04 | Filtrar por categoría | IMPLEMENTADO | `src/components/catalog/CatalogFilters.jsx` (selección de slug del árbol), thunk `fetchProducts({ category })`. |
| UC-CAT-05 | Filtrar por precio | IMPLEMENTADO | `src/components/catalog/CatalogFilters.jsx` (`price_min` / `price_max`). |
| UC-CAT-06 | Gestionar categorías (admin) | IMPLEMENTADO | `src/pages/admin/AdminCategoriesPage.jsx`, `src/hooks/domain/useCategories.js`, ruta `admin/categories`. |
| UC-CAT-07 | Ver productos relacionados | IMPLEMENTADO | `src/components/catalog/RelatedProductsSection.jsx`, `src/hooks/domain/useRelatedProducts.js`. |
| UC-CAT-08 | Listar categorías | IMPLEMENTADO | `src/pages/catalog/CategoryListPage.jsx` (árbol público), ruta `categories`. |
| UC-CAT-09 | Crear producto (admin) | IMPLEMENTADO | `src/pages/admin/AdminProductCreatePage.jsx` + `AdminProductForm.jsx`, ruta `admin/products/new`. |
| UC-CAT-10 | Editar producto (admin) | IMPLEMENTADO | `src/pages/admin/AdminProductEditPage.jsx` + `AdminProductForm.jsx`, ruta `admin/products/:id/edit`. |
| UC-CAT-11 | Desactivar producto (admin) | IMPLEMENTADO | `src/pages/admin/AdminProductForm.jsx` / `AdminProductsPage.jsx` (estado activo del producto), `src/hooks/domain/useAdminProducts.js`. |
| UC-CAT-12 | Sincronizar precios | IMPLEMENTADO | `src/pages/admin/AdminPriceSyncPage.jsx` (carga CSV, preview de diffs, confirmación), ruta `admin/price-sync`. |
| UC-CAT-13 | Asignar múltiples categorías | IMPLEMENTADO | `src/pages/admin/AdminProductForm.jsx` (`DualListBox`, campo `category_ids`). |
| UC-PRO-01 | Crear voucher (admin) | IMPLEMENTADO | `src/components/admin/VoucherCreateForm.jsx` (`createVoucher`), `src/pages/admin/AdminVoucherDetailPage.jsx`. |
| UC-PRO-02 | Editar voucher (admin) | IMPLEMENTADO | `src/pages/admin/AdminVoucherDetailPage.jsx` (`updateVoucher` / PATCH). |
| UC-PRO-03 | Desactivar voucher (admin) | IMPLEMENTADO | `src/pages/admin/AdminVoucherDetailPage.jsx` (toggle `is_active` + `deleteVoucher`). |
| UC-PRO-04 | Reporte de uso de vouchers | AUSENTE-UI | Sólo se muestran contadores inline (`current_uses / max_uses`) en `AdminVouchersPage.jsx` / `AdminVoucherDetailPage.jsx`. No existe vista de métricas (usos totales, descuento otorgado, impacto en ventas); ningún `AdminReport*` referencia vouchers. |
| UC-PRO-05 | Código referral | AUSENTE-UI | Sin coincidencias de `referral`/`referido` en lógica de promociones; los únicos matches son no relacionados (PdfViewer, securityConfig, páginas de orden). No hay UI ni hook de referidos. |
| UC-QST-01 | Hacer pregunta | IMPLEMENTADO | `src/pages/catalog/ProductQuestionAskPage.jsx`, `src/hooks/domain/useProductQuestions.js`, ruta `catalog/:productId/ask`. |
| UC-QST-02 | Ver preguntas | IMPLEMENTADO | `src/pages/catalog/ProductQuestionsListPage.jsx`, `useProductQuestions`, ruta `catalog/:productId/questions`. |
| UC-QST-03 | Responder pregunta (admin) | IMPLEMENTADO | `src/pages/admin/AdminQuestionsAnswerPage.jsx`, `useAdminQuestionsPendingAnswer`, ruta `admin/questions/answer`. |
| UC-QST-04 | Moderar preguntas (admin) | IMPLEMENTADO | `src/pages/admin/AdminQuestionsModerationPage.jsx` (approve/reject), `useAdminQuestionsModeration`. |
| UC-REV-01 | Dejar reseña | IMPLEMENTADO | `src/pages/account/ProductReviewCreatePage.jsx`, `src/hooks/domain/useReviews.js`, ruta `account/orders/:orderId/products/:productId/review`. |
| UC-REV-02 | Ver reseñas | IMPLEMENTADO | `src/pages/catalog/ProductReviewsListPage.jsx`, `useProductReviews`, `src/components/catalog/Rating/Rating.jsx`. |
| UC-REV-03 | Moderar reseñas (admin) | IMPLEMENTADO | `src/pages/admin/AdminReviewsModerationPage.jsx`, `useAdminReviewsModeration`, ruta `admin/reviews/moderation`. |
| UC-NEW-01 | Suscribirse | IMPLEMENTADO | `src/pages/NewsletterSubscribePage.jsx`, `src/redux/slices/newsletterSlice.js`, ruta `newsletter`. |
| UC-NEW-02 | Desuscribirse | IMPLEMENTADO | `src/pages/NewsletterUnsubscribePage.jsx`, ruta `newsletter/unsubscribe`. |
| UC-NEW-03 | Gestionar suscriptores | IMPLEMENTADO | `src/pages/admin/AdminNewsletterSubscribersPage.jsx`, `useNewsletterSubscribers`, ruta `admin/newsletter/subscribers`. |
| UC-NEW-04 | Enviar campaña newsletter | IMPLEMENTADO | `src/pages/admin/AdminNewsletterComposePage.jsx` (compone/programa/envía vía `sendNewsletterBroadcast`), ruta `admin/newsletter/compose`. El envío de emails es backend, pero la composición/disparo en UI existe. |
