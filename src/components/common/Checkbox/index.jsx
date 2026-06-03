/**
 * Checkbox — casilla de verificación accesible nativa, sin dependencias.
 * Inspirado en kno-react-inputs Checkbox
 * (checked / onChange / label / disabled / indeterminate).
 *
 * Mapea a: aceptación de términos (UC-AUTH-01), toggles booleanos de
 * configuración (UC-CFG) y formularios de admin (UC-ADM).
 *
 * Renderiza un <input type="checkbox"> real (estilado visualmente) dentro
 * de un <label>, de modo que click sobre el texto también alterna el valor
 * y los lectores de pantalla asocian la etiqueta automáticamente.
 *
 * API:
 *   <Checkbox
 *     checked={bool}
 *     onChange={(next) => …}   // recibe el valor booleano resultante
 *     label={<span>…</span>}   // node opcional
 *     disabled
 *     indeterminate            // estado visual "—" (no marcado ni vacío)
 *     id="acepta-terminos"
 *     ariaLabel="…"            // úsalo cuando no hay label visible
 *   />
 */
import { useEffect, useRef } from 'react';
import styles from './Checkbox.module.scss';

const Checkbox = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  id,
  ariaLabel,
}) => {
  const inputRef = useRef(null);

  // `indeterminate` no es un atributo HTML; solo se setea en el nodo DOM.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (event) => {
    if (disabled || typeof onChange !== 'function') return;
    onChange(event.target.checked);
  };

  return (
    <label
      className={`${styles.checkbox} ${disabled ? styles.disabled : ''}`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        id={id}
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={handleChange}
      />
      <span className={styles.box} aria-hidden="true" />
      {label != null && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Checkbox;
