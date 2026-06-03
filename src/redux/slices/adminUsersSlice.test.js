/**
 * Tests — adminUsersSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer, * as adminUsersSlice from './adminUsersSlice';

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

  // No existe accion de cambio de rol en el backend (AdminUserViewSet solo
  // expone suspend/reactivate). changeUserRole se elimino del slice.
  it('no exporta changeUserRole (ruta /role/ inexistente en backend)', () => {
    expect(adminUsersSlice.changeUserRole).toBeUndefined();
  });

  it('adminUsers/suspend/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'adminUsers/suspend/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('adminUsers/suspend/fulfilled marca lastAction=suspended', () => {
    const store = makeStore();
    store.dispatch({ type: 'adminUsers/suspend/pending' });
    store.dispatch({ type: 'adminUsers/suspend/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
    expect(store.getState().slice.lastAction).toBe('suspended');
  });

  it('adminUsers/reactivate/fulfilled marca lastAction=reactivated', () => {
    const store = makeStore();
    store.dispatch({ type: 'adminUsers/reactivate/pending' });
    store.dispatch({ type: 'adminUsers/reactivate/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
    expect(store.getState().slice.lastAction).toBe('reactivated');
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
