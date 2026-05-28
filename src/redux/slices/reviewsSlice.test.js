/**
 * Tests — reviewsSlice
 * Estado: thunks pending/fulfilled/rejected
 * Auto-generado — cubre el contrato del reducer
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './reviewsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { slice: reducer } });

describe('reviewsSlice', () => {
  it('estado inicial es válido (no undefined)', () => {
    const store = makeStore();
    const state = store.getState().slice;
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('reviews/submit/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'reviews/submit/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('reviews/submit/fulfilled desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'reviews/submit/pending' });
    store.dispatch({ type: 'reviews/submit/fulfilled', payload: {} });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('reviews/submit/rejected desactiva isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'reviews/submit/pending' });
    store.dispatch({ type: 'reviews/submit/rejected', payload: 'error' });
    expect(store.getState().slice.isActioning).toBe(false);
  });

  it('reviews/approve/pending activa isActioning', () => {
    const store = makeStore();
    store.dispatch({ type: 'reviews/approve/pending' });
    expect(store.getState().slice.isActioning).toBe(true);
  });

  it('acciones desconocidas no rompen el estado', () => {
    const store = makeStore();
    expect(() => store.dispatch({ type: '__unknown__' })).not.toThrow();
  });
});
