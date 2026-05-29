/**
 * Handlers MSW del dominio support (tickets de soporte).
 *
 * Paths alineados con supportSlice.js y admin:
 *   GET  /api/v1/support/tickets/
 *   POST /api/v1/support/tickets/
 *   GET  /api/v1/support/tickets/:id/
 *   POST /api/v1/support/tickets/:id/reply/
 *   GET  /api/v1/admin/support/tickets/
 *   PATCH /api/v1/admin/support/tickets/:id/
 *
 * Corrige BUG-MOCK-01.
 * Iniciativa: validar-contrato-de-mocks-vs-backend-real
 */

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface SupportMessage {
  id: number;
  author: string;
  body: string;
  created_at: string;
  is_staff: boolean;
}

interface SupportTicket {
  id: number;
  reference: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  messages: SupportMessage[];
}

const STATUSES: TicketStatus[]   = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function createTicket(overrides: Partial<SupportTicket> = {}): SupportTicket {
  const id = overrides.id ?? faker.number.int({ min: 100, max: 9999 });
  return {
    id,
    reference: `TKT-${id}`,
    subject: faker.helpers.arrayElement([
      'Problema con mi pedido',
      'Solicitud de devolución',
      'Pregunta sobre envío',
      'Pieza dañada',
      'Cambio de dirección',
    ]),
    status: overrides.status ?? faker.helpers.arrayElement(STATUSES),
    priority: overrides.priority ?? faker.helpers.arrayElement(PRIORITIES),
    created_at: faker.date.recent({ days: 30 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString(),
    messages: [{
      id: 1,
      author: faker.internet.email(),
      body: faker.lorem.paragraph(),
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      is_staff: false,
    }],
    ...overrides,
  };
}

const _tickets: SupportTicket[] = Array.from({ length: 8 }, (_, i) =>
  createTicket({ id: i + 1 })
);

export const supportHandlers = [
  // Comprador
  http.get('/api/v1/support/tickets/', () =>
    HttpResponse.json({ count: _tickets.length, results: _tickets, next: null, previous: null })
  ),

  http.post('/api/v1/support/tickets/', async ({ request }) => {
    const body = await request.json() as { subject: string; body: string; priority?: TicketPriority };
    const ticket = createTicket({
      id: Date.now(),
      subject: body.subject,
      status: 'OPEN',
      priority: body.priority ?? 'MEDIUM',
    });
    _tickets.unshift(ticket);
    return HttpResponse.json(ticket, { status: 201 });
  }),

  http.get('/api/v1/support/tickets/:id/', ({ params }) => {
    const ticket = _tickets.find(t => t.id === Number(params.id))
      ?? createTicket({ id: Number(params.id) });
    return HttpResponse.json(ticket);
  }),

  http.post('/api/v1/support/tickets/:id/reply/', async ({ params, request }) => {
    const body = await request.json() as { body: string };
    const idx  = _tickets.findIndex(t => t.id === Number(params.id));
    const msg: SupportMessage = {
      id: Date.now(),
      author: 'staff@practica-yoruba.mx',
      body: body.body,
      created_at: new Date().toISOString(),
      is_staff: true,
    };
    if (idx >= 0) {
      _tickets[idx].messages.push(msg);
      _tickets[idx].status = 'IN_PROGRESS';
    }
    return HttpResponse.json(msg, { status: 201 });
  }),

  // Admin
  http.get('/api/v1/admin/support/tickets/', ({ request }) => {
    const url    = new URL(request.url);
    const status = url.searchParams.get('status') ?? '';
    const results = status
      ? _tickets.filter(t => t.status === status)
      : _tickets;
    return HttpResponse.json({ count: _tickets.length, results, next: null, previous: null });
  }),

  http.patch('/api/v1/admin/support/tickets/:id/', async ({ params, request }) => {
    const body = await request.json() as Partial<SupportTicket>;
    const idx  = _tickets.findIndex(t => t.id === Number(params.id));
    if (idx >= 0) Object.assign(_tickets[idx], body);
    return HttpResponse.json(_tickets[idx] ?? createTicket({ id: Number(params.id) }));
  }),
];
