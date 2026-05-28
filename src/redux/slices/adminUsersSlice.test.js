/**
 * Tests — adminUsersSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './adminUsersSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('adminUsersSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('adminUsers/changeRole/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'adminUsers/changeRole/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('adminUsers/changeRole/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'adminUsers/changeRole/pending' });
    store.dispatch({ type: 'adminUsers/changeRole/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('adminUsers/changeRole/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'adminUsers/changeRole/pending' });
    store.dispatch({ type: 'adminUsers/changeRole/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('adminUsers/suspend/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'adminUsers/suspend/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
