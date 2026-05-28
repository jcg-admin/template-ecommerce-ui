/**
 * Tooltip — ecommerce-ui
 * Tooltip accesible con Popover API + floating-ui para posicionamiento.
 * Aparece en hover/focus con delay configurable.
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-302)
 */
import { useId, useRef, useCallback } from 'react';
import { useFloating as useFloatingLib, autoUpdate, flip, shift, offset } from '@floating-ui/react';
import styles from './Tooltip.module.scss';

export default function Tooltip({
  content,
  children,
  placement = 'top',
  delay     = 300,
}) {
  const id        = useId();
  const tooltipId = `tooltip-${id.replace(/:/g, '')}`;
  const timerRef  = useRef(null);

  const { refs, floatingStyles } = useFloatingLib({
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip(), shift({ padding: 4 })],
  });

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      document.getElementById(tooltipId)?.showPopover?.();
    }, delay);
  }, [tooltipId, delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    document.getElementById(tooltipId)?.hidePopover?.();
  }, [tooltipId]);

  const child = typeof children === 'string'
    ? <span>{children}</span>
    : children;

  return (
    <>
      <div
        ref={refs.setReference}
        className={styles.wrapper}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={tooltipId}
      >
        {child}
      </div>

      <div
        id={tooltipId}
        ref={refs.setFloating}
        popover="manual"
        role="tooltip"
        className={styles.tooltip}
        style={floatingStyles}
      >
        {content}
      </div>
    </>
  );
}
