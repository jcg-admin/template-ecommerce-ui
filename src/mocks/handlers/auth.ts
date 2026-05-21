/**
 * Handlers MSW del dominio auth.
 *
 * Login y register: deterministicos. Los pares de credenciales
 * (comprador@test.mx/Test1234!, admin@e-comerce.example.com/Admin1234!)
 * son contrato de tests; cambiar a Faker romperia suites enteras.
 *
 * `/api/auth/me/`: usa la factory `createUser` con overrides fijos
 * para preservar identidad del usuario actual pero rellenar campos
 * variables (avatar, telefono, completeness) con datos realistas.
 */

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import type { User } from './types';
import { createUser } from '../factories';

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
  // POST /api/token/  (login deterministico)
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

  // POST /api/auth/register/  (deterministico, el email viene del body)
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

  // GET /api/auth/me/  (factory con identidad fija pero rellenos variables)
  http.get('/api/auth/me/', () => {
    // Seed estable para que /me/ devuelva el mismo usuario en cada
    // request dentro de una misma sesion, pero con campos rellenos
    // realistas (phone, avatar, completeness) que cambian entre seeds
    // distintos en sesiones distintas.
    faker.seed(1);
    const user = createUser({
      id: 1,
      email: 'comprador@test.mx',
      first_name: 'Demo',
      last_name: 'User',
      is_staff: false,
    });
    faker.seed();
    return HttpResponse.json(user);
  }),
];
