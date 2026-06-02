.. reporte::
   :agente: drift-auditor (read-only)
   :tarea: DRIFT catalogue/reviews/questions/chartsize — UI vs backend real
   :fecha: 2026-06-02
   :herramientas: Bash, Read, Grep
   :basado-en: api@d0cba50 (develop, 2026-06-02) · ui worktree HEAD (template-ecommerce-ui)

# Drift audit — catalogue / reviews / questions / chartsize

READ-ONLY. Compara el layer catalogue/reviews/questions/chartsize de la UI
contra el backend Django real (`/tmp/references/e-comerce/api/practicayoruba`,
branch `develop`, api short SHA **d0cba50**).

Mounts verificados en `config/urls.py` (segun enunciado): `api/v1/catalogue/`
-> catalogue.urls + chartsize.urls; `api/v1/` -> browse_public_urls;
`api/v1/products/` -> browse_product_urls + reviews.urls + questions.urls;
`api/v1/admin/` -> catalogue.admin_urls + browse_admin_urls + chartsize.admin_urls
+ reviews.admin_urls + questions.admin_urls.

Severidad: **ALTA** = rompe la llamada (404 / 400 / campo requerido ausente).
**MEDIA** = campo no expuesto / desalineado pero con fallback graceful.
**BAJA** = campo extra ignorado por el backend (no rompe).

---

## Tabla de drift

