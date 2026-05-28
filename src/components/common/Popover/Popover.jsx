/**
 * Popover — ecommerce-ui
 * Extensión de Tooltip con título y cuerpo enriquecido.
 *
 * Lógica completa de ui-core-5.25.0 popover.js:
 *   - Hereda TODO de Tooltip: Popover API, floating-ui, delay, placement
 *   - Añade: `title` (popover-header) + `content` (popover-body)
 *   - trigger: 'click' por defecto (vs 'hover' en Tooltip)
 *   - placement: 'right' por defecto (vs 'top' en Tooltip)
 *   - offset [0, 8] por defecto
 *   - Acepta content como string, ReactNode o función () => ReactNode
 *
 * Referencia: ui-core-5.25.0 popover.js
 * Iniciativa: implementar-componentes-diferidos-ui-core
 *
 * @param {string|ReactNode|Function} content   — cuerpo del popover
 * @param {string|ReactNode}          title     — cabecera (opcional)
 * @param {string}                    placement — floating-ui placement
 * @param {string}                    trigger   — 'click' | 'hover' | 'focus'
 * @param {number}                    delay     — ms de delay para hover
 * @param {ReactNode}                 children  — elemento trigger
 */
import { useId, useRef, useCallback, useState } from 'react';
import { useFloating as useFloatingLib, autoUpdate, flip, shift, offset } from '@floating-ui/react';
import useClickOutside from '@hooks/ui/useClickOutside';
import useEscapeKey    from '@hooks/ui/useEscapeKey';
import styles from './Popover.module.scss';

export default function Popover({
  content,
  title,
  placement = 'right',   // Default de ui-core popover.js
  trigger   = 'click',   // Default de ui-core popover.js (vs 'hover' de Tooltip)
  delay     = 0,
  children,
  className = '',
}) {
  const id       = useId();
  const panelId  = `popover-${id.replace(/:/g, '')}`;
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const triggerRef = useRef(null);

  const { refs, floatingStyles } = useFloatingLib({
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset([0, 8]), flip(), shift({ padding: 8 })],
  });

  const show = useCallback(() => {
    clearTimeout(timerRef.current);
    if (delay > 0) {
      timerRef.current = setTimeout(() => setOpen(true), delay);
    } else {
      setOpen(true);
    }
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setOpen(false);
  }, []);

  const toggle = useCallback(() => (open ? hide() : show()), [open, hide, show]);

  // Cerrar con Escape (equivale a keyboard:true en ui-core)
  useEscapeKey(hide, open);

  // Cerrar al click fuera (equivale a light-dismiss en ui-core)
  const panelRef = useRef(null);
  useClickOutside(panelRef, () => {
    if (open) hide();
  }, open);

  // Combinar refs para floating-ui + click-outside
  const setFloatingRef = useCallback((el) => {
    panelRef.current = el;
    refs.setFloating(el);
  }, [refs]);

  const setTriggerRef = useCallback((el) => {
    triggerRef.current = el;
    refs.setReference(el);
  }, [refs]);

  // Resolver content si es función
  const resolvedContent = typeof content === 'function' ? content() : content;

  // Eventos de trigger
  const triggerProps = {
    ref: setTriggerRef,
    'aria-describedby': open ? panelId : undefined,
    'aria-expanded':    open,
  };

  if (trigger === 'click') {
    triggerProps.onClick = toggle;
  } else if (trigger === 'hover') {
    triggerProps.onMouseEnter = show;
    triggerProps.onMouseLeave = hide;
    triggerProps.onFocus      = show;
    triggerProps.onBlur       = hide;
  } else if (trigger === 'focus') {
    triggerProps.onFocus = show;
    triggerProps.onBlur  = hide;
  }

  return (
    <>
      <span {...triggerProps} className={styles.triggerWrapper}>
        {children}
      </span>

      {open && (
        <div
          id={panelId}
          ref={setFloatingRef}
          role="tooltip"
          className={`${styles.popover} ${className}`}
          style={floatingStyles}
        >
          {/* .popover-arrow equivalente */}
          <span className={styles.arrow} aria-hidden="true" />

          {/* .popover-header equivalente */}
          {title && (
            <div className={styles.header}>{title}</div>
          )}

          {/* .popover-body equivalente */}
          <div className={styles.body}>{resolvedContent}</div>
        </div>
      )}
    </>
  );
}
