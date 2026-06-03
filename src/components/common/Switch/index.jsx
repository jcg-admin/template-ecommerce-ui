/**
 * Switch — toggle (interruptor) accesible nativo, sin dependencias.
 * Inspirado en kno-react-inputs Switch (checked / onChange / disabled / size).
 *
 * Mapea a toggles de admin: voucher/product activo, settings booleanos.
 *
 * API:
 *   <Switch
 *     checked={bool}
 *     onChange={(next) => …}   // recibe el valor booleano resultante
 *     disabled
 *     ariaLabel="…"
 *     size="sm|md"
 *   />
 */
import styles from './Switch.module.scss';

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  ariaLabel,
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd;

  const toggle = () => {
    if (disabled || typeof onChange !== 'function') return;
    onChange(!checked);
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter' || event.key === 'Spacebar') {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={`${styles.switch} ${sizeClass} ${checked ? styles.checked : ''}`}
    >
      <span className={styles.knob} aria-hidden="true" />
    </button>
  );
};

export default Switch;
