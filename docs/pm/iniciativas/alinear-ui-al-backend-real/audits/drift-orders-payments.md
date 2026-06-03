```yml
created_at: 2026-06-02T22:55:02
project: template-ecommerce-ui
author: claude
status: Borrador
version: 1.0.0
```

<!--
.. reporte::
   :agente: drift-audit (READ-ONLY)
   :tarea: Comparar capa orders/cart/checkout/payments del UI vs backend Django real
   :fecha: 2026-06-02
   :herramientas: Read, Bash (grep, git rev-parse)
   :basado-en: api develop @ d0cba50 (git -C /tmp/references/e-comerce/api rev-parse --short HEAD)
-->

# Drift — Orders / Cart / Checkout / Payments (UI vs backend real)

**Backend de referencia:** `/tmp/references/e-comerce/api/practicayoruba`, rama
`develop`, short SHA **`d0cba50`** (verificado con
`git -C /tmp/references/e-comerce/api rev-parse --short HEAD`).

**Mounts (`config/urls.py`):**

- `api/v1/orders/` → `apps.orders.urls`
- `api/v1/admin/` → `apps.orders.admin_urls`
- `api/v1/cart/` → `apps.cart.urls`
- `api/v1/payments/` → `apps.payments.urls`
- `api/v1/checkout/` → `apps.payments.checkout_urls`
- `api/v1/admin/` → `apps.payments.admin_urls`

**READ-ONLY:** no se modificó código. Solo auditoría.

---

## Tabla DRIFT

