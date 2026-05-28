/**
 * Handlers MSW del dominio admin.
 *
 * Paths alineados con adminSlice.js y páginas de admin:
 *   GET  /api/v1/admin/metrics/
 *   GET  /api/v1/admin/orders/
 *   GET  /api/v1/admin/products/
 *   GET  /api/v1/admin/users/
 *   GET  /api/v1/admin/vouchers/
 *   GET  /api/v1/admin/categories/
 *   GET  /api/v1/admin/payments
 *   GET  /api/v1/admin/settings/
 *   GET  /api/v1/admin/product-discounts/
 *   POST /api/v1/admin/product-discounts/
 *   GET  /api/v1/admin/notifications/
 *   POST /api/v1/admin/backups/trigger/
 *   POST /api/v1/admin/price-sync/preview-csv/
 *   POST /api/v1/admin/price-sync/apply-csv/
 *   POST /api/v1/admin/price-sync/preview-percentage/
 *   POST /api/v1/admin/price-sync/apply-percentage/
 *   GET/PATCH /api/v1/admin/users/:id/
 *   POST /api/v1/admin/users/:id/suspend/
 *   POST /api/v1/admin/users/:id/reactivate/
 *
 * Corrige BUG-MOCK-01 (16 endpoints admin sin handler).
 * Iniciativa: validar-contrato-de-mocks-vs-backend-real
 */

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { createOrderList } from '../factories/order';
import { createProductList } from '../factories/product';
import { createUser } from '../factories/user';
import { createVoucher } from '../factories/voucher';

const _adminOrders   = createOrderList(35);
const _adminProducts = createProductList(50);
const _adminUsers    = Array.from({ length: 20 }, (_, i) =>
  createUser({ id: i + 1, is_staff: i === 0, is_admin: i === 0 })
);

