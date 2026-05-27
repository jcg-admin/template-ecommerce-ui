/**
 * AdminLayout — Práctica Yorùbà
 * Layout con sidebar fijo a la izquierda y contenido a la derecha.
 * Asume que AppRouter envuelve las admin routes en <AdminLayout/>.
 */

import { Outlet } from 'react-router-dom';
import AdminSidebar from '@components/admin/AdminSidebar';
import styles from './AdminLayout.module.scss';

export default function AdminLayout() {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
