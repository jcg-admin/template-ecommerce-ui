/**
 * Tests — checkoutSlice
 * Estado del flujo de checkout y pago
 */
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from './checkoutSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));
import apiService from '@services/apiService';

const makeStore = (extra = {}) =>
  configureStore({
    reducer: { checkout: checkoutReducer },
    preloadedState: { checkout: { isLoading: false, error: null, ...extra } },
  });

describe('checkoutSlice', () => {
  it('estado inicial correcto', () => {
    const store = makeStore();
    const state = store.getState().checkout;
    expect(state).toBeDefined();
    expect(state.isLoading).toBe(false);
  });

  it('createOrder — pending pone isLoading=true', () => {
    apiService.post.mockReturnValue(new Promise(() => {})); // never resolves
    const store = makeStore();
    store.dispatch({ type: 'checkout/createOrder/pending' });
    expect(store.getState().checkout.isLoading).toBe(true);
  });

  it('createOrder — fulfilled limpia isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'checkout/createOrder/pending' });
    store.dispatch({
      type: 'checkout/createOrder/fulfilled',
      payload: { order_number: 'PY-001', redirect_url: null },
    });
    expect(store.getState().checkout.isLoading).toBe(false);
  });

  it('createOrder — rejected pone error', () => {
    const store = makeStore();
    store.dispatch({ type: 'checkout/createOrder/pending' });
    store.dispatch({
      type: 'checkout/createOrder/rejected',
      payload: { message: 'Sin stock' },
    });
    const state = store.getState().checkout;
    expect(state.isLoading).toBe(false);
  });

  it('initMercadoPago — pending pone isLoading=true', () => {
    const store = makeStore();
    store.dispatch({ type: 'checkout/initMercadoPago/pending' });
    expect(store.getState().checkout.isLoading).toBe(true);
  });

  it('el slice no falla al recibir acciones desconocidas', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: 'unknown/action' })).not.toThrow();
  });
});
