/**
 * Handlers MSW del dominio payments.
 *
 * Endpoint canónico unificado (api: payments/urls.py):
 *   POST /api/v1/payments/initiate/  con {order_number, gateway, installments}
 *   → {checkout_url, order_number, amount, installments}  (BR-006/007)
 *
 * Las URLs de redireccion apuntan a los sandboxes de MercadoPago y
 * PayPal. `scripts/verify-build.mjs` los tiene en la allowlist.
 */

import { http, HttpResponse } from 'msw';

export const paymentsHandlers = [
  http.post('/api/v1/payments/initiate/', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      order_number?: string; gateway?: string; installments?: number;
    };
    const isPaypal = body?.gateway === 'PAYPAL';
    return HttpResponse.json({
      payment_id: null,
      checkout_url: isPaypal
        ? 'https://sandbox.paypal.com/checkoutnow/mock'
        : 'https://sandbox.mercadopago.com.mx/checkout/mock',
      order_number: body?.order_number ?? 'PY-MOCK',
      amount: '1780.00',
      installments: body?.installments ?? 1,
    });
  }),
];
