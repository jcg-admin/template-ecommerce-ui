/**
 * Handlers MSW del dominio cart.
 *
 * Endpoints cubiertos:
 *   GET    /api/cart/             carrito actual
 *   POST   /api/cart/items/       anadir item
 *   PATCH  /api/cart/items/:id/   actualizar cantidad
 *   DELETE /api/cart/items/:id/   eliminar item
 *   POST   /api/cart/voucher/     aplicar voucher
 *   DELETE /api/cart/voucher/     quitar voucher
 *
 * El estado del carrito vive en variables a nivel
 * de modulo. MSW v2 reusa el mismo modulo entre requests (igual que
 * el interceptor heredado), asi que la mutacion entre handlers es
 * consistente para una sesion de dev. En Jest, `server.resetHandlers()`
 * NO toca este estado — para casos donde un test exija estado limpio,
 * el test debe reasignar `cartState.items = []` desde un `beforeEach`
 * propio o usar `server.use(...overrides)`.
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

function buildCart() {
  return { items: cartState.items, voucher: cartState.voucher };
}

export const cartHandlers = [
  // Cart base
  http.get('/api/cart/', () => HttpResponse.json(buildCart())),

  // Cart items
  http.post('/api/cart/items/', async ({ request }) => {
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
        name: `Producto Mock #${body.product_id}`,
        price: 480,
        quantity: body.quantity ?? 1,
        image_url: '/mock-images/product.jpg',
      });
    }
    return HttpResponse.json(buildCart());
  }),

  http.patch('/api/cart/items/:id/', async ({ params, request }) => {
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

  http.delete('/api/cart/items/:id/', ({ params }) => {
    const id = parseInt(String(params.id), 10);
    cartState.items = cartState.items.filter((i) => i.id !== id);
    return HttpResponse.json(buildCart());
  }),

  // Voucher
  http.post('/api/cart/voucher/', async ({ request }) => {
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

  http.delete('/api/cart/voucher/', () => {
    cartState.voucher = null;
    return HttpResponse.json(buildCart());
  }),

];
