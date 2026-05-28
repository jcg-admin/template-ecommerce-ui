/**
 * Dropdown — ecommerce-ui
 * Menu desplegable con Popover API (light-dismiss nativo) +
 * floating-ui para posicionamiento.
 *
 * El browser gestiona nativamente con popover=auto:
 *   - Cierre al click fuera (light-dismiss)
 *   - Cierre con Escape
 *   - Top layer (z-index sobre todo)
 *   - Solo uno abierto a la vez
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-301)
 *
 * @param {ReactNode} trigger   — elemento que abre el dropdown
 * @param {ReactNode} children  — contenido del panel
 * @param {string}    placement — floating-ui placement (default: bottom-start)
 * @param {string}    className
 */
import { useId, useRef, useCallback } from 'react';
import { useFloating as useFloatingLib, autoUpdate, flip, shift, offset } from '@floating-ui/react';
import styles from './Dropdown.module.scss';

export default function Dropdown({
  trigger,
  children,
  placement = 'bottom-start',
  className = '',
}) {
  const id = useId();
  const panelId = `dropdown-${id.replace(/:/g, '')}`;
  const triggerRef = useRef(null);

  const { refs, floatingStyles } = useFloatingLib({
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  // Combinar ref del trigger con el ref de floating-ui
  const setTriggerRef = useCallback((el) => {
    triggerRef.current = el;
    refs.setReference(el);
  }, [refs]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {/* Trigger — usa popovertarget para vincular con el panel */}
      <div
        ref={setTriggerRef}
        popovertarget={panelId}
        className={styles.trigger}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById(panelId)?.togglePopover?.();
          }
        }}
      >
        {trigger}
      </div>

      {/* Panel — popover=auto: light-dismiss + Escape + top layer nativos */}
      <div
        id={panelId}
        ref={refs.setFloating}
        popover="auto"
        className={styles.panel}
        style={floatingStyles}
        role="menu"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * DropdownItem — item individual dentro del Dropdown
 */
export function DropdownItem({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      role="menuitem"
      className={`${styles.item} ${disabled ? styles.itemDisabled : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * DropdownDivider — separador visual
 */
export function DropdownDivider() {
  return <hr className={styles.divider} role="separator" />;
}
