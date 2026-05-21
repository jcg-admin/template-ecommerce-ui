/**
 * Handlers MSW del dominio returns.
 *
 * Cubre UC-RET-01..06 portados textualmente del interceptor heredado
 * `src/mocks/interceptors/returns.js`. Endpoints:
 *
 *   GET  /api/v1/returns/                              comprador: listado
 *   GET  /api/v1/returns/:id/                          comprador: detalle
 *   POST /api/v1/returns/                              comprador: crear
 *   GET  /api/v1/admin/returns/                        admin: bandeja con metrics
 *   GET  /api/v1/admin/returns/:id/                    admin: detalle
 *   POST /api/v1/admin/returns/:id/approve/            admin: aprobar
 *   POST /api/v1/admin/returns/:id/reject/             admin: rechazar (justification)
 *   POST /api/v1/admin/returns/:id/request-info/       admin: solicitar info (message)
 *   POST /api/v1/admin/returns/:id/reception/          admin: recepcion (product_condition)
 *   POST /api/v1/admin/returns/:id/refund/             admin: reembolso (amount)
 *
 * Estado en variables de modulo; idem inventory.
 */

import { http, HttpResponse } from 'msw';

type ReturnStatus =
  | 'PENDIENTE_REVISION'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'PENDIENTE_INFORMACION'
  | 'RECIBIDA'
  | 'COMPLETADA'
  | 'REEMBOLSADA';

interface ReturnItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface ReturnHistory {
  id: number;
  status: ReturnStatus;
  created_at: string;
}

interface RefundInfo {
  status: string;
  amount: number;
}

interface ReturnRecord {
  id: number;
  order_id: string;
  customer: { name: string; email: string };
  reason: string;
  description: string;
  status: ReturnStatus;
  items: ReturnItem[];
  history: ReturnHistory[];
  refund: RefundInfo | null;
  rejection_reason?: string;
  product_condition?: string;
  created_at: string;
}

