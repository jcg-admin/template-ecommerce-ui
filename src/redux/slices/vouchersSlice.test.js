/**
 * Tests — vouchersSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './vouchersSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('vouchersSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('vouchers/fetchAll/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'vouchers/fetchAll/pending' });
    expect(store.getState().slice.isLoading).toBe(true);
  });

  it('vouchers/fetchAll/fulfilled desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'vouchers/fetchAll/pending' });
    store.dispatch({ type: 'vouchers/fetchAll/fulfilled', payload: {} });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('vouchers/fetchAll/rejected desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'vouchers/fetchAll/pending' });
    store.dispatch({ type: 'vouchers/fetchAll/rejected', payload: 'error' });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('vouchers/create/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'vouchers/create/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
