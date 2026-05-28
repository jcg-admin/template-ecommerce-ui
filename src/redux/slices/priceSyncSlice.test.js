/**
 * Tests — priceSyncSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './priceSyncSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('priceSyncSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('priceSync/previewCsv/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'priceSync/previewCsv/pending' });
    expect(store.getState().slice.isLoading).toBe(true);
  });

  it('priceSync/previewCsv/fulfilled desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'priceSync/previewCsv/pending' });
    store.dispatch({ type: 'priceSync/previewCsv/fulfilled', payload: {} });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('priceSync/previewCsv/rejected desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'priceSync/previewCsv/pending' });
    store.dispatch({ type: 'priceSync/previewCsv/rejected', payload: 'error' });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('priceSync/applyCsv/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'priceSync/applyCsv/pending' });
    expect(store.getState().slice.isApplying).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
