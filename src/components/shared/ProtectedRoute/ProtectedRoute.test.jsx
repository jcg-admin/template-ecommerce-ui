/**
 * Tests ProtectedRoute — ecommerce-ui
 *
 * UC-AUTH-01: acceso a rutas protegidas segun estado de sesion.
 *
 * Casos cubiertos:
 *   (a) usuario no autenticado -> redirige a /auth/login preservando `state.from`
 *   (b) usuario autenticado -> renderiza el contenido de la ruta (Outlet)
 *   (c) carga en progreso (isLoading true) -> muestra PageLoader, no redirige
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import authReducer from '@redux/slices/authSlice';
import ProtectedRoute from './index';

// Captura la location que recibe la pantalla de login (para verificar state.from)
function LoginSpy() {
  const location = useLocation();
  return (
    <div data-testid="login-spy">
      {JSON.stringify(location.state)}
    </div>
  );
}

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

function renderRoutes(authState, initialPath = '/cuenta') {
  const store = buildStore(authState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/auth/login" element={<LoginSpy />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/cuenta" element={<div data-testid="contenido-protegido">Mi cuenta</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('ProtectedRoute (UC-AUTH-01)', () => {
  it('redirige a /auth/login cuando el usuario no esta autenticado', () => {
    renderRoutes({ isAuthenticated: false });
    expect(screen.getByTestId('login-spy')).toBeInTheDocument();
    expect(screen.queryByTestId('contenido-protegido')).not.toBeInTheDocument();
  });

  it('preserva la ruta original en state.from al redirigir a login', () => {
    renderRoutes({ isAuthenticated: false }, '/cuenta');
    const spy = screen.getByTestId('login-spy');
    const state = JSON.parse(spy.textContent);
    expect(state?.from?.pathname).toBe('/cuenta');
  });

  it('renderiza el contenido protegido cuando el usuario esta autenticado', () => {
    renderRoutes({
      isAuthenticated: true,
      user: { id: 1, email: 'comprador@test.mx', is_staff: false },
    });
    expect(screen.getByTestId('contenido-protegido')).toBeInTheDocument();
    expect(screen.queryByTestId('login-spy')).not.toBeInTheDocument();
  });

  it('muestra PageLoader mientras isLoading es true y no redirige', () => {
    // PageLoader usa un div/span de carga; verificamos que el contenido
    // protegido NO se renderiza (el guard esta bloqueado por isLoading)
    renderRoutes({ isAuthenticated: false, isLoading: true });
    expect(screen.queryByTestId('contenido-protegido')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-spy')).not.toBeInTheDocument();
  });

  // Regresion BUG-ACCOUNT-01: el guard chequeaba isLoading ANTES que
  // isAuthenticated. Tras el login, fetchProfile.pending volvia a poner
  // isLoading=true -> el usuario autenticado quedaba en PageLoader
  // indefinidamente. El fix renderiza el Outlet si ya esta autenticado
  // aunque haya un fetch de auth en curso.
  it('renderiza el contenido aunque isLoading sea true si ya esta autenticado (BUG-ACCOUNT-01)', () => {
    renderRoutes({
      isAuthenticated: true,
      isLoading: true,
      user: { id: 1, email: 'comprador@test.mx', is_staff: false },
    });
    expect(screen.getByTestId('contenido-protegido')).toBeInTheDocument();
    expect(screen.queryByTestId('login-spy')).not.toBeInTheDocument();
  });
});
