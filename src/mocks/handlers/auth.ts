/**
 * Handlers MSW del dominio auth.
 *
 * Endpoints cubiertos (matching del `mockInterceptor` heredado):
 *   POST /api/token/         login con username + password (DRF token)
 *   POST /api/auth/register/ alta de cuenta
 *   POST /api/auth/logout/   cierre de sesion
 *   GET  /api/auth/me/       perfil del usuario autenticado
 *
 * Datos hardcoded por ahora; T-015 anadira variabilidad Faker
 * preservando los pares username/password de los tests.
 */

import { http, HttpResponse } from 'msw';
import type { User } from './types';

function mockUser(id: number, isStaff: boolean, email = 'comprador@test.mx'): User {
  return {
    id,
    email,
    first_name: 'Demo',
    last_name: 'User',
    is_staff: isStaff,
  } as User;
}

export const authHandlers = [
  // POST /api/token/  (login)
  http.post('/api/token/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { username?: string; password?: string }
      | null;

    if (!body?.username || !body?.password) {
      return HttpResponse.json(
        { detail: 'Credenciales requeridas.' },
        { status: 400 }
      );
    }
    if (
      body.username === 'comprador@test.mx' &&
      body.password === 'Test1234!'
    ) {
      return HttpResponse.json({ user: mockUser(1, false) });
    }
    if (
      body.username === 'admin@e-comerce.example.com' &&
      body.password === 'Admin1234!'
    ) {
      return HttpResponse.json({ user: mockUser(2, true) });
    }
    return HttpResponse.json(
      { detail: 'Credenciales invalidas.' },
      { status: 401 }
    );
  }),

  // POST /api/auth/register/
  http.post('/api/auth/register/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { email?: string; password?: string }
      | null;
    if (!body?.email || !body?.password) {
      return HttpResponse.json(
        { detail: 'Email y contrasena requeridos.' },
        { status: 400 }
      );
    }
    return HttpResponse.json(
      { user: mockUser(99, false, body.email) },
      { status: 201 }
    );
  }),

  // POST /api/auth/logout/
  http.post('/api/auth/logout/', () => {
    return HttpResponse.json({ detail: 'Sesion cerrada.' });
  }),

  // GET /api/auth/me/
  http.get('/api/auth/me/', () => {
    return HttpResponse.json(mockUser(1, false));
  }),
];
