/**
 * MSW worker para el navegador.
 *
 * Se importa desde `src/index.jsx` en dos casos:
 *   1. Desarrollo: `NODE_ENV !== 'production'` (comportamiento original).
 *   2. Demo:       `DEMO_MODE === 'true'` en un build de produccion,
 *                  activado con `npm run build:demo`.
 *
 * El guard se aplica en `src/index.jsx`, no aqui. Este modulo solo
 * configura el worker; la decision de cargarlo o no es del punto de
 * entrada.
 *
 * Correccion A-01 de la iniciativa `auditar-integracion-catalogo`:
 * el JSDoc previo decia "solo en NODE_ENV=development", incorrecto
 * desde que `habilitar-msw-en-modo-demo` introdujo el caso DEMO_MODE.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
