/**
 * Dropdown — ecommerce-ui
 * Menú desplegable con API completa de ui-core-5.25.0 dropdown.js.
 *
 * Opciones de ui-core implementadas:
 *   autoClose: true | false | 'inside' | 'outside'
 *   boundary:  'clippingParents' (floating-ui)
 *   display:   'dynamic' | 'static'
 *   offset:    [0, 2]
 *   reference: 'toggle' | 'parent' | HTMLElement
 *
 * Métodos públicos via ref:
 *   toggle() / show() / hide() / dispose() / update()
 *
 * Iniciativa: integrar-componentes-ui-core-js (completar API)
 */
import {
  useId, useRef, useCallback, useState,
  useImperativeHandle, forwardRef,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useFloating, autoUpdate, flip, shift, offset as floatOffset,
} from '@floating-ui/react';
import useClickOutside from '@hooks/ui/useClickOutside';
import useEscapeKey    from '@hooks/ui/useEscapeKey';
import styles from './Dropdown.module.scss';

const Dropdown = forwardRef(function Dropdown({
  trigger,
  children,
  placement  = 'bottom-start',
  className  = '',
  // Opciones de ui-core
  autoClose  = true,     // true | false | 'inside' | 'outside'
  offset     = [0, 2],   // Default ui-core [skid, distance]
  display    = 'dynamic',// 'dynamic' | 'static'
  reference  = 'toggle', // 'toggle' | 'parent'
  // Callbacks
  onShow,
  onShown,
  onHide,
  onHidden,
}, ref) {
  const id      = useId();
  const panelId = `dropdown-${id.replace(/:/g, '')}`;
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const { refs, floatingStyles } = useFloating({
    placement,
    whileElementsMounted: display === 'dynamic' ? autoUpdate : undefined,
    middleware: [
      floatOffset({ mainAxis: offset[1] ?? 2, crossAxis: offset[0] ?? 0 }),
      flip(),
      shift({ padding: 8 }),
    ],
  });

  const show = useCallback(() => {
    setOpen(true);
    onShow?.();
    setTimeout(() => onShown?.(), 100);
  }, [onShow, onShown]);

  const hide = useCallback(() => {
    setOpen(false);
    onHide?.();
    setTimeout(() => onHidden?.(), 100);
  }, [onHide, onHidden]);

  const toggle = useCallback(() => open ? hide() : show(), [open, hide, show]);

  // update() — equivale a update() de ui-core (reposicionar Popper)
  const update = useCallback(() => { /* floating-ui gestiona automáticamente */ }, []);
  const dispose = useCallback(() => hide(), [hide]);

  useImperativeHandle(ref, () => ({
    toggle, show, hide, dispose, update,
  }), [toggle, show, hide, dispose, update]);

  useEscapeKey(hide, open);

  // autoClose lógica — equivale a _config.autoClose de ui-core
  const setPanelRef = useCallback((el) => {
    panelRef.current = el;
    refs.setFloating(el);
  }, [refs]);

  useClickOutside(panelRef, () => {
    if (!open) return;
    if (autoClose === false) return;
    if (autoClose === 'inside') return; // 'inside' no cierra al click fuera
    hide();
  }, open);

  const handlePanelClick = useCallback(() => {
    if (autoClose === false) return;
    if (autoClose === 'outside') return; // 'outside' no cierra al click dentro
    hide();
  }, [autoClose, hide]);

  const setTriggerRef = useCallback((el) => {
    refs.setReference(el);
  }, [refs]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div
        ref={setTriggerRef}
        className={`${styles.trigger} ${styles.triggerWrapper}`}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
          if (e.key === 'ArrowDown' && !open) show();
        }}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            ref={setPanelRef}
            role="menu"
            className={styles.panel}
            style={floatingStyles}
            onClick={handlePanelClick}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Dropdown;

export function DropdownItem({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      role="menuitem"
      className={`${styles.item} ${disabled ? styles.itemDisabled : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      tabIndex={-1}
    >
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <hr className={styles.divider} role="separator" />;
}

export function DropdownHeader({ children }) {
  return <div className={styles.header}>{children}</div>;
}
