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
 *   POST   /api/v1/logistics/shipping-quote/   — UC-LOG-09 calcular costo de envio
 *
 * Identificadores y campos en ingles (DEC-DOC-005). La forma de la guia
 * replica ShipmentGuideSerializer: id, order_number, courier (anidado),
 * tracking_number, status.
 *
 * UC-LOG-09 (shipping-quote) es una feature FABRICADA del template: el
 * catalogo de UCs (`catalogo-ucs.rst:2073`) la marca pendiente y el backend
 * de referencia no expone la ruta. El contrato vive aqui como mock
 * deterministico, sin libs nuevas ni estado entre requests:
 *   - `postal_code` debe ser 5 digitos -> 400 POSTAL_CODE_INVALID si no.
 *   - `zone` por el primer digito del CP:
 *       0-1 -> metropolitana   (cost 99,  ETA 2-4 dias)
 *       2-5 -> nacional        (cost 149, ETA 3-6 dias)
 *       6-9 -> extendida       (cost 199, ETA 5-9 dias)
 *   - `free_shipping_threshold` = 999.
 *   - `subtotal >= 999` -> qualifies_free_shipping y cost 0.
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

// ─── UC-LOG-09 — derivacion de zona / costo / ETA por codigo postal ─────────
const FREE_SHIPPING_THRESHOLD = 999;
const POSTAL_CODE_RE = /^\d{5}$/;

interface ZoneConfig {
  zone: string;
  cost: number;
  estimated_days_min: number;
  estimated_days_max: number;
}

/** Deriva la zona logistica a partir del primer digito del CP. */
function zoneForPostalCode(postalCode: string): ZoneConfig {
  const firstDigit = Number(postalCode[0]);
  if (firstDigit <= 1) {
    return { zone: 'metropolitana', cost: 99, estimated_days_min: 2, estimated_days_max: 4 };
  }
  if (firstDigit <= 5) {
    return { zone: 'nacional', cost: 149, estimated_days_min: 3, estimated_days_max: 6 };
  }
  return { zone: 'extendida', cost: 199, estimated_days_min: 5, estimated_days_max: 9 };
}

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

  // ─── UC-LOG-09 — calcular costo de envio ──────────────────────────────────
  http.post('/api/v1/logistics/shipping-quote/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { postal_code?: string; subtotal?: number }
      | null;

    const postalCode = body?.postal_code ?? '';
    if (!POSTAL_CODE_RE.test(postalCode)) {
      return HttpResponse.json(
        {
          detail: 'El codigo postal debe tener 5 digitos.',
          codigo_error: 'POSTAL_CODE_INVALID',
        },
        { status: 400 },
      );
    }

    const subtotal = Number(body?.subtotal ?? 0);
    const { zone, cost, estimated_days_min, estimated_days_max } =
      zoneForPostalCode(postalCode);

    const qualifies = subtotal >= FREE_SHIPPING_THRESHOLD;

    return HttpResponse.json({
      postal_code: postalCode,
      zone,
      cost: qualifies ? 0 : cost,
      currency: 'MXN',
      estimated_days_min,
      estimated_days_max,
      free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
      qualifies_free_shipping: qualifies,
    });
  }),

  // UC-LOG-07 — Reportar problema de envio (comprador). Feature FABRICADA del
  // template (sin backend de referencia): el comprador abre una incidencia sobre
  // una orden ya despachada. POST { order_id, reason, description } → 201.
  http.post('/api/v1/logistics/shipping-issues/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { order_id?: number | string; reason?: string; description?: string }
      | null;

    if (!body?.reason || !body?.description?.trim()) {
      return HttpResponse.json(
        {
          detail: 'Motivo y descripcion son obligatorios.',
          codigo_error: 'SHIPPING_ISSUE_INVALID',
        },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        id: Math.floor(Math.random() * 9000) + 1000,
        order_id: body.order_id ?? null,
        reason: body.reason,
        description: body.description,
        status: 'ABIERTO',
        created_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];
