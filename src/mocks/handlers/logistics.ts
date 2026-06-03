/**
 * Handlers MSW del dominio logistica.
 *
 * Paths alineados con logisticsSlice.js y el backend real (apps.logistics, P-13):
 *   POST   /api/v1/logistics/guides/          — UC-LOG-01 crear guia
 *   PATCH  /api/v1/logistics/guides/:id/       — UC-LOG-02 actualizar estado
 *   GET    /api/v1/logistics/couriers/         — UC-LOG-06 listar
 *   POST   /api/v1/logistics/couriers/         — UC-LOG-06 crear
 *   PATCH  /api/v1/logistics/couriers/:id/     — UC-LOG-06 actualizar
 *   DELETE /api/v1/logistics/couriers/:id/     — UC-LOG-06 eliminar
 *
 * Identificadores y campos en ingles (DEC-DOC-005). La forma de la guia
 * replica ShipmentGuideSerializer: id, order_number, courier (anidado),
 * tracking_number, status.
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
  { id: 1, name: 'DHL Express',  code: 'DHL', is_active: true,  tracking_url_template: 'https://dhl.example/track?n={tracking_number}' },
  { id: 2, name: 'FedEx',        code: 'FDX', is_active: true,  tracking_url_template: 'https://fedex.example/track?n={tracking_number}' },
  { id: 3, name: 'Estafeta',     code: 'EST', is_active: false, tracking_url_template: null },
];
let _nextCourierId = 4;
let _guideSeq = 1000;

export const logisticsHandlers = [
  // ─── UC-LOG-01 — crear guia de envio ──────────────────────────────────────
  // POST /api/v1/logistics/guides/ body { order_id, courier_id,
  // tracking_number, notes } → ShipmentGuideSerializer.
  http.post('/api/v1/logistics/guides/', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const id = _guideSeq++;
    const courier = _couriers.find((c) => c.id === Number(body.courier_id)) ?? _couriers[0];
    return HttpResponse.json({
      id,
      order:           body.order_id ?? null,
      order_number:    `PY-2026-${String(id).padStart(6, '0')}`,
      courier,
      tracking_number: body.tracking_number ?? null,
      status:          'CREATED',
      notes:           body.notes ?? '',
      delivered_at:    null,
      estimated_delivery: null,
      last_event:      null,
    }, { status: 201 });
  }),

  // ─── UC-LOG-02 — actualizar estado de la guia ─────────────────────────────
  // PATCH /api/v1/logistics/guides/:id/ body { status, description }.
  http.patch('/api/v1/logistics/guides/:id/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as { status?: string };
    return HttpResponse.json({
      id:              Number(params.id),
      tracking_number: null,
      status:          body.status ?? 'IN_TRANSIT',
      courier:         _couriers[0],
      order_number:    `PY-2026-${String(params.id).padStart(6, '0')}`,
    });
  }),

  // ─── UC-LOG-06 — listar couriers ──────────────────────────────────────────
  http.get('/api/v1/logistics/couriers/', () =>
    HttpResponse.json([..._couriers]),
  ),

  // ─── UC-LOG-06 — crear courier ────────────────────────────────────────────
  http.post('/api/v1/logistics/couriers/', async ({ request }) => {
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
  http.patch('/api/v1/logistics/couriers/:id/', async ({ params, request }) => {
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
  // El backend hace soft-delete (is_active=false) y devuelve { deactivated }.
  http.delete('/api/v1/logistics/couriers/:id/', ({ params }) => {
    const id  = Number(params.id);
    const idx = _couriers.findIndex((c) => c.id === id);
    if (idx >= 0) _couriers[idx] = { ..._couriers[idx], is_active: false };
    return HttpResponse.json({ deactivated: true });
  }),
];
