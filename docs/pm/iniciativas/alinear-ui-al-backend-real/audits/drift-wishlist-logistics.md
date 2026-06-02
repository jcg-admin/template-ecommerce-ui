.. reporte::
   :agente: general-purpose (audit READ-ONLY)
   :tarea: Drift UI vs backend real — wishlist/search/logistics/reports/backups/static_content
   :fecha: 2026-06-02
   :herramientas: Bash, Read, Grep
   :basado-en: api develop @ d0cba50 ; ui @ 9779506

# Drift — wishlist / search / logistics / reports / backups / static_content

:Fecha: 2026-06-02T22:58:46
:api (backend real): `/tmp/references/e-comerce/api` branch **develop** @ **d0cba50**
:ui: `/home/user/template-ecommerce-ui` @ 9779506
:Alcance: endpoints (path+verb) + nombres de campo clave, READ-ONLY (sin cambios de codigo)

## Mounts reales (config/urls.py)

| Mount | Prefijo | app |
|-------|---------|-----|
| `config/urls.py:44` | `api/v1/wishlist/` | `apps.wishlist.urls` |
| `config/urls.py:79` | `api/v1/search/` | `apps.search_history.urls` |
| `config/urls.py:70` | `api/v1/logistics/` | `apps.logistics.urls` |
| `config/urls.py:67` | `api/v1/admin/` | `apps.reports.admin_urls` |
| `config/urls.py:84` | `api/v1/admin/` | `apps.backups.admin_urls` |
| `config/urls.py:71` | `api/v1/admin/` | `apps.static_content.admin_urls` |

---

## Tabla DRIFT

