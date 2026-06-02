/**
 * Handlers MSW del dominio logistica.
 *
 * Paths alineados con logisticsSlice.js:
 *   POST   /api/v1/admin/orders/:orderNumber/guide/       — UC-LOG-01 crear guia
 *   PATCH  /api/v1/admin/orders/:orderNumber/tracking/    — UC-LOG-02 registrar rastreo
 *   GET    /api/v1/admin/couriers/                         — UC-LOG-06 listar
 *   POST   /api/v1/admin/couriers/                         — UC-LOG-06 crear
 *   PATCH  /api/v1/admin/couriers/:id/                     — UC-LOG-06 actualizar
 *   DELETE /api/v1/admin/couriers/:id/                     — UC-LOG-06 eliminar
 *   POST   /api/v1/orders/:orderNumber/shipping-issue/     — UC-LOG-07 reportar problema
 *
 * Identificadores y campos en ingles (DEC-DOC-005).
 */

import { http, HttpResponse } from 'msw';

interface Courier {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  tracking_url_template?: string | null;
}

// Couriers en memoria para consistencia entre requests.
const _couriers: Courier[] = [
  { id: 1, name: 'DHL Express',  code: 'DHL', is_active: true,  tracking_url_template: 'https://dhl.example/track?n={tracking}' },
  { id: 2, name: 'FedEx',        code: 'FDX', is_active: true,  tracking_url_template: 'https://fedex.example/track?n={tracking}' },
  { id: 3, name: 'Estafeta',     code: 'EST', is_active: false, tracking_url_template: null },
];
let _nextCourierId = 4;
let _guideSeq = 1000;

export const logisticsHandlers = [
  // ─── UC-LOG-01 — crear guia de envio ──────────────────────────────────────
  http.post('/api/v1/admin/orders/:orderNumber/guide/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const guideId = `G-${_guideSeq++}`;
    return HttpResponse.json({
      guide_id:     guideId,
      order_number: params.orderNumber,
      tracking:     null,
      status:       'CREATED',
      label_url:    `/media/guides/${guideId}.pdf`,
      ...body,
    }, { status: 201 });
  }),

  // ─── UC-LOG-02 — registrar numero de rastreo ──────────────────────────────
  http.patch('/api/v1/admin/orders/:orderNumber/tracking/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as { tracking?: string };
    return HttpResponse.json({
      order_number: params.orderNumber,
      tracking:     body.tracking ?? null,
      status:       'IN_TRANSIT',
    });
  }),

  // ─── UC-LOG-06 — listar couriers ──────────────────────────────────────────
  http.get('/api/v1/admin/couriers/', () =>
    HttpResponse.json({ count: _couriers.length, results: [..._couriers] }),
  ),

  // ─── UC-LOG-06 — crear courier ────────────────────────────────────────────
  http.post('/api/v1/admin/couriers/', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Partial<Courier>;
    const courier: Courier = {
      id:        _nextCourierId++,
      name:      body.name ?? 'Nuevo courier',
      code:      body.code ?? 'NEW',
      is_active: body.is_active ?? true,
      tracking_url_template: body.tracking_url_template ?? null,
    };
    _couriers.push(courier);
    return HttpResponse.json(courier, { status: 201 });
  }),

  // ─── UC-LOG-06 — actualizar courier ───────────────────────────────────────
  http.patch('/api/v1/admin/couriers/:id/', async ({ params, request }) => {
    const id   = Number(params.id);
    const body = await request.json().catch(() => ({})) as Partial<Courier>;
    const idx  = _couriers.findIndex((c) => c.id === id);
    if (idx < 0) {
      return HttpResponse.json({ detail: 'COURIER_INEXISTENTE' }, { status: 404 });
    }
    _couriers[idx] = { ..._couriers[idx], ...body, id };
    return HttpResponse.json(_couriers[idx]);
  }),

  // ─── UC-LOG-06 — eliminar courier ─────────────────────────────────────────
  http.delete('/api/v1/admin/couriers/:id/', ({ params }) => {
    const id  = Number(params.id);
    const idx = _couriers.findIndex((c) => c.id === id);
    if (idx >= 0) _couriers.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── UC-LOG-07 — reportar problema de envio (comprador) ───────────────────
  http.post('/api/v1/orders/:orderNumber/shipping-issue/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as { message?: string; category?: string };
    if (!body.message || !String(body.message).trim()) {
      return HttpResponse.json({ detail: 'MENSAJE_VACIO' }, { status: 422 });
    }
    return HttpResponse.json({
      id:           Math.floor(Math.random() * 100000),
      order_number: params.orderNumber,
      message:      body.message,
      category:     body.category ?? 'OTHER',
      status:       'OPEN',
      created_at:   new Date().toISOString(),
    }, { status: 201 });
  }),
];
