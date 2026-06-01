/**
 * ProtectedRoute — ecommerce-ui
 * Requiere autenticación. Si no está autenticado, redirige a /auth/login
 * preservando la ruta original en el state para redirigir al volver.
 */

import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthLoading } from '@redux/selectors';
import PageLoader from '@components/shared/LazyLoad/PageLoader';

export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading       = useSelector(selectAuthLoading);
  const location        = useLocation();

  // Si ya autenticado, renderizar aunque haya un fetch en curso (ej. fetchProfile)
  if (isAuthenticated) return <Outlet />;

  // Sin sesión conocida: esperar si hay una operación de auth en curso
  if (isLoading) return <PageLoader />;

  return <Navigate to="/auth/login" state={{ from: location }} replace />;
}
