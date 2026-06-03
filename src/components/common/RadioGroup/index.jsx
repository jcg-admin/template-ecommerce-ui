/**
 * RadioGroup — grupo de opciones excluyentes, accesible y nativo, sin deps.
 * Inspirado en kno-react-inputs RadioGroup/RadioButton (data/items, value,
 * onChange, layout horizontal/vertical, disabled).
 *
 * Mapea a UC-CFG-01/02 (settings de opcion unica) y a la seleccion de
 * metodo de pago en checkout.
 *
 * Usa <input type="radio"> nativos con un `name` compartido: el navegador
 * gestiona la exclusion mutua y la navegacion por flechas sin JS extra.
 *
 * API:
 *   <RadioGroup
 *     items={[{ label, value, disabled? }, …]}
 *     value={selectedValue}
 *     onChange={(value) => …}   // recibe el value del item seleccionado
 *     name="payment-method"     // name compartido entre los radios
 *     layout="vertical|horizontal"
 *     ariaLabel="…"
 *   />
 */
import { useId } from 'react';
import styles from './RadioGroup.module.scss';

const RadioGroup = ({
  items = [],
  value,
  onChange,
  name,
  layout = 'vertical',
  ariaLabel,
}) => {
  const reactId = useId();
  const groupName = name || `radiogroup-${reactId}`;
  const isHorizontal = layout === 'horizontal';

  const handleChange = (item) => {
    if (item.disabled || typeof onChange !== 'function') return;
    onChange(item.value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
      data-layout={layout}
      className={`${styles.group} ${isHorizontal ? styles.horizontal : styles.vertical}`}
    >
      {items.map((item, index) => {
        const checked = item.value === value;
        const optionId = `${groupName}-${index}`;
        return (
          <label
            key={item.value ?? index}
            htmlFor={optionId}
            className={`${styles.option} ${item.disabled ? styles.optionDisabled : ''}`}
          >
            <input
              id={optionId}
              type="radio"
              name={groupName}
              value={item.value}
              checked={checked}
              disabled={item.disabled || false}
              onChange={() => handleChange(item)}
              className={styles.input}
            />
            <span className={styles.control} aria-hidden="true" />
            <span className={styles.label}>{item.label}</span>
          </label>
        );
      })}
    </div>
  );
};

export default RadioGroup;