| UI file:line | UI endpoint/field | api file:line | Real | Drift | Sev |
|---|---|---|---|---|---|
| `ordersSlice.js:19` `:35` | `POST /api/v1/checkout/` (checkoutOrder) | `payments/checkout_urls.py` (no tiene `''`) / `orders/urls.py:9` `checkout/` | Checkout buyer real = `POST /api/v1/orders/checkout/`. `checkout_urls.py` solo expone `eligibility/` y `express/`. `POST /api/v1/checkout/` (raíz) **no existe** | **DRIFT** path: UI llama a `/api/v1/checkout/` que no es ruta válida del backend | **ALTA** |
| `ordersSlice.js:20` `:48` | `POST /api/v1/orders/{order_number}/cancel/` body `{reason}` | `orders/urls.py:21` + `serializers.py:206-211` `CancelOrderSerializer.reason` | Coincide path, verbo y campo `reason` | **CONFIRMED** (UC-ORD-04) | — |
| `ordersSlice.js:21` `:61` | `PATCH /api/v1/orders/{order_number}/address/` body `{recipient_name,street,city,state,zip_code,country,phone}` | `orders/urls.py:25` + `serializers.py:214-222` `UpdateAddressSerializer` | Coincide path, verbo y campos | **CONFIRMED** (UC-ORD-05) | — |
| `ordersSlice.js:22` `:74` | `PATCH /api/v1/orders/{order_number}/shipping/` body `{shipping_method_id}` | `orders/urls.py:29` + `serializers.py:225-229` `UpdateShippingSerializer.shipping_method_id` | Coincide path, verbo y campo | **CONFIRMED** (UC-ORD-06) | — |
| `ordersSlice.js:23` `:89` | `PATCH /api/v1/admin/orders/{order_number}/status/` body `{new_status,notes}` | `orders/admin_urls.py:19` + `admin_views.py:174-177,198-199` `new_status`,`notes` (`new_status` required) | Coincide path, verbo y campos | **CONFIRMED** (UC-ORD-07) | — |
| `ordersSlice.js:24` `:106` | `POST /api/v1/admin/orders/{order_number}/cancel/` body `{reason}` | `orders/admin_urls.py:23` + `admin_views.py:249-251,276` `reason` (`minLength:10`, required) | Path/verbo/campo OK, pero el backend exige `reason` no vacío y `minLength 10`; UI lo envía sin validación de longitud | **DRIFT** menor: UI no garantiza `reason` con minLength 10 (backend lo rechaza con 400) | BAJA |
| `ordersSlice.js:222` | `GET /api/v1/orders/{order_number}/` | `orders/urls.py:17` `OrderDetailView` | Coincide | **CONFIRMED** (UC-ORD-02) | — |
| `ordersSlice.js:235` | `GET /api/v1/orders/` (listado) | `orders/urls.py:13` `OrderListView` | Coincide; UI espera `{count,results}` (`ordersSlice.js:202`), backend pagina | **CONFIRMED** (UC-ORD-03) | — |
| `cartSlice.js:27` `:37` | `GET /api/cart/` (fetchCart) | `cart/urls.py:8` `CartView` montado en `/api/v1/cart/` | UI usa `/api/cart/` **sin `/v1/`**; backend real es `/api/v1/cart/` | **DRIFT** path: falta segmento `v1` | **ALTA** |
| `cartSlice.js:28` `:52` | `POST /api/cart/items/` body `{product_id,variant_id,quantity}` | `cart/urls.py:9` `CartItemListView` (`/api/v1/cart/items/`) + `serializers.py:62-66` `AddItemSerializer` | Campos OK; path sin `/v1/` | **DRIFT** path: falta `v1` (campos coinciden) | **ALTA** |
| `cartSlice.js:29` `:68` | `PATCH /api/cart/items/{id}/` body `{quantity}` | `cart/urls.py:10` `CartItemDetailView` + `serializers.py:69-71` `UpdateItemSerializer.quantity` | Campo OK; path sin `/v1/` | **DRIFT** path: falta `v1` | **ALTA** |
| `cartSlice.js:29` `:80` | `DELETE /api/cart/items/{id}/` | `cart/urls.py:10` `CartItemDetailView` | Verbo OK; path sin `/v1/` | **DRIFT** path: falta `v1` | **ALTA** |
| `cartSlice.js:30` `:93` | `POST /api/cart/voucher/` body `{code}` | `cart/urls.py:13` `CartVoucherView` (`/api/v1/cart/voucher/`) | Path sin `/v1/`. Además NO existe serializer `code` para voucher en `cart/serializers.py` (sin `MergeCartSerializer`-equivalente para voucher); el body field `code` no está verificado en serializers leídos | **DRIFT** path: falta `v1`; campo `code` sin serializer confirmado | **ALTA** |
| `cartSlice.js:30` `:108` | `DELETE /api/cart/voucher/` | `cart/urls.py:13` `CartVoucherView` | Verbo OK; path sin `/v1/` | **DRIFT** path: falta `v1` | **ALTA** |
| `cartSlice.js:31` `:121` | `POST /api/cart/save/` (saveCartForLater) | `cart/urls.py:11` `CartSaveView` (`/api/v1/cart/save/`) | Path sin `/v1/` | **DRIFT** path: falta `v1` | **ALTA** |
| `cartSlice.js:32` `:134` | `POST /api/cart/sync/` (syncCartOnLogin) | `cart/urls.py:12` `CartMergeView` (`/api/v1/cart/merge/`) + `serializers.py:74-76` `MergeCartSerializer.cart_token` | Endpoint inventado: backend no tiene `sync/`; el merge real es `merge/` y requiere body `{cart_token}` (UI no lo envía, manda `{}`) | **DRIFT** endpoint inventado (`sync/`) + path sin `v1` + falta campo `cart_token` | **ALTA** |
| `paymentsSlice.js:33` `:55` | `POST /api/v1/payments/mercadopago/checkout` body `{order_id,installments}` | `payments/urls.py:9` `InitiatePaymentView` (`/api/v1/payments/initiate/`) + `serializers.py:42-58` `InitiatePaymentSerializer` (`order_number`,`gateway`,`installments`) | Endpoint `mercadopago/checkout` **no existe**. Real = `POST /api/v1/payments/initiate/` con `{order_number, gateway:'MERCADOPAGO', installments}`. UI envía `order_id` (no `order_number`) y no envía `gateway` | **DRIFT** endpoint inventado + campo `order_id` vs `order_number` + falta `gateway` | **ALTA** |
| `paymentsSlice.js:34` `:77` | `POST /api/v1/payments/paypal/checkout` body `{order_id}` | `payments/urls.py:9` `InitiatePaymentView` `initiate/` + `serializers.py:46-54` | Endpoint `paypal/checkout` **no existe**. Real = `initiate/` con `{order_number, gateway:'PAYPAL'}` | **DRIFT** endpoint inventado + campo `order_id` vs `order_number` + falta `gateway` | **ALTA** |
| `paymentsSlice.js:35` `:96` | `POST /api/v1/payments/retry` body `{order_id,gateway}` | sin ruta en `payments/urls.py`; existe `payments/urls.py:29` `retry-eligibility/` (GET, distinto) | Endpoint `retry` (POST raíz) **no existe** en el backend. Reintento se modela vía `initiate/` de nuevo; `<order>/retry-eligibility/` es solo GET de elegibilidad (UC-PAY-08) | **DRIFT** endpoint inventado (no hay POST retry) | **ALTA** |
| `paymentsSlice.js:36` `:118` | `POST /api/v1/admin/payments/{payment_id}/refund/` body `{amount,reason}` | `payments/admin_urls.py:14` `AdminRefundView` + `serializers.py:132-142` `RefundRequestSerializer` (`amount`,`reason`) | Coincide path, verbo y campos (montado vía `api/v1/admin/` → `payments.admin_urls`) | **CONFIRMED** (UC-PAY-09) | — |
| `paymentsSlice.js:237` | `POST /api/v1/payments/{order_number}/initiate/` body `{gateway}` (thunk `initiatePayment` Yoruba) | `payments/urls.py:9` `initiate/` (sin `<order_number>` prefix) | Backend `initiate/` NO toma `order_number` en el path; el `order_number` va en el body. UI arma `/{order_number}/initiate/` que no matchea ninguna ruta | **DRIFT** path: segmento `{order_number}/` inexistente en la ruta real | **ALTA** |
| `paymentsSlice.js:255` | `GET /api/v1/payments/{order_number}/history/` | `payments/urls.py:23` `PaymentHistoryView` | Coincide | **CONFIRMED** (UC-PAY-06) | — |
| `paymentsSlice.js:274` | `GET /api/v1/checkout/eligibility/` | `payments/checkout_urls.py:6` `CheckoutEligibilityView` + `serializers.py:99-107` `CheckoutEligibilitySerializer` (`express_available`,`reason`,`default_address`,`default_shipping`,`estimated_total`) | Path/verbo OK. Campo response: serializer real usa `express_available`; el mock UI (`checkout.ts:32`) devuelve `eligible`/`reasons`/`cart_item_count` (drift de mock, no de slice) | **CONFIRMED** path; ver nota mock | — |
| `paymentsSlice.js:291` | `POST /api/v1/checkout/express/` | `payments/checkout_urls.py:7` `ExpressCheckoutView` + `serializers.py:110-118` `ExpressCheckoutSerializer` (`notes`,`installments`) | Coincide path/verbo; UI no envía body (`notes`/`installments` opcionales con default) | **CONFIRMED** (UC-ORD-01-EXT) | — |
| `checkoutSlice.js:19` (@deprecated) | `POST /api/orders/` (createOrder) | sin ruta; real `orders/urls.py:9` `checkout/` montado en `/api/v1/orders/checkout/` | Slice marcado `@deprecated`; path `/api/orders/` no versionado y no es ruta del backend | **DRIFT** (deprecated) path legacy inválido | MEDIA |
| `checkoutSlice.js:31` (@deprecated) | `POST /api/payments/mercadopago/create/` | sin ruta; real `payments/urls.py:9` `initiate/` | Path legacy no versionado, no existe | **DRIFT** (deprecated) | MEDIA |
| `checkoutSlice.js:43` (@deprecated) | `POST /api/payments/paypal/create/` | sin ruta; real `payments/urls.py:9` `initiate/` | Path legacy no versionado, no existe | **DRIFT** (deprecated) | MEDIA |

