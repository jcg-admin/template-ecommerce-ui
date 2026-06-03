/**
 * ProgressBar — barra de progreso accesible nativa, sin dependencias.
 * Iniciativa: UC-CHT-FREESHIP.
 *
 * API:
 *   <ProgressBar value={n} max={100} label="…" showValue ariaLabel="…" />
 */
import styles from './ProgressBar.module.scss';

const ProgressBar = ({ value = 0, max = 100, label, showValue = false, ariaLabel }) => {
  const safeMax = Number(max) > 0 ? Number(max) : 0;
  const clamped = safeMax === 0 ? 0 : Math.min(Math.max(Number(value) || 0, 0), safeMax);
  const percent = safeMax === 0 ? 0 : (clamped / safeMax) * 100;

  return (
    <div className={styles.wrapper}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && <span className={styles.value}>{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
      >
        <div
          className={styles.fill}
          data-testid="progressbar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
