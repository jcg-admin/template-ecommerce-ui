/**
 * Handlers MSW del dominio payments.
 *
 * Endpoints cubiertos:
 *   POST /api/payments/mercadopago/create/  preferencia MercadoPago
 *   POST /api/payments/paypal/create/       orden PayPal
 *
 * Las URLs de redireccion (`init_point`, `approve_url`) apuntan a
 * sandbox.mercadopago.com.mx y sandbox.paypal.com tal como hace el
 * interceptor heredado. `scripts/verify-build.mjs` ya las tiene en
 * la allowlist de URLs esperadas en el bundle (T-020 de la
 * iniciativa anterior).
 */

import { http, HttpResponse } from 'msw';

export const paymentsHandlers = [
  http.post('/api/payments/mercadopago/create/', () => {
    return HttpResponse.json({
      preference_id: `TEST-${Date.now()}`,
      init_point: 'https://sandbox.mercadopago.com.mx/checkout/mock',
    });
  }),

  http.post('/api/payments/paypal/create/', () => {
    return HttpResponse.json({
      order_id: `PAYPAL-MOCK-${Date.now()}`,
      approve_url: 'https://sandbox.paypal.com/checkoutnow/mock',
    });
  }),
];
