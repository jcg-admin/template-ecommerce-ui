/**
 * Sidebar — ecommerce-ui
 * Sidebar de navegación con API completa de ui-core sidebar.js.
 *
 * Métodos públicos via ref:
 *   show()            — abre el sidebar
 *   hide()            — cierra el sidebar
 *   toggle()          — alterna abierto/cerrado
 *   narrow()          — modo estrecho (solo iconos)
 *   unfoldable()      — modo expandible en hover
 *   reset()           — restaura estado por defecto
 *   toggleNarrow()    — alterna narrow
 *   toggleUnfoldable() — alterna unfoldable
 *
 * Variantes:
 *   narrow:     sidebar colapsado a iconos
 *   unfoldable: se expande al hover (narrow + hover = full)
 *   overlaid:   flota sobre el contenido (móvil)
 *
 * Eventos: onShow/onShown/onHide/onHidden/onResize
 */
import {
  useState, useCallback,
  useImperativeHandle, forwardRef,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Sidebar.module.scss';

const Sidebar = forwardRef(function Sidebar({
  children,
  open:       controlled,
  defaultOpen = true,
  narrow:     narrowProp   = false,
  unfoldable: unfoldableProp = false,
  overlaid    = false,
  position    = 'start',    // 'start' (left) | 'end' (right)
  className   = '',
  // Callbacks
  onShow,
  onShown,
  onHide,
  onHidden,
}, ref) {
  const [internalOpen,       setInternalOpen]       = useState(defaultOpen);
  const [isNarrow,           setIsNarrow]           = useState(narrowProp);
  const [isUnfoldable,       setIsUnfoldable]       = useState(unfoldableProp);
  const [isHovering,         setIsHovering]         = useState(false);

  const open = controlled !== undefined ? controlled : internalOpen;

  const show = useCallback(() => {
    if (controlled === undefined) setInternalOpen(true);
    onShow?.();
    setTimeout(() => onShown?.(), 250);
  }, [controlled, onShow, onShown]);

  const hide = useCallback(() => {
    if (controlled === undefined) setInternalOpen(false);
    onHide?.();
    setTimeout(() => onHidden?.(), 250);
  }, [controlled, onHide, onHidden]);

  const toggle = useCallback(() => open ? hide() : show(), [open, hide, show]);

  // narrow() — equivale a Sidebar.narrow() de ui-core
  const narrow      = useCallback(() => setIsNarrow(true),  []);
  const unfoldable  = useCallback(() => { setIsNarrow(true); setIsUnfoldable(true); }, []);

  // reset() — equivale a Sidebar.reset() de ui-core
  const reset = useCallback(() => {
    setIsNarrow(narrowProp);
    setIsUnfoldable(unfoldableProp);
    if (controlled === undefined) setInternalOpen(defaultOpen);
  }, [narrowProp, unfoldableProp, controlled, defaultOpen]);

  const toggleNarrow      = useCallback(() => isNarrow ? reset() : narrow(), [isNarrow, narrow, reset]);
  const toggleUnfoldable  = useCallback(() => isUnfoldable ? reset() : unfoldable(), [isUnfoldable, unfoldable, reset]);

  useImperativeHandle(ref, () => ({
    show, hide, toggle,
    narrow, unfoldable, reset,
    toggleNarrow, toggleUnfoldable,
    isNarrow:     () => isNarrow,
    isUnfoldable: () => isUnfoldable,
    isOpen:       () => open,
  }), [show, hide, toggle, narrow, unfoldable, reset, toggleNarrow, toggleUnfoldable, isNarrow, isUnfoldable, open]);

  // En modo unfoldable: expandir al hover
  const expanded = !isNarrow || (isUnfoldable && isHovering);

  const sidebarCls = [
    styles.sidebar,
    isNarrow     ? styles.narrow     : '',
    isUnfoldable ? styles.unfoldable : '',
    overlaid     ? styles.overlaid   : '',
    position === 'end' ? styles.posEnd : '',
    className,
  ].filter(Boolean).join(' ');

  // Para overlaid (móvil), se usa AnimatePresence
  if (overlaid) {
    return (
      <>
        {open && (
          <div
            className={styles.backdrop}
            onClick={hide}
            aria-hidden="true"
          />
        )}
        <AnimatePresence>
          {open && (
            <motion.aside
              className={sidebarCls}
              initial={{ x: position === 'end' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: position === 'end' ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              aria-label="Navegación lateral"
            >
              {children}
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Para sidebar permanente (desktop): siempre en el DOM
  // open controla la clase CSS (show/hide), no el montaje
  return (
    <aside
      className={[sidebarCls, !open ? styles.sidebarHidden : ''].filter(Boolean).join(' ')}
      style={{ width: expanded ? undefined : undefined }}
      onMouseEnter={() => isUnfoldable && setIsHovering(true)}
      onMouseLeave={() => isUnfoldable && setIsHovering(false)}
      aria-label="Navegación lateral"
    >
      {children}
    </aside>
  );
});

export default Sidebar;

/** SidebarNav — lista de navegación dentro del Sidebar */
export function SidebarNav({ children, className = '' }) {
  return (
    <nav className={`${styles.nav} ${className}`} aria-label="Menú lateral">
      <ul className={styles.navList}>{children}</ul>
    </nav>
  );
}

/** SidebarNavItem — ítem individual */
export function SidebarNavItem({ children, href, icon, active = false, className = '' }) {
  return (
    <li className={`${styles.navItem} ${active ? styles.navItemActive : ''} ${className}`}>
      <a href={href} className={styles.navLink} aria-current={active ? 'page' : undefined}>
        {icon && <span className={styles.navIcon} aria-hidden="true">{icon}</span>}
        <span className={styles.navLabel}>{children}</span>
      </a>
    </li>
  );
}

/** SidebarBrand — logo/nombre de la app */
export function SidebarBrand({ children, className = '' }) {
  return <div className={`${styles.brand} ${className}`}>{children}</div>;
}
export { Sidebar };
