/**
 * Header — Práctica Yorùbà
 * Cabecera con logo, tagline IFÁ · ÒRÌSÀ · OLÓDÙMARÈ,
 * navegación Yorùbà, búsqueda, cuenta y carrito.
 *
 * Adaptado del paquete dist-yoruba-ui en T-301:
 *   - Rutas en inglés (/catalog, /account, /cart, /wishlist)
 *   - Navegación Yoruba con categorías reales del catálogo Oja
 *   - Integración Redux idéntica al repo (selectores + uiSlice)
 *   - Logo via alias @assets (T-105)
 */

import Offcanvas from '@components/common/Offcanvas/Offcanvas';
import Badge from '@components/common/Badge';
import Avatar from '@components/common/Avatar';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectCartItemCount,
  selectCartItems,
  selectIsSearchOpen,
} from '@redux/selectors';
import { toggleSearch } from '@redux/slices/uiSlice';
import useKeyboardShortcut from '@hooks/ui/useKeyboardShortcut';
import { selectUser } from '@redux/selectors';
import { logoutUser } from '@redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Dropdown, { DropdownItem, DropdownDivider } from '@components/common/Dropdown/Dropdown';
import logoUrl from '@assets/practica-yoruba-logo.png';
import styles from './Header.module.scss';

// Navegación Yorùbà — categorías del catálogo Oja Yoruba en inglés
// Las rutas usan la convención /catalog?category=<slug> del router EN
const MAIN_NAV = [
  { to: '/catalog?category=akoses-medicinas',           label: 'Akoses & Medicinas' },
  { to: '/catalog?category=collares-y-pulseras',        label: 'Elekes & Collares' },
  { to: '/catalog?category=isan-iconos',                label: 'Isan / Iconos' },
  { to: '/catalog?category=complementos-y-herramientas',label: 'Herramientas' },
  { to: '/catalog?category=enseres',                    label: 'Enseres' },
];

export default function Header() {
  const dispatch     = useDispatch();
  // T-503: Ctrl+K activa/desactiva el buscador (BUG-SB01 - mejora de accesibilidad)
  useKeyboardShortcut({ key: 'k', ctrl: true }, () => dispatch(toggleSearch()));
  const isAuth       = useSelector(selectIsAuthenticated);
  const cartCount    = useSelector(selectCartItemCount);
  const cartItems    = useSelector(selectCartItems) ?? [];
  const isSearchOpen  = useSelector(selectIsSearchOpen);
  const user          = useSelector(selectUser);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate     = useNavigate();
  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/auth/login');
  };

  return (
    <header className={styles.header}>
      {/* ─── Top utility strip ─── */}
      <div className={styles.topStrip}>
        <div className={styles.topStripInner}>
          <div className={styles.topStripLeft}>
            <span>
              Envío gratis en pedidos &gt;{' '}
              <b className={styles.bronze}>$1,500 MXN</b>
            </span>
            <span className={styles.dot}>·</span>
            <span>Atención L-V 10:00 — 19:00 · Envíos a toda la república</span>
          </div>
          <div className={styles.topStripRight}>
            <Link to="/help">Ayuda</Link>
            <Link to="/account/orders">Rastrear pedido</Link>
            <Link to="/contact">Contacto</Link>
          </div>
        </div>
      </div>

      {/* ─── Main bar: logo + search + actions ─── */}
      <div className={styles.mainBar}>
        <div className={styles.mainBarInner}>
          {/* Brand */}
          <Link to="/" className={styles.brand} aria-label="Inicio">
            <img
              src={logoUrl}
              alt=""
              aria-hidden="true"
              className={styles.brandLogo}
            />
            <span className={styles.brandText}>
              <span className={styles.brandName}>Práctica Yorùbà</span>
              <span className={styles.brandTag}>Ifá · Òrìsà · Olódùmarè</span>
            </span>
          </Link>

          {/* Search */}
          <button
            type="button"
            className={styles.searchTrigger}
            onClick={() => dispatch(toggleSearch())}
            aria-label="Buscar productos"
            aria-expanded={isSearchOpen}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className={styles.searchPlaceholder}>
              Buscar elekes, otanes, herramientas de òrìsà…
            </span>
            <kbd className={styles.searchKbd}>⌘ K</kbd>
          </button>

          {/* Actions */}
          <div className={styles.actions}>
            {/* T-606: Dropdown de usuario (BUG-HE01 corregido) */}
            {isAuth ? (
              <Dropdown
                trigger={
                  <span className={styles.actionLink} aria-label="Menu de usuario">
                    <Avatar src={user?.avatar_url} name={user?.first_name} size="sm" />
                    {user?.first_name || 'Mi cuenta'} ▾
                  </span>
                }
                placement="bottom-end"
              >
                <DropdownItem onClick={() => navigate('/account')}>Mi cuenta</DropdownItem>
                <DropdownItem onClick={() => navigate('/account/orders')}>Mis pedidos</DropdownItem>
                <DropdownItem onClick={() => navigate('/account/profile')}>Perfil</DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout}>Cerrar sesión</DropdownItem>
              </Dropdown>
            ) : (
              <button
                type="button"
                className={styles.actionLink}
                onClick={() => navigate('/auth/login')}
              >
                Ingresar
              </button>
            )}

            <Link to="/account/wishlist" className={styles.actionLink}>
              Deseos
            </Link>

            <button
              type="button"
              className={styles.cartBtn}
              onClick={() => setCartOpen(true)}
              aria-label={`Carrito (${cartCount} ${cartCount === 1 ? 'pieza' : 'piezas'})`}
            >
              Bolsa
              <span className={styles.cartCount}>
                <Badge value={cartCount} tone="coral" ariaLabel={`${cartCount} en la bolsa`} />
              </span>
            </button>
            <Offcanvas
              open={cartOpen}
              onClose={() => setCartOpen(false)}
              placement="end"
              backdrop
              keyboard
              scroll={false}
            >
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Tu bolsa ({cartCount})</h2>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    aria-label="Cerrar carrito"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                  >✕</button>
                </div>
                {cartCount === 0 ? (
                  <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>Tu bolsa está vacía</p>
                ) : (
                  <>
                    {cartItems.slice(0, 3).map((item, i) => (
                      <div key={item.id ?? i} style={{ display: 'flex', gap: 12, marginBottom: 12,
                        padding: '10px 0', borderBottom: '1px solid #eee' }}>
                        {item.image_url && (
                          <img src={item.image_url} alt=""
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>
                            {item.quantity} × ${Number(item.unit_price || 0).toLocaleString('es-MX')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8 }}>
                        + {cartItems.length - 3} pieza{cartItems.length - 3 !== 1 ? 's' : ''} más
                      </p>
                    )}
                    <Link to="/cart" onClick={() => setCartOpen(false)}
                      style={{ display: 'block', textAlign: 'center', marginTop: 16,
                        padding: '10px', background: 'var(--c-coral-soft)',
                        color: '#fff', borderRadius: 4, textDecoration: 'none' }}>
                      Ver bolsa completa →
                    </Link>
                  </>
                )}
              </div>
            </Offcanvas>
          </div>
        </div>
      </div>

      {/* ─── Categories nav ─── */}
      <nav className={styles.categoriesNav} aria-label="Categorías Yorùbà">
        <div className={styles.categoriesInner}>
          {MAIN_NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
          <span className={styles.navSpacer} />
          <Link to="/catalog" className={styles.navLinkAccent}>
            · Catálogo completo →
          </Link>
        </div>
      </nav>
    </header>
  );
}