| UI file:line | UI endpoint/field | api file:line | Real | Drift | Sev |
|--------------|-------------------|---------------|------|-------|-----|
| `src/redux/slices/wishlistSlice.js:19` | `GET /api/v1/wishlist/` | `apps/wishlist/urls.py:7` | `'' -> WishlistView` (GET) | — | CONFIRMED |
| `src/redux/slices/wishlistSlice.js:19` `:47` | `POST /api/v1/wishlist/` body `{product_id, variant_id}` | `apps/wishlist/views.py:150-153` | POST lee `product_id`, `variant_id` | — | CONFIRMED |
| `src/redux/slices/wishlistSlice.js:20,60` | `DELETE /api/v1/wishlist/:id/` | `apps/wishlist/urls.py:8`, `views.py:209` | `<int:pk>/` DELETE | — | CONFIRMED |
| `src/redux/slices/wishlistSlice.js:21,73` | `POST /api/v1/wishlist/:id/move-to-cart/` | `apps/wishlist/urls.py:9-10`, `views.py:223` | `<int:pk>/move-to-cart/` POST | — | CONFIRMED |
| `src/pages/account/WishlistPage.jsx:77,83,97,98,100,102,105` | fields `price_at_add, current_price, image_url, product_name, category_name, orisha_name, is_available, stock` | `apps/wishlist/views.py:57-64` | serializer expone esos campos planos | — | CONFIRMED |
| `src/redux/slices/wishlistSlice.js:191` | `toggleWishlist` busca `i.product_id` en items | `apps/wishlist/views.py:57-64` | serializer NO expone `product_id`; producto anidado en `product.id` (`views.py:41`) + `product_name` | Campo `product_id` inexistente en el item; el lookup nunca matchea -> usa fallback `productId` como itemId | MEDIA |
| `src/hooks/domain/useWishlist.js:13` | `GET /api/v1/wishlist/`, lee `total_items, items_out_of_stock` | `apps/wishlist/views.py:124-141` | GET wishlist | path OK; `total_items`/`items_out_of_stock` no verificados en serializer de lista (GET arma dict propio en `views.py:124-141`, fuera de alcance de campos clave) | CONFIRMED (path) |
| `src/redux/slices/searchHistorySlice.js:16,35` | `DELETE /api/v1/search/history/` (borrar todo) | `apps/search_history/urls.py:8`, `views.py:21,37` | `history/` list-view tiene `delete` | — | CONFIRMED |
| `src/redux/slices/searchHistorySlice.js:17,23` | `DELETE /api/v1/search/history/:id/` | `apps/search_history/urls.py:9`, `views.py:42,49` | `history/<int:pk>/` delete | — | CONFIRMED |
| `src/redux/slices/catalogSlice.js:117` | `GET /api/v1/search/history/` | `apps/search_history/urls.py:8`, `views.py:30` | `history/` GET | — | CONFIRMED |
| `src/redux/slices/catalogSlice.js:126,136` | `DELETE /api/v1/search/history/:id/` y `/api/v1/search/history/` | `apps/search_history/urls.py:8,9` | delete uno + delete todos | — | CONFIRMED |
| `src/hooks/domain/useSearchHistory.js:11` | espera fields `{id, term, searched_at}` | `apps/search_history/serializers.py:13-14,18` | serializer expone aliases `term` (source=query), `searched_at` (source=created_at) | — | CONFIRMED |
| `src/hooks/domain/useLogistics.js:16` | `GET /api/v1/logistics/` -> `{group_a, group_b}` | `apps/logistics/urls.py:14` | `'' -> LogisticsPanelView` GET | — | CONFIRMED |
| `src/redux/slices/logisticsSlice.js:27` | `POST /api/v1/logistics/guides/:guideId/confirm-delivery/` | `apps/logistics/urls.py:20` | `guides/<int:pk>/confirm-delivery/` POST | — | CONFIRMED |
| `src/redux/slices/logisticsSlice.js:42` | `POST /api/v1/admin/orders/:orderNumber/guide/` (crear guia) | `apps/logistics/urls.py:17` | crear guia es `POST /api/v1/logistics/guides/` (`ShipmentGuideListCreateView`); `apps/orders/admin_urls.py:5-25` NO tiene `guide/` | Path inventado: no existe `/api/v1/admin/orders/:n/guide/`; el real es `/api/v1/logistics/guides/` con body `{order_id, courier_id, tracking_number, notes}` (`serializers.py:49-63`) | ALTA |
| `src/redux/slices/logisticsSlice.js:58` | `PATCH /api/v1/admin/orders/:orderNumber/tracking/` (set tracking) body `{tracking}` | (no existe) | grep `tracking` en todos los `*/urls.py` = 0 rutas | Endpoint inventado: no existe ruta `tracking/` en backend. El tracking se setea al crear la guia (`tracking_number`) | ALTA |
| `src/redux/slices/logisticsSlice.js:69,75` | `GET /api/v1/admin/couriers/` | `apps/logistics/urls.py:15` | real es `GET /api/v1/logistics/couriers/` | Prefijo equivocado: `/admin/` vs `/logistics/` | ALTA |
| `src/redux/slices/logisticsSlice.js:69,87` | `POST /api/v1/admin/couriers/` | `apps/logistics/urls.py:15` | `POST /api/v1/logistics/couriers/` | Prefijo equivocado `/admin/` vs `/logistics/` | ALTA |
| `src/redux/slices/logisticsSlice.js:99` | `PATCH /api/v1/admin/couriers/:id/` | `apps/logistics/urls.py:16` | `/api/v1/logistics/couriers/<int:pk>/` (verbos en `CourierDetailView`) | Prefijo equivocado `/admin/` vs `/logistics/` | ALTA |
| `src/redux/slices/logisticsSlice.js:111` | `DELETE /api/v1/admin/couriers/:id/` | `apps/logistics/urls.py:16` | `/api/v1/logistics/couriers/<int:pk>/` | Prefijo equivocado `/admin/` vs `/logistics/` | ALTA |
| `src/redux/slices/logisticsSlice.js:125` | `POST /api/v1/orders/:orderNumber/shipping-issue/` | (no existe) | grep `shipping-issue` en todos los `*/urls.py`/`*/admin_urls.py` = 0; `apps/orders/urls.py` solo tiene `shipping/` (`OrderShippingUpdateView`, distinto proposito) | Endpoint inventado: no hay ruta `shipping-issue/` | ALTA |
| `src/mocks/handlers/logistics.ts:37,51,61,66,80,92,100` | MSW mockea los paths drifted (`/admin/orders/:n/guide/`, `/admin/orders/:n/tracking/`, `/admin/couriers/`, `/orders/:n/shipping-issue/`) | (paths reales arriba) | mocks replican el contrato drifted -> tests verdes ocultan el drift | Mock alineado al slice drifted, no al backend real | ALTA |
| `src/mocks/handlers/logistics.ts:41,43,55` | mock devuelve `guide_id, label_url, tracking` | `apps/logistics/serializers.py:38-40` | real expone `id, tracking_number, status, courier, order_number` | Campos mock (`guide_id`, `label_url`, `tracking`) no existen en serializer real | MEDIA |
| `src/hooks/domain/useReports.js:23` | `GET /api/v1/admin/reports/sales/` | `apps/reports/admin_urls.py:16-17` | `reports/sales/` | — | CONFIRMED |
| `src/hooks/domain/useReports.js:24` | `GET /api/v1/admin/reports/top-sellers/` | `apps/reports/admin_urls.py:18-19` | `reports/top-sellers/` | — | CONFIRMED |
| `src/hooks/domain/useReports.js:25` | `GET /api/v1/admin/reports/customers-rfm/` | `apps/reports/admin_urls.py:22-23` | `reports/customers-rfm/` | — | CONFIRMED |
| `src/hooks/domain/useReports.js:26` | `GET /api/v1/admin/reports/dashboard/` | `apps/reports/admin_urls.py:20-21` | `reports/dashboard/` | — | CONFIRMED |
| `src/hooks/domain/useReports.js:72` | `GET /api/v1/admin/reports/:slug/export/` | `apps/reports/admin_urls.py:36-37` | `reports/<slug:slug>/export/` | — | CONFIRMED |
| (sin consumidor UI) | — | `apps/reports/admin_urls.py:25-32` | `reports/catalog-by-category/`, `reports/low-stock/`, `reports/catalog-summary/` existen en backend | 3 endpoints reales sin hook/consumidor en UI (cobertura faltante) | BAJA |
| `src/redux/slices/backupsSlice.js:16` | `POST /api/v1/admin/backups/trigger/` | `apps/backups/admin_urls.py:14` | `backups/trigger/` POST | — | CONFIRMED |
| `src/hooks/domain/useBackups.js:11` | `GET /api/v1/admin/backups/` | `apps/backups/admin_urls.py:13` | `backups/` GET | — | CONFIRMED |
| `src/pages/admin/AdminBackupsPage.jsx:90,93-94` | fields `size_bytes, download_url` | `apps/backups/serializers.py:9-13` | serializer expone `size_bytes, download_url, type, status, filename, error_detail` | — | CONFIRMED |
| `src/redux/slices/adminSlice.js:732` | `GET /api/v1/admin/pages/` (listar) | `apps/static_content/admin_urls.py:15` | real `GET /api/v1/admin/static-content/` | Base path equivocado: `pages` vs `static-content` | ALTA |
| `src/redux/slices/adminSlice.js:1147,1155` | `GET /api/v1/admin/pages/:slug/` | `apps/static_content/admin_urls.py:17` | `static-content/<slug:slug>/` GET | Base path equivocado `pages` vs `static-content` | ALTA |
| `src/redux/slices/adminSlice.js:1171,1206` | `PATCH /api/v1/admin/pages/:slug/` (guardar draft) | `apps/static_content/admin_urls.py:17`, `views.py:91` | `static-content/<slug:slug>/` PATCH | Base path equivocado `pages` vs `static-content` | ALTA |
| `src/redux/slices/adminSlice.js:1198` | `POST /api/v1/admin/pages/` (crear) | `apps/static_content/views.py:41` | crear es `POST /api/v1/admin/static-content/` | Base path equivocado `pages` vs `static-content` | ALTA |
| `src/redux/slices/adminSlice.js:1163` | `GET /api/v1/admin/pages/:slug/versions/` | (no existe) | `static_content/admin_urls.py` no tiene subruta `versions/`; el detail (`StaticContentSerializer.versions`, `serializers.py:21`) anida versiones dentro del GET de detail | Endpoint inventado: no hay ruta `versions/`; las versiones vienen anidadas en el detail | ALTA |
| `src/redux/slices/adminSlice.js:1179` | `POST /api/v1/admin/pages/:slug/publish/` | (no existe) | `static_content/views.py` solo tiene get/post(list) y get/patch(detail); no hay `publish` | Endpoint inventado: no existe `publish/` | ALTA |
| `src/redux/slices/adminSlice.js:1189` | `POST /api/v1/admin/pages/:slug/restore/:versionId/` | (no existe) | sin ruta `restore/` en backend | Endpoint inventado: no existe `restore/` | ALTA |
| `src/pages/admin/AdminStaticPageEditorPage.jsx:31,49` | form fields `title, content, meta_description` | `apps/static_content/models.py:17-20`, `serializers.py:25` | modelo/serializer usan `slug, title, body, version`; NO hay `content` ni `meta_description` | Field mismatch: UI usa `content` (real `body`) y `meta_description` (inexistente) | ALTA |
| `src/pages/admin/AdminStaticPagesPage.jsx:52,56,57` | fields `slug, title, version` | `apps/static_content/serializers.py:25` | `slug, title, body, version` | — | CONFIRMED |

