/**
 * Rating — ecommerce-ui
 * Selector de calificación por estrellas.
 * Implementado como radiogroup con inputs radio ocultos y labels SVG.
 *
 * Referencia: ui-core rating.js (T-303)
 * Iniciativa: integrar-componentes-ui-core-js
 *
 * @param {number}   value       — valor actual (0–itemCount)
 * @param {Function} onChange    — callback(newValue)
 * @param {number}   itemCount   — número de estrellas (default: 5)
 * @param {boolean}  readOnly
 * @param {boolean}  disabled
 * @param {number}   precision   — 1 = estrellas enteras, 0.5 = medias
 * @param {string}   name        — name del radiogroup
 */
import { useId, useCallback } from 'react';
import styles from './Rating.module.scss';

const StarIcon = ({ filled, half }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.starSvg}>
    <defs>
      <linearGradient id="half-grad">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? 'currentColor' : half ? 'url(#half-grad)' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default function Rating({
  value     = 0,
  onChange,
  itemCount = 5,
  readOnly  = false,
  disabled  = false,
  precision = 1,
  name,
}) {
  const id       = useId();
  const groupName = name ?? `rating-${id.replace(/:/g, '')}`;
  const isInteractive = !readOnly && !disabled;

  const handleChange = useCallback((newVal) => {
    if (isInteractive) onChange?.(newVal);
  }, [isInteractive, onChange]);

  const stars = Array.from({ length: itemCount }, (_, i) => {
    const starVal  = i + 1;
    const halfVal  = i + 0.5;
    const filled   = value >= starVal;
    const half     = !filled && precision === 0.5 && value >= halfVal;

    return { starVal, halfVal, filled, half };
  });

  if (readOnly || disabled) {
    // Modo solo lectura — display puro, sin inputs
    return (
      <div
        className={`${styles.rating} ${disabled ? styles.disabled : ''}`}
        aria-label={`Calificación: ${value} de ${itemCount}`}
        aria-readonly="true"
      >
        {stars.map(({ starVal, filled, half }) => (
          <span key={starVal} className={styles.starWrap}>
            <StarIcon filled={filled} half={half} />
          </span>
        ))}
      </div>
    );
  }

  // Modo interactivo — radiogroup
  return (
    <fieldset
      className={styles.rating}
      role="radiogroup"
      aria-label={`Calificación de ${itemCount} estrellas`}
      disabled={disabled}
    >
      <legend className={styles.srOnly}>Calificación</legend>
      {stars.map(({ starVal, halfVal, filled, half }) => (
        <span key={starVal} className={styles.starWrap}>
          {precision === 0.5 && (
            <>
              <input
                type="radio" name={groupName}
                id={`${groupName}-${halfVal}`}
                value={halfVal}
                checked={value === halfVal}
                onChange={() => handleChange(halfVal)}
                className={styles.srOnly}
                aria-label={`${halfVal} estrellas`}
              />
              <label htmlFor={`${groupName}-${halfVal}`} className={styles.halfLabel} />
            </>
          )}
          <input
            type="radio" name={groupName}
            id={`${groupName}-${starVal}`}
            value={starVal}
            checked={value === starVal}
            onChange={() => handleChange(starVal)}
            className={styles.srOnly}
            aria-label={`${starVal} ${starVal === 1 ? 'estrella' : 'estrellas'}`}
          />
          <label htmlFor={`${groupName}-${starVal}`} className={styles.starLabel}>
            <StarIcon filled={filled} half={half} />
          </label>
        </span>
      ))}
    </fieldset>
  );
}
