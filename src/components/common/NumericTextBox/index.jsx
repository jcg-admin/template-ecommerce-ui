/**
 * NumericTextBox — ecommerce-ui
 * Adaptación NATIVA del NumericTextBox de kno-react-inputs:
 * un input numérico con steppers +/-.
 *
 * API (inspirada en NumericTextBox de @progress/kno-react-inputs):
 *   value     — número actual (controlado por el padre)
 *   onChange  — (number) => void; recibe el valor ya clampeado a [min, max]
 *   min       — límite inferior (default -Infinity)
 *   max       — límite superior (default  Infinity)
 *   step      — incremento de los steppers (default 1)
 *   disabled  — bloquea input y steppers
 *   ariaLabel — etiqueta accesible del campo numérico
 *
 * El componente es controlado: clampea contra min/max, deshabilita los
 * steppers en los límites e ignora entradas no numéricas (NaN).
 */
import { useCallback } from 'react';
import styles from './NumericTextBox.module.scss';

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export default function NumericTextBox({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  ariaLabel = 'Cantidad',
  className = '',
}) {
  const current = Number.isFinite(value) ? value : 0;

  const emit = useCallback((next) => {
    if (disabled) return;
    const clamped = clamp(next, min, max);
    if (clamped !== current) onChange?.(clamped);
  }, [disabled, min, max, current, onChange]);

  const handleDecrement = useCallback(() => emit(current - step), [emit, current, step]);
  const handleIncrement = useCallback(() => emit(current + step), [emit, current, step]);

  const handleInput = useCallback((e) => {
    if (disabled) return;
    const raw = e.target.value;
    if (raw === '' || raw === '-') return;       // estado intermedio de tecleo
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;            // ignora entradas no numéricas
    onChange?.(clamp(parsed, min, max));
  }, [disabled, min, max, onChange]);

  const atMin = current <= min;
  const atMax = current >= max;

  const wrapperCls = [
    styles.wrapper,
    disabled ? styles.disabled : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperCls}>
      <button
        type="button"
        className={styles.stepper}
        onClick={handleDecrement}
        disabled={disabled || atMin}
        aria-label="Disminuir"
      >
        −
      </button>

      <input
        type="number"
        className={styles.input}
        value={current}
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(max) ? max : undefined}
        step={step}
        disabled={disabled}
        onChange={handleInput}
        aria-label={ariaLabel}
      />

      <button
        type="button"
        className={styles.stepper}
        onClick={handleIncrement}
        disabled={disabled || atMax}
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}

export { NumericTextBox };
