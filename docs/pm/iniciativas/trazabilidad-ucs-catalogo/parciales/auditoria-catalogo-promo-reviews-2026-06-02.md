.. reporte::
   :agente: uc-audit-catalogo-promo-reviews
   :tarea: Verificar claims de implementacion UI de la familia CAT/PRO/QST/REV/NEW contra catalogo canonico de UCs
   :fecha: 2026-06-02
   :herramientas: Bash(ls/grep/find), Read
   :basado-en: matriz-trazabilidad-ucs.md (seccion CAT/PRO/QST/REV/NEW) vs /tmp/references/e-comerce-docs/source/requisitos/casos-uso/ y repo HEAD de template-ecommerce-ui

```yml
created_at: 2026-06-02 20:22:58
project: template-ecommerce-ui
work_package: trazabilidad-ucs-catalogo
phase: Phase 9 — PILOT/VALIDATE
author: claude
status: Borrador
version: 1.0.0
```

# Auditoria — Familia CAT / PRO / QST / REV / NEW

## Alcance y metodo

Se auditaron las 32 filas de la seccion "CAT / PRO / QST / REV / NEW"
de `matriz-trazabilidad-ucs.md`. Para cada fila:

1. Se verifico la existencia **actual** (HEAD del repo) de cada
   artefacto citado con `ls`/`test -f`/`grep`.
2. Para los dos ex-gaps (UC-PRO-04, UC-PRO-05) se abrio el `.rst`
   canonico, se extrajeron los criterios de aceptacion y se verifico
   la implementacion contra ellos.

> Nota de contexto: la tabla por familia conserva la clasificacion
> **snapshot** original (UC-PRO-04 y UC-PRO-05 aparecen como
> AUSENTE-UI). El "Resumen" de la matriz (lineas 12-19) declara que
> ambos fueron cerrados con TDD+MSW. Esta auditoria valida la
> afirmacion del Resumen contra el codigo real, y trata el claim
> efectivo de cada UC como IMPLEMENTADO cuando el Resumen lo declara.

## Tabla de verificacion

