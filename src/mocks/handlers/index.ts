/**
 * MSW handlers — registro central.
 *
 * Este archivo exporta el array `handlers` que `src/mocks/browser.ts`
 * y `src/mocks/node.ts` consumen para registrar el worker (en dev) y
 * el server (en Jest) respectivamente.
 *
 * Estado actual: vacio. Las tareas T-008 a T-012 lo iran poblando
 * por dominio (catalog, auth, cart, payments, inventory, returns).
 *
 * En T-013 esta exportacion cambia de un array plano a una funcion
 * `buildHandlers()` que lee las variables `*_SOURCE` y compone
 * conditional handler registration por dominio.
 */

import type { HttpHandler } from 'msw';
import { catalogHandlers } from './catalog';
import { authHandlers } from './auth';
import { cartHandlers } from './cart';
import { paymentsHandlers } from './payments';

export const handlers: HttpHandler[] = [
  ...catalogHandlers,
  ...authHandlers,
  ...cartHandlers,
  ...paymentsHandlers,
];
