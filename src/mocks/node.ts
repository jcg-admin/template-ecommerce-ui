/**
 * MSW server para Node (uso en Jest).
 *
 * Intercepta el modulo `http` de Node sin usar Service Worker.
 * Se importa desde `tests/setup-msw.ts` (T-007) que llama
 * `server.listen()` en `beforeAll`, `server.resetHandlers()` en
 * `afterEach`, `server.close()` en `afterAll`.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
