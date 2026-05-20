/**
 * paymentsSlice — pruebas de integracion con withLogging y withValidation
 *
 * T-012 de la iniciativa resolver-hallazgos-de-deuda-del-template.
 *
 * Verifica que initiateMercadoPagoPayment y retryPayment:
 *   - Rechazan payloads sin order_id valido (withValidation).
 *   - Aceptan payloads validos y llaman al apiService correcto.
 *   - Loguean inicio y duracion con el nombre canonico (withLogging).
 */

import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

import apiService from '@services/apiService';
import paymentsReducer, {
  initiateMercadoPagoPayment,
  retryPayment,
} from '@redux/slices/paymentsSlice';

const buildStore = () =>
  configureStore({
    reducer: { payments: paymentsReducer },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });

describe('paymentsSlice — decorators integration', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy   = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiService.post.mockResolvedValue({
      data: { preference_id: 'pref-1', payment_url: 'https://mp/checkout/abc' },
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    jest.clearAllMocks();
  });

  // ── Validacion ────────────────────────────────────────────────────

  test('initiateMercadoPagoPayment rechaza payload sin order_id', async () => {
    const store = buildStore();
    const result = await store.dispatch(initiateMercadoPagoPayment({ installments: 3 }));

    expect(result.type).toBe('payments/initiateMercadoPago/rejected');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  test('initiateMercadoPagoPayment rechaza si order_id es null', async () => {
    const store = buildStore();
    const result = await store.dispatch(
      initiateMercadoPagoPayment({ order_id: null, installments: 1 }),
    );

    expect(result.type).toBe('payments/initiateMercadoPago/rejected');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  test('retryPayment rechaza payload sin order_id', async () => {
    const store = buildStore();
    const result = await store.dispatch(retryPayment({ gateway: 'paypal' }));

    expect(result.type).toBe('payments/retry/rejected');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  // ── Camino feliz: dispara apiService ─────────────────────────────

  test('initiateMercadoPagoPayment con order_id valido llama a apiService.post', async () => {
    const store = buildStore();
    const result = await store.dispatch(
      initiateMercadoPagoPayment({ order_id: 42, installments: 6 }),
    );

    expect(result.type).toBe('payments/initiateMercadoPago/fulfilled');
    expect(apiService.post).toHaveBeenCalledTimes(1);
    const [url, body] = apiService.post.mock.calls[0];
    expect(url).toContain('/api/');
    expect(body.order_id).toBe(42);
    expect(body.installments).toBe(6);
  });

  test('retryPayment con order_id valido llama a apiService.post', async () => {
    const store = buildStore();
    apiService.post.mockResolvedValueOnce({ data: { paypal_order_id: 'pp-1' } });
    const result = await store.dispatch(retryPayment({ order_id: '7', gateway: 'paypal' }));

    expect(result.type).toBe('payments/retry/fulfilled');
    expect(apiService.post).toHaveBeenCalledTimes(1);
    expect(apiService.post.mock.calls[0][1]).toEqual({ order_id: '7', gateway: 'paypal' });
  });

  // ── Logging ──────────────────────────────────────────────────────

  test('initiateMercadoPagoPayment loguea inicio y duracion', async () => {
    const store = buildStore();
    await store.dispatch(initiateMercadoPagoPayment({ order_id: 1 }));

    const messages = logSpy.mock.calls.map(c => c[0]);
    expect(
      messages.some(m => typeof m === 'string' && m.includes('payments/initiateMercadoPagoPayment called')),
    ).toBe(true);
    expect(
      messages.some(m => typeof m === 'string' && /payments\/initiateMercadoPagoPayment completed in [\d.]+ms/.test(m)),
    ).toBe(true);
  });

  test('retryPayment loguea con nombre canonico', async () => {
    const store = buildStore();
    apiService.post.mockResolvedValueOnce({ data: { payment_url: 'https://x' } });
    await store.dispatch(retryPayment({ order_id: 1, gateway: 'mp' }));

    const messages = logSpy.mock.calls.map(c => c[0]);
    expect(
      messages.some(m => typeof m === 'string' && m.includes('payments/retryPayment')),
    ).toBe(true);
  });
});
