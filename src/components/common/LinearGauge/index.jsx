/**
 * LinearGauge — medidor lineal horizontal SVG/CSS accesible nativo, sin deps.
 * Inspirado en kno-react-gauges LinearGauge (value/min/max/scale/bar).
 * Mapea a UC-INV-01 (niveles de stock) y KPIs de admin.
 *
 * Dibuja un track horizontal con una barra de relleno proporcional a
 * (value - min) / (max - min), con clamp y guarda para max <= min.
 * Opcionalmente pinta zonas de umbral y un label con el valor.
 *
 * API:
 *   <LinearGauge
 *     value={n}
 *     min={0}
 *     max={100}
 *     thresholds={[{ value: 80, tone: 'success' }]}
 *     label="Stock"
 *     showValue
 *     ariaLabel="Nivel de stock"
 *   />
 *
 * thresholds: lista ordenada de cortes `{ value, tone }`. El relleno toma
 * el tono del primer corte cuyo `value` es >= al valor actual (zonas de
 * menor a mayor). Las zonas se pintan sobre el track como referencia.
 */
import styles from './LinearGauge.module.scss';

// Tonos soportados → tokens CSS existentes (sin hex hardcodeado).
const TONE_CLASS = {
  primary: styles.tonePrimary,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  error: styles.toneError,
};

const toneClass = (tone) => TONE_CLASS[tone] || styles.tonePrimary;

const LinearGauge = ({
  value = 0,
  min = 0,
  max = 100,
  thresholds,
  label,
  showValue = false,
  ariaLabel,
}) => {
  const nMin = Number(min) || 0;
  const nMax = Number(max);
  const safeMax = Number.isFinite(nMax) ? nMax : 0;
  const range = safeMax - nMin;

  const clamped = range <= 0
    ? nMin
    : Math.min(Math.max(Number(value) || 0, nMin), safeMax);

  const percent = range <= 0 ? 0 : ((clamped - nMin) / range) * 100;

  // Normaliza umbrales a posición [0,100] dentro del rango y los ordena.
  const zones = Array.isArray(thresholds) && range > 0
    ? thresholds
        .filter((t) => t && Number.isFinite(Number(t.value)))
        .map((t) => ({
          value: Number(t.value),
          tone: t.tone,
          pos: Math.min(Math.max(((Number(t.value) - nMin) / range) * 100, 0), 100),
        }))
        .sort((a, b) => a.value - b.value)
    : [];

  // Tono del relleno: primer umbral cuyo valor cubre al actual.
  const activeZone = zones.find((z) => clamped <= z.value);
  const fillTone = activeZone ? activeZone.tone : undefined;

  return (
    <div className={styles.wrapper}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && (
            <span className={styles.value} data-testid="lineargauge-value">
              {Math.round(clamped)}
            </span>
          )}
        </div>
      )}
      <div
        className={styles.track}
        role="meter"
        aria-label={ariaLabel}
        aria-valuenow={clamped}
        aria-valuemin={nMin}
        aria-valuemax={safeMax}
      >
        {zones.map((z, i) => {
          const start = i === 0 ? 0 : zones[i - 1].pos;
          const width = z.pos - start;
          if (width <= 0) return null;
          return (
            <div
              key={`zone-${z.value}-${z.tone}`}
              className={`${styles.zone} ${toneClass(z.tone)}`}
              data-testid="lineargauge-zone"
              data-tone={z.tone || 'primary'}
              style={{ left: `${start}%`, width: `${width}%` }}
            />
          );
        })}
        <div
          className={`${styles.fill} ${toneClass(fillTone)}`}
          data-testid="lineargauge-fill"
          data-tone={fillTone || 'primary'}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default LinearGauge;
