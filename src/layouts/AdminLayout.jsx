/**
 * AdminLayout — ecommerce-ui
 * Layout del panel admin: sidebar + header + contenido.
 * Acceso exclusivo para is_staff = true.
 *
 * Corrige:
 *   BUG-S03: nav duplicada — ahora usa Sidebar + AdminSidebar
 *   BUG-S04: backdrop sin accesibilidad (ahora en Sidebar comun)
 *   BUG-S05: aria-label del hamburguesa no dinámico
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-202)
 */

import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { selectUser } from '@redux/selectors';
import { logoutUser } from '@redux/slices/authSlice';
import { closeSidebar, openSidebar, selectIsSidebarOpen } from '@redux/slices/uiSlice';
import Sidebar from '@components/layout/Sidebar/Sidebar';
import AdminSidebar from '@components/admin/AdminSidebar';
import ToastContainer from '@components/common/Toast/ToastContainer';
import ErrorBoundary from '@components/shared/ErrorBoundary';
import styles from './AdminLayout.module.scss';

export default function AdminLayout() {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const user          = useSelector(selectUser);
  const isSidebarOpen = useSelector(selectIsSidebarOpen);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/auth/login');
  };

  return (
    <div className={styles.root}>
      {/* Sidebar comun — gestiona backdrop, scroll lock y Escape (BUG-S01/S04) */}
      <Sidebar
        open={isSidebarOpen}
        onClose={() => dispatch(closeSidebar())}
      >
        <AdminSidebar />
      </Sidebar>

      {/* Contenido principal */}
      <div className={styles.content}>
        <header className={styles.header}>
          {/* BUG-S05 corregido: aria-label dinamico */}
          <button
            className={styles.menuBtn}
            onClick={() => dispatch(isSidebarOpen ? closeSidebar() : openSidebar())}
            aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isSidebarOpen}
            aria-controls="admin-sidebar"
          >
            ☰
          </button>
          <span className={styles.headerTitle}>Panel de administración</span>
          <div className={styles.headerUser}>
            <span>{user?.first_name} {user?.last_name}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
