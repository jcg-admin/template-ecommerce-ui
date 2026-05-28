/**
 * Tests — settingsSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './settingsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('settingsSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('settings/update/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'settings/update/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('settings/update/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'settings/update/pending' });
    store.dispatch({ type: 'settings/update/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('settings/update/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'settings/update/pending' });
    store.dispatch({ type: 'settings/update/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
