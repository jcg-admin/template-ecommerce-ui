/**
 * RangeSlider — ecommerce-ui
 * Slider de valor simple o doble (rango min/max).
 * Basado en <input type=range> nativo — accesibilidad de teclado,
 * touch y ARIA nativos del navegador.
 *
 * Referencia: ui-core range-slider.js (T-401)
 * Iniciativa: integrar-componentes-ui-core-js
 *
 * Props single:
 *   value {number}, onChange(value)
 *
 * Props doble (range):
 *   value {[min,max]}, onChange([min,max]), distance (mínima separación)
 */
import { useId, useCallback } from 'react';
import styles from './RangeSlider.module.scss';

export default function RangeSlider({
  min        = 0,
  max        = 100,
  step       = 1,
  value,
  onChange,
  distance   = 0,
  label,
  disabled   = false,
  formatValue = (v) => v,
}) {
  const id       = useId();
  const isDouble = Array.isArray(value);

  const lo = isDouble ? value[0] : value;
  const hi = isDouble ? value[1] : null;

  const handleLo = useCallback((e) => {
    const next = Number(e.target.value);
    if (isDouble) {
      // garantizar lo <= hi - distance (BUG-CF01 corregido)
      onChange([Math.min(next, hi - distance), hi]);
    } else {
      onChange(next);
    }
  }, [isDouble, hi, distance, onChange]);

  const handleHi = useCallback((e) => {
    const next = Number(e.target.value);
    onChange([lo, Math.max(next, lo + distance)]);
  }, [lo, distance, onChange]);

  const pct = (v) => ((v - min) / (max - min)) * 100;

  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`}>
      {label && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.values} aria-live="polite">
            {isDouble
              ? `${formatValue(lo)} – ${formatValue(hi)}`
              : formatValue(lo)}
          </span>
        </div>
      )}

      <div className={styles.track}>
        {/* Track activo (relleno entre thumbs) */}
        <div
          className={styles.trackFill}
          style={isDouble
            ? { left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }
            : { left: 0, width: `${pct(lo)}%` }
          }
        />

        {/* Input lo / single */}
        <input
          id={`${id}-lo`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          disabled={disabled}
          onChange={handleLo}
          className={styles.input}
          aria-label={isDouble ? 'Valor mínimo' : (label ?? 'Valor')}
          aria-valuemin={min}
          aria-valuemax={isDouble ? hi : max}
          aria-valuenow={lo}
          aria-valuetext={`${formatValue(lo)}`}
        />

        {/* Input hi (solo en modo doble) */}
        {isDouble && (
          <input
            id={`${id}-hi`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={hi}
            disabled={disabled}
            onChange={handleHi}
            className={styles.input}
            aria-label="Valor máximo"
            aria-valuemin={lo}
            aria-valuemax={max}
            aria-valuenow={hi}
            aria-valuetext={`${formatValue(hi)}`}
          />
        )}
      </div>
    </div>
  );
}
