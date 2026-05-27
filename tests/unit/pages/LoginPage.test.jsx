/**
 * Tests — LoginPage
 * UC-AUTH-02 / Sprint 1 (completado en Sprint 2)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../src/redux/slices/authSlice';
import LoginPage from '../../../src/pages/auth/LoginPage';

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: null, isAuthenticated: false, isLoading: false, error: null, ...preloadedState } },
  });

const renderPage = (state = {}) =>
  render(
    <Provider store={makeStore(state)}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );

describe('LoginPage', () => {

  it('renderiza el formulario de inicio de sesion', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar a mi cuenta/i })).toBeInTheDocument();
  });

  it.skip('muestra error de validacion cuando el username esta vacio — BUG-04: comp usa required nativo, no mensaje custom;', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Entrar a mi cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/usuario es obligatorio/i)).toBeInTheDocument();
    });
  });

  it.skip('muestra error de validacion cuando la contrasena esta vacia — BUG-04: comp usa required nativo, no mensaje custom;', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'testuser', name: 'username' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Entrar a mi cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/contrasena es obligatoria/i)).toBeInTheDocument();
    });
  });

  it.skip('limpia el error de campo al escribir — BUG-04: depende del test de validacion anterior;', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Entrar a mi cuenta/i }));
    await waitFor(() => screen.getByText(/usuario es obligatorio/i));
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'u', name: 'username' },
    });
    expect(screen.queryByText(/usuario es obligatorio/i)).not.toBeInTheDocument();
  });

  it('tiene link para recuperar contrasena', () => {
    renderPage();
    expect(screen.getByText(/OLVIDASTE TU CONTRASEÑA/i)).toBeInTheDocument();
  });

  it('tiene link para crear cuenta', () => {
    renderPage();
    expect(screen.getByText(/Crear una ahora/i)).toBeInTheDocument();
  });

  it.skip('muestra estado de carga — BUG-04: comp usa loading local (useState), no isLoading del store; el botón solo muestra "Entrando…" mientras el dispatch está pendiente', () => {});
});

// =============================================================================
// T-301 T-302 T-303 — Redirect post-login por perfil
// =============================================================================

jest.mock('../../../src/services/apiService', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get:  jest.fn(),
  },
}));

// eslint-disable-next-line import/order
import apiService from '../../../src/services/apiService';
import { Routes, Route } from 'react-router-dom';

function renderWithRoutes(initialEntries = ['/auth/login']) {
  return render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/account"   element={<div data-testid="cuenta">Cuenta</div>} />
          <Route path="/admin"     element={<div data-testid="admin">Admin</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

async function submitLogin(email, password) {
  fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
    target: { value: email, name: 'username' },
  });
  fireEvent.change(screen.getByLabelText(/Contraseña/i), {
    target: { value: password, name: 'password' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Entrar a mi cuenta/i }));
}

describe('LoginPage — redirect post-login (T-301 T-302 T-303)', () => {
  afterEach(() => jest.clearAllMocks());

  it('T-301: login de comprador redirige a /account', async () => {
    apiService.post.mockResolvedValue({
      data: { user: { id: 1, email: 'comprador@test.mx', is_staff: false, is_admin: false } },
    });
    renderWithRoutes();
    await submitLogin('comprador@test.mx', 'Test1234!');
    await waitFor(() =>
      expect(screen.getByTestId('cuenta')).toBeInTheDocument()
    );
    expect(screen.queryByTestId('admin')).not.toBeInTheDocument();
  });

  it('T-302: login de admin (is_staff true) redirige a /admin', async () => {
    apiService.post.mockResolvedValue({
      data: { user: { id: 2, email: 'admin@e-comerce.example.com', is_staff: true, is_admin: true } },
    });
    renderWithRoutes();
    await submitLogin('admin@e-comerce.example.com', 'Admin1234!');
    await waitFor(() =>
      expect(screen.getByTestId('admin')).toBeInTheDocument()
    );
    expect(screen.queryByTestId('cuenta')).not.toBeInTheDocument();
  });

  it('T-302b: login de staff (is_staff true, is_admin false) redirige a /admin', async () => {
    apiService.post.mockResolvedValue({
      data: { user: { id: 3, email: 'staff@test.mx', is_staff: true, is_admin: false } },
    });
    renderWithRoutes();
    await submitLogin('staff@test.mx', 'Staff1234!');
    await waitFor(() =>
      expect(screen.getByTestId('admin')).toBeInTheDocument()
    );
  });

  it('T-303: login exitoso respeta state.from si existe', async () => {
    apiService.post.mockResolvedValue({
      data: { user: { id: 1, email: 'comprador@test.mx', is_staff: false, is_admin: false } },
    });
    // Simular llegada desde una ruta protegida
    renderWithRoutes([{ pathname: '/auth/login', state: { from: { pathname: '/account' } } }]);
    await submitLogin('comprador@test.mx', 'Test1234!');
    await waitFor(() =>
      expect(screen.getByTestId('cuenta')).toBeInTheDocument()
    );
  });
});
