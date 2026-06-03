/**
 * Handlers MSW del dominio cart.
 *
 * Endpoints cubiertos:
 *   GET    /api/v1/cart/             carrito actual
 *   POST   /api/v1/cart/items/       anadir item
 *   PATCH  /api/v1/cart/items/:id/   actualizar cantidad
 *   DELETE /api/v1/cart/items/:id/   eliminar item
 *   POST   /api/v1/cart/voucher/     aplicar voucher
 *   DELETE /api/v1/cart/voucher/     quitar voucher
 *
 * Contrato: replica el objeto Cart real del backend
 * (apps/cart/serializers.py CartSerializer + CartItemSerializer). El
 * modelo de impuestos es **tax-INCLUSIVO**: el IVA ya esta dentro de
 * `unit_price`, asi que `total == subtotal_net` y `tax_included` es solo
 * informativo (NO se suma). Difiere del modelo cliente tax-exclusivo
 * anterior (`total = subtotal + 16%`), que sobre-cobraba IVA.
 *
 * Cada item expone los campos reales (`product_name`, `unit_price`,
 * `subtotal`, etc.). `image_url` es una EXTENSION DOCUMENTADA del
 * template: el backend real no tiene imagen por item, pero el
 * storefront necesita una miniatura (mismo criterio que UC-LOG-09).
 *
 * El estado del carrito vive en variables a nivel de modulo. MSW v2
 * reusa el mismo modulo entre requests, asi que la mutacion entre
 * handlers es consistente para una sesion de dev. En Jest,
 * `server.resetHandlers()` NO toca este estado — para casos donde un
 * test exija estado limpio, el test debe reasignar `cartState.items = []`
 * desde un `beforeEach` propio o usar `server.use(...overrides)`.
 */

import { http, HttpResponse } from 'msw';
import type { CartItem, Voucher } from './types';

interface CartState {
  items: CartItem[];
  voucher: Voucher | null;
}

const cartState: CartState = {
  items: [],
  voucher: null,
};


const KNOWN_VOUCHERS: Record<string, Voucher> = {
  DEMO10: { code: 'DEMO10', type: 'PERCENT', value: 10 },
  DESCUENTO50: { code: 'DESCUENTO50', type: 'FIXED', value: 50 },
};

const IVA_RATE = 0.16;
const FREE_SHIPPING_THRESHOLD = 1500;

