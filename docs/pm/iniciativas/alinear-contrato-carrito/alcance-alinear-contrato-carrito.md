```yml
created_at: 2026-06-03T07:39:24
project: template-ecommerce-ui
author: Nestor Monroy
status: Borrador
version: 1.0.0
iniciativa: alinear-contrato-carrito
submodulo: ui
```

# Alcance — Alinear el contrato del carrito del UI al backend real (D-4)

## Premisa verificada

| Campo | Valor |
|-------|-------|
| Nivel de gate ejecutado | 0a + 0b |
| Red flags activos | RF-2 (`state`/`schema` del carrito), RF-3 (contrato cross-repo UI↔server) |
| Resultado | CONFIRMAR |
| Iniciativas previas revisadas | Ninguna iniciativa `*carrito*`/`*cart*` en `docs/pm/iniciativas/`; commits previos `BUG-CART-03/04` no tocaron el contrato de campos/totales |

### Evidencia del contrato real (fuente de verdad: backend de referencia)

`/tmp/references/e-comerce/api/practicayoruba/apps/cart/serializers.py`:

- L8-22 `CartItemSerializer`: `fields = ['id', 'product_name', 'product_slug',
  'variant_label', 'sku', 'quantity', 'unit_price', 'subtotal', ...]` con
  `product_name = CharField(source='product.name')`. [PROVEN]
- L50-56 `CartSerializer`: `fields = ['id', 'cart_token', 'items', 'totals']`. [PROVEN]

`/tmp/references/e-comerce/api/practicayoruba/apps/cart/models.py` `get_totals()`:

- L72 `subtotal_net = subtotal - discount` [PROVEN]
- L75 `tax = (subtotal_net * iva_rate / (1 + iva_rate)).quantize(Decimal('0.01'))` [PROVEN]
- L85 `'total': str(subtotal_net)` — **tax-INCLUSIVO**: el total NO suma IVA;
  el IVA ya esta dentro de `unit_price` y `tax_included` es informativo. [PROVEN]
- L82-92: keys `subtotal, discount, subtotal_net, tax_included, shipping_cost,
  total, free_shipping_threshold, free_shipping_remaining, free_shipping_applied,
  item_count`. [PROVEN]

### Drift confirmado en el UI (estado heredado)

- `src/redux/slices/cartSlice.js:144-155` (pre-cambio) `calculateTotals` con
  modelo **tax-EXCLUSIVO**: `tax = taxable * 0.16; total = taxable + tax` —
  sobre-cobraba IVA respecto del backend. [PROVEN]
- `src/redux/slices/cartSlice.js:145` (pre-cambio) usaba `item.price` (campo
  inexistente en el contrato real). [PROVEN]
- `src/components/layout/Header/index.jsx:188-190` (pre-cambio) usaba
  `item.name` / `item.price`. [PROVEN]
- `src/mocks/handlers/cart.ts` (pre-cambio) `buildCart()` devolvia
  `{ items, voucher }` con items `name`/`price`, sin objeto `totals`. [PROVEN]
- `src/types/domain.ts` `CartItem` ya estaba migrado (cambio sin commitear en el
  worktree) a `product_name`/`unit_price`/`subtotal` + `image_url`. [PROVEN]

## Contrato objetivo (implementado)

Respuesta de `GET/POST/PATCH/DELETE /api/cart/*` = objeto Cart:

```
{ id, cart_token,
  items: [{ id, product_name, product_slug, variant_label, sku, quantity,
            unit_price(str), subtotal(str), available_stock, is_available,
            price_changed, image_url(extension template) }],
  totals: { subtotal, discount, subtotal_net, tax_included, shipping_cost:null,
            total, free_shipping_threshold, free_shipping_remaining,
            free_shipping_applied, item_count } }
```

Modelo de impuestos **tax-inclusivo**:
`subtotal = Σ(unit_price·qty)` · `subtotal_net = subtotal − discount` ·
`total = subtotal_net` · `tax_included = subtotal_net·0.16/1.16` (informativo).

### Extension documentada del template

`image_url` por item se conserva en el mock y el tipo como extension del
template (el backend real no la tiene), mismo criterio que UC-LOG-09.

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/mocks/handlers/cart.ts` | `buildCart()` devuelve el shape Cart real con `totals` tax-inclusivo; items con campos reales + `image_url` |
| `src/mocks/factories/cart.ts` | factory migrada a `product_name`/`unit_price`/`subtotal` + `image_url` |
| `src/redux/slices/cartSlice.js` | eliminado `calculateTotals` (tax-exclusivo); `totals` desde `cart.totals` via `mapTotals` (con alias `tax`=`tax_included`); `itemCount` desde `totals.item_count`; recompute local tax-inclusivo solo en `removeCartItem` |
| `src/types/domain.ts` | `CartItem` alineado (ya estaba migrado en el worktree) |
| `src/components/layout/Header/index.jsx` | mini-carrito usa `product_name`/`unit_price` |
| `tests/unit/reducers/cartSlice.test.js` | tests al contrato real (total = subtotal_net; `tax_included` informativo) |
| `src/redux/slices/cartSlice.test.js` | payloads con shape real |
| `src/pages/cart/CartPage.test.jsx` | `CART_PAYLOAD` con `unit_price`/`subtotal` + `totals` reales |
| `src/hooks/domain/useCart.test.js` | items con shape real |

`src/redux/selectors/index.js` no requirio cambios: los selectores apuntan a
`state.cart.{items,itemCount,totals,voucher}`, que el slice llena correctamente.

## Hallazgos

Ver `hallazgos-alinear-contrato-carrito.md`.
```
