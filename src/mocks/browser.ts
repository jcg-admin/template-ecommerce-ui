/**
 * MSW worker para el navegador (uso de desarrollo).
 *
 * Se importa desde `src/index.jsx` solo en `NODE_ENV=development`,
 * para que el bundle de produccion no incluya ni MSW ni los
 * handlers. El guard de `NODE_ENV` se aplica en `src/index.jsx`
 * (T-006), no aqui.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
