/**
 * Gauge — medidor radial SVG accesible nativo, sin dependencias.
 * Iniciativa: UC-ADM-GAUGE.
 *
 * Dibuja un arco semicircular cuyo relleno representa la proporción
 * (value - min) / (max - min), con clamp y guarda para max == min.
 *
 * API:
 *   <Gauge value={n} min={0} max={100} label="Stock" unit="%" ariaLabel="…" />
 */
import styles from './Gauge.module.scss';

// pathLength normalizado: el arco mide 100 unidades, así dasharray/offset
// se expresan directamente en "porcentaje" sin depender del radio real.
const ARC_LENGTH = 100;

const Gauge = ({ value = 0, min = 0, max = 100, label, unit, ariaLabel }) => {
  const nMin = Number(min) || 0;
  const nMax = Number(max);
  const safeMax = Number.isFinite(nMax) ? nMax : 0;
  const range = safeMax - nMin;

  const clamped = range <= 0
    ? nMin
    : Math.min(Math.max(Number(value) || 0, nMin), safeMax);

  const percent = range <= 0 ? 0 : ((clamped - nMin) / range) * 100;
  const offset = ARC_LENGTH - percent;

  return (
    <div
      className={styles.wrapper}
      role="meter"
      aria-label={ariaLabel}
      aria-valuenow={clamped}
      aria-valuemin={nMin}
      aria-valuemax={safeMax}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 120 120"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className={styles.track}
          cx="60"
          cy="60"
          r="50"
          pathLength={ARC_LENGTH}
        />
        <circle
          className={styles.arc}
          data-testid="gauge-arc"
          cx="60"
          cy="60"
          r="50"
          pathLength={ARC_LENGTH}
          style={{ strokeDasharray: ARC_LENGTH, strokeDashoffset: offset }}
        />
      </svg>
      <div className={styles.readout}>
        <span className={styles.value}>
          {Math.round(clamped)}
          {unit && <span className={styles.unit}>{unit}</span>}
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </div>
    </div>
  );
};

export default Gauge;
