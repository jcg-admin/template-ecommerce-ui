/**
 * Handlers MSW del dominio checkout.
 *
 * Paths alineados con paymentsSlice.js (slice activo) y checkoutSlice.js (legacy):
 *   POST /api/v1/checkout/              — crear orden desde carrito
 *   GET  /api/v1/checkout/eligibility/  — validar elegibilidad del carrito
 *   POST /api/v1/checkout/express/      — checkout exprés (un click)
 *   POST /api/orders/ (legacy)          — checkoutSlice.js @deprecated, BUG-URL-01
 *   POST /api/v1/payments/retry         — reintentar pago fallido
 *
 * Corrige BUG-MOCK-01, documenta BUG-URL-01.
 * Iniciativa: validar-contrato-de-mocks-vs-backend-real
 */

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { createOrder } from '../factories/order';

export const checkoutHandlers = [
  // POST /api/v1/checkout/ — crea una orden desde el carrito activo
  http.post('/api/v1/checkout/', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const order = createOrder({
      order_number: `PY-${new Date().getFullYear()}-${faker.number.int({ min: 100000, max: 999999 })}`,
      status: 'PENDING_PAYMENT',
    });
    return HttpResponse.json({ ...order, ...body }, { status: 201 });
  }),

  // GET /api/v1/checkout/eligibility/
  http.get('/api/v1/checkout/eligibility/', () =>
    HttpResponse.json({
      eligible: true,
      reasons: [],
      cart_item_count: faker.number.int({ min: 1, max: 5 }),
    })
  ),

  // POST /api/v1/checkout/express/
  http.post('/api/v1/checkout/express/', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const order = createOrder({ status: 'PENDING_PAYMENT' });
    return HttpResponse.json({
      ...order,
      redirect_url: null,
      message: 'Orden exprés creada',
      ...body,
    }, { status: 201 });
  }),

  // POST /api/orders/ — BUG-URL-01: path legacy del checkoutSlice @deprecated
  // Se mantiene para que el slice no rompa aunque no deba usarse
  http.post('/api/orders/', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const order = createOrder({ status: 'PENDING_PAYMENT' });
    return HttpResponse.json({ ...order, ...body }, { status: 201 });
  }),

  // POST /api/v1/payments/retry
  http.post('/api/v1/payments/retry', async ({ request }) => {
    const body = await request.json() as { order_number: string; gateway?: string };
    return HttpResponse.json({
      order_number: body.order_number,
      gateway: body.gateway ?? 'mercadopago',
      redirect_url: 'https://sandbox.mercadopago.com.mx/checkout/mock-retry',
    });
  }),

  // Legacy payment paths (checkoutSlice @deprecated — BUG-URL-01)
  http.post('/api/payments/mercadopago/create/', async () =>
    HttpResponse.json({
      preference_id: `TEST-LEGACY-${Date.now()}`,
      init_point: 'https://sandbox.mercadopago.com.mx/checkout/mock',
    })
  ),
  http.post('/api/payments/paypal/create/', async () =>
    HttpResponse.json({
      order_id: `PAYPAL-LEGACY-${Date.now()}`,
      approve_url: 'https://sandbox.paypal.com/checkoutnow/mock',
    })
  ),
];
