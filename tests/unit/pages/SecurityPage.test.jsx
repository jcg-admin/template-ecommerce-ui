/**
 * Tests — SecurityPage
 * Cambio de contraseña + sesiones activas + eliminación de cuenta
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer  from '../../../src/redux/slices/authSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), put: jest.fn() },
}));
jest.mock('../../../src/components/account/AccountSidebar', () => ({
  __esModule: true,
  default: () => <nav data-testid="account-sidebar" />,
}));
import apiService  from '@services/apiService';
import SecurityPage from '../../../src/pages/account/SecurityPage';

const makeStore = () => configureStore({
  reducer: { auth: authReducer },
  preloadedState: {
    auth: {
      user: { id: 1, email: 'user@practica.mx', first_name: 'Oshún' },
      isAuthenticated: true, isLoading: false, error: null,
    },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter><SecurityPage /></MemoryRouter>
  </Provider>
);

describe('SecurityPage', () => {
  it('renderiza las secciones principales', () => {
    renderPage();
    expect(screen.getAllByText(/cambiar contraseña/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/sesiones activas/i)).toBeInTheDocument();
    expect(screen.getByText(/eliminar cuenta/i)).toBeInTheDocument();
  });

  it('muestra las sesiones mock', () => {
    renderPage();
    expect(screen.getByText(/Chrome · macOS/i)).toBeInTheDocument();
    expect(screen.getByText(/Safari · iOS/i)).toBeInTheDocument();
  });

  it('muestra la sesión actual marcada', () => {
    renderPage();
    expect(screen.getByText(/ACTIVA · ESTE DISPOSITIVO/i)).toBeInTheDocument();
  });

  it('muestra error si las contraseñas nuevas no coinciden', async () => {
    renderPage();
    const [current, next, confirm] = screen.getAllByDisplayValue('');
    fireEvent.change(current, { target: { value: 'actual123' } });
    fireEvent.change(next,    { target: { value: 'nueva123!' } });
    fireEvent.change(confirm, { target: { value: 'diferente' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
  });

  it('llama al endpoint de cambio de contraseña cuando es válido', async () => {
    apiService.post.mockResolvedValue({ detail: 'OK' });
    renderPage();
    const [current, next, confirm] = screen.getAllByDisplayValue('');
    fireEvent.change(current, { target: { value: 'actual123' } });
    fireEvent.change(next,    { target: { value: 'Oshun2026!' } });
    fireEvent.change(confirm, { target: { value: 'Oshun2026!' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    await waitFor(() => expect(apiService.post).toHaveBeenCalled());
  });

  it('el AccountSidebar se renderiza', () => {
    renderPage();
    expect(screen.getByTestId('account-sidebar')).toBeInTheDocument();
  });
});
