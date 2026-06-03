/**
 * DropDownButton — ecommerce-ui
 *
 * Botón que abre un menú de acciones (no es un select de formulario).
 * Inspirado en el DropDownButton de kno-react-buttons: `items` con
 * `onItemClick`, soporte de texto/icono y estado `disabled`.
 *
 * A diferencia de `common/Dropdown` (popover de contenido libre con
 * floating-ui), aquí el menú es una lista cerrada de acciones con
 * navegación por teclado entre items (ARIA menu/menuitem).
 *
 * Convenciones reutilizadas:
 *   - Trigger con el look del Button de `common/primitives` vía `variant`.
 *   - Cierre por click-outside (`@hooks/ui/useClickOutside`) y Escape
 *     (`@hooks/ui/useEscapeKey`).
 *
 * Maps to: UC-ADM (acciones por fila en tablas de administración).
 */
import {
  useId, useRef, useState, useCallback, useEffect,
} from 'react';
import useClickOutside from '@hooks/ui/useClickOutside';
import useEscapeKey from '@hooks/ui/useEscapeKey';
import styles from './DropDownButton.module.scss';

export default function DropDownButton({
  text,
  items = [],
  disabled = false,
  variant = 'primary',
  ariaLabel,
  className = '',
}) {
  const id = useId();
  const menuId = `ddb-${id.replace(/:/g, '')}`;
  const [open, setOpen] = useState(false);
  // Item enfocado por teclado (-1 = ninguno). Se aplica con focus() real.
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const openMenu = useCallback((index = -1) => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(index);
  }, [disabled]);

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => {
      if (prev) {
        setActiveIndex(-1);
        return false;
      }
      setActiveIndex(-1);
      return true;
    });
  }, [disabled]);

  useClickOutside(rootRef, close, open);
  useEscapeKey(() => {
    if (!open) return;
    close();
    triggerRef.current?.focus();
  }, open);

  // Mover el foco al item activo cuando cambia (navegación con flechas).
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const enabledIndexes = items
    .map((item, i) => (item?.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const moveActive = useCallback((direction) => {
    if (enabledIndexes.length === 0) return;
    setActiveIndex((current) => {
      const pos = enabledIndexes.indexOf(current);
      if (pos === -1) {
        return direction > 0
          ? enabledIndexes[0]
          : enabledIndexes[enabledIndexes.length - 1];
      }
      const nextPos = (pos + direction + enabledIndexes.length)
        % enabledIndexes.length;
      return enabledIndexes[nextPos];
    });
  }, [enabledIndexes]);

  const handleTriggerKeyDown = useCallback((event) => {
    if (disabled) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openMenu(enabledIndexes[0] ?? -1);
        else moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openMenu(enabledIndexes[enabledIndexes.length - 1] ?? -1);
        else moveActive(-1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggle();
        break;
      default:
        break;
    }
  }, [disabled, open, openMenu, toggle, moveActive, enabledIndexes]);

  const handleMenuKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(enabledIndexes[0] ?? -1);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1);
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  }, [moveActive, close, enabledIndexes]);

  const handleItemClick = useCallback((item) => {
    if (item?.disabled) return;
    item?.onClick?.();
    close();
    triggerRef.current?.focus();
  }, [close]);

  const triggerCls = [
    styles.trigger,
    styles[`trigger_${variant}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerCls}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.triggerLabel}>{text}</span>
        <span className={styles.caret} aria-hidden="true" />
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          className={styles.menu}
          aria-label={ariaLabel}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <li role="none" key={item?.label ?? index}>
              <button
                ref={(el) => { itemRefs.current[index] = el; }}
                type="button"
                role="menuitem"
                className={styles.item}
                disabled={item?.disabled}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => handleItemClick(item)}
              >
                {item?.icon && (
                  <span className={styles.itemIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className={styles.itemLabel}>{item?.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
