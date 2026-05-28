/**
 * Tests — addressesSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './addressesSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('addressesSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('addresses/fetch/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'addresses/fetch/pending' });
    expect(store.getState().slice.isLoading).toBe(true);
  });

  it('addresses/fetch/fulfilled desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'addresses/fetch/pending' });
    store.dispatch({ type: 'addresses/fetch/fulfilled', payload: {} });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('addresses/fetch/rejected desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'addresses/fetch/pending' });
    store.dispatch({ type: 'addresses/fetch/rejected', payload: 'error' });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('addresses/create/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'addresses/create/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
