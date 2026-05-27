/**
 * Tests AdminRoute — ecommerce-ui
 *
 * UC-AUTH-01b: acceso al panel admin segun rol de usuario.
 * Decision T-103 de validar-perfiles-de-usuario:
 *   - is_staff: true  -> acceso concedido (staff tecnico)
 *   - is_admin: true  -> acceso concedido (admin del negocio)
 *   - ambos false     -> redirige a "/"
 *   - no autenticado  -> redirige a "/auth/login"
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import authReducer from '@redux/slices/authSlice';
import AdminRoute from './AdminRoute';

function buildStore(authState = {}) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...authState,
      },
    },
  });
}

function renderRoutes(authState) {
  const store = buildStore(authState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/"           element={<div data-testid="inicio">Inicio</div>} />
          <Route path="/auth/login" element={<div data-testid="login">Login</div>} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div data-testid="panel-admin">Panel Admin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('AdminRoute (UC-AUTH-01b, decision T-103)', () => {
  it('redirige a /auth/login cuando el usuario no esta autenticado', () => {
    renderRoutes({ isAuthenticated: false });
    expect(screen.getByTestId('login')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-admin')).not.toBeInTheDocument();
  });

  it('redirige a / cuando el usuario esta autenticado pero es comprador (is_staff false, is_admin false)', () => {
    renderRoutes({
      isAuthenticated: true,
      user: { id: 1, email: 'comprador@test.mx', is_staff: false, is_admin: false },
    });
    expect(screen.getByTestId('inicio')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-admin')).not.toBeInTheDocument();
  });

  it('concede acceso cuando el usuario tiene is_staff true (staff tecnico)', () => {
    renderRoutes({
      isAuthenticated: true,
      user: { id: 3, email: 'staff@test.mx', is_staff: true, is_admin: false },
    });
    expect(screen.getByTestId('panel-admin')).toBeInTheDocument();
  });

  it('concede acceso cuando el usuario tiene is_admin true (admin del negocio)', () => {
    renderRoutes({
      isAuthenticated: true,
      user: { id: 2, email: 'admin@e-comerce.example.com', is_staff: true, is_admin: true },
    });
    expect(screen.getByTestId('panel-admin')).toBeInTheDocument();
  });

  it('muestra PageLoader mientras isLoading es true y no redirige', () => {
    renderRoutes({ isAuthenticated: false, isLoading: true });
    expect(screen.queryByTestId('panel-admin')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
    expect(screen.queryByTestId('inicio')).not.toBeInTheDocument();
  });
});
