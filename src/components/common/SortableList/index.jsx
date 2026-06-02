/**
 * SortableList — ecommerce-ui (UC-ADM-SORT)
 * Lista reordenable nativa: arrastre con la HTML Drag and Drop API y, para
 * accesibilidad/teclado, botones "subir"/"bajar" por fila (y flechas
 * ArrowUp/ArrowDown con foco en la fila). Sin dependencias externas.
 *
 * Funciona como componente no controlado: mantiene su propio orden interno y
 * notifica cada cambio vía `onReorder(newItems)`. Si `items` cambia desde
 * fuera (nueva identidad de array), se resincroniza.
 *
 * @param {Array}    items       — array de objetos con id estable
 * @param {Function} getKey      — opcional, clave estable por item. Default item.id
 * @param {Function} renderItem  — (item, index) => ReactNode con el contenido de la fila
 * @param {Function} onReorder   — callback(newItems) con el array reordenado
 * @param {string}   ariaLabel   — opcional, etiqueta accesible de la lista
 * @param {string}   className   — clases extra para el contenedor
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './SortableList.module.scss';

const defaultGetKey = (item, index) => (item && item.id != null ? item.id : index);

// Devuelve una copia de `list` con el elemento en `from` movido a `to`.
function moveItem(list, from, to) {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export default function SortableList({
  items,
  getKey = defaultGetKey,
  renderItem,
  onReorder,
  ariaLabel,
  className = '',
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const [order, setOrder] = useState(safeItems);
  const dragIndex = useRef(null);

  // Resincronizar si el array externo cambia de identidad.
  useEffect(() => {
    setOrder(Array.isArray(items) ? items : []);
  }, [items]);

  const applyMove = useCallback(
    (from, to) => {
      setOrder((current) => {
        const next = moveItem(current, from, to);
        if (next !== current && typeof onReorder === 'function') {
          onReorder(next);
        }
        return next;
      });
    },
    [onReorder],
  );

  const handleDragStart = (index) => (e) => {
    dragIndex.current = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      // Algunos navegadores requieren datos para iniciar el arrastre.
      try {
        e.dataTransfer.setData('text/plain', String(index));
      } catch {
        /* jsdom u otros entornos pueden no soportarlo */
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from == null) return;
    applyMove(from, index);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      applyMove(index, index - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      applyMove(index, index + 1);
    }
  };

  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={[styles.list, className].filter(Boolean).join(' ')}
    >
      {order.map((item, index) => {
        const key = getKey(item, index);
        const isFirst = index === 0;
        const isLast = index === order.length - 1;
        return (
          <li
            key={key}
            role="listitem"
            className={styles.item}
            draggable="true"
            tabIndex={0}
            aria-roledescription="Elemento reordenable"
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
            onKeyDown={handleKeyDown(index)}
          >
            <span className={styles.handle} aria-hidden="true">
              ⠿
            </span>
            <div className={styles.content}>
              {typeof renderItem === 'function' ? renderItem(item, index) : null}
            </div>
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.controlButton}
                aria-label="Subir"
                disabled={isFirst}
                onClick={() => applyMove(index, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.controlButton}
                aria-label="Bajar"
                disabled={isLast}
                onClick={() => applyMove(index, index + 1)}
              >
                ↓
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export { SortableList };
