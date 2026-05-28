/**
 * Handlers MSW del dominio orders.
 *
 * Paths alineados con ordersSlice.js:
 *   GET  /api/v1/orders/                     — listado paginado
 *   GET  /api/v1/orders/:orderNumber/         — detalle
 *   POST /api/v1/orders/:orderNumber/cancel/  — cancelacion
 *   PATCH /api/v1/orders/:orderNumber/address/  — actualizar direccion
 *   PATCH /api/v1/orders/:orderNumber/shipping/ — actualizar envio
 *   PATCH /api/v1/orders/:orderNumber/status/   — cambio de estado (admin)
 *
 * Corrige BUG-MOCK-01 (endpoint sin handler) y BUG-URL-02 (sub-endpoints faltantes).
 * Iniciativa: validar-contrato-de-mocks-vs-backend-real
 */

import { http, HttpResponse } from 'msw';
import type { PaginatedResponse, Order } from './types';
import { createOrder, createOrderList } from '../factories/order';

// Base de orders en memoria para consistencia entre requests
const _orders: Order[] = createOrderList(12);

export const ordersHandlers = [
  // GET /api/v1/orders/?page=N&status=...
  http.get('/api/v1/orders/', ({ request }) => {
    const url    = new URL(request.url);
    const page   = Number(url.searchParams.get('page') ?? 1);
    const status = url.searchParams.get('status') ?? '';
    const PAGE   = 10;

    let results = [..._orders];
    if (status) results = results.filter(o => o.status === status);

    const start  = (page - 1) * PAGE;
    const paged  = results.slice(start, start + PAGE);
    const body: PaginatedResponse<Order> = {
      count: results.length,
      next:  start + PAGE < results.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: paged,
    };
    return HttpResponse.json(body);
  }),

  // GET /api/v1/orders/:orderNumber/
  http.get('/api/v1/orders/:orderNumber/', ({ params }) => {
    const order = _orders.find(o => o.order_number === params.orderNumber)
      ?? createOrder({ order_number: params.orderNumber as string, status: 'PAID' });
    return HttpResponse.json(order);
  }),

  // POST /api/v1/orders/:orderNumber/cancel/
  http.post('/api/v1/orders/:orderNumber/cancel/', ({ params }) => {
    const idx = _orders.findIndex(o => o.order_number === params.orderNumber);
    if (idx >= 0) _orders[idx] = { ..._orders[idx], status: 'CANCELLED' };
    return HttpResponse.json({ status: 'CANCELLED', order_number: params.orderNumber });
  }),

  // PATCH /api/v1/orders/:orderNumber/address/
  http.patch('/api/v1/orders/:orderNumber/address/', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ order_number: params.orderNumber, ...body });
  }),

  // PATCH /api/v1/orders/:orderNumber/shipping/
  http.patch('/api/v1/orders/:orderNumber/shipping/', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ order_number: params.orderNumber, ...body });
  }),

  // PATCH /api/v1/orders/:orderNumber/status/  (admin)
  http.patch('/api/v1/orders/:orderNumber/status/', async ({ params, request }) => {
    const body = await request.json() as { status: string; notes?: string };
    const idx  = _orders.findIndex(o => o.order_number === params.orderNumber);
    if (idx >= 0) _orders[idx] = { ..._orders[idx], status: body.status as Order['status'] };
    return HttpResponse.json({ order_number: params.orderNumber, status: body.status });
  }),
];
