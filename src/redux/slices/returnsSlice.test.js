/**
 * Tests — returnsSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './returnsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('returnsSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('returns/create/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'returns/create/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('returns/create/fulfilled desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'returns/create/pending' });
    store.dispatch({ type: 'returns/create/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('returns/create/rejected desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'returns/create/pending' });
    store.dispatch({ type: 'returns/create/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('returns/fetchCustomer/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'returns/fetchCustomer/pending' });
    expect(store.getState().slice.isLoading).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