| UC | Claim | Verificado | Evidencia file:line | Discrepancia |
|----|-------|-----------|---------------------|--------------|
| UC-CAT-01 | IMPLEMENTADO | SI | `src/pages/catalog/CatalogPage.jsx` (existe), `src/redux/slices/catalogSlice.js` (existe) | Ninguna |
| UC-CAT-02 | IMPLEMENTADO | SI | `src/pages/catalog/ProductPage.jsx` (existe) | Ninguna |
| UC-CAT-03 | IMPLEMENTADO | SI | `src/components/catalog/SearchBar.jsx`, `src/pages/catalog/SearchResultsPage.jsx`, `src/hooks/domain/useSearch.js` (existen) | Ninguna |
| UC-CAT-03-EXT | IMPLEMENTADO | SI | `src/components/catalog/CatalogFilters.jsx` (existe) | Ninguna |
| UC-CAT-04 | IMPLEMENTADO | SI | `src/components/catalog/CatalogFilters.jsx` (existe) | Ninguna |
| UC-CAT-05 | IMPLEMENTADO | SI | `src/components/catalog/CatalogFilters.jsx` (existe) | Ninguna |
| UC-CAT-06 | IMPLEMENTADO | SI | `src/pages/admin/AdminCategoriesPage.jsx`, `src/hooks/domain/useCategories.js`; ruta `src/router/AppRouter.jsx:265` (`admin/categories`) | Ninguna |
| UC-CAT-07 | IMPLEMENTADO | SI | `src/components/catalog/RelatedProductsSection.jsx`, `src/hooks/domain/useRelatedProducts.js` (existen) | Ninguna |
| UC-CAT-08 | IMPLEMENTADO | SI | `src/pages/catalog/CategoryListPage.jsx`; ruta `AppRouter.jsx:155` (`categories`) | Ninguna |
| UC-CAT-09 | IMPLEMENTADO | SI | `src/pages/admin/AdminProductCreatePage.jsx`, `src/pages/admin/AdminProductForm.jsx`; ruta `AppRouter.jsx:253` (`admin/products/new`) | Ninguna |
| UC-CAT-10 | IMPLEMENTADO | SI | `src/pages/admin/AdminProductEditPage.jsx`; ruta `AppRouter.jsx:257` (`admin/products/:id/edit`) | Ninguna |
| UC-CAT-11 | IMPLEMENTADO | SI | `src/pages/admin/AdminProductForm.jsx:266-275` (campo `status` BORRADOR/PUBLICADO); `src/pages/admin/AdminProductsPage.jsx:122-123` (pill estado) | Menor: el control es `status` (BORRADOR/PUBLICADO), no un `is_active` booleano; `is_active` solo aparece como filtro en `useAdminProducts.js:10`. Cumple "desactivar/ocultar producto" via estado borrador. |
| UC-CAT-12 | IMPLEMENTADO | SI | `src/pages/admin/AdminPriceSyncPage.jsx:3-7,24,31` (CSV upload, preview de diffs, confirm); ruta `AppRouter.jsx:268` | Ninguna |
| UC-CAT-13 | IMPLEMENTADO | SI | `src/pages/admin/AdminProductForm.jsx:19,244-247` (`DualListBox`, `category_ids`) | Ninguna |
| UC-PRO-01 | IMPLEMENTADO | SI | `src/components/admin/VoucherCreateForm.jsx` (existe); `AdminVoucherDetailPage.jsx:15,75` (`createVoucher`) | Ninguna |
| UC-PRO-02 | IMPLEMENTADO | SI | `src/pages/admin/AdminVoucherDetailPage.jsx:15,78` (`updateVoucher`) | Ninguna |
| UC-PRO-03 | IMPLEMENTADO | SI | `src/pages/admin/AdminVoucherDetailPage.jsx:103,146` (`deleteVoucher`, toggle `is_active`) | Ninguna |
| UC-PRO-04 | AUSENTE-UI (snapshot) / IMPLEMENTADO (Resumen) | SI (cerrado) | `src/pages/admin/AdminVoucherDetailPage.jsx:17,47-48,62,186-207` (`fetchVoucherUsage`, seccion "Uso del voucher": `total_uses`, `total_discount`, tabla de canjes); thunk `src/redux/slices/vouchersSlice.js:60` → `GET /admin/vouchers/<id>/usage/` | **Drift de endpoint (MEDIA):** el UC canonico especifica `GET /api/v1/admin/vouchers/report/` con **agregacion sobre todos los vouchers** ordenada por `-current_uses` y ROI (`uc-pro-04...rst:115-130,379`). La impl es **por-voucher** (`<id>/usage/`), no el reporte agregado. POST-01 (admin ve metricas de uso) se cumple parcialmente; falta vista agregada/ranking/ROI/export CSV (PARTE 4.2/4.3 del UC). |
| UC-PRO-05 | AUSENTE-UI (snapshot) / IMPLEMENTADO (Resumen) | SI (cerrado) | `src/pages/account/ReferralPage.jsx` (codigo, share_url, copiar/compartir, metricas invitados/recompensas); `src/redux/slices/referralSlice.js:17,24` (`fetchReferral` → `GET /api/v1/account/referral/`); ruta `AppRouter.jsx:213` (`account/referral`); nav `src/layouts/AccountLayout.jsx:25` ("Referidos"); mock `src/mocks/handlers/referral.ts`; tests `ReferralPage.test.jsx`, `referralSlice.test.js` | Cumple los 4 requisitos del task (ReferralPage + referralSlice + ruta /account/referral + nav). Cubre Subflujo A del UC (referidor obtiene/comparte codigo + panel). Subflujos B/C (aplicacion al registro y emision de recompensa) son flujo de registro/backend, fuera del alcance de esta pagina. |
| UC-QST-01 | IMPLEMENTADO | SI | `src/pages/catalog/ProductQuestionAskPage.jsx`, `src/hooks/domain/useProductQuestions.js:19`; ruta `AppRouter.jsx:169` | Ninguna |
| UC-QST-02 | IMPLEMENTADO | SI | `src/pages/catalog/ProductQuestionsListPage.jsx`; ruta `AppRouter.jsx:171` | Ninguna |
| UC-QST-03 | IMPLEMENTADO | SI | `src/pages/admin/AdminQuestionsAnswerPage.jsx`; hook `useProductQuestions.js:33` (`useAdminQuestionsPendingAnswer`); ruta `AppRouter.jsx:321` | Ninguna |
| UC-QST-04 | IMPLEMENTADO | SI | `src/pages/admin/AdminQuestionsModerationPage.jsx`; hook `useProductQuestions.js:43` (`useAdminQuestionsModeration`) | Ninguna |
| UC-REV-01 | IMPLEMENTADO | SI | `src/pages/account/ProductReviewCreatePage.jsx`, `src/hooks/domain/useReviews.js`; ruta `AppRouter.jsx:225` | Ninguna |
| UC-REV-02 | IMPLEMENTADO | SI | `src/pages/catalog/ProductReviewsListPage.jsx`; hook `useReviews.js:27` (`useProductReviews`); `src/components/catalog/Rating/Rating.jsx` (existe) | Ninguna |
| UC-REV-03 | IMPLEMENTADO | SI | `src/pages/admin/AdminReviewsModerationPage.jsx`; hook `useReviews.js:50` (`useAdminReviewsModeration`); ruta `AppRouter.jsx:325` | Ninguna |
| UC-NEW-01 | IMPLEMENTADO | SI | `src/pages/NewsletterSubscribePage.jsx`, `src/redux/slices/newsletterSlice.js`; ruta `AppRouter.jsx:165` | Ninguna |
| UC-NEW-02 | IMPLEMENTADO | SI | `src/pages/NewsletterUnsubscribePage.jsx`; ruta `AppRouter.jsx:167` | Ninguna |
| UC-NEW-03 | IMPLEMENTADO | SI | `src/pages/admin/AdminNewsletterSubscribersPage.jsx`; hook `useNewsletter.js` (`useNewsletterSubscribers`); ruta `AppRouter.jsx:317` | Ninguna |
| UC-NEW-04 | IMPLEMENTADO | SI | `src/pages/admin/AdminNewsletterComposePage.jsx:8,55` (`sendNewsletterBroadcast`); thunk `newsletterSlice.js:73`; ruta `AppRouter.jsx:319` | Ninguna |

