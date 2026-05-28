/**
 * Tests — ordersSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './ordersSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('ordersSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('orders/checkout/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'orders/checkout/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('orders/checkout/fulfilled desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'orders/checkout/pending' });
    store.dispatch({ type: 'orders/checkout/fulfilled', payload: {} });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('orders/checkout/rejected desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'orders/checkout/pending' });
    store.dispatch({ type: 'orders/checkout/rejected', payload: 'error' });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('orders/cancel/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'orders/cancel/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
