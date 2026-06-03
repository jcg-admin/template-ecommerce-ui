/**
 * Rating — calificación por estrellas accesible nativa, sin dependencias.
 * Adaptado de kno-react-inputs (Rating): value, max, onChange, readOnly,
 * pasos de media estrella (display) y label.
 *
 * API:
 *   <Rating value={4} max={5} onChange={(v) => …} ariaLabel="…" />
 *   <Rating value={3.5} readOnly />            // solo lectura, medias estrellas
 *
 * - Controlado: el padre posee `value`. Si se omite `onChange` o se pasa
 *   `readOnly`, el componente es solo de presentación (no interactivo).
 * - Interactivo: cada estrella es un <button> con aria-label; el grupo es
 *   un role="radiogroup" navegable con flechas del teclado.
 * - Medias estrellas: si `value` es fraccional se muestra el relleno
 *   parcial (solo display; el usuario solo puede seleccionar enteros).
 *
 * Iniciativa: UC-REV-01/02.
 */
import styles from './Rating.module.scss';

const STAR_PATH =
  'M8 .25l2.06 4.17 4.6.67-3.33 3.24.79 4.58L8 11.92 3.88 13.1l.79-4.58'
  + 'L1.34 5.09l4.6-.67L8 .25z';

const Star = ({ fill }) => {
  // fill: 'full' | 'half' | 'empty'
  const pct = fill === 'full' ? 100 : fill === 'half' ? 50 : 0;
  return (
    <svg
      className={styles.star}
      viewBox="0 0 16 14"
      width="20"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.starOutline} d={STAR_PATH} />
      {pct > 0 && (
        <path
          className={styles.starFill}
          d={STAR_PATH}
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        />
      )}
    </svg>
  );
};

const Rating = ({
  value = 0,
  max = 5,
  onChange,
  readOnly = false,
  ariaLabel = 'Calificación',
}) => {
  const safeMax = Number(max) > 0 ? Math.floor(Number(max)) : 0;
  const current = Math.min(Math.max(Number(value) || 0, 0), safeMax);
  const interactive = !readOnly && typeof onChange === 'function';

  const select = (next) => {
    if (!interactive) return;
    onChange(next);
  };

  // Navegación con flechas en modo interactivo.
  const handleKeyDown = (e) => {
    if (!interactive) return;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      next = Math.min(Math.round(current) + 1, safeMax);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      next = Math.max(Math.round(current) - 1, 0);
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = safeMax;
    }
    if (next !== null) {
      e.preventDefault();
      select(next);
    }
  };

  const stars = [];
  for (let i = 1; i <= safeMax; i += 1) {
    const fill = current >= i ? 'full' : current >= i - 0.5 ? 'half' : 'empty';
    const label = `${i} de ${safeMax} estrellas`;

    if (interactive) {
      stars.push(
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={Math.round(current) === i}
          aria-label={label}
          tabIndex={Math.round(current) === i || (current === 0 && i === 1) ? 0 : -1}
          className={styles.starButton}
          onClick={() => select(i)}
        >
          <Star fill={fill} />
        </button>,
      );
    } else {
      stars.push(
        <span key={i} className={styles.starStatic}>
          <Star fill={fill} />
        </span>,
      );
    }
  }

  return (
    <div
      className={styles.wrapper}
      role={interactive ? 'radiogroup' : 'img'}
      onKeyDown={interactive ? handleKeyDown : undefined}
      aria-label={
        interactive ? ariaLabel : `${ariaLabel}: ${current} de ${safeMax}`
      }
    >
      {stars}
    </div>
  );
};

export default Rating;
export { Rating };