function buildSeed(id: number, overrides: Partial<ReturnRecord> = {}): ReturnRecord {
  return {
    id,
    order_id: `ORD-${1000 + id}`,
    customer: { name: 'Demo User', email: 'comprador@test.mx' },
    reason: 'DAMAGED_ON_ARRIVAL',
    description: 'Llego danado en la caja externa.',
    status: 'PENDIENTE_REVISION',
    items: [{ id: 1, product_name: 'Collar Oshun', quantity: 1, price: 1250 }],
    history: [{ id: 1, status: 'PENDIENTE_REVISION', created_at: new Date().toISOString() }],
    refund: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

const initialItems = (): ReturnRecord[] => [
  buildSeed(1),
  buildSeed(2, { status: 'APROBADA' }),
  buildSeed(3, { status: 'PENDIENTE_INFORMACION' }),
];

const state = {
  items: initialItems(),
  nextId: 4,
};

function findById(id: number) {
  return state.items.find((r) => r.id === id);
}

function applyUpdate(id: number, patch: Partial<ReturnRecord>) {
  const idx = state.items.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  state.items[idx] = { ...state.items[idx], ...patch };
  return state.items[idx];
}

function metrics() {
  return {
    pendientes:     state.items.filter((r) => r.status === 'PENDIENTE_REVISION').length,
    aprobadas:      state.items.filter((r) => r.status === 'APROBADA').length,
    pendiente_info: state.items.filter((r) => r.status === 'PENDIENTE_INFORMACION').length,
  };
}

export const returnsHandlers = [
  // Cliente
  http.get('/api/v1/returns/', () => {
    return HttpResponse.json({ count: state.items.length, results: state.items });
  }),

  http.get('/api/v1/returns/:id/', ({ params }) => {
    const id = parseInt(String(params.id), 10);
    const item = findById(id);
    return item
      ? HttpResponse.json(item)
      : HttpResponse.json({ detail: 'Devolucion no encontrada.' }, { status: 404 });
  }),

  http.post('/api/v1/returns/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { order_id?: string; reason?: string; description?: string }
      | null;
    if (!body?.order_id || !body?.reason) {
      return HttpResponse.json(
        { detail: 'order_id y reason son obligatorios.' },
        { status: 400 }
      );
    }
    const created = buildSeed(state.nextId++, {
      order_id: body.order_id,
      reason: body.reason,
      description: body.description ?? '',
      status: 'PENDIENTE_REVISION',
    });
    state.items.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  // Admin: bandeja con metrics
  http.get('/api/v1/admin/returns/', () => {
    return HttpResponse.json({
      count: state.items.length,
      results: state.items,
      metrics: metrics(),
    });
  }),

  http.get('/api/v1/admin/returns/:id/', ({ params }) => {
    const id = parseInt(String(params.id), 10);
    const item = findById(id);
    return item
      ? HttpResponse.json(item)
      : HttpResponse.json({ detail: 'Devolucion no encontrada.' }, { status: 404 });
  }),

  http.post('/api/v1/admin/returns/:id/approve/', ({ params }) => {
    const id = parseInt(String(params.id), 10);
    if (!findById(id)) {
      return HttpResponse.json({ detail: 'Devolucion no encontrada.' }, { status: 404 });
    }
    return HttpResponse.json(applyUpdate(id, { status: 'APROBADA' }));
  }),

  http.post('/api/v1/admin/returns/:id/reject/', async ({ params, request }) => {
    const id = parseInt(String(params.id), 10);
    if (!findById(id)) {
      return HttpResponse.json({ detail: 'Devolucion no encontrada.' }, { status: 404 });
    }
    const body = (await request.json().catch(() => null)) as
      | { justification?: string }
      | null;
    if (!body?.justification) {
      return HttpResponse.json({ detail: 'justification es obligatoria.' }, { status: 400 });
    }
    return HttpResponse.json(
      applyUpdate(id, { status: 'RECHAZADA', rejection_reason: body.justification })
    );
  }),

  http.post('/api/v1/admin/returns/:id/request-info/', async ({ params, request }) => {
    const id = parseInt(String(params.id), 10);
    if (!findById(id)) {
      return HttpResponse.json({ detail: 'Devolucion no encontrada.' }, { status: 404 });
    }
    const body = (await request.json().catch(() => null)) as
      | { message?: string }
      | null;
    if (!body?.message) {
      return HttpResponse.json({ detail: 'message es obligatorio.' }, { status: 400 });
    }
    return HttpResponse.json(applyUpdate(id, { status: 'PENDIENTE_INFORMACION' }));
  }),

  http.post('/api/v1/admin/returns/:id/reception/', async ({ params, request }) => {
    const id = parseInt(String(params.id), 10);
    if (!findById(id)) {
      return HttpResponse.json({ detail: 'Devolucion no encontrada.' }, { status: 404 });
    }
    const body = (await request.json().catch(() => null)) as
      | { product_condition?: string }
      | null;
    if (!body?.product_condition) {
      return HttpResponse.json({ detail: 'product_condition es obligatorio.' }, { status: 400 });
    }
    return HttpResponse.json(
      applyUpdate(id, { status: 'RECIBIDA', product_condition: body.product_condition })
    );
  }),

  http.post('/api/v1/admin/returns/:id/refund/', async ({ params, request }) => {
    const id = parseInt(String(params.id), 10);
    const item = findById(id);
    if (!item) {
      return HttpResponse.json({ detail: 'Devolucion no encontrada.' }, { status: 404 });
    }
    if (item.status !== 'RECIBIDA' && item.status !== 'COMPLETADA') {
      return HttpResponse.json(
        { detail: 'La devolucion debe estar recibida antes de reembolsar.' },
        { status: 409 }
      );
    }
    const body = (await request.json().catch(() => null)) as { amount?: number } | null;
    return HttpResponse.json(
      applyUpdate(id, {
        status: 'REEMBOLSADA',
        refund: { status: 'COMPLETED', amount: body?.amount ?? 0 },
      })
    );
  }),
];

// Exportados para tests heredados.
export const __returnsState = state;
export const __resetReturnsState = () => {
  state.items = initialItems();
  state.nextId = 4;
};
