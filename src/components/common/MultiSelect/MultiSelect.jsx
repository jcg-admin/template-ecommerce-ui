/**
 * MultiSelect — ecommerce-ui
 * Selector múltiple con Popover API + floating-ui.
 * Referencia: ui-core multi-select.js (T-403)
 * Iniciativa: integrar-componentes-ui-core-js
 *
 * @param {Array}    options    — [{label, value}] o strings
 * @param {Array}    value      — array de values seleccionados
 * @param {Function} onChange   — callback([...values])
 * @param {string}   placeholder
 * @param {boolean}  search     — habilita búsqueda interna
 * @param {boolean}  disabled
 * @param {string}   label
 */
import { useId, useRef, useCallback, useMemo, useState } from 'react';
import {
  useFloating as useFloatingLib,
  autoUpdate, flip, shift, offset,
} from '@floating-ui/react';
import styles from './MultiSelect.module.scss';

function normalize(opt) {
  return typeof opt === 'string' ? { label: opt, value: opt } : opt;
}

export default function MultiSelect({
  options      = [],
  value        = [],
  onChange,
  placeholder  = 'Seleccionar…',
  search       = false,
  disabled     = false,
  label,
  selectAllLabel = 'Seleccionar todo',
}) {
  const id       = useId();
  const panelId  = `ms-panel-${id.replace(/:/g, '')}`;
  const [query,  setQuery]  = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  const normalized = useMemo(() => options.map(normalize), [options]);

  const filtered = useMemo(() => {
    if (!search || !query) return normalized;
    const q = query.toLowerCase();
    return normalized.filter((o) => o.label.toLowerCase().includes(q));
  }, [normalized, search, query]);

  const { refs, floatingStyles } = useFloatingLib({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  const toggle = useCallback((optVal) => {
    if (value.includes(optVal)) {
      onChange(value.filter((v) => v !== optVal));
    } else {
      onChange([...value, optVal]);
    }
  }, [value, onChange]);

  const selectAll = useCallback(() => {
    onChange(normalized.map((o) => o.value));
  }, [normalized, onChange]);

  const clearAll = useCallback(() => onChange([]), [onChange]);

  const setTriggerRef = useCallback((el) => {
    triggerRef.current = el;
    refs.setReference(el);
  }, [refs]);

  const triggerLabel = value.length === 0
    ? placeholder
    : value.length === 1
      ? normalized.find((o) => o.value === value[0])?.label ?? placeholder
      : `${value.length} seleccionados`;

  return (
    <div className={styles.wrapper}>
      {label && (
        <span id={`${id}-label`} className={styles.label}>{label}</span>
      )}

      {/* Trigger */}
      <button
        ref={setTriggerRef}
        type="button"
        disabled={disabled}
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${id}-label` : undefined}
        onClick={() => setIsOpen((v) => !v)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span className={styles.triggerText}>{triggerLabel}</span>
        <span className={styles.arrow} aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={refs.setFloating}
          id={panelId}
          className={styles.panel}
          style={floatingStyles}
        >
          {/* Barra de búsqueda interna */}
          {search && (
            <div className={styles.searchWrap}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar…"
                className={styles.searchInput}
                aria-label="Filtrar opciones"
              />
            </div>
          )}

          {/* Selectar todo / limpiar */}
          <div className={styles.actions}>
            <button type="button" className={styles.actionBtn} onClick={selectAll}>
              {selectAllLabel}
            </button>
            <button type="button" className={styles.actionBtn} onClick={clearAll}
              disabled={value.length === 0}>
              Limpiar
            </button>
          </div>

          {/* Lista */}
          <ul role="listbox" className={styles.list} aria-multiselectable="true"
            aria-label={label ?? 'Opciones'}>
            {filtered.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(opt.value); }}
                >
                  <span className={styles.checkbox} aria-hidden="true">
                    {selected ? '☑' : '☐'}
                  </span>
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
