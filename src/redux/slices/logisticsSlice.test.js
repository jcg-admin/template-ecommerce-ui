/**
 * Tests — logisticsSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './logisticsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('logisticsSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('logistics/confirmDelivery/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'logistics/confirmDelivery/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('logistics/confirmDelivery/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'logistics/confirmDelivery/pending' });
    store.dispatch({ type: 'logistics/confirmDelivery/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('logistics/confirmDelivery/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'logistics/confirmDelivery/pending' });
    store.dispatch({ type: 'logistics/confirmDelivery/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
