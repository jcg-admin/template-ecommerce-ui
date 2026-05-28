/**
 * Tests — authSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './authSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('authSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('auth/login/pending activa isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'auth/login/pending' });
    expect(store.getState().slice.isLoading).toBe(true);
  });

  it('auth/login/fulfilled desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'auth/login/pending' });
    store.dispatch({ type: 'auth/login/fulfilled', payload: {} });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('auth/login/rejected desactiva isLoading', () => {
    const store = makeStore();
    store.dispatch({ type: 'auth/login/pending' });
    store.dispatch({ type: 'auth/login/rejected', payload: 'error' });
    expect(store.getState().slice.isLoading).toBe(false);
  });

  it('auth/logout/fulfilled limpia el usuario', () => {
    const store = makeStore();
    store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
    expect(store.getState().slice.isAuthenticated).toBe(false);
    expect(store.getState().slice.user).toBeNull();
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
