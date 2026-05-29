/**
 * Handlers MSW del dominio inventory (admin).
 *
 * Cubre UC-INV-01..05 portados del interceptor heredado eliminado en
 * T-018 de la iniciativa `revisar-arquitectura-de-mocks`. Endpoints:
 *
 *   GET  /api/v1/admin/inventory/                          listado + summary
 *   GET  /api/v1/admin/inventory/variants/:id/movements/   historial
 *   POST /api/v1/admin/inventory/variants/:id/adjust/      ajuste con motivo
 *   POST /api/v1/admin/inventory/import/                   import masivo
 *
 * Estado en variables de modulo. Los exportados `__inventoryState` y
 * `__resetInventoryState` se preservan para uso desde tests; el
 * subarbol `src/mocks/interceptors/` heredado fue eliminado en T-018
 * de la iniciativa `revisar-arquitectura-de-mocks`.
 */

import { http, HttpResponse } from 'msw';

type StockStatus = 'NORMAL' | 'BAJO' | 'AGOTADO';

interface InventoryItem {
  variant_id: number;
  sku: string;
  product_name: string;
  stock: number;
  min_threshold: number;
}

interface InventoryMovement {
  id: number;
  type: 'SALE' | 'CANCELLATION' | 'MANUAL';
  delta: number;
  reason: string;
  observations?: string;
  created_at: string;
}

interface ImportReport {
  id: number;
  created: number;
  updated: number;
  errors: number;
  error_report: string | null;
  download_url: string | null;
}

const initialItems = (): InventoryItem[] => [
  { variant_id: 1, sku: 'OSHU-CH', product_name: 'Collar Oshun',   stock: 8,  min_threshold: 3 },
  { variant_id: 2, sku: 'OSHU-MD', product_name: 'Collar Oshun',   stock: 2,  min_threshold: 3 },
  { variant_id: 3, sku: 'YEMA-CH', product_name: 'Elekes Yemaya',  stock: 0,  min_threshold: 2 },
  { variant_id: 4, sku: 'ELE-OB',  product_name: 'Elekes Obatala', stock: 12, min_threshold: 4 },
];

const initialMovements = (): Record<number, InventoryMovement[]> => ({
  1: [
    { id: 1, type: 'SALE',   delta: -1, reason: 'Venta #1001',     created_at: '2026-05-01T10:00:00Z' },
    { id: 2, type: 'MANUAL', delta:  3, reason: 'CONTEO_FISICO',   created_at: '2026-05-10T12:00:00Z' },
  ],
  2: [
    { id: 3, type: 'CANCELLATION', delta: 1, reason: 'Cancelacion #1003', created_at: '2026-05-11T08:30:00Z' },
  ],
});

const state: {
  items: InventoryItem[];
  movements: Record<number, InventoryMovement[]>;
  importReports: ImportReport[];
} = {
  items: initialItems(),
  movements: initialMovements(),
  importReports: [],
};

function classify(stock: number, threshold: number): StockStatus {
  if (stock <= 0) return 'AGOTADO';
  if (stock <= threshold) return 'BAJO';
  return 'NORMAL';
}

function summary() {
  return {
    productos_normales:   state.items.filter((i) => classify(i.stock, i.min_threshold) === 'NORMAL').length,
    productos_bajo_stock: state.items.filter((i) => classify(i.stock, i.min_threshold) === 'BAJO').length,
    productos_agotados:   state.items.filter((i) => classify(i.stock, i.min_threshold) === 'AGOTADO').length,
  };
}

function decorate(item: InventoryItem) {
  return { ...item, status: classify(item.stock, item.min_threshold) };
}

export const inventoryHandlers = [
  http.get('/api/v1/admin/inventory/', () => {
    return HttpResponse.json({
      count: state.items.length,
      results: state.items.map(decorate),
      summary: summary(),
    });
  }),

  http.get('/api/v1/admin/inventory/variants/:id/movements/', ({ params }) => {
    const id = parseInt(String(params.id), 10);
    const movs = state.movements[id] ?? [];
    return HttpResponse.json({ count: movs.length, results: movs });
  }),

  http.post('/api/v1/admin/inventory/variants/:id/adjust/', async ({ params, request }) => {
    const id = parseInt(String(params.id), 10);
    const item = state.items.find((i) => i.variant_id === id);
    if (!item) {
      return HttpResponse.json({ detail: 'Variante no encontrada.' }, { status: 404 });
    }
    const body = (await request.json().catch(() => null)) as {
      new_quantity?: number;
      reason?: string;
      observations?: string;
    } | null;
    const newQty = body?.new_quantity;
    if (typeof newQty !== 'number' || Number.isNaN(newQty)) {
      return HttpResponse.json({ detail: 'new_quantity numerico es obligatorio.' }, { status: 400 });
    }
    if (newQty < 0) {
      return HttpResponse.json({ detail: 'STOCK_NEGATIVO_NO_PERMITIDO' }, { status: 409 });
    }
    if (!body?.reason) {
      return HttpResponse.json({ detail: 'reason es obligatorio.' }, { status: 400 });
    }
    const delta = newQty - item.stock;
    item.stock = newQty;
    state.movements[id] = state.movements[id] ?? [];
    const mov: InventoryMovement = {
      id: (state.movements[id].length + 1) * 100 + id,
      type: 'MANUAL',
      delta,
      reason: body.reason,
      observations: body.observations ?? '',
      created_at: new Date().toISOString(),
    };
    state.movements[id].push(mov);
    return HttpResponse.json({
      variant_id: id,
      new_stock: newQty,
      movement: mov,
    });
  }),

  http.post('/api/v1/admin/inventory/import/', () => {
    const report: ImportReport = {
      id: state.importReports.length + 1,
      created: 3,
      updated: 2,
      errors: 0,
      error_report: null,
      download_url: null,
    };
    state.importReports.push(report);
    return HttpResponse.json(report, { status: 201 });
  }),
];

// Exportados para tests. Permiten resetear estado entre casos.
// Antes vivian como `__resetInventoryState` del interceptor heredado
// en `src/mocks/interceptors/inventory.js`, eliminado en T-018.
export const __inventoryState = state;
export const __resetInventoryState = () => {
  state.items = initialItems();
  state.movements = initialMovements();
  state.importReports = [
  // ── Stock-Alerts — SKUs con stock bajo o agotado ───────────────────
  http.get('/api/v1/admin/inventory/alerts/', () => {
    const alerts = state.items
      .filter((item) => item.stock <= item.min_threshold)
      .map((item) => ({
        variant_id:    item.variant_id,
        product_id:    item.variant_id,
        sku:           item.sku,
        product_name:  item.product_name,
        variant_label: item.sku,
        orisha_name:   'Oshún',
        stock:         item.stock,
        threshold:     item.min_threshold,
      }));
    return HttpResponse.json({ count: alerts.length, results: alerts });
  }),
];
};