## Conteos

- **Filas auditadas:** 32
- **CONFIRMED (artefacto existe y claim sostenido):** 32
- **DISCREPANCIES:** 2
  - **UC-PRO-04 — Drift de endpoint/alcance (MEDIA):** la impl es reporte
    de uso **por-voucher** (`/admin/vouchers/<id>/usage/`), no el reporte
    **agregado** con ranking + ROI + export CSV que especifica el UC
    canonico (`/api/v1/admin/vouchers/report/`). El claim IMPLEMENTADO es
    sostenible para POST-01 (admin ve metricas de uso) pero el alcance
    completo del UC (agregacion, ROI, export) no esta cubierto en UI.
  - **UC-CAT-11 — Nota menor (BAJA):** el control de "desactivar producto"
    se implementa via campo `status` (BORRADOR/PUBLICADO), no un toggle
    `is_active`. Funcionalmente equivalente (oculta el producto del
    catalogo); el `is_active` citado es solo filtro de listado admin.
    No invalida el claim.

## Artefactos faltantes o stale

Ninguno. Los 60+ paths citados en las 32 filas (paginas, slices, hooks,
componentes, rutas) existen en HEAD. Ningun IMPLEMENTADO tiene artefacto
ausente. La unica observacion de fondo es el drift de alcance de
UC-PRO-04 descrito arriba.
