/**
 * cartSlice.applyVoucher — pruebas con withValidation
 *
 * T-013 de la iniciativa resolver-hallazgos-de-deuda-del-template.
 *
 * Verifica que applyVoucher rechaza codigos vacios o no-string antes
 * de tocar la API, y que con un codigo valido invoca el endpoint y
 * pasa el body esperado.
 */

import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

import apiService from '@services/apiService';
import cartReducer, { applyVoucher } from '@redux/slices/cartSlice';

const buildStore = () =>
  configureStore({
    reducer: { cart: cartReducer },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });

describe('cartSlice.applyVoucher — withValidation integration', () => {
  beforeEach(() => {
    apiService.post.mockResolvedValue({
      data: { items: [], voucher: { code: 'WELCOME10' } },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Validacion: rechazos sin llamar a la API ─────────────────────

  test('rechaza string vacio sin tocar apiService', async () => {
    const store = buildStore();
    const result = await store.dispatch(applyVoucher(''));

    expect(result.type).toBe('cart/applyVoucher/rejected');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  test('rechaza string solo con whitespace', async () => {
    const store = buildStore();
    const result = await store.dispatch(applyVoucher('   '));

    expect(result.type).toBe('cart/applyVoucher/rejected');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  test('rechaza undefined', async () => {
    const store = buildStore();
    const result = await store.dispatch(applyVoucher(undefined));

    expect(result.type).toBe('cart/applyVoucher/rejected');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  test('rechaza null', async () => {
    const store = buildStore();
    const result = await store.dispatch(applyVoucher(null));

    expect(result.type).toBe('cart/applyVoucher/rejected');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  test('rechaza tipo no-string (numero)', async () => {
    const store = buildStore();
    const result = await store.dispatch(applyVoucher(12345));

    expect(result.type).toBe('cart/applyVoucher/rejected');
    expect(apiService.post).not.toHaveBeenCalled();
  });

  // ── Camino feliz ─────────────────────────────────────────────────

  test('codigo valido llama a apiService.post con el body esperado', async () => {
    const store = buildStore();
    const result = await store.dispatch(applyVoucher('WELCOME10'));

    expect(result.type).toBe('cart/applyVoucher/fulfilled');
    expect(apiService.post).toHaveBeenCalledTimes(1);
    const [, body] = apiService.post.mock.calls[0];
    expect(body).toEqual({ code: 'WELCOME10' });
  });
});
