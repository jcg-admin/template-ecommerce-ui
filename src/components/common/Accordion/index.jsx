/**
 * Accordion — UC-CAT-FAQ (ecommerce-ui)
 * Paneles colapsables nativos, sin dependencias externas.
 *
 * Cada item se renderiza como una cabecera <button aria-expanded> que
 * togglea su panel. El panel es un role="region" con aria-labelledby
 * apuntando al id del botón que lo controla.
 *
 * - allowMultiple=false (default): acordeón clásico, abrir uno cierra el resto.
 * - allowMultiple=true: varios paneles pueden estar abiertos a la vez.
 *
 * Teclado: al ser cabeceras <button>, Enter y Espacio disparan el toggle
 * con el comportamiento nativo del navegador (no se reimplementa).
 *
 * API:
 *   <Accordion
 *     items={[{ id, title, content }]}   // content: nodo o string
 *     defaultOpenIds={[...]}             // opcional
 *     allowMultiple={false}              // default
 *     ariaLabel="Preguntas frecuentes"
 *   />
 */
import { useState, useCallback, useId } from 'react';
import styles from './Accordion.module.scss';

function Accordion({
  items = [],
  defaultOpenIds = [],
  allowMultiple = false,
  ariaLabel,
}) {
  const baseId = useId().replace(/:/g, '');

  // Estado inicial: con allowMultiple=false el acordeón clásico solo
  // admite un panel abierto, así que respetamos únicamente el primer id.
  const [openIds, setOpenIds] = useState(() => {
    if (!Array.isArray(defaultOpenIds) || defaultOpenIds.length === 0) return [];
    return allowMultiple ? [...defaultOpenIds] : [defaultOpenIds[0]];
  });

  const toggle = useCallback((id) => {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (allowMultiple) {
        return isOpen ? prev.filter((x) => x !== id) : [...prev, id];
      }
      // Acordeón clásico: abrir cierra los demás; click sobre el abierto lo cierra.
      return isOpen ? [] : [id];
    });
  }, [allowMultiple]);

  const list = Array.isArray(items) ? items : [];

  return (
    <div className={styles.accordion} role="group" aria-label={ariaLabel}>
      {list.map((item) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `${baseId}-h-${item.id}`;
        const panelId = `${baseId}-p-${item.id}`;

        return (
          <div key={item.id} className={styles.item}>
            <h3 className={styles.heading}>
              <button
                type="button"
                id={headerId}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span className={styles.title}>{item.title}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className={styles.panel}
              >
                <div className={styles.panelInner}>{item.content}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
export { Accordion };
