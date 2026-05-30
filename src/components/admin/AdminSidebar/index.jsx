/**
 * AdminSidebar — ecommerce-ui
 * Navegación lateral del panel administrativo.
 * Lista canónica de rutas admin (migrada desde AdminLayout.jsx en T-202).
 *
 * Corrige BUG-S03: antes la nav estaba duplicada en AdminLayout.jsx y
 * aquí con listas divergentes. Ahora es la única fuente de verdad.
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-202)
 */

import { NavLink } from 'react-router-dom';
import logoUrl from '@assets/practica-yoruba-logo.png';
import styles from './AdminSidebar.module.scss';

const ADMIN_NAV = [
  { section: 'Principal' },
  { to: '/admin',              label: 'Dashboard',     end: true },
  { section: 'Catálogo' },
  { to: '/admin/products',     label: 'Productos' },
  { to: '/admin/products/new', label: 'Crear Producto' },
  { to: '/admin/categories',   label: 'Categorías' },
  { section: 'Ventas' },
  { to: '/admin/orders',       label: 'Pedidos' },
  { to: '/admin/payments',     label: 'Pagos' },
  { to: '/admin/returns',      label: 'Devoluciones' },
  { to: '/admin/vouchers',     label: 'Vouchers' },
  { section: 'Clientes' },
  { to: '/admin/users',        label: 'Usuarios' },
  { to: '/admin/support',      label: 'Soporte' },
  { section: 'Operaciones' },
  { to: '/admin/inventory',    label: 'Inventario' },
  { to: '/admin/logistics',    label: 'Logística' },
  { to: '/admin/reports',      label: 'Reportes', end: true },
  { section: 'Configuración' },
  { to: '/admin/config',       label: 'Configuración' },
  { to: '/admin/system-settings', label: 'Sistema' },
  { to: '/admin/audit-log',    label: 'Auditoría' },
];

export default function AdminSidebar() {
  return (
    <>
      <div className={styles.brand}>
        <img src={logoUrl} alt="" className={styles.brandLogo} />
        <div>
          <div className={styles.brandName}>Práctica Yorùbà</div>
          <div className={styles.brandTag}>Panel administrativo</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {ADMIN_NAV.map((item, i) =>
          item.section ? (
            <p key={item.section} className={styles.navSection}>{item.section}</p>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className={styles.footer}>
        <NavLink to="/" className={styles.exitLink}>← Ir al storefront</NavLink>
      </div>
    </>
  );
}
