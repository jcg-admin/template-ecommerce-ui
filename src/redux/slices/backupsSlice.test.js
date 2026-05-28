/**
 * Tests — backupsSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './backupsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('backupsSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('backups/trigger/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'backups/trigger/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('backups/trigger/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'backups/trigger/pending' });
    store.dispatch({ type: 'backups/trigger/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('backups/trigger/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'backups/trigger/pending' });
    store.dispatch({ type: 'backups/trigger/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
