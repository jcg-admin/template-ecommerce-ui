/**
 * Tests — catalogSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './catalogSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('catalogSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('catalog/fetchProducts/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'catalog/fetchProducts/pending' });
    expect(store.getState().slice.isLoading).toBe(true);
  });

  it('catalog/fetchProducts/fulfilled desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'catalog/fetchProducts/pending' });
    store.dispatch({ type: 'catalog/fetchProducts/fulfilled', payload: {} });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('catalog/fetchProducts/rejected desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'catalog/fetchProducts/pending' });
    store.dispatch({ type: 'catalog/fetchProducts/rejected', payload: 'error' });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('catalog/fetchProduct/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'catalog/fetchProduct/pending' });
    expect(store.getState().slice.isLoading).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