| UI file:line | UI endpoint/field | api file:line | Real | Drift | Sev |
|---|---|---|---|---|---|
| catalogSlice.js:21 | `GET /api/v1/catalogue/` | catalogue/urls.py:17 | `'' -> CatalogueListView` | CONFIRMED | — |
| catalogSlice.js:33 | `GET /api/v1/catalogue/{slug}/` | catalogue/urls.py:25 | `<slug:slug>/ -> ProductDetailView` | CONFIRMED | — |
| catalogSlice.js:46 | `GET /api/v1/catalogue/search/` | catalogue/urls.py:19 | `search/ -> ProductSearchView` | CONFIRMED | — |
| catalogSlice.js:76 | `GET /api/v1/catalogue/?is_featured=true` | catalogue/urls.py:17 | CatalogueListView (acepta is_featured) | CONFIRMED | — |
| catalogSlice.js:98 | `GET /api/v1/categories/` | browse_public_urls.py:8 | `categories/ -> CategoryTreeView` (mount `api/v1/`) | CONFIRMED | — |
| catalogSlice.js:117,126,136 | `GET\|DELETE /api/v1/search/history/[<id>/]` | catalogue/urls.py:20-23 | `search/history/[<pk>/]` (mount `api/v1/catalogue/`) | **PATH** — UI usa `/api/v1/search/history/`, backend monta bajo `/api/v1/catalogue/search/history/` | **ALTA** |
| searchHistorySlice.js:16-17 | `DELETE /api/v1/search/history/[<id>/]` | catalogue/urls.py:20-23 | idem (real es `/api/v1/catalogue/search/history/`) | **PATH** — mismo drift que catalogSlice | **ALTA** |
| useSearchSuggestions.js:20 | `GET /api/v1/catalogue/search/suggestions/` | catalogue/urls.py:18 | `autocomplete/ -> AutocompleteView` | **PATH inventado** — no existe `search/suggestions/`; el real es `autocomplete/` | **ALTA** |
| useRelatedProducts.js:24 | `GET /api/v1/products/{slug}/related/` | browse_product_urls.py:8 | `<slug:slug>/related/ -> RelatedProductsView` | CONFIRMED | — |
| productsSlice.js:30 / adminSlice.js:890 | `POST /api/v1/admin/products/` | catalogue/admin_urls.py:15 | router `products` (ProductAdminViewSet.create) | CONFIRMED | — |
| productsSlice.js:43 / adminSlice.js:898 | `PATCH /api/v1/admin/products/{id}/` | catalogue/admin_urls.py:15 | ViewSet partial_update | CONFIRMED | — |
| adminSlice.js:882 | `GET /api/v1/admin/products/{id}/` | catalogue/admin_urls.py:15 | ViewSet retrieve | CONFIRMED | — |
| productsSlice.js:56 | `POST /api/v1/admin/products/{id}/deactivate/` | catalogue/views.py:528,534 | `@action deactivate` (ProductDeactivateAction) | CONFIRMED | — |
| productsSlice.js:69 | `POST /api/v1/admin/products/{id}/activate/` | catalogue/views.py (n/a) | **NO existe** `activate` action (solo `deactivate`, `toggle-featured`, `price-history`) | **VERB/PATH inventado** | **ALTA** |
| adminSlice.js:696 | `PATCH /api/v1/admin/products/{id}/` (is_featured) | catalogue/views.py:645 | existe `@action toggle-featured` (POST), pero PATCH al detail tambien sirve via ViewSet | CONFIRMED | — |
| useAdminProducts.js:26 / adminSlice.js:684 | `GET /api/v1/admin/products/` | catalogue/admin_urls.py:15 | ViewSet list | CONFIRMED | — |
| adminSlice.js:690 | `DELETE /api/v1/admin/products/{id}/` | catalogue/admin_urls.py:15 | ViewSet destroy | CONFIRMED | — |
| categoriesSlice.js:22 / adminSlice.js:827 | `POST /api/v1/admin/categories/` | catalogue/admin_urls.py:14 | router `categories` create | CONFIRMED | — |
| categoriesSlice.js:34 / adminSlice.js:835 | `PATCH /api/v1/admin/categories/{id}/` | catalogue/admin_urls.py:14 | ViewSet partial_update | CONFIRMED | — |
| categoriesSlice.js:46 | `POST /api/v1/admin/categories/{id}/deactivate/` | catalogue/views.py:391 | `@action deactivate` (CategoryAdminViewSet) | CONFIRMED | — |
| adminSlice.js:819 | `GET /api/v1/admin/categories/` | catalogue/admin_urls.py:14 | ViewSet list | CONFIRMED | — |
| adminSlice.js:1284 | `DELETE /api/v1/admin/categories/{id}/` | catalogue/admin_urls.py:14 | ViewSet destroy | CONFIRMED | — |
| adminSlice.js:1295 | `POST /api/v1/admin/categories/{id}/move/` | catalogue/views.py (n/a) | **NO existe** `move` action en CategoryAdminViewSet | **PATH inventado** | **ALTA** |
| productDiscountsSlice / useProductDiscounts.js:16 | `GET /api/v1/admin/product-discounts/` | catalogue/admin_urls.py:26 | `ProductDiscountListCreateView` | CONFIRMED | — |
| productVariantsSlice.js:21 / adminSlice.js:979 | `GET\|POST /api/v1/admin/products/{pid}/variants/` | chartsize/admin_urls.py:14-18 | `(?P<product_pk>)/variants` router (ProductVariantAdminViewSet) | CONFIRMED | — |
| productVariantsSlice.js:63 | `PATCH /api/v1/admin/products/{pid}/variants/{id}/` | chartsize/admin_urls.py:14-18 | ViewSet partial_update | CONFIRMED | — |
| productVariantsSlice.js:79 | `PUT /api/v1/admin/variants/{id}/price/` + body `{price}` | chartsize/admin_urls.py:31-34 / views.py:259 | `VariantPriceAdminView.put`, lee `price` | CONFIRMED | — |
| productVariantsSlice.js:94 | `DELETE /api/v1/admin/variants/{id}/price/` | chartsize/admin_urls.py:31-34 | `VariantPriceAdminView.delete` | CONFIRMED | — |
| adminSlice.js:1010,1020 | `GET\|POST /api/v1/admin/products/{pid}/variant-types/` | chartsize/admin_urls.py:20-25 | `(?P<product_pk>)/variant-types` router (VariantTypeAdminViewSet) | CONFIRMED | — |
| adminSlice.js:1031,1041 | `PATCH\|DELETE /api/v1/admin/products/{pid}/variant-types/{tid}/` | chartsize/admin_urls.py:20-25 | ViewSet update/destroy | CONFIRMED | — |
| adminSlice.js:1052,1063,1074 | `.../variant-types/{tid}/options/[{oid}/]` | chartsize/admin_urls.py (n/a) | **NO existe** sub-ruta `options/` (VariantTypeAdminViewSet sin @action options) | **PATH inventado** | **ALTA** |
| adminSlice.js:989 | `POST /api/v1/admin/products/{pid}/variants/bulk/` | chartsize (n/a) | **NO existe** action `bulk` en ProductVariantAdminViewSet | **PATH inventado** | **ALTA** |
| adminSlice.js:1000 | `POST /api/v1/admin/products/{pid}/variants/regenerate/` | chartsize (n/a) | **NO existe** action `regenerate` | **PATH inventado** | **ALTA** |
| reviewsSlice.js:37 / useReviews.js:32 | `POST\|GET /api/v1/products/{pid}/reviews/` | reviews/urls.py:14 | `ProductReviewsView` (get+post) | CONFIRMED | — |
| reviewsSlice.js:50 | `POST /api/v1/admin/reviews/{id}/approve/` | reviews/admin_urls.py:13 | `ReviewApproveView` | CONFIRMED | — |
| reviewsSlice.js:63 | `POST /api/v1/admin/reviews/{id}/reject/` + `{reason}` | reviews/admin_urls.py:15 / views.py:395 | `ReviewRejectView`, lee `reason`; default UI `CONTENIDO_INAPROPIADO` valido (models.py:32) | CONFIRMED | — |
| useReviews.js:18 | `GET /api/v1/admin/reviews/?status=PENDING_MODERATION` | reviews/views.py:307 / models.py:23 | valid set {PENDING_MODERATION, APPROVED, REJECTED} | CONFIRMED | — |
| reviewsSlice.js (payload):30-35 | review create `{order_id, rating, title, body}` | reviews/serializers.py:48-52 | `ReviewCreateSerializer` = order_id, rating, title, body | CONFIRMED | — |
| (UI no consume) | `GET .../reviews/{id}/helpful/`, `/edit/`, `/images/` | reviews/urls.py:17-25 | existen en backend; sin consumidor UI | MISSING UI (no rompe) | BAJA |
| questionsSlice.js:30 / useProductQuestions.js:24 | `POST\|GET /api/v1/products/{pid}/questions/` | questions/urls.py:9 | `ProductQuestionsView` (get+post) | CONFIRMED | — |
| questionsSlice.js:31-33 | ask payload `{body, email}` | questions/serializers.py:55-59 | `PublicQuestionCreateSerializer` = body, **asker_name**, **asker_email** | **FIELD** — UI manda `email`, backend espera `asker_email`; falta `asker_name` (requerido para anonimo -> 400) | **ALTA** |
| questionsSlice.js:46 | answer payload `{body}` | questions/serializers.py:99-102 / views.py:205-207 | `AdminAnswerSerializer` requiere `answer_body` | **FIELD** — UI manda `body`, backend exige `answer_body` -> 400 | **ALTA** |
| questionsSlice.js:59 | approve payload `{edited_body}` | questions/views.py:225-241 | approve **ignora** el body (no lee edited_body) | FIELD extra ignorado | BAJA |
| questionsSlice.js:74 | reject payload `{reason}` | questions/views.py:253-265 | reject **ignora** el body (no lee reason) | FIELD extra ignorado | BAJA |
| questionsSlice.js:46 (ADMIN_ANSWER_URL) | `POST /api/v1/admin/questions/{id}/answer/` | questions/admin_urls.py:12 | `AdminQuestionAnswerView` (path `<question_id>`) | CONFIRMED (path) | — |
| questionsSlice.js:55,70 | `POST /api/v1/admin/questions/{id}/approve\|reject/` | questions/admin_urls.py:15,18 | Approve/Reject views | CONFIRMED | — |
| useProductQuestions.js:12 | `GET /api/v1/admin/questions/?status=APPROVED_PENDING_ANSWER` | questions/views.py:33,150 / models.py:23-25 | VALID_STATUSES = {PENDING, ANSWERED, REJECTED}; valor invalido -> 400 | **FIELD/VALUE** — `APPROVED_PENDING_ANSWER` no existe | **ALTA** |
| useProductQuestions.js:13 | `GET /api/v1/admin/questions/?status=PENDING_MODERATION` | questions/views.py:33,150 | idem; `PENDING_MODERATION` no esta en VALID_STATUSES -> 400 | **FIELD/VALUE** — usar `PENDING` | **ALTA** |
| ProductQuestionsListPage / PublicQuestionItem | `q.answer.body`, `q.answer.answered_at` | questions/serializers.py:22,42-50 | `answer` SerializerMethodField {body, answered_at} | CONFIRMED (ya fixeado H-CICLO37-04) | — |
| ProductPage.jsx:63 | `variant.price_override` | chartsize/serializers.py:142-150 | `ProductVariantPublicSerializer` NO expone `price_override` (solo admin, ln 108) | **FIELD** — siempre undefined; fallback a price_with_tax | MEDIA |
| ProductPage.jsx:49,161 / variants[] | `product.variants[].{label,slug,effective_price,price_with_tax,is_available,stock}` | chartsize/serializers.py:132-142 | ProductVariantPublicSerializer expone esos campos | CONFIRMED | — |
| catalogo detalle | `product.{base_price, price_with_tax, sale_price, reviews_summary, questions_count, related_products, variants, images, categories}` | catalogue/serializers.py:227-235 | ProductDetailSerializer fields | CONFIRMED | — |
| ProductReviewsListPage.jsx:30 | `data.average_rating` | reviews/views.py:138 (list response) | la lista publica devuelve `results`; `average_rating` proviene de reviews_summary del detalle | MEDIA (shape: pagina espera average_rating top-level; backend list devuelve results/count) | MEDIA |

