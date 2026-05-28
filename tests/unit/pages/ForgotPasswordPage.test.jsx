/**
 * Tests — ForgotPasswordPage
 * UC-AUTH-07: Recuperación de contraseña paso 1
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../src/redux/slices/authSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), put: jest.fn() },
}));
import apiService from '@services/apiService';
import ForgotPasswordPage from '../../../src/pages/auth/ForgotPasswordPage';

const makeStore = () => configureStore({
  reducer: { auth: authReducer },
  preloadedState: { auth: { user: null, isAuthenticated: false, isLoading: false, error: null } },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/auth/forgot-password']}>
      <ForgotPasswordPage />
    </MemoryRouter>
  </Provider>
);

describe('ForgotPasswordPage', () => {
  it('renderiza el formulario de recuperación', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /recuperar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it('el campo de email es requerido', () => {
    renderPage();
    expect(screen.getByRole('textbox', { name: /correo/i })).toBeRequired();
  });

  it('muestra el estado de éxito tras enviar el correo', async () => {
    apiService.post.mockResolvedValue({ detail: 'OK' });
    renderPage();

    fireEvent.change(screen.getByRole('textbox', { name: /correo/i }), {
      target: { value: 'oshun@practica.mx' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument();
    });
  });

  it('muestra el estado de éxito incluso cuando el backend rechaza (anti-enumeración)', async () => {
    apiService.post.mockRejectedValue(new Error('404'));
    renderPage();

    fireEvent.change(screen.getByRole('textbox', { name: /correo/i }), {
      target: { value: 'noexiste@practica.mx' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument();
    });
  });

  it('tiene link de vuelta al login', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/auth/login');
  });
});