---

## Conteos

- **CONFIRMED:** 21
- **DRIFT:** 17

### DRIFT por severidad

- **ALTA (13):**
  - logistics: `POST /admin/orders/:n/guide/` inventado (real `/logistics/guides/`)
  - logistics: `PATCH /admin/orders/:n/tracking/` inventado (no existe)
  - logistics: couriers GET/POST/PATCH/DELETE bajo `/admin/couriers/` (real `/logistics/couriers/`) — 4 entradas
  - logistics: `POST /orders/:n/shipping-issue/` inventado (no existe)
  - logistics MSW: mocks replican paths drifted -> ocultan el drift en tests
  - static_content: base `pages` vs `static-content` — GET list, GET detail, PATCH, POST crear (4 entradas)
  - static_content: `versions/`, `publish/`, `restore/` inventados (3 entradas, contadas dentro de ALTA)
  - static_content: field mismatch `content`/`meta_description` vs `body`
- **MEDIA (2):**
  - wishlist: `toggleWishlist` busca `i.product_id` inexistente en el item serializado
  - logistics MSW: campos `guide_id`/`label_url`/`tracking` no existen en serializer real
- **BAJA (1):**
  - reports: 3 endpoints reales (`catalog-by-category`, `low-stock`, `catalog-summary`) sin consumidor UI