---

## Catalogue `/api/v1/catalogue/` (fix de iniciativa previa) — verificacion

El fix previo alineo `catalogSlice.js` de `/api/products/*` a `/api/v1/catalogue/*`
(comentario catalogSlice.js:5). **Verificado**: list (`/api/v1/catalogue/`),
detalle (`/api/v1/catalogue/{slug}/`) y search (`/api/v1/catalogue/search/`) siguen
coincidiendo con catalogue/urls.py:17,19,25. El fix se mantiene correcto.

**Excepcion residual del mismo dominio**: el sub-arbol `search/history/` y
`autocomplete/` quedaron fuera del fix:
- catalogSlice/searchHistorySlice usan `/api/v1/search/history/` pero el backend
  lo monta bajo `/api/v1/catalogue/search/history/` (catalogue/urls.py:20-23).
- useSearchSuggestions usa `/api/v1/catalogue/search/suggestions/` pero el real
  es `/api/v1/catalogue/autocomplete/` (catalogue/urls.py:18).

---

## Conteo

- **CONFIRMED:** 34 filas
- **DRIFT (ALTA):** 12 filas (10 drifts distintos — search-history y question-status ocupan 2 filas cada uno)
- **DRIFT (MEDIA):** 2 filas
- **DRIFT/BAJA (extra ignorado / missing UI):** 3 filas

DRIFTs de severidad ALTA (10 distintos): search-history path (2 filas),
search-suggestions inventado, products/activate inventado, categories/move
inventado, variant-types/options inventado, variants/bulk inventado,
variants/regenerate inventado, question-ask payload (asker_email/asker_name),
question-answer payload (answer_body), question status filter values
(APPROVED_PENDING_ANSWER / PENDING_MODERATION) (2 filas).

Nota de alcance: `move`, `options`, `bulk`, `regenerate`, `adjust-stock`,
`images`, `import` viven en `adminSlice.js`; los listados aqui son los que tocan
catalogue/chartsize. adjust-stock/images/import pertenecen a inventory/otras
vistas y quedan fuera de este audit de catalogue/reviews/questions/chartsize.
