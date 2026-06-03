# Backlog consolidado — drift UI ↔ backend real

```yml
fecha: 2026-06-02T23:01:50
api_ref: /tmp/references/e-comerce/api @ d0cba50 (develop)
fuente: 5 reportes en audits/drift-*.md
```

> Auditoría exhaustiva del UI completo contra el backend Django **real**
> (no specs). El UI se construyó contra mocks MSW especulativos que driftaron
> del contrato real en muchos endpoints/campos. En modo DEMO funciona (los mocks
> replican el drift), pero **se romperá al conectar el backend real**.

## Totales

| Dominio | CONFIRMED | DRIFT | ALTA |
|---------|-----------|-------|------|
| auth/users | 16 | 6 | 4 |
| orders/cart/payments | 9 | 16 | 12 |
| vouchers/returns/support | 26 | 11 | 5 |
| wishlist/search/logistics | 21 | 17 | 13 |
| catalogue/reviews/questions | 34 | 10 | ~12 |
| **settings (CFG)** | — | **RESUELTO** | — (commit 2895503) |

Detalle con `file:line` (ambos lados) en `audits/drift-<dominio>.md`.

## Backlog priorizado (ALTA primero)

### B1 — Cart (rompe carrito completo contra backend real)
- `cartSlice.js:27-32` — 6 URLs sin `/v1/` (`/api/cart/*` → `/api/v1/cart/*`).
- `cartSlice.js:32,134` — `sync/` inventado → real `merge/` con body `{cart_token}`.
- Mocks `cart.ts` replican el drift (corregir junto).

### B2 — Payments / Checkout
- `paymentsSlice.js:33,55,77` — `mercadopago/checkout` + `paypal/checkout`
  inventados → `POST /payments/initiate/` con `gateway` en body; `order_id`→`order_number`.
- `paymentsSlice.js:96` — `retry` inventado.
- `paymentsSlice.js:237` — `initiate/` no lleva `{order_number}` en path (va en body).
- `ordersSlice.js:19,35` — `checkoutOrder` → `/orders/checkout/` (no `/checkout/`).
- `checkoutSlice.js` (deprecated) — paths sin versionar inexistentes.
- `ordersSlice.js:106` — admin cancel `reason` requiere minLength 10.

### B3 — Auth/Users
- change-password: `confirm_password` → `new_password_confirm` (`authSlice.js:103`).
- password-reset/confirm: `{uid,token,new_password}` → `{token,new_password,new_password_confirm}`.
- avatar: `/auth/profile/avatar/` inventado → PATCH `/auth/profile/` campo `avatar`.
- admin role: `/admin/users/:id/role/` inventado → update del ViewSet.
- logout-all: alias a `/auth/logout/` → `/auth/logout-all/`.
- **bug UI:** `useAuth.js:15,31` importa `getCurrentUser` (no existe; es `fetchProfile`).

### B4 — Logistics / Static content
- couriers `/admin/couriers/` → `/logistics/couriers/`; create-guide
  `/admin/orders/:n/guide/` → `/logistics/guides/`; `tracking/` y
  `shipping-issue/` inventados (`logisticsSlice.js`).
- static content `/admin/pages/` → `/admin/static-content/`; `versions/publish/restore/`
  inventados; campos `content`/`meta_description` → `body` (`adminSlice.js`, `AdminStaticPageEditorPage.jsx`).

### B5 — Catalogue / Questions / Reviews
- `search/history/` → `/catalogue/search/history/`; `search/suggestions/` → `autocomplete/`.
- product `activate/`, category `move/`, variant `bulk/`/`regenerate/`,
  variant-type `options/` — acciones inventadas.
- questions ask `{body,email}` → `{body,asker_name,asker_email}`; answer `{body}` → `{answer_body}`;
  status filters inválidos (`APPROVED_PENDING_ANSWER`/`PENDING_MODERATION` → `PENDING/ANSWERED/REJECTED`).

### B6 — Vouchers / Returns / Support / Contact / Newsletter
- voucher `/{id}/usage/` inventado (solo activate/deactivate/report).
- returns create `order_id` → `order_number`.
- support reply `is_internal` → `is_internal_note`.
- contact create `message` → `body` (min 20).
- newsletter campaign `html_body/...` → `body` + `audience_filter`.

### MEDIA / BAJA
Ver reportes: wishlist `product_id` lookup, reviews `average_rating`, variant
`price_override`, endpoints sin consumidor (audit-log, reports, reviews helpful/edit).

## Naturaleza del esfuerzo

~46 hallazgos ALTA. Cada fix = slice + mock + test (TDD). Es un **programa
multi-fase**, no un one-shot. Settings (CFG) ya cerrado como piloto del patrón.
Ejecución recomendada: por dominio (B1→B6), suite verde por lote.

## Estado de ejecución (2026-06-03)

| Lote | Dominio | Estado |
|------|---------|--------|
| B1 | cart | ✅ (commit Fix cart endpoints) |
| B2 | payments/checkout | ✅ |
| B3 | auth/users | ✅ (4 agentes paralelos) |
| B4 | logistics/static-content | ✅ |
| B5 | catalogue/questions/reviews | ✅ |
| B6 | vouchers/returns/support/contact/newsletter | ✅ |
| settings/CFG | — | ✅ |
| inventario | — | ✅ (UI ya correcto) |

**Hallazgos relevantes del ciclo:** varios "endpoints" del UI eran **inventados**
(no existen en el backend real) → se ELIMINARON, no se "alinearon":
voucher `/{id}/usage/`, admin user `/role/`, product `activate/`, category
`move/`, chartsize `bulk/regenerate/options`, logistics `tracking/` y
`shipping-issue/`, static `versions/publish/restore/`. El resto eran drifts de
path (`/admin/inventory`→`/inventory` NO; `/admin/couriers`→`/logistics/couriers`
SÍ) o de nombre de campo (`confirm_password`→`new_password_confirm`,
`order_id`→`order_number`, `message`→`body`, `is_internal`→`is_internal_note`,
`html_body`→`body`+`audience_filter`, `asker_email`/`answer_body`).

Verificación final: jest 1846 passed / 0 failed; check-scss 182 clean;
build:demo EXIT=0.
