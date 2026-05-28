/**
 * Tests — paymentsSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './paymentsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('paymentsSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('payments/initiateMercadoPago/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'payments/initiateMercadoPago/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('payments/initiateMercadoPago/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'payments/initiateMercadoPago/pending' });
    store.dispatch({ type: 'payments/initiateMercadoPago/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('payments/initiateMercadoPago/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'payments/initiateMercadoPago/pending' });
    store.dispatch({ type: 'payments/initiateMercadoPago/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('payments/initiatePayPal/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'payments/initiatePayPal/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
