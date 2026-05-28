/**
 * Collapse / Accordion — ecommerce-ui
 * Basado en <details>/<summary> nativo del navegador.
 *
 * El browser gestiona nativamente:
 *   - Toggle abierto/cerrado
 *   - Accesibilidad (role=group, aria-expanded del summary)
 *   - El atributo `name` agrupa details en un accordion exclusivo
 *     (Chrome 120+, Firefox 130+)
 *
 * Referencia: ui-core collapse.js (T-305)
 * Iniciativa: integrar-componentes-ui-core-js
 *
 * @param {string}    summary — título del panel colapsable
 * @param {boolean}   open    — estado controlado (opcional)
 * @param {Function}  onToggle
 * @param {string}    name    — agrupa en accordion exclusivo
 * @param {ReactNode} children
 */
import styles from './Collapse.module.scss';

export function Collapse({
  summary,
  open,
  onToggle,
  name,
  className = '',
  children,
}) {
  const controlled = open !== undefined;

  return (
    <details
      className={`${styles.collapse} ${className}`}
      open={controlled ? open : undefined}
      onToggle={onToggle ? (e) => onToggle(e.newState === 'open') : undefined}
      name={name}
    >
      <summary
        className={styles.summary}
        onClick={onToggle ? (e) => {
          // complemento para jsdom — el toggle nativo del browser también lo llama
          const details = e.currentTarget.closest('details');
          if (details) setTimeout(() => onToggle(details.hasAttribute('open')), 0);
        } : undefined}
      >
        <span className={styles.summaryText}>{summary}</span>
        <span className={styles.indicator} aria-hidden="true">›</span>
      </summary>
      <div className={styles.body}>
        {children}
      </div>
    </details>
  );
}

/**
 * Accordion — grupo de Collapse con exclusividad nativa via name
 */
export function Accordion({ items, className = '' }) {
  const name = `accordion-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <div className={`${styles.accordion} ${className}`}>
      {items.map((item, i) => (
        <Collapse key={i} summary={item.summary} name={name}>
          {item.content}
        </Collapse>
      ))}
    </div>
  );
}

export default Collapse;
