/**
 * Handlers MSW del dominio referral (UC-PRO-05).
 *
 * Programa de referidos de la cuenta del comprador:
 *   GET /api/v1/account/referral/  -> { code, share_url, invited_count, rewards }
 *
 * Alineado con referralSlice.js (thunk fetchReferral).
 *
 * Registro: en `./index.ts` importar `{ referralHandlers }` y añadir
 * `list.push(...referralHandlers);` dentro de `buildHandlers()`
 * (no requiere flag propia: pertenece al flujo de cuenta del comprador).
 */

import { http, HttpResponse } from 'msw';

interface Referral {
  code: string;
  share_url: string;
  invited_count: number;
  rewards: number;
}

const REFERRAL: Referral = {
  code: 'AMIGO-7F3K2',
  share_url: 'https://tienda.example.com/?ref=AMIGO-7F3K2',
  invited_count: 3,
  rewards: 150,
};

export const referralHandlers = [
  http.get('/api/v1/account/referral/', () =>
    HttpResponse.json(REFERRAL),
  ),
];
