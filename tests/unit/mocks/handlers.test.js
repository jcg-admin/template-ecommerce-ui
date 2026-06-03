/**
 * Tests de los handlers MSW inventory + returns (UC-INV-01..05, UC-RET-01..06).
 *
 * Migracion de los 19 casos previamente en
 * `src/mocks/interceptors/{inventory,returns}.test.js` (eliminados en
 * T-018 de revisar-arquitectura-de-mocks). Aqui se ejercitan los
 * mismos casos pero a traves de fetch real interceptado por MSW
 * server, demostrando que la cobertura del interceptor heredado vive
 * en los handlers MSW equivalentes.
 *
 * Patron: cada test resetea el estado del modulo (__resetXState) en
 * beforeEach para mantener determinismo entre casos.
 */

import { __resetInventoryState } from '@mocks/handlers/inventory';
import { __resetReturnsState } from '@mocks/handlers/returns';

async function get(url) {
  const r = await fetch(url);
  const data = await r.json().catch(() => null);
  return { status: r.status, data };
}

async function post(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => null);
  return { status: r.status, data };
}

beforeEach(() => {
  __resetInventoryState();
  __resetReturnsState();
});

describe('mocks/handlers/inventory (UC-INV-01..05)', () => {
  it('GET /api/v1/admin/inventory/ retorna results + summary con keys en ingles', async () => {
    const r = await get('http://localhost/api/v1/admin/inventory/');
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data.results)).toBe(true);
    expect(r.data).toHaveProperty('summary');
    expect(r.data.summary).toHaveProperty('productos_normales');
    expect(r.data.summary).toHaveProperty('productos_bajo_stock');
    expect(r.data.summary).toHaveProperty('productos_agotados');
  });

  it('cada item incluye status calculado (NORMAL/BAJO/AGOTADO)', async () => {
    const r = await get('http://localhost/api/v1/admin/inventory/');
    const statuses = r.data.results.map((i) => i.status);
    expect(statuses).toEqual(expect.arrayContaining(['NORMAL', 'BAJO', 'AGOTADO']));
  });

  it('GET variants/<id>/movements/ retorna movimientos con type en ingles', async () => {
    const r = await get('http://localhost/api/v1/admin/inventory/variants/1/movements/');
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data.results)).toBe(true);
    expect(r.data.results[0]).toHaveProperty('type');
    expect(['SALE', 'CANCELLATION', 'MANUAL']).toContain(r.data.results[0].type);
  });

  it('GET movements de variante sin movimientos retorna lista vacia', async () => {
    const r = await get('http://localhost/api/v1/admin/inventory/variants/9999/movements/');
    expect(r.status).toBe(200);
    expect(r.data.results).toEqual([]);
  });

  it('POST adjust con new_quantity valido devuelve 200 + nuevo stock', async () => {
    const r = await post('http://localhost/api/v1/admin/inventory/variants/1/adjust/', {
      new_quantity: 15,
      reason: 'CONTEO_FISICO',
    });
    expect(r.status).toBe(200);
    expect(r.data.new_stock).toBe(15);
    expect(r.data.movement.type).toBe('MANUAL');
    const list = await get('http://localhost/api/v1/admin/inventory/');
    const v1 = list.data.results.find((i) => i.variant_id === 1);
    expect(v1.stock).toBe(15);
  });

  it('POST adjust sin reason devuelve 400', async () => {
    const r = await post('http://localhost/api/v1/admin/inventory/variants/1/adjust/', {
      new_quantity: 10,
    });
    expect(r.status).toBe(400);
  });

  it('POST adjust con new_quantity negativo devuelve 409', async () => {
    const r = await post('http://localhost/api/v1/admin/inventory/variants/1/adjust/', {
      new_quantity: -1,
      reason: 'MERMA',
    });
    expect(r.status).toBe(409);
    expect(r.data.detail).toMatch(/STOCK_NEGATIVO/);
  });

  it('POST adjust sobre variante inexistente devuelve 404', async () => {
    const r = await post('http://localhost/api/v1/admin/inventory/variants/999/adjust/', {
      new_quantity: 5,
      reason: 'AJUSTE',
    });
    expect(r.status).toBe(404);
  });

  it('POST /api/v1/admin/inventory/import/ devuelve 201 con reporte', async () => {
    const r = await post('http://localhost/api/v1/admin/inventory/import/');
    expect(r.status).toBe(201);
    expect(r.data).toHaveProperty('created');
    expect(r.data).toHaveProperty('updated');
    expect(r.data).toHaveProperty('errors');
    expect(r.data).toHaveProperty('download_url');
  });
});

