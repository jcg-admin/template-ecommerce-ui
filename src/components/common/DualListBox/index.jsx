import { useState } from 'react';
import styles from './DualListBox.module.scss';

/**
 * DualListBox — UC-ADM-LISTBOX
 *
 * Componente nativo (sin dependencias) para mover ítems entre dos listas:
 * "disponibles" (ids fuera de selectedIds) y "seleccionados" (ids dentro).
 * El estado de selección es controlado vía `selectedIds` + `onChange`; la
 * selección visual (ítem resaltado) es interna a cada panel.
 *
 * @param {{ id: string|number, label: string }[]} items
 * @param {(string|number)[]} selectedIds
 * @param {(nextSelectedIds: (string|number)[]) => void} onChange
 * @param {string} availableLabel
 * @param {string} selectedLabel
 * @param {string} ariaLabel
 */
function DualListBox({
  items = [],
  selectedIds = [],
  onChange,
  availableLabel = 'Disponibles',
  selectedLabel = 'Seleccionados',
  ariaLabel = 'Asignación',
}) {
  // Ítem resaltado por panel: 'available' | 'selected'.
  const [highlighted, setHighlighted] = useState({ available: null, selected: null });

  const selectedSet = new Set(selectedIds);
  const available = items.filter((it) => !selectedSet.has(it.id));
  const selected = items.filter((it) => selectedSet.has(it.id));

  const emit = (next) => {
    if (typeof onChange === 'function') onChange(next);
  };

  const add = (id) => {
    if (selectedSet.has(id)) return;
    emit([...selectedIds, id]);
    setHighlighted((h) => ({ ...h, available: null }));
  };

  const remove = (id) => {
    if (!selectedSet.has(id)) return;
    emit(selectedIds.filter((sid) => sid !== id));
    setHighlighted((h) => ({ ...h, selected: null }));
  };

  const moveHighlighted = (panel) => {
    const id = highlighted[panel];
    if (id == null) return;
    if (panel === 'available') add(id);
    else remove(id);
  };

  const renderPanel = (panel, label, list, action, actionVerb) => (
    <div className={styles.panel}>
      <div className={styles.panelLabel} id={`${panel}-label`}>
        {label}
      </div>
      <ul
        className={styles.list}
        role="listbox"
        aria-label={label}
        aria-labelledby={`${panel}-label`}
      >
        {list.map((it) => {
          const isHighlighted = highlighted[panel] === it.id;
          return (
            <li
              key={it.id}
              role="option"
              aria-selected={isHighlighted}
              aria-label={it.label}
              className={`${styles.option} ${isHighlighted ? styles.optionActive : ''}`}
              onClick={() =>
                setHighlighted((h) => ({
                  ...h,
                  [panel]: isHighlighted ? null : it.id,
                }))
              }
            >
              <span className={styles.optionLabel}>{it.label}</span>
              <button
                type="button"
                className={styles.itemButton}
                aria-label={`${actionVerb} ${it.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  action(it.id);
                }}
              >
                {panel === 'available' ? '›' : '‹'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className={styles.dualListBox} role="group" aria-label={ariaLabel}>
      {renderPanel('available', availableLabel, available, add, 'Añadir')}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlBtn}
          aria-label={`Mover a ${selectedLabel}`}
          onClick={() => moveHighlighted('available')}
        >
          ›
        </button>
        <button
          type="button"
          className={styles.controlBtn}
          aria-label={`Mover a ${availableLabel}`}
          onClick={() => moveHighlighted('selected')}
        >
          ‹
        </button>
      </div>

      {renderPanel('selected', selectedLabel, selected, remove, 'Quitar')}
    </div>
  );
}

export default DualListBox;