export const adminHandlers = [

  // ── Métricas — shape alineada con AdminDashboardPage.jsx ──────────
  http.get('/api/v1/admin/metrics/', () =>
    HttpResponse.json({
      // KPIs del día
      sales_today:      faker.number.int({ min: 2000, max: 25000 }),
      sales_delta_pct:  faker.number.float({ min: -15, max: 30, fractionDigits: 1 }),
      orders_today:     faker.number.int({ min: 0, max: 20 }),
      orders_delta_pct: faker.number.float({ min: -10, max: 25, fractionDigits: 1 }),
      avg_ticket:       faker.number.int({ min: 300, max: 2000 }),
      ticket_delta_pct: faker.number.float({ min: -5, max: 15, fractionDigits: 1 }),
      new_users_today:  faker.number.int({ min: 0, max: 8 }),
      users_delta_pct:  faker.number.float({ min: -5, max: 20, fractionDigits: 1 }),
      // Listas
      recent_orders: _adminOrders.slice(0, 6),
      alerts: [
        { id: 1, type: 'low_stock', message: '3 productos con stock bajo', level: 'warning' },
      ],
      top_products: _adminProducts.slice(0, 5).map(p => ({
        ...p, revenue: faker.number.int({ min: 500, max: 5000 }),
        units_sold: faker.number.int({ min: 5, max: 80 }),
      })),
      sales_by_orisha: [
        { orisha: 'Yemayá', revenue: 12500 },
        { orisha: 'Shangó', revenue: 9800 },
        { orisha: 'Obatalá', revenue: 7200 },
      ],
    })
  ),

  // ── Órdenes admin ───────────────────────────────────────────────────
  http.get('/api/v1/admin/orders/', ({ request }) => {
    const url    = new URL(request.url);
    const page   = Number(url.searchParams.get('page') ?? 1);
    const status = url.searchParams.get('status') ?? '';
    const PAGE   = 20;
    let results  = [..._adminOrders];
    if (status) results = results.filter(o => o.status === status);
    const start  = (page - 1) * PAGE;
    return HttpResponse.json({
      count: results.length,
      next: start + PAGE < results.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: results.slice(start, start + PAGE),
    });
  }),

  // ── Productos admin ─────────────────────────────────────────────────
  http.get('/api/v1/admin/products/', ({ request }) => {
    const url  = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const q    = (url.searchParams.get('q') ?? '').toLowerCase();
    const PAGE = 20;
    let results = [..._adminProducts];
    if (q) results = results.filter(p => p.name.toLowerCase().includes(q));
    const start = (page - 1) * PAGE;
    return HttpResponse.json({
      count: results.length,
      next: start + PAGE < results.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: results.slice(start, start + PAGE),
    });
  }),

  // ── Usuarios admin ──────────────────────────────────────────────────
  http.get('/api/v1/admin/users/', ({ request }) => {
    const url  = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const PAGE = 10;
    const start = (page - 1) * PAGE;
    return HttpResponse.json({
      count: _adminUsers.length,
      next: start + PAGE < _adminUsers.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: _adminUsers.slice(start, start + PAGE),
    });
  }),

  http.get('/api/v1/admin/users/:id/', ({ params }) => {
    const user = _adminUsers.find(u => u.id === Number(params.id))
      ?? createUser({ id: Number(params.id) });
    return HttpResponse.json(user);
  }),

  http.patch('/api/v1/admin/users/:id/', async ({ params, request }) => {
    const body = await request.json() as Partial<ReturnType<typeof createUser>>;
    const idx  = _adminUsers.findIndex(u => u.id === Number(params.id));
    if (idx >= 0) Object.assign(_adminUsers[idx], body);
    return HttpResponse.json(_adminUsers[idx] ?? createUser({ id: Number(params.id) }));
  }),

  http.post('/api/v1/admin/users/:id/suspend/', ({ params }) =>
    HttpResponse.json({ id: Number(params.id), status: 'suspended' })
  ),
  http.post('/api/v1/admin/users/:id/reactivate/', ({ params }) =>
    HttpResponse.json({ id: Number(params.id), status: 'active' })
  ),

  // ── Vouchers admin ──────────────────────────────────────────────────
  http.get('/api/v1/admin/vouchers/', () => {
    const vouchers = Array.from({ length: 10 }, () => createVoucher());
    return HttpResponse.json({ count: vouchers.length, results: vouchers, next: null, previous: null });
  }),

  // ── Categorías admin ────────────────────────────────────────────────
  http.get('/api/v1/admin/categories/', () => {
    const cats = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: faker.commerce.department(),
      slug: `cat-${i + 1}`,
      product_count: faker.number.int({ min: 0, max: 40 }),
    }));
    return HttpResponse.json({ count: cats.length, results: cats, next: null, previous: null });
  }),

  // ── Pagos admin ─────────────────────────────────────────────────────
  http.get('/api/v1/admin/payments', ({ request }) => {
    const url  = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const PAGE = 20;
    const payments = _adminOrders.map(o => ({
      id: faker.number.int({ min: 1000, max: 9999 }),
      order_number: o.order_number,
      gateway: faker.helpers.arrayElement(['mercadopago', 'paypal', 'cash']),
      amount: o.total,
      status: faker.helpers.arrayElement(['approved', 'pending', 'rejected']),
      created_at: o.created_at,
    }));
    const start = (page - 1) * PAGE;
    return HttpResponse.json({
      count: payments.length,
      results: payments.slice(start, start + PAGE),
      next: start + PAGE < payments.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
    });
  }),

  // ── Configuración admin ─────────────────────────────────────────────
  http.get('/api/v1/admin/settings/', () =>
    HttpResponse.json({
      site_name: 'Práctica Yorùbà',
      site_description: 'Tienda de objetos ceremoniales',
      currency: 'MXN',
      tax_rate: 0.16,
      shipping_fee_default: 150,
      free_shipping_threshold: 1500,
      maintenance_mode: false,
      allow_guest_checkout: true,
    })
  ),

  http.patch('/api/v1/admin/settings/', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // ── Descuentos de producto ──────────────────────────────────────────
  http.get('/api/v1/admin/product-discounts/', () => {
    const discounts = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      product_id: faker.number.int({ min: 1, max: 50 }),
      product_name: faker.commerce.productName(),
      discount_type: faker.helpers.arrayElement(['PERCENT', 'FIXED']),
      value: faker.number.int({ min: 5, max: 30 }),
      valid_from: faker.date.recent({ days: 10 }).toISOString(),
      valid_until: faker.date.soon({ days: 20 }).toISOString(),
      is_active: faker.datatype.boolean(),
    }));
    return HttpResponse.json({ count: discounts.length, results: discounts, next: null, previous: null });
  }),

  http.post('/api/v1/admin/product-discounts/', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: Date.now(), is_active: true, ...body }, { status: 201 });
  }),

  // ── Price sync ──────────────────────────────────────────────────────
  http.post('/api/v1/admin/price-sync/preview-csv/', async () =>
    HttpResponse.json({
      preview: _adminProducts.slice(0, 5).map(p => ({
        sku: p.sku ?? `SKU-${p.id}`,
        name: p.name,
        current_price: p.price_with_tax,
        new_price: Math.round(p.price_with_tax * 1.05),
        change: '+5%',
      })),
      affected_count: 5,
    })
  ),

  http.post('/api/v1/admin/price-sync/apply-csv/', async () =>
    HttpResponse.json({ applied: true, updated_count: 5, errors: [] })
  ),

  http.post('/api/v1/admin/price-sync/preview-percentage/', async ({ request }) => {
    const body = await request.json() as { percentage: number; category?: string };
    const pct  = (body.percentage ?? 0) / 100;
    return HttpResponse.json({
      preview: _adminProducts.slice(0, 3).map(p => ({
        sku: p.sku ?? `SKU-${p.id}`,
        name: p.name,
        current_price: p.price_with_tax,
        new_price: Math.round(p.price_with_tax * (1 + pct)),
        change: `${body.percentage > 0 ? '+' : ''}${body.percentage}%`,
      })),
      affected_count: _adminProducts.length,
    });
  }),

  http.post('/api/v1/admin/price-sync/apply-percentage/', async ({ request }) => {
    const body = await request.json() as { percentage: number };
    return HttpResponse.json({
      applied: true,
      updated_count: _adminProducts.length,
      percentage: body.percentage,
      errors: [],
    });
  }),

  // ── Notificaciones admin ────────────────────────────────────────────
  http.get('/api/v1/admin/notifications/', () => {
    const notifs = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      type: faker.helpers.arrayElement(['order_new', 'stock_low', 'return_new', 'user_new']),
      message: faker.lorem.sentence(),
      read: faker.datatype.boolean(),
      created_at: faker.date.recent({ days: 3 }).toISOString(),
    }));
    return HttpResponse.json({ count: notifs.length, results: notifs });
  }),

  // ── Backups ─────────────────────────────────────────────────────────
  http.post('/api/v1/admin/backups/trigger/', () =>
    HttpResponse.json({
      backup_id: `BKP-${Date.now()}`,
      status: 'initiated',
      estimated_duration_seconds: 45,
      message: 'Backup iniciado correctamente',
    }, { status: 202 })
  ),
];