describe('mocks/handlers/returns (UC-RET-01..06)', () => {
  it('GET /api/v1/returns/ retorna la lista con results y count', async () => {
    const r = await get('http://localhost/api/v1/returns/');
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data.results)).toBe(true);
    expect(r.data.count).toBe(r.data.results.length);
  });

  it('GET /api/v1/returns/<id>/ devuelve el detalle del comprador', async () => {
    const r = await get('http://localhost/api/v1/returns/1/');
    expect(r.status).toBe(200);
    expect(r.data.id).toBe(1);
    expect(r.data).toHaveProperty('order_id');
    expect(r.data).toHaveProperty('status');
    expect(r.data).toHaveProperty('items');
  });

  it('GET inexistente retorna 404', async () => {
    const r = await get('http://localhost/api/v1/returns/999/');
    expect(r.status).toBe(404);
    expect(r.data.detail).toMatch(/no encontrada/i);
  });

  it('POST /api/v1/returns/ crea (201) con order_number + reason', async () => {
    // El backend (ReturnCreateSerializer) valida `order_number` en el body;
    // la representación de lectura expone `order_id`.
    const r = await post('http://localhost/api/v1/returns/', {
      order_number: 'ORD-9999',
      reason: 'WRONG_ITEM',
    });
    expect(r.status).toBe(201);
    expect(r.data.order_id).toBe('ORD-9999');
    expect(r.data.status).toBe('PENDIENTE_REVISION');
  });

  it('POST sin reason devuelve 400', async () => {
    const r = await post('http://localhost/api/v1/returns/', {
      order_number: 'ORD-9999',
    });
    expect(r.status).toBe(400);
  });

  it('GET /api/v1/admin/returns/ incluye metrics + results', async () => {
    const r = await get('http://localhost/api/v1/admin/returns/');
    expect(r.status).toBe(200);
    expect(r.data).toHaveProperty('results');
    expect(r.data).toHaveProperty('metrics');
    expect(r.data.metrics).toHaveProperty('pendientes');
    expect(r.data.metrics).toHaveProperty('aprobadas');
  });

  it('POST approve actualiza el status del item', async () => {
    const r = await post('http://localhost/api/v1/admin/returns/1/approve/');
    expect(r.status).toBe(200);
    expect(r.data.status).toBe('APROBADA');
    const after = await get('http://localhost/api/v1/admin/returns/1/');
    expect(after.data.status).toBe('APROBADA');
  });

  it('POST reject sin justification devuelve 400', async () => {
    const r = await post('http://localhost/api/v1/admin/returns/1/reject/', {});
    expect(r.status).toBe(400);
  });

  it('POST refund antes de RECIBIDA devuelve 409', async () => {
    const r = await post('http://localhost/api/v1/admin/returns/1/refund/', {
      amount: 1250,
    });
    expect(r.status).toBe(409);
  });

  it('POST reception -> refund flujo completo', async () => {
    await post('http://localhost/api/v1/admin/returns/1/reception/', {
      product_condition: 'GOOD',
    });
    const r = await post('http://localhost/api/v1/admin/returns/1/refund/', {
      amount: 1250,
    });
    expect(r.status).toBe(200);
    expect(r.data.status).toBe('REEMBOLSADA');
    expect(r.data.refund.amount).toBe(1250);
  });
});
