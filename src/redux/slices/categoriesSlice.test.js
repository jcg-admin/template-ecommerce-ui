/**
 * Tests — categoriesSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './categoriesSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('categoriesSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('categories/create/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'categories/create/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('categories/create/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'categories/create/pending' });
    store.dispatch({ type: 'categories/create/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('categories/create/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'categories/create/pending' });
    store.dispatch({ type: 'categories/create/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('categories/update/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'categories/update/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
