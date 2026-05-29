/**
 * Handlers MSW del dominio storefront (auth addresses, notifications,
 * search history, contact, newsletter).
 *
 * Paths:
 *   GET  /api/v1/auth/addresses/          — BUG-MOCK-01
 *   POST /api/v1/auth/profile/avatar/     — BUG-MOCK-01
 *   POST /api/v1/auth/resend-verification/ — BUG-MOCK-01
 *   GET  /api/v1/notifications/preferences/ — BUG-MOCK-01
 *   POST /api/v1/notifications/read-all/  — BUG-MOCK-01
 *   GET  /api/v1/search/history/          — BUG-MOCK-01
 *   POST /api/v1/contact/messages/        — BUG-MOCK-01
 *   POST /api/v1/newsletter/subscribe/    — BUG-MOCK-01
 *   POST /api/v1/newsletter/unsubscribe/  — BUG-MOCK-01
 *
 * Iniciativa: validar-contrato-de-mocks-vs-backend-real
 */

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

interface Address {
  id: number;
  alias: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
}

const _addresses: Address[] = [
  {
    id: 1,
    alias: 'Casa',
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: 'Ciudad de México',
    zip: '06600',
    country: 'MX',
    is_default: true,
  },
  {
    id: 2,
    alias: 'Trabajo',
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: 'Ciudad de México',
    zip: '11580',
    country: 'MX',
    is_default: false,
  },

  // ── Actualizar dirección existente (PATCH) ──────────────────────────
  http.patch('/api/v1/auth/addresses/:id/', async ({ params, request }) => {
    const id   = Number(params.id);
    const body = await request.json() as Partial<Address>;
    const idx  = _addresses.findIndex((a) => a.id === id);
    if (idx < 0) return HttpResponse.json({ detail: 'No encontrada' }, { status: 404 });
    _addresses[idx] = { ..._addresses[idx], ...body };
    return HttpResponse.json(_addresses[idx]);
  }),

  // ── Eliminar dirección (DELETE) ───────────────────────────────────────
  http.delete('/api/v1/auth/addresses/:id/', ({ params }) => {
    const id  = Number(params.id);
    const idx = _addresses.findIndex((a) => a.id === id);
    if (idx < 0) return HttpResponse.json({ detail: 'No encontrada' }, { status: 404 });
    _addresses.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

export const storefrontHandlers = [

  // ── Direcciones ─────────────────────────────────────────────────────
  http.get('/api/v1/auth/addresses/', () =>
    HttpResponse.json({ count: _addresses.length, results: _addresses })
  ),

  http.post('/api/v1/auth/addresses/', async ({ request }) => {
    const body = await request.json() as Partial<Address>;
    const addr: Address = {
      id: Date.now(),
      alias: body.alias ?? 'Nueva dirección',
      street: body.street ?? '',
      city: body.city ?? '',
      state: body.state ?? '',
      zip: body.zip ?? '',
      country: body.country ?? 'MX',
      is_default: body.is_default ?? false,
    };
    _addresses.push(addr);
    return HttpResponse.json(addr, { status: 201 });
  }),

  // ── Avatar ──────────────────────────────────────────────────────────
  http.post('/api/v1/auth/profile/avatar/', () =>
    HttpResponse.json({
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      message: 'Avatar actualizado',
    })
  ),

  // ── Reenviar verificación ───────────────────────────────────────────
  http.post('/api/v1/auth/resend-verification/', async ({ request }) => {
    const body = await request.json() as { email: string };
    return HttpResponse.json({
      email: body.email,
      message: 'Correo de verificación reenviado. Revisa tu bandeja de entrada.',
    });
  }),

  // ── Notificaciones ──────────────────────────────────────────────────
  http.get('/api/v1/notifications/preferences/', () =>
    HttpResponse.json({
      email_orders: true,
      email_promotions: false,
      email_newsletter: true,
      push_orders: true,
      push_promotions: false,
      unread_count: faker.number.int({ min: 0, max: 12 }),
    })
  ),

  http.patch('/api/v1/notifications/preferences/', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  http.post('/api/v1/notifications/read-all/', () =>
    HttpResponse.json({ read: true, count: faker.number.int({ min: 1, max: 10 }) })
  ),

  // ── Historial de búsqueda ───────────────────────────────────────────
  http.get('/api/v1/search/history/', () => {
    const terms = ['elekes', 'sopera de Yemayá', 'otanes', 'oshe', 'collar de Obatala'];
    return HttpResponse.json({
      count: terms.length,
      results: terms.map((q, i) => ({
        id: i + 1,
        query: q,
        searched_at: faker.date.recent({ days: 14 }).toISOString(),
      })),
    });
  }),

  http.delete('/api/v1/search/history/', () => new HttpResponse(null, { status: 204 })),

  // ── Contacto ────────────────────────────────────────────────────────
  http.post('/api/v1/contact/messages/', async ({ request }) => {
    const body = await request.json() as { name: string; email: string; message: string };
    return HttpResponse.json({
      id: Date.now(),
      name: body.name,
      email: body.email,
      message: body.message,
      created_at: new Date().toISOString(),
      confirmation: 'Tu mensaje fue recibido. Te responderemos en 24-48 horas.',
    }, { status: 201 });
  }),

  // ── Newsletter ──────────────────────────────────────────────────────
  http.post('/api/v1/newsletter/subscribe/', async ({ request }) => {
    const body = await request.json() as { email: string };
    return HttpResponse.json({
      email: body.email,
      subscribed: true,
      message: '¡Suscrito! Recibirás novedades y ofertas exclusivas.',
    });
  }),

  http.post('/api/v1/newsletter/unsubscribe/', async ({ request }) => {
    const body = await request.json() as { email: string };
    return HttpResponse.json({
      email: body.email,
      subscribed: false,
      message: 'Te has dado de baja de nuestra lista. Lo sentimos.',
    });
  }),
];
