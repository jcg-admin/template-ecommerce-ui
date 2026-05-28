/**
 * Handlers MSW del dominio wishlist.
 *
 * Paths alineados con wishlistSlice.js:
 *   GET    /api/v1/wishlist/
 *   POST   /api/v1/wishlist/
 *   DELETE /api/v1/wishlist/:id/
 *   POST   /api/v1/wishlist/:id/move-to-cart/
 *
 * Corrige BUG-MOCK-01 (4 endpoints sin handler).
 * Iniciativa: validar-contrato-de-mocks-vs-backend-real
 */

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { createProduct } from '../factories/product';

interface WishlistItem {
  id: number;
  product_id: number;
  product: ReturnType<typeof createProduct>;
  added_at: string;
}

let _wishlist: WishlistItem[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  product_id: i + 10,
  product: createProduct({ id: i + 10 }),
  added_at: faker.date.recent({ days: 30 }).toISOString(),
}));

export const wishlistHandlers = [
  http.get('/api/v1/wishlist/', () =>
    HttpResponse.json({ count: _wishlist.length, results: _wishlist, next: null, previous: null })
  ),

  http.post('/api/v1/wishlist/', async ({ request }) => {
    const body = await request.json() as { product_id: number; variant_id?: number };
    const item: WishlistItem = {
      id: Date.now(),
      product_id: body.product_id,
      product: createProduct({ id: body.product_id }),
      added_at: new Date().toISOString(),
    };
    _wishlist.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.delete('/api/v1/wishlist/:id/', ({ params }) => {
    _wishlist = _wishlist.filter(i => i.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/v1/wishlist/:id/move-to-cart/', ({ params }) => {
    const item = _wishlist.find(i => i.id === Number(params.id));
    _wishlist = _wishlist.filter(i => i.id !== Number(params.id));
    return HttpResponse.json({
      moved: true,
      product_id: item?.product_id,
      message: 'Producto movido al carrito',
    });
  }),
];