---

## Notas sobre handlers MSW (mock vs slice)

Los handlers MSW del UI replican los paths **de los slices**, por lo que heredan
los mismos drifts (no los corrigen):

- `cart.ts:46-118` intercepta `/api/cart/*` (sin `v1`) → consistente con
  `cartSlice.js` pero divergente del backend real `/api/v1/cart/*`.
- `payments.ts:20-32` intercepta `/api/v1/payments/mercadopago/checkout` y
  `/paypal/checkout` → endpoints inventados que no existen en el backend.
- `checkout.ts:21-28` intercepta `POST /api/v1/checkout/` → el slice
  `checkoutOrder` apunta ahí, pero el checkout buyer real es
  `POST /api/v1/orders/checkout/`.
- `checkout.ts:31-37` `eligibility/` devuelve `{eligible,reasons,cart_item_count}`
  mientras el serializer real (`payments/serializers.py:99-107`) usa
  `{express_available,reason,default_address,default_shipping,estimated_total}`
  → **drift de forma de respuesta** (MEDIA).
- `orders.ts:72` intercepta `PATCH /api/v1/orders/:orderNumber/status/`
  (admin) pero el slice (`ordersSlice.js:23`) y el backend
  (`orders/admin_urls.py:19`) usan `/api/v1/admin/orders/{order_number}/status/`
  → el handler MSW de admin-status está bajo el prefijo equivocado (drift mock).

---

## Conteo

- **CONFIRMED:** 9 (incluye UC-ORD-04 cancel, ya confirmado por directiva)
- **DRIFT:** 16 (3 de ellos en `checkoutSlice.js` @deprecated)

Total filas de tabla: 25.

### Resumen por severidad (solo DRIFTs)

| Sev | Cantidad |
|---|---|
| ALTA | 12 |
| MEDIA | 3 (los 3 de checkoutSlice @deprecated + el de forma de respuesta del mock eligibility se cuenta aparte en notas) |
| BAJA | 1 (admin cancel reason minLength 10) |