/** Redondea a 2 decimales y devuelve string decimal (formato DRF). */
function dec(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

/**
 * Construye el objeto Cart real con `items` y `totals` tax-inclusivos.
 *
 *   subtotal     = Σ(unit_price · quantity)
 *   discount     = del voucher aplicado (PERCENT sobre subtotal, o FIXED)
 *   subtotal_net = subtotal − discount
 *   total        = subtotal_net               (IVA ya incluido)
 *   tax_included = subtotal_net · iva/(1+iva)  (informativo, NO se suma)
 */
function buildCart() {
  const items = cartState.items.map((it) => {
    const unitPrice = Number(it.unit_price ?? 0);
    const subtotal = unitPrice * it.quantity;
    return {
      id: it.id,
      product_name: it.product_name,
      product_slug: it.product_slug,
      variant_label: it.variant_label ?? null,
      sku: it.sku,
      quantity: it.quantity,
      unit_price: dec(unitPrice),
      subtotal: dec(subtotal),
      available_stock: it.available_stock ?? 99,
      is_available: it.is_available ?? true,
      price_changed: it.price_changed ?? false,
      // Extension del template (no esta en el backend real): miniatura.
      image_url: it.image_url,
      // Identificadores que usan las mutaciones del cliente.
      product_id: it.product_id,
      variant_id: it.variant_id,
    };
  });

  const subtotal = cartState.items.reduce(
    (sum, it) => sum + Number(it.unit_price ?? 0) * it.quantity,
    0,
  );

  const voucher = cartState.voucher;
  let discount = 0;
  if (voucher) {
    discount =
      voucher.type === 'PERCENT'
        ? subtotal * (voucher.value / 100)
        : Math.min(voucher.value, subtotal);
  }

  const subtotalNet = subtotal - discount;
  const total = subtotalNet;
  const taxIncluded = subtotalNet * (IVA_RATE / (1 + IVA_RATE));
  const itemCount = cartState.items.reduce((n, it) => n + it.quantity, 0);

  const freeShippingApplied = subtotalNet >= FREE_SHIPPING_THRESHOLD;
  const freeShippingRemaining = freeShippingApplied
    ? 0
    : FREE_SHIPPING_THRESHOLD - subtotalNet;

  return {
    id: 1,
    cart_token: 'mock-cart-token',
    items,
    // `voucher` se conserva como extension del template para que el
    // cliente refleje el cupon aplicado; el backend real lo deriva del
    // descuento en `totals`.
    voucher,
    totals: {
      subtotal: dec(subtotal),
      discount: dec(discount),
      subtotal_net: dec(subtotalNet),
      tax_included: dec(taxIncluded),
      shipping_cost: null,
      total: dec(total),
      free_shipping_threshold: dec(FREE_SHIPPING_THRESHOLD),
      free_shipping_remaining: dec(freeShippingRemaining),
      free_shipping_applied: freeShippingApplied,
      item_count: itemCount,
    },
  };
}

export const cartHandlers = [
  // Cart base
  http.get('/api/v1/cart/', () => HttpResponse.json(buildCart())),

  // Cart items
  http.post('/api/v1/cart/items/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { product_id?: number; variant_id?: number; quantity?: number }
      | null;
    if (!body?.product_id) {
      return HttpResponse.json(
        { detail: 'product_id requerido.' },
        { status: 400 }
      );
    }
    const exists = cartState.items.find((i) => i.product_id === body.product_id);
    if (exists) {
      exists.quantity += body.quantity ?? 1;
    } else {
      cartState.items.push({
        id: Date.now(),
        product_id: body.product_id,
        variant_id: body.variant_id ?? 1,
        product_name: `Producto Mock #${body.product_id}`,
        product_slug: `producto-mock-${body.product_id}`,
        sku: `MOCK-${body.product_id}`,
        unit_price: 480,
        quantity: body.quantity ?? 1,
        available_stock: 99,
        is_available: true,
        price_changed: false,
        // Extension del template: miniatura (no esta en el backend real).
        image_url: '/mock-images/product.jpg',
      });
    }
    return HttpResponse.json(buildCart());
  }),

  http.patch('/api/v1/cart/items/:id/', async ({ params, request }) => {
    const id = parseInt(String(params.id), 10);
    const item = cartState.items.find((i) => i.id === id);
    if (!item) {
      return HttpResponse.json(
        { detail: 'Item no encontrado.' },
        { status: 404 }
      );
    }
    const body = (await request.json().catch(() => null)) as
      | { quantity?: number }
      | null;
    if (body?.quantity !== undefined) item.quantity = body.quantity;
    return HttpResponse.json(buildCart());
  }),

  http.delete('/api/v1/cart/items/:id/', ({ params }) => {
    const id = parseInt(String(params.id), 10);
    cartState.items = cartState.items.filter((i) => i.id !== id);
    return HttpResponse.json(buildCart());
  }),

  // Voucher — recalcula totals.discount al aplicar / quitar.
  http.post('/api/v1/cart/voucher/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { code?: string }
      | null;
    const code = body?.code?.toUpperCase() ?? '';
    const voucher = KNOWN_VOUCHERS[code];
    if (!voucher) {
      return HttpResponse.json(
        { detail: 'Voucher invalido o expirado.' },
        { status: 400 }
      );
    }
    cartState.voucher = voucher;
    return HttpResponse.json(buildCart());
  }),

  http.delete('/api/v1/cart/voucher/', () => {
    cartState.voucher = null;
    return HttpResponse.json(buildCart());
  }),

];
