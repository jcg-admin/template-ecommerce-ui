/**
 * Handlers MSW del dominio auth.
 *
 * Paths alineados con authSlice.js (familia /api/v1/auth/*):
 *   POST  /api/v1/auth/login/
 *   POST  /api/v1/auth/logout/
 *   POST  /api/v1/auth/register/
 *   GET   /api/v1/auth/profile/
 *   PATCH /api/v1/auth/profile/
 *   POST  /api/v1/auth/change-password/
 *   POST  /api/v1/auth/verify-email/
 *   POST  /api/v1/auth/password-reset/
 *   POST  /api/v1/auth/password-reset/confirm/
 *
 * Los handlers legacy `/api/token/`, `/api/auth/me/`, `/api/auth/logout/`
 * y `/api/auth/register/` fueron eliminados en la iniciativa
 * `auditar-y-corregir-inconsistencias` (H-02): ningun archivo de src/
 * fuera de los handlers los invocaba. El comentario anterior que decia
 * "algunos componentes y tests aun los usan" era incorrecto.
 *
 * Credenciales validas (contrato de tests):
 *   comprador@test.mx / Test1234!           -> id 1, is_staff false
 *   admin@e-comerce.example.com / Admin1234! -> id 2, is_staff true
 */

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import type { User } from './types';
import { createUser } from '../factories';

// Sesion activa en el handler (MSW es stateless entre requests
// pero no entre llamadas dentro de la misma carga de pagina).
// readLogin actualiza _activeSession; readMe lo consulta.
let _activeSession: ReturnType<typeof mockUser> | null = null;

function mockUser(
  id: number,
  isStaff: boolean,
  email = 'comprador@test.mx',
  isAdmin = false,
): User {
  return {
    id,
    email,
    first_name: 'Demo',
    last_name: 'User',
    is_staff: isStaff,
    is_admin: isAdmin,
  } as User;
}

async function readLogin(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  if (!body?.username || !body?.password) {
    return HttpResponse.json(
      { detail: 'Credenciales requeridas.' },
      { status: 400 }
    );
  }
  if (body.username === 'comprador@test.mx' && body.password === 'Test1234!') {
    _activeSession = mockUser(1, false);
    return HttpResponse.json({ user: _activeSession });
  }
  if (
    body.username === 'admin@e-comerce.example.com' &&
    body.password === 'Admin1234!'
  ) {
    _activeSession = mockUser(2, true, 'admin@e-comerce.example.com', true);
    return HttpResponse.json({ user: _activeSession });
  }
  if (body.username === 'staff@test.mx' && body.password === 'Staff1234!') {
    _activeSession = mockUser(3, true, 'staff@test.mx', false);
    return HttpResponse.json({ user: _activeSession });
  }
  return HttpResponse.json(
    { detail: 'Credenciales invalidas.' },
    { status: 401 }
  );
}

async function readRegister(request: Request) {
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
}

function readMe() {
  // Si hay sesion activa (post-login en modo demo), devolver ese perfil.
  // Fallback al perfil comprador para requests directos sin login previo.
  if (_activeSession) {
    return HttpResponse.json(_activeSession);
  }
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
}

export const authHandlers = [
  // Familia /api/v1/auth/  (la que usa authSlice.js)
  http.post('/api/v1/auth/login/',           ({ request }) => readLogin(request)),
  http.post('/api/v1/auth/logout/', () => { _activeSession = null; return HttpResponse.json({ detail: 'Sesion cerrada.' }); }),
  http.post('/api/v1/auth/register/',        ({ request }) => readRegister(request)),
  http.get('/api/v1/auth/profile/',          () => readMe()),
  http.patch('/api/v1/auth/profile/',        async ({ request }) => {
    const patch = (await request.json().catch(() => ({}))) as Partial<User>;
    faker.seed(1);
    const base = createUser({
      id: 1,
      email: 'comprador@test.mx',
      first_name: 'Demo',
      last_name: 'User',
      is_staff: false,
    });
    faker.seed();
    return HttpResponse.json({ ...base, ...patch });
  }),
  // UC-AUTH-16 — baja logica de la cuenta. Reautenticacion con password
  // (POST /auth/me/deactivate/). Password incorrecto -> 400 (AC-02).
  http.post('/api/v1/auth/me/deactivate/', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    if (body?.password !== 'Test1234!') {
      return HttpResponse.json({ detail: 'Contrasena incorrecta.' }, { status: 400 });
    }
    _activeSession = null;
    return HttpResponse.json({ detail: 'Cuenta dada de baja exitosamente.' });
  }),
  http.post('/api/v1/auth/change-password/', () => HttpResponse.json({ detail: 'Contrasena actualizada.' })),
  http.post('/api/v1/auth/verify-email/',    () => HttpResponse.json({ detail: 'Email verificado.' })),
  http.post('/api/v1/auth/password-reset/',  () => HttpResponse.json({ detail: 'Si el email existe, se enviara un enlace.' })),
  http.post('/api/v1/auth/password-reset/confirm/', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { token?: string; new_password?: string }
      | null;
    if (!body?.token || !body?.new_password) {
      return HttpResponse.json({ detail: 'token y new_password requeridos.' }, { status: 400 });
    }
    return HttpResponse.json({ detail: 'Contrasena restablecida.' });
  }),
];
