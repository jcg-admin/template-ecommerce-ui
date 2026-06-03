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
 *   GET  /api/v1/config/settings/   (singleton global; UC-ADM-04/CFG-03/05)
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

  // ── Configuración global (UC-ADM-04 / UC-CFG-03 / UC-CFG-05) ──────────
  // Endpoint canónico singleton: GET/PATCH /api/v1/config/settings/
  // (rest-api-conventions.rst:92). Sirve tanto al admin como al storefront
  // (footer + contacto) en modo demo.
  // Endpoints reales (backend Django): admin edita en /api/v1/admin/settings/
  // (AdminSiteSettingsView) y el storefront lee el subconjunto público en
  // /api/v1/config/settings/ (SiteSettingsView). Campos alineados al
  // AdminSiteSettingsSerializer real (apps/settings_app/serializers.py).
  http.get('/api/v1/admin/settings/', () =>
    HttpResponse.json({
      id: 1,
      site_name: 'Práctica Yorùbà',
      currency: 'MXN',
      iva_rate: 0.16,
      payment_timeout_minutes: 30,
      order_timeout_minutes: 60,
      max_return_days: 30,
      min_stock_threshold: 5,
      free_shipping_threshold: 1500,
      // UC-CFG-05 — datos de contacto
      support_email: 'hola@practicayoruba.com',
      phone: '+52 55 1111 2222',
      address: 'Av. Reforma 123, Col. Centro, CDMX, 06600',
      social_links: {
        facebook:  'https://facebook.com/practicayoruba',
        instagram: 'https://instagram.com/practicayoruba',
        youtube:   'https://youtube.com/@practicayoruba',
      },
      updated_at: '2026-06-02T00:00:00Z',
    })
  ),

  http.patch('/api/v1/admin/settings/', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(body);
  }),

  // UC-CFG-05 — lectura pública (footer + contacto). Subconjunto público real
  // (SiteSettingsSerializer excluye site_name/currency/order_timeout/max_return).
  http.get('/api/v1/config/settings/', () =>
    HttpResponse.json({
      id: 1,
      iva_rate: 0.16,
      payment_timeout_minutes: 30,
      min_stock_threshold: 5,
      free_shipping_threshold: 1500,
      support_email: 'hola@practicayoruba.com',
      phone: '+52 55 1111 2222',
      address: 'Av. Reforma 123, Col. Centro, CDMX, 06600',
      social_links: {
        facebook:  'https://facebook.com/practicayoruba',
        instagram: 'https://instagram.com/practicayoruba',
        youtube:   'https://youtube.com/@practicayoruba',
      },
      updated_at: '2026-06-02T00:00:00Z',
    })
  ),

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
  // Shape real (price_sync_views.py): { session_id, valid_count,
  // invalid_count, preview: [{sku, product_name, old_price, new_price,
  // diff_pct}], errors: [{sku, error, line}] }
  http.post('/api/v1/admin/price-sync/preview-csv/', async () =>
    HttpResponse.json({
      session_id:    'sess-mock-001',
      valid_count:   5,
      invalid_count: 0,
      preview: _adminProducts.slice(0, 5).map(p => ({
        sku:          p.sku ?? `SKU-${p.id}`,
        product_id:   p.id,
        product_name: p.name,
        old_price:    String(p.price_with_tax),
        new_price:    String(Math.round(p.price_with_tax * 1.05)),
        diff_pct:     5,
      })),
      errors: [],
    })
  ),

  // apply-csv real: ← { session_id } → { updated_count, message }
  http.post('/api/v1/admin/price-sync/apply-csv/', async () =>
    HttpResponse.json({ updated_count: 5, message: '5 precios actualizados correctamente.' })
  ),

  // Shape real: ← { pct, category_id?, price_min?, price_max? }
  //             → { session_id, valid_count, preview:[...], pct }
  http.post('/api/v1/admin/price-sync/preview-percentage/', async ({ request }) => {
    const body = await request.json() as { pct: number };
    const pct  = (body.pct ?? 0) / 100;
    const rows = _adminProducts.slice(0, 3);
    return HttpResponse.json({
      session_id:  'sess-pct-mock',
      valid_count: rows.length,
      pct:         body.pct ?? 0,
      preview: rows.map(p => ({
        sku:          p.sku ?? `SKU-${p.id}`,
        product_id:   p.id,
        product_name: p.name,
        old_price:    String(p.price_with_tax),
        new_price:    String(Math.round(p.price_with_tax * (1 + pct))),
        diff_pct:     body.pct ?? 0,
      })),
      errors: [],
    });
  }),

  // apply-percentage real: ← { session_id } → { updated_count, message }
  http.post('/api/v1/admin/price-sync/apply-percentage/', async () =>
    HttpResponse.json({ updated_count: 3, message: '3 precios actualizados correctamente.' })
  ),

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

  // ── Producto admin individual ────────────────────────────────────────
  http.get('/api/v1/admin/products/:id/', ({ params }) => {
    const id = Number(params.id);
    const p  = _adminProducts.find((x) => x.id === id);
    if (!p) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 });
    return HttpResponse.json({ ...p, images: [], variants: [] });
  }),

  http.patch('/api/v1/admin/products/:id/', async ({ params, request }) => {
    const id   = Number(params.id);
    const body = await request.json() as Record<string, unknown>;
    const idx  = _adminProducts.findIndex((x) => x.id === id);
    if (idx < 0) return HttpResponse.json({ detail: 'No encontrado' }, { status: 404 });
    _adminProducts[idx] = { ..._adminProducts[idx], ...body };
    return HttpResponse.json(_adminProducts[idx]);
  }),

  // ── Gateways de pago — configuración ────────────────────────────────
  http.get('/api/v1/admin/gateways/', () =>
    HttpResponse.json({
      count: 2,
      results: [
        {
          id: 'mercadopago', label: 'MercadoPago', is_active: true,
          mode: 'sandbox', last_test_at: '2026-05-20T10:00:00Z',
          meta: {
            label: 'MercadoPago',
            desc: 'Pagos con tarjeta, OXXO y transferencia SPEI.',
            fields: ['public_key', 'access_token'],
          },
        },
        {
          id: 'paypal', label: 'PayPal', is_active: false,
          mode: 'sandbox', last_test_at: null,
          meta: {
            label: 'PayPal',
            desc: 'Pagos internacionales con cuenta PayPal o tarjeta.',
            fields: ['client_id', 'client_secret'],
          },
        },
      ],
    })
  ),

  http.patch('/api/v1/admin/gateways/:id/', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: params.id, ...body });
  }),

  http.post('/api/v1/admin/gateways/:id/test/', ({ params }) =>
    HttpResponse.json({
      ok:         true,
      gateway_id: params.id,
      message:    `Conexión con ${params.id} en modo sandbox verificada correctamente.`,
      latency_ms: 142,
    })
  ),

  // ── Métodos de envío ─────────────────────────────────────────────────
  http.get('/api/v1/admin/shipping-methods/', () =>
    HttpResponse.json({
      count: 3,
      results: [
        { id: 1, name: 'DHL Express', carrier: 'DHL',  price: 120, free_threshold: 1500, min_days: 1, max_days: 3,  is_active: true },
        { id: 2, name: 'Fedex Estándar', carrier: 'FedEx', price: 85,  free_threshold: 1000, min_days: 3, max_days: 7,  is_active: true },
        { id: 3, name: 'Estafeta Económico', carrier: 'Estafeta', price: 55, free_threshold: 800, min_days: 5, max_days: 10, is_active: false },
      ],
    })
  ),

  // ── Páginas CMS estáticas (apps.static_content, UC-CFG-04) ───────────
  // El list view real devuelve un array plano (StaticContentSerializer many).
  http.get('/api/v1/admin/static-content/', () =>
    HttpResponse.json([
      { id: 1, slug: 'acerca-de',  title: 'Acerca de Oja Yoruba',   body: '<p>Somos una tienda especializada en productos para la práctica yorùbá.</p>', version: 3, updated_at: '2026-04-01T00:00:00Z' },
      { id: 2, slug: 'terminos',   title: 'Términos y condiciones',  body: '<p>Estos son nuestros términos.</p>', version: 2, updated_at: '2026-03-15T00:00:00Z' },
      { id: 3, slug: 'privacidad', title: 'Aviso de privacidad',     body: '<p>Aviso de privacidad de Oja Yoruba.</p>', version: 1, updated_at: '2026-03-10T00:00:00Z' },
    ])
  ),

  // Detail: pagina + versions[] anidadas (StaticContentSerializer).
  http.get('/api/v1/admin/static-content/:slug/', ({ params }) => {
    const mk = (id: number, slug: string, title: string, body: string, version: number) => ({
      id, slug, title, body, version, updated_at: '2026-04-01T00:00:00Z',
      versions: Array.from({ length: version }, (_, i) => ({
        id:         id * 100 + (version - i),
        version:    version - i,
        title,
        body,
        changed_by: 1,
        changed_by_username: 'admin',
        created_at: '2026-03-01T00:00:00Z',
      })),
    });
    const pages: Record<string, object> = {
      'orishas':    mk(10, 'orishas',    'Los Òrìsà', '<p>Los Òrìsà son las deidades de la tradición yorùbá. Cada uno rige aspectos de la naturaleza y la vida humana.</p>', 1),
      'pataki':     mk(11, 'pataki',     'Pataki — Las Historias Sagradas', '<p>Los pataki son los relatos sagrados del sistema Ifá.</p>', 1),
      'glosario':   mk(12, 'glosario',   'Glosario Yorùbà', '<p><strong>Babalawo</strong>: sacerdote de Ifá. <strong>Odu</strong>: cada uno de los 256 signos del sistema Ifá.</p>', 2),
      'pago':       mk(13, 'pago',       'Formas de Pago', '<p>Aceptamos MercadoPago y PayPal. Precios en MXN.</p>', 1),
      'faq':        mk(14, 'faq',        'Preguntas Frecuentes', '<p><strong>¿Envían a toda la República?</strong> Sí, con DHL y Estafeta.</p>', 3),
      'acerca-de':  mk(1,  'acerca-de',  'Acerca de Oja Yoruba', '<p>Somos una tienda especializada en productos para la práctica yorùbá.</p>', 3),
      'terminos':   mk(2,  'terminos',   'Términos y condiciones', '<p>Estos son nuestros términos.</p>', 2),
      'ifa':        mk(15, 'ifa',        'Ifá y la Práctica Yorùbà', '<p>Ifá es el sistema de adivinación de la tradición yorùbá.</p>', 1),
      'santoral':   mk(16, 'santoral',   'Santoral de los Òrìsà', '<p>El santoral yorùbá reúne las fechas de celebración de los Òrìsà.</p>', 2),
      'envios':     mk(17, 'envios',     'Envíos y Devoluciones', '<p>Enviamos a toda la República con DHL Express y Estafeta. Devoluciones en 15 días hábiles.</p>', 1),
      'terms':      mk(18, 'terms',      'Terms and Conditions', '<p>By using this site you agree to our terms of service.</p>', 1),
      'privacy':    mk(19, 'privacy',    'Privacy Policy', '<p>We collect only the information necessary to process your orders.</p>', 1),
      'privacidad': mk(3,  'privacidad', 'Aviso de privacidad', '<p>Aviso de privacidad de Oja Yoruba.</p>', 1),
    };
    const page = pages[params.slug as string];
    if (!page) return HttpResponse.json({ detail: 'Contenido no encontrado.', codigo_error: 'CONTENT_NOT_FOUND' }, { status: 404 });
    return HttpResponse.json(page);
  }),

  // PATCH bumpea version y agrega una StaticContentVersion (no hay publish/restore).
  http.patch('/api/v1/admin/static-content/:slug/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const nextVersion = 2;
    return HttpResponse.json({
      id: 1,
      slug: params.slug,
      title: body.title ?? 'Sin título',
      body: body.body ?? '',
      version: nextVersion,
      updated_at: new Date().toISOString(),
      versions: [
        { id: 102, version: nextVersion, title: body.title ?? '', body: body.body ?? '', changed_by: 1, changed_by_username: 'admin', created_at: new Date().toISOString() },
        { id: 101, version: 1, title: 'Versión previa', body: '<p>previo</p>', changed_by: 1, changed_by_username: 'admin', created_at: '2026-03-01T00:00:00Z' },
      ],
    });
  }),

  // ── Vouchers — detalle, crear, actualizar, eliminar ──────────────────
  http.get('/api/v1/admin/vouchers/:id/', ({ params }) => {
    const id   = Number(params.id);
    const base = createVoucher({ code: `DEMO${id}` });
    return HttpResponse.json({
      id,
      code:                   base.code,
      voucher_type:           base.type === 'PERCENT' ? 'PERCENTAGE' : 'FIXED',
      discount_value:         base.value,
      discount_pct:           base.type === 'PERCENT' ? base.value : 0,
      max_discount:           '',
      min_order_amount:       500,
      max_uses:               100,
      current_uses:           Math.floor(Math.random() * 20),
      restricted_to_email:    '',
      valid_from:             '2026-01-01',
      valid_until:            '2026-12-31',
      is_active:              true,
    });
  }),

  // UC-PRO-04 — Reporte AGREGADO de uso de vouchers (ranking + ROI)
  http.get('/api/v1/admin/vouchers/report/', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    const codes = ['WELCOME10', 'ENVIOGRATIS', 'YORUBA20', 'PRIMERA', 'VIP15', 'BLACKFRIDAY'];
    let rows = codes.map((code, i) => {
      const current_uses   = faker.number.int({ min: 0, max: 120 });
      const total_discount = faker.number.int({ min: 0, max: 8000 });
      const revenue        = faker.number.int({ min: total_discount, max: total_discount + 30000 });
      const orders_count   = current_uses;
      const roi            = total_discount > 0 ? Number((revenue / total_discount).toFixed(2)) : 0;
      return {
        code,
        type: i % 2 === 0 ? 'PERCENT' : 'FIXED',
        is_active: i % 3 !== 0,
        current_uses, total_discount, orders_count, revenue, roi,
        created_at: faker.date.recent({ days: 60 }).toISOString().slice(0, 10),
      };
    });
    if (status === 'active')   rows = rows.filter((r) => r.is_active);
    if (status === 'inactive') rows = rows.filter((r) => !r.is_active);
    rows.sort((a, b) => b.current_uses - a.current_uses); // ranking por -usos
    return HttpResponse.json({ results: rows });
  }),

  // UC-PRO-04 — Reporte de uso del voucher (métricas + últimos canjes)
  http.get('/api/v1/admin/vouchers/:id/usage/', ({ params }) => {
    const id          = Number(params.id);
    const totalUses   = faker.number.int({ min: 5, max: 60 });
    const redemptions = Array.from({ length: Math.min(totalUses, 10) }, (_, i) => ({
      id:              i + 1,
      order_number:    `OXY-${1000 + id * 10 + i}`,
      user_email:      faker.internet.email().toLowerCase(),
      discount_amount: faker.number.int({ min: 50, max: 800 }),
      redeemed_at:     faker.date.recent({ days: 30 }).toISOString(),
    }));
    const totalDiscount = redemptions.reduce((s, r) => s + r.discount_amount, 0);
    return HttpResponse.json({
      voucher_id:     id,
      total_uses:     totalUses,
      total_discount: totalDiscount,
      redemptions,
    });
  }),

  http.post('/api/v1/admin/vouchers/', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const id   = Math.floor(Math.random() * 9000) + 1000;
    return HttpResponse.json({ id, ...body }, { status: 201 });
  }),

  http.patch('/api/v1/admin/vouchers/:id/', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), ...body });
  }),

  http.delete('/api/v1/admin/vouchers/:id/', () =>
    new HttpResponse(null, { status: 204 })
  ),
  // ── Categorías — CRUD completo ─────────────────────────────────────────────
  // F5-T01 DELETE /api/v1/admin/categories/:id/
  http.delete('/api/v1/admin/categories/:id/', () =>
    new HttpResponse(null, { status: 204 })
  ),

  // F5-T12 PATCH /api/v1/admin/categories/:id/
  http.patch('/api/v1/admin/categories/:id/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), ...body });
  }),

  // F5-T14 POST /api/v1/admin/categories/
  http.post('/api/v1/admin/categories/', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    return HttpResponse.json(
      { id: faker.number.int({ min: 100, max: 999 }), ...body },
      { status: 201 }
    );
  }),

  // ── Pedidos admin ───────────────────────────────────────────────────────────
  // F5-T06 GET /api/v1/admin/orders/:id/
  http.get('/api/v1/admin/orders/:id/', ({ params }) => {
    // El UI pide /admin/orders/{order_number}/ (fetchAdminOrder). Antes se
    // buscaba por Number(params.id) contra una propiedad `id` inexistente en
    // Order → NaN → siempre devolvía la primera orden. Se busca por order_number.
    const orderNumber = String(params.id);
    const base = _adminOrders.find((o) => o.order_number === orderNumber) ?? _adminOrders[0];
    return HttpResponse.json({
      ...base,
      order_number: base.order_number,
      status_logs: [
        { id: 1, status: 'PENDING_PAYMENT', created_at: new Date(Date.now() - 86400000).toISOString(), note: '' },
        { id: 2, status: base.status,       created_at: new Date().toISOString(),                      note: '' },
      ],
      items: (base as any).items ?? [],
      refund_history: [],
    });
  }),

  // F5-T15 POST /api/v1/admin/orders/:id/refund/
  http.post('/api/v1/admin/orders/:id/refund/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    return HttpResponse.json({
      id: Number(params.id),
      status: 'REFUNDED',
      refund_amount: body.amount ?? 0,
      refunded_at: new Date().toISOString(),
    });
  }),

  // ── Productos admin — CRUD ──────────────────────────────────────────────────
  // F5-T02 DELETE /api/v1/admin/products/:id/
  http.delete('/api/v1/admin/products/:id/', () =>
    new HttpResponse(null, { status: 204 })
  ),

  // F5-T17 POST /api/v1/admin/products/
  http.post('/api/v1/admin/products/', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    return HttpResponse.json(
      { id: faker.number.int({ min: 1000, max: 9999 }), ...body },
      { status: 201 }
    );
  }),

  // F5-T18 POST /api/v1/admin/products/:id/adjust-stock/
  http.post('/api/v1/admin/products/:id/adjust-stock/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as { quantity?: number; reason?: string };
    const newStock = faker.number.int({ min: 0, max: 200 });
    return HttpResponse.json({
      product_id: Number(params.id),
      stock: newStock,
      adjustment: body.quantity ?? 0,
      reason: body.reason ?? '',
      adjusted_at: new Date().toISOString(),
    });
  }),

  // F5-T19 POST /api/v1/admin/products/:id/images/
  http.post('/api/v1/admin/products/:id/images/', async () =>
    HttpResponse.json(
      { id: faker.number.int({ min: 100, max: 999 }), url: '/mock-images/product.jpg', is_main: false },
      { status: 201 }
    )
  ),

  // ── Imágenes de producto ───────────────────────────────────────────────────
  // F5-T03 DELETE /api/v1/admin/products/:id/images/:imageId/
  http.delete('/api/v1/admin/products/:id/images/:imageId/', () =>
    new HttpResponse(null, { status: 204 })
  ),

  // ── Variantes ─────────────────────────────────────────────────────────────
  // F5-T04 DELETE /api/v1/admin/products/:id/variant-types/:vtId/
  http.delete('/api/v1/admin/products/:id/variant-types/:vtId/', () =>
    new HttpResponse(null, { status: 204 })
  ),

  // F5-T08 GET /api/v1/admin/products/:id/variant-types/
  http.get('/api/v1/admin/products/:id/variant-types/', ({ params }) =>
    HttpResponse.json([
      { id: 1, product_id: Number(params.id), type_name: 'Talla',  values: ['XS', 'S', 'M', 'L', 'XL'] },
      { id: 2, product_id: Number(params.id), type_name: 'Color',  values: ['Rojo', 'Negro', 'Blanco'] },
    ])
  ),

  // F5-T09 GET /api/v1/admin/products/:id/variants/
  http.get('/api/v1/admin/products/:id/variants/', ({ params }) => {
    const pid = Number(params.id);
    return HttpResponse.json(
      Array.from({ length: 6 }, (_, i) => ({
        id:         i + 1,
        product_id: pid,
        sku:        `SKU-${pid}-${String(i + 1).padStart(3, '0')}`,
        name:       `Variante ${i + 1}`,
        price:      faker.number.int({ min: 100, max: 2000 }),
        stock:      faker.number.int({ min: 0, max: 50 }),
        is_active:  true,
        combination: [{ type_name: 'Talla', label: ['XS','S','M','L','XL','XL'][i] }],
      }))
    );
  }),

  // F5-T23 POST /api/v1/admin/variants/:id/adjust-stock/
  http.post('/api/v1/admin/variants/:id/adjust-stock/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as { quantity?: number; reason?: string };
    return HttpResponse.json({
      variant_id: Number(params.id),
      stock:      faker.number.int({ min: 0, max: 100 }),
      adjustment: body.quantity ?? 0,
      reason:     body.reason ?? '',
      adjusted_at: new Date().toISOString(),
    });
  }),

  // Import de productos: el endpoint real es POST /api/v1/admin/inventory/import/
  // (single-shot), manejado en src/mocks/handlers/inventory.ts. Los handlers
  // products/import/* (template/status/upload) correspondían a endpoints
  // inventados sin respaldo en el backend real y se eliminaron.

  // ── Price sync ────────────────────────────────────────────────────────────
  // GET real: price-sync/template.csv (sin slash, columnas sku,name,price)
  http.get('/api/v1/admin/price-sync/template.csv', () =>
    new HttpResponse(
      'sku,name,price\nEJEMPLO-001,Producto ejemplo,150\nEJEMPLO-002,Otro,200\n',
      { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="price-sync-template.csv"' } }
    )
  ),

  // ── Métodos de envío ───────────────────────────────────────────────────────
  // F5-T05 DELETE /api/v1/admin/shipping-methods/:id/
  http.delete('/api/v1/admin/shipping-methods/:id/', () =>
    new HttpResponse(null, { status: 204 })
  ),

  // F5-T13 PATCH /api/v1/admin/shipping-methods/:id/
  http.patch('/api/v1/admin/shipping-methods/:id/', async ({ params, request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), ...body });
  }),

  // F5-T21 POST /api/v1/admin/shipping-methods/
  http.post('/api/v1/admin/shipping-methods/', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    return HttpResponse.json(
      { id: faker.number.int({ min: 100, max: 999 }), ...body },
      { status: 201 }
    );
  }),

  // ── Usuarios admin ─────────────────────────────────────────────────────────
  // F5-T22 POST /api/v1/admin/users/:id/reset-password/
  http.post('/api/v1/admin/users/:id/reset-password/', () =>
    HttpResponse.json({ detail: 'Email de restablecimiento enviado.' })
  ),

  // ── Vouchers ───────────────────────────────────────────────────────────────
  // VoucherViewSet real: @action activate / deactivate (no toggle ni duplicate).
  http.post('/api/v1/admin/vouchers/:id/activate/', ({ params }) =>
    HttpResponse.json({ id: Number(params.id), is_active: true })
  ),

  http.post('/api/v1/admin/vouchers/:id/deactivate/', ({ params }) =>
    HttpResponse.json({ id: Number(params.id), is_active: false })
  ),

  // ── Páginas estáticas ──────────────────────────────────────────────────────
  // F5-T16 POST /api/v1/admin/static-content/
  http.post('/api/v1/admin/static-content/', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    return HttpResponse.json(
      { id: faker.number.int({ min: 100, max: 999 }), ...body },
      { status: 201 }
    );
  }),

];
