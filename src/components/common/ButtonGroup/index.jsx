/**
 * ButtonGroup — ecommerce-ui (admin toolbars / filter bars)
 * Componente nativo, sin dependencias externas. Inspirado en el
 * ButtonGroup de kno-react-buttons (segmento de botones unidos).
 *
 * DOS modos de uso:
 *
 * (a) Wrapper presentacional — agrupa visualmente botones hijos con
 *     bordes unidos:
 *
 *       <ButtonGroup ariaLabel="Acciones">
 *         <Button>Uno</Button>
 *         <Button>Dos</Button>
 *       </ButtonGroup>
 *
 * (b) Selector segmentado controlado — si se pasa `items` (array de
 *     {label, value}) junto con `value` y `onChange`, renderiza una
 *     barra de selección única con role="group" y aria-pressed por
 *     opción:
 *
 *       <ButtonGroup
 *         items={[{label: 'Día', value: 'day'}, {label: 'Mes', value: 'month'}]}
 *         value={range}
 *         onChange={setRange}
 *         ariaLabel="Rango"
 *       />
 *
 * Accesibilidad: contenedor con role="group" + aria-label. En modo
 * selector cada opción es un <button type="button"> con aria-pressed
 * reflejando si su value coincide con el value activo. Si `value` no
 * coincide con ninguna opción, ningún botón queda activo (render seguro).
 *
 * @param {Array<{label: any, value: any}>} [items]      — opciones del selector
 * @param {*}        [value]       — value activo (modo selector)
 * @param {Function} [onChange]    — callback(value) al pulsar una opción
 * @param {'horizontal'|'vertical'} [orientation='horizontal'] — dirección
 * @param {string}   [ariaLabel]   — etiqueta accesible del grupo
 * @param {Node}     [children]    — botones a agrupar (modo wrapper)
 * @param {string}   [className]   — clases extra para el contenedor
 */
import styles from './ButtonGroup.module.scss';

export default function ButtonGroup({
  items,
  value,
  onChange,
  orientation = 'horizontal',
  ariaLabel,
  children,
  className = '',
}) {
  const isVertical = orientation === 'vertical';
  const rootClass = [
    styles.root,
    isVertical ? styles.vertical : styles.horizontal,
    className,
  ].filter(Boolean).join(' ');

  // Modo (b) — selector segmentado controlado
  if (Array.isArray(items)) {
    const handleClick = (next) => {
      if (typeof onChange === 'function') onChange(next);
    };

    return (
      <div
        role="group"
        aria-label={ariaLabel}
        data-orientation={orientation}
        className={rootClass}
      >
        {items.map(({ label, value: optValue }) => {
          const isActive = value === optValue;
          return (
            <button
              key={String(optValue)}
              type="button"
              className={[styles.segment, isActive ? styles.active : '']
                .filter(Boolean).join(' ')}
              aria-pressed={isActive}
              onClick={() => handleClick(optValue)}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  // Modo (a) — wrapper presentacional
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-orientation={orientation}
      className={rootClass}
    >
      {children}
    </div>
  );
}
