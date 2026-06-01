/**
 * AdminRoute — ecommerce-ui
 *
 * Permite acceso a usuarios con is_staff = true O is_admin = true.
 * Ver decision T-103 de validar-perfiles-de-usuario:
 * is_staff: staff tecnico del sistema (equivale al is_staff de Django).
 * is_admin: administrador del negocio (campo adicional del perfil).
 * Ambos roles tienen acceso completo al panel en el template base.
 * Redirige a "/" si el usuario no tiene ninguno de los dos roles.
 */

import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuthenticated, selectIsAdmin, selectAuthLoading } from '@redux/selectors';
import PageLoader from '@components/shared/LazyLoad/PageLoader';

export default function AdminRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);
  const isLoading       = useSelector(selectAuthLoading);

  // Si autenticado y con rol admin, renderizar directamente
  if (isAuthenticated && isAdmin) return <Outlet />;

  // Sin datos definitivos: esperar si hay un fetch de auth en curso
  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <Navigate to="/" replace />;
}
