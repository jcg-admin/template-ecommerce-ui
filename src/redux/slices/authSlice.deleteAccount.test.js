/**
 * Tests — authSlice.deleteAccount (UC-AUTH-16)
 * Dar de baja la cuenta: el thunk limpia la sesion (como logout) en
 * fulfilled y preserva el error en rejected.
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { deleteAccount } from './authSlice';
import apiService from '@services/apiService';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

const makeStore = () =>
  configureStore({ reducer: { slice: reducer } });

const loggedInStore = () => {
  const store = makeStore();
  store.dispatch({
    type: 'auth/login/fulfilled',
    payload: { user: { id: 1, email: 'comprador@test.mx' } },
  });
  return store;
};

describe('authSlice — deleteAccount (UC-AUTH-16)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('llama a POST /auth/me/deactivate/ con la contrasena (UC-AUTH-16)', async () => {
    apiService.post.mockResolvedValueOnce({ data: { detail: 'ok' } });
    const store = loggedInStore();
    await store.dispatch(deleteAccount({ password: 'Test1234!' }));
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/v1/auth/me/deactivate/',
      { password: 'Test1234!' },
    );
  });

  it('fulfilled limpia la sesion (como logout)', async () => {
    apiService.post.mockResolvedValueOnce({ data: { detail: 'ok' } });
    const store = loggedInStore();
    expect(store.getState().slice.isAuthenticated).toBe(true);

    await store.dispatch(deleteAccount({ password: 'Test1234!' }));

    const state = store.getState().slice;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('pending activa isLoading', () => {
    const store = loggedInStore();
    store.dispatch({ type: 'auth/deleteAccount/pending' });
    expect(store.getState().slice.isLoading).toBe(true);
  });

  it('rejected preserva el error y no limpia el usuario', async () => {
    apiService.post.mockRejectedValueOnce(new Error('No se pudo eliminar'));
    const store = loggedInStore();

    await store.dispatch(deleteAccount({ password: 'wrong' }));

    const state = store.getState().slice;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('No se pudo eliminar');
    // La sesion se preserva si la baja falla.
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
  });
});
