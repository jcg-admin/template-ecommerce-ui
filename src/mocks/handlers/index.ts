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

/**
 * MSW handlers — registro central con conditional registration.
 *
 * El array final de handlers se compone en runtime leyendo cuatro
 * variables de entorno por dominio:
 *
 *   CATALOG_SOURCE   controla los handlers de `./catalog`
 *   AUTH_SOURCE      controla los handlers de `./auth`
 *   CART_SOURCE      controla los handlers de `./cart` (incluye wishlist)
 *   PAYMENTS_SOURCE  controla los handlers de `./payments`
 *
 * Valor `mock` registra los handlers (interceptan via MSW); cualquier
 * otro valor (`real` por convencion) los omite, dejando que la request
 * salga al backend real. Por defecto todo es `mock`, igual que en
 * `webpack.config.js#defaultFlags`.
 *
 * Inventory y returns NO tienen flag propia: pertenecen a flujos
 * administrativos que no se separan por dominio del comprador. Se
 * registran siempre. Si en el futuro se necesita un flag
 * `ADMIN_SOURCE`, se anade aqui.
 *
 * Decision 3a-ii de la iniciativa `revisar-arquitectura-de-mocks`.
 */

import type { HttpHandler } from 'msw';
import { catalogHandlers } from './catalog';
import { authHandlers } from './auth';
import { cartHandlers } from './cart';
import { paymentsHandlers } from './payments';
import { inventoryHandlers } from './inventory';
import { returnsHandlers } from './returns';

// DefinePlugin solo reemplaza accesos estaticos a process.env.VARIABLE.
// El acceso dinamico process.env[key] deja 'process' sin resolver en
// el bundle del browser. Se lee cada variable estaticamente.
const ENV_FLAGS: Record<string, string> = {
  CATALOG_SOURCE:  process.env.CATALOG_SOURCE  ?? 'mock',
  AUTH_SOURCE:     process.env.AUTH_SOURCE     ?? 'mock',
  CART_SOURCE:     process.env.CART_SOURCE     ?? 'mock',
  PAYMENTS_SOURCE: process.env.PAYMENTS_SOURCE ?? 'mock',
};

function isMock(key: string): boolean {
  return (ENV_FLAGS[key] ?? 'mock').toLowerCase() === 'mock';
}

/**
 * Construye el array de handlers segun los flags actuales.
 * Se llama en cada arranque de worker/server; no se cachea para que
 * tests puedan reasignar `process.env.CATALOG_SOURCE` antes de un
 * `server.use(...buildHandlers())` si lo necesitan.
 */
export function buildHandlers(): HttpHandler[] {
  const list: HttpHandler[] = [];
  if (isMock('CATALOG_SOURCE'))  list.push(...catalogHandlers);
  if (isMock('AUTH_SOURCE'))     list.push(...authHandlers);
  if (isMock('CART_SOURCE'))     list.push(...cartHandlers);
  if (isMock('PAYMENTS_SOURCE')) list.push(...paymentsHandlers);
  // Admin: siempre activo. Ver JSDoc del modulo.
  list.push(...inventoryHandlers);
  list.push(...returnsHandlers);
  return list;
}

/**
 * Array estatico para compatibilidad: lo consumen `browser.ts` y
 * `node.ts` en su carga inicial. Equivalente a llamar `buildHandlers()`
 * una vez al cargar el modulo.
 */
export const handlers: HttpHandler[] = buildHandlers();
