/**
 * Tests — questionsSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './questionsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('questionsSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('questions/ask/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'questions/ask/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('questions/ask/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'questions/ask/pending' });
    store.dispatch({ type: 'questions/ask/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('questions/ask/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'questions/ask/pending' });
    store.dispatch({ type: 'questions/ask/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('questions/answer/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'questions/answer/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
