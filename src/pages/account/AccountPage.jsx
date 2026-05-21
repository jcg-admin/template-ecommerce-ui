/**
 * AccountPage — e-comerce-ui
 * Hub de la cuenta del comprador. Muestra resumen y navegacion
 * a las secciones de perfil, direcciones y ordenes.
 *
 * Tras T-017 de `revisar-arquitectura-de-mocks` el componente despacha
 * siempre el thunk real `fetchProfile`. Cuando `PROFILE_SOURCE=mock`
 * (el default) MSW intercepta via `/api/v1/auth/profile/`; cuando es
 * `real`, la request sale al backend.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProfile } from '@redux/slices/authSlice';
import { selectUser, selectAuthLoading } from '@redux/selectors';
import styles from './AccountPage.module.scss';

const IS_MOCK_MODE = process.env.PROFILE_SOURCE === 'mock';

const NAV_ITEMS = [
  { to: '/account/profile',   label: 'Mi perfil',          desc: 'Datos personales y avatar' },
  { to: '/account/addresses', label: 'Mis direcciones',     desc: 'Direcciones de envio guardadas' },
  { to: '/account/orders',    label: 'Mis pedidos',         desc: 'Historial y estado de ordenes' },
  { to: '/account/wishlist',  label: 'Lista de deseos',     desc: 'Productos que te interesan' },
  { to: '/account/password',  label: 'Cambiar contrasena',  desc: 'Seguridad de la cuenta' },
];

export default function AccountPage() {
  const dispatch  = useDispatch();
  const user      = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (isLoading && !user) {
    return <div className={styles.page}><p>Cargando cuenta...</p></div>;
  }

  const greeting = user?.first_name ? `Hola, ${user.first_name}` : 'Mi cuenta';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{greeting}</h1>
        {user?.email && <p className={styles.email}>{user.email}</p>}
        {user?.profile_completeness !== undefined && user.profile_completeness < 100 && (
          <p className={styles.completeness}>
            Perfil completado al {user.profile_completeness}%
            {' — '}
            <Link to="/account/profile">Completar ahora</Link>
          </p>
        )}
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label, desc }) => (
          <Link key={to} to={to} className={styles.navItem}>
            <span className={styles.navLabel}>{label}</span>
            <span className={styles.navDesc}>{desc}</span>
          </Link>
        ))}
      </nav>

      {IS_MOCK_MODE && (
        <p className={styles.mockBadge}>Modo mock activo (PROFILE_SOURCE=mock)</p>
      )}
    </div>
  );
}
