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

import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectCartItemCount,
  selectIsSearchOpen,
} from '@redux/selectors';
import { toggleSearch, openModal } from '@redux/slices/uiSlice';
import useKeyboardShortcut from '@hooks/ui/useKeyboardShortcut';
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
  const isSearchOpen = useSelector(selectIsSearchOpen);

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
            {isAuth ? (
              <Link to="/account" className={styles.actionLink}>
                Mi cuenta
              </Link>
            ) : (
              <button
                type="button"
                className={styles.actionLink}
                onClick={() => dispatch(openModal({ modal: 'auth' }))}
              >
                Ingresar
              </button>
            )}

            <Link to="/account/wishlist" className={styles.actionLink}>
              Deseos
            </Link>

            <Link
              to="/cart"
              className={styles.cartBtn}
              aria-label={`Carrito (${cartCount} ${cartCount === 1 ? 'pieza' : 'piezas'})`}
            >
              Bolsa
              <span className={styles.cartCount}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            </Link>
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
