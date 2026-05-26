/**
 * Handlers MSW del dominio payments.
 *
 * Paths alineados con paymentsSlice.js (el slice activo, con UC-PAY-*):
 *   POST /api/v1/payments/mercadopago/checkout
 *   POST /api/v1/payments/paypal/checkout
 *
 * Nota: existe un checkoutSlice.js legacy que usa los paths sin versionar
 * `/api/payments/mercadopago/create/` y `/api/payments/paypal/create/`.
 * La app activa (PaymentSelectionPage.jsx) usa paymentsSlice, no
 * checkoutSlice. Los handlers se alinean con el slice activo.
 *
 * Las URLs de redireccion apuntan a los sandboxes de MercadoPago y
 * PayPal. `scripts/verify-build.mjs` los tiene en la allowlist.
 */

import { http, HttpResponse } from 'msw';

export const paymentsHandlers = [
  http.post('/api/v1/payments/mercadopago/checkout', () => {
    return HttpResponse.json({
      preference_id: `TEST-${Date.now()}`,
      init_point: 'https://sandbox.mercadopago.com.mx/checkout/mock',
    });
  }),

  http.post('/api/v1/payments/paypal/checkout', () => {
    return HttpResponse.json({
      order_id: `PAYPAL-MOCK-${Date.now()}`,
      approve_url: 'https://sandbox.paypal.com/checkoutnow/mock',
    });
  }),
];
