/**
 * Rating — ecommerce-ui
 * Control de valoración con API completa de ui-core rating.js.
 *
 * Opciones de ui-core implementadas:
 *   itemCount: 5        — número de estrellas
 *   value: null         — valor inicial
 *   precision: 1        — 1 = enteros, 0.5 = medias estrellas
 *   readOnly: false     — solo visualización
 *   disabled: false
 *   allowClear: false   — clic en valor activo lo borra
 *   highlightOnlySelected: false — ilumina solo la seleccionada
 *   icon: null          — SVG/ReactNode para estrella vacía
 *   activeIcon: null    — SVG/ReactNode para estrella activa
 *   tooltips: false     — array de strings | true (usa el número)
 *   size: null          — 'sm' | 'lg' | null
 *   name: null          — name del input oculto
 *
 * Métodos via ref: update(config) / reset()
 * Evento: onChange(value)
 */
import {
  useState, useCallback, useId,
  useImperativeHandle, forwardRef,
} from 'react';
import styles from './Rating.module.scss';

// Icono de estrella por defecto
const StarEmpty  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>;
const StarFilled = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>;

const Rating = forwardRef(function Rating({
  itemCount            = 5,         // Default ui-core
  value:    controlled,
  defaultValue         = null,      // Default ui-core (null = sin valor)
  precision            = 1,         // Default ui-core
  readOnly             = false,     // Default ui-core
  disabled             = false,     // Default ui-core
  allowClear           = false,     // Default ui-core
  highlightOnlySelected = false,    // Default ui-core
  icon                 = null,      // Default ui-core
  activeIcon           = null,      // Default ui-core
  tooltips             = false,     // Default ui-core
  size                 = null,      // Default ui-core
  name,                             // Default ui-core
  onChange,
  className            = '',
}, ref) {
  const id = useId();
  const groupName = name ?? `rating-${id.replace(/:/g, '')}`;

  const [internal, setInternal] = useState(controlled ?? defaultValue ?? null);
  const [hover,    setHover]    = useState(null);

  const val = controlled !== undefined ? controlled : internal;

  const setVal = useCallback((v) => {
    if (controlled === undefined) setInternal(v);
    onChange?.(v);
  }, [controlled, onChange]);

  // update(config) — equivale a Rating.update() de ui-core
  const update = useCallback((config) => {
    if (config.value !== undefined) {
      if (controlled === undefined) setInternal(config.value);
    }
  }, [controlled]);

  // reset() — equivale a Rating.reset() de ui-core
  const reset = useCallback(() => {
    if (controlled === undefined) setInternal(null);
    onChange?.(null);
  }, [controlled, onChange]);

  useImperativeHandle(ref, () => ({ update, reset }), [update, reset]);

  // Generar los valores según precision
  const steps = precision < 1
    ? Array.from({ length: itemCount / precision }, (_, i) => (i + 1) * precision)
    : Array.from({ length: itemCount }, (_, i) => i + 1);

  const isActive = (v) => {
    const current = hover ?? val ?? 0;
    if (highlightOnlySelected) return val !== null && Math.abs(val - v) < 0.001;
    return current >= v;
  };

  const handleClick = useCallback((v) => {
    if (readOnly || disabled) return;
    if (allowClear && val === v) {
      setVal(null);
    } else {
      setVal(v);
    }
  }, [readOnly, disabled, allowClear, val, setVal]);

  const getTooltip = (v) => {
    if (!tooltips) return undefined;
    if (Array.isArray(tooltips)) return tooltips[v - 1];
    return String(v);
  };

  const EmptyIcon  = icon       ? () => icon       : StarEmpty;
  const ActiveIcon = activeIcon ? () => activeIcon  : StarFilled;

  const wrapperCls = [
    styles.rating,
    readOnly  ? styles.readOnly  : '',
    disabled  ? styles.disabled  : '',
    size      ? styles[`size_${size}`] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperCls}
      role="group"
      aria-label={`Valoración: ${val ?? 0} de ${itemCount}`}
    >
      {steps.map((v) => {
        const active = isActive(v);
        const tip    = getTooltip(v);
        const label  = `${v} ${v === 1 ? 'estrella' : 'estrellas'}`;

        return (
          <label
            key={v}
            className={`${styles.item} ${active ? styles.itemActive : ''}`}
            title={tip}
            aria-label={label}
          >
            <input
              type="radio"
              name={groupName}
              value={v}
              checked={val === v}
              disabled={disabled || readOnly}
              onChange={() => handleClick(v)}
              onClick={() => handleClick(v)}
              className={styles.radioInput}
              aria-label={label}
            />
            <span
              className={styles.icon}
              onMouseEnter={() => !readOnly && !disabled && setHover(v)}
              onMouseLeave={() => setHover(null)}
            >
              {active ? <ActiveIcon /> : <EmptyIcon />}
            </span>
          </label>
        );
      })}
    </div>
  );
});

export default Rating;
export { Rating };
