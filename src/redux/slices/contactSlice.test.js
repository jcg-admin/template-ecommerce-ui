/**
 * Tests — contactSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './contactSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('contactSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('contact/send/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'contact/send/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('contact/send/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'contact/send/pending' });
    store.dispatch({ type: 'contact/send/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('contact/send/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'contact/send/pending' });
    store.dispatch({ type: 'contact/send/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('contact/markRead/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'contact/markRead/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
