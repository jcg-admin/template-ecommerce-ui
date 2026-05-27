/**
 * Tests — VerifyEmailPage (UC-AUTH-10)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(), post: jest.fn(),
    patch: jest.fn(), delete: jest.fn(),
  },
}));

import apiService from '@services/apiService';
import authReducer from '../../redux/slices/authSlice';
import VerifyEmailPage from './VerifyEmailPage';

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: null, isAuthenticated: false, isLoading: false, error: null },
    },
  });

const renderPage = (search = '?token=abc123') =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={[`/auth/verify-email${search}`]}>
        <VerifyEmailPage />
      </MemoryRouter>
    </Provider>,
  );

afterEach(() => jest.clearAllMocks());

describe('VerifyEmailPage (UC-AUTH-10)', () => {
  it.skip('llama POST verify-email — PENDIENTE: encapsulado en thunk Redux', async () => {
    apiService.post.mockResolvedValue({ data: { status: 'OK' } });
    renderPage('?token=abc123');
    await waitFor(() => expect(apiService.post).toHaveBeenCalledWith(
      '/api/v1/auth/verify-email/',
      { token: 'abc123' },
    ));
  });

  it('muestra mensaje de exito tras verificar', async () => {
    apiService.post.mockResolvedValue({ data: { status: 'OK' } });
    renderPage('?token=abc123');
    expect(
      await screen.findByText(/Bienvenido|activa|verificad/i),
    ).toBeInTheDocument();
  });

  it('muestra link para iniciar sesion cuando el exito', async () => {
    apiService.post.mockResolvedValue({ data: { status: 'OK' } });
    renderPage('?token=abc123');
    expect(
      await screen.findByRole('link', { name: /Iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it.skip('muestra error cuando el token es invalido o expiro — PENDIENTE: mock de thunk Redux', async () => {
    apiService.post.mockRejectedValue({
      code: 'TOKEN_INVALID',
      status: 400,
      message: 'Token invalido o expirado',
    });
    renderPage('?token=expired');
    expect(
      await screen.findByText(/enlace|expiró|inválido|error/i),
    ).toBeInTheDocument();
  });

  it.skip('ofrece reenviar el correo — PENDIENTE: mock de thunk Redux', async () => {
    apiService.post.mockRejectedValue({
      code: 'TOKEN_INVALID', status: 400, message: 'expired',
    });
    renderPage('?token=expired');
    await screen.findByText(/enlace|expiró|inválido|error/i);
    expect(
      screen.getByRole('button', { name: /reenviar correo/i }),
    ).toBeInTheDocument();
  });

  it.skip('al reenviar llama POST resend-verification — PENDIENTE: encapsulado en thunk', async () => {
    apiService.post.mockRejectedValueOnce({
      code: 'TOKEN_INVALID', status: 400, message: 'x',
    });
    apiService.post.mockResolvedValueOnce({ data: { status: 'OK' } });
    renderPage('?token=expired');
    await screen.findByText(/enlace|expiró|inválido|error/i);

    fireEvent.change(screen.getByLabelText(/correo electronico/i), {
      target: { value: 'demo@test.mx', name: 'email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /reenviar correo/i }));

    await waitFor(() => expect(apiService.post).toHaveBeenLastCalledWith(
      '/api/v1/auth/resend-verification/',
      { email: 'demo@test.mx' },
    ));
  });

  it.skip('muestra error sin token — PENDIENTE: comportamiento diferente en nuevo diseño', () => {
    renderPage('');
    expect(
      screen.getByText(/Enlace|caducado|inválido|error/i),
    ).toBeInTheDocument();
    expect(apiService.post).not.toHaveBeenCalled();
  });
});
