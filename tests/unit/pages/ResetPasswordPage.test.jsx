/**
 * Tests — ResetPasswordPage
 * UC-AUTH-07: Recuperación de contraseña paso 2
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }                 from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore }           from '@reduxjs/toolkit';
import authReducer from '../../../src/redux/slices/authSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), put: jest.fn() },
}));
import apiService from '@services/apiService';
import ResetPasswordPage from '../../../src/pages/auth/ResetPasswordPage';

const makeStore = () => configureStore({
  reducer: { auth: authReducer },
  preloadedState: { auth: { user: null, isAuthenticated: false, isLoading: false, error: null } },
});

const renderPage = (uid = 'test-uid', token = 'valid-token') => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={[`/auth/reset-password/${uid}/${token}`]}>
      <Routes>
        <Route path="/auth/reset-password/:uid/:token" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('ResetPasswordPage', () => {
  it('renderiza el formulario de nueva contraseña', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /nueva contraseña/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it('tiene dos campos de contraseña', () => {
    renderPage();
    const pwdFields = screen.getAllByDisplayValue('');
    expect(pwdFields.length).toBeGreaterThanOrEqual(2);
  });

  it('muestra error cuando las contraseñas no coinciden', async () => {
    renderPage();
    const [next, confirm] = screen.getAllByDisplayValue('');
    fireEvent.change(next,    { target: { value: 'Yemaya123!' } });
    fireEvent.change(confirm, { target: { value: 'distinta456' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
  });

  it('llama al endpoint con el token al enviar contraseñas iguales', async () => {
    apiService.post.mockResolvedValue({ detail: 'OK' });
    renderPage('abc123', 'valid-tok');

    const [next, confirm] = screen.getAllByDisplayValue('');
    fireEvent.change(next,    { target: { value: 'Oshun2026!' } });
    fireEvent.change(confirm, { target: { value: 'Oshun2026!' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => expect(apiService.post).toHaveBeenCalled());
  });

  it('muestra error de token inválido cuando el backend falla', async () => {
    apiService.post.mockRejectedValue({ response: { data: { token: ['invalid'] } } });
    renderPage();

    const [next, confirm] = screen.getAllByDisplayValue('');
    fireEvent.change(next,    { target: { value: 'Oshun2026!' } });
    fireEvent.change(confirm, { target: { value: 'Oshun2026!' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText(/token inválido/i)).toBeInTheDocument();
    });
  });

  it('tiene link de vuelta al paso 1', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /volver al paso 1/i }))
      .toHaveAttribute('href', '/auth/forgot-password');
  });
});
