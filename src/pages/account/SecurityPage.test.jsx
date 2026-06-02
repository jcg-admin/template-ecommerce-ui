/**
 * Tests — SecurityPage (UC-AUTH-16)
 * El boton "Eliminar cuenta" abre un ConfirmModal y al confirmar
 * despacha deleteAccount (POST /api/v1/auth/me/deactivate/ con password) y navega al login.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn(), put: jest.fn() },
}));

// Usa el mock de ConfirmModal del repo (auto-confirma via boton).
jest.mock('@components/shared/ConfirmModal/ConfirmModal');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import apiService from '@services/apiService';
import authReducer from '../../redux/slices/authSlice';
import SecurityPage from './SecurityPage';

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: { id: 1, email: 'demo@test.mx' },
        isAuthenticated: true, isLoading: false, error: null,
      },
    },
  });

const renderPage = () =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <SecurityPage />
      </MemoryRouter>
    </Provider>,
  );

afterEach(() => jest.clearAllMocks());

describe('SecurityPage — eliminar cuenta (UC-AUTH-16)', () => {
  it('el boton de eliminacion abre el ConfirmModal (tras escribir password)', () => {
    renderPage();
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Confirma tu contraseña/i), {
      target: { value: 'Test1234!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /solicitar eliminación/i }));
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
  });

  it('al confirmar con password despacha deactivate y navega al login', async () => {
    apiService.post.mockResolvedValueOnce({ data: { detail: 'Cuenta dada de baja exitosamente.' } });
    renderPage();

    fireEvent.change(screen.getByLabelText(/Confirma tu contraseña/i), {
      target: { value: 'Test1234!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /solicitar eliminación/i }));
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }));

    await waitFor(() =>
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/auth/me/deactivate/',
        { password: 'Test1234!' },
      ),
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login'),
    );
  });
});
