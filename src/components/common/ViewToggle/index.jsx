/**
 * ViewToggle — ecommerce-ui (UC-CAT-LIST)
 * Conmutador de vista de catálogo entre cuadrícula (grid) y lista (list).
 * Componente nativo controlado, sin dependencias externas.
 *
 * Accesibilidad: contenedor con role="group" + aria-label; dos botones
 * type="button" con aria-label descriptivo y aria-pressed reflejando el
 * estado activo. Si `value` no coincide con ninguna opción, ningún botón
 * queda marcado como activo (render seguro).
 *
 * @param {'grid'|'list'} value     — vista activa actual
 * @param {Function}      onChange  — callback(nuevoValor) al pulsar una opción
 * @param {string}        ariaLabel — etiqueta accesible del grupo
 * @param {string}        className — clases extra para el contenedor
 */
import styles from './ViewToggle.module.scss';

const OPTIONS = [
  { value: 'grid', label: 'Vista de cuadrícula' },
  { value: 'list', label: 'Vista de lista' },
];

function GridIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="1" y="2" width="14" height="2" rx="1" />
      <rect x="1" y="7" width="14" height="2" rx="1" />
      <rect x="1" y="12" width="14" height="2" rx="1" />
    </svg>
  );
}

const ICONS = { grid: GridIcon, list: ListIcon };

export default function ViewToggle({ value, onChange, ariaLabel, className = '' }) {
  const handleClick = (next) => {
    if (typeof onChange === 'function') onChange(next);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {OPTIONS.map(({ value: optValue, label }) => {
        const isActive = value === optValue;
        const Icon = ICONS[optValue];
        return (
          <button
            key={optValue}
            type="button"
            className={[styles.button, isActive ? styles.active : ''].filter(Boolean).join(' ')}
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => handleClick(optValue)}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
