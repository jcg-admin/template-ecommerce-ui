/**
 * Autocomplete — ecommerce-ui
 * Combobox accesible con Popover API + floating-ui.
 * Referencia: ui-core autocomplete.js (T-402)
 * Iniciativa: integrar-componentes-ui-core-js
 *
 * @param {string}      value        — valor controlado del input
 * @param {Function}    onChange(v)  — callback al escribir
 * @param {Function}    onSelect(v)  — callback al seleccionar opción
 * @param {Array}       options      — [{label, value}] o strings
 * @param {string}      placeholder
 * @param {boolean}     disabled
 * @param {string}      label
 * @param {string}      noResults    — mensaje sin resultados
 */
import { useId, useRef, useCallback, useMemo, useState } from 'react';
import {
  useFloating as useFloatingLib,
  autoUpdate, flip, shift, offset,
} from '@floating-ui/react';
import styles from './Autocomplete.module.scss';

function normalize(opt) {
  return typeof opt === 'string' ? { label: opt, value: opt } : opt;
}

export default function Autocomplete({
  value       = '',
  onChange,
  onSelect,
  options     = [],
  placeholder = 'Buscar…',
  disabled    = false,
  label,
  noResults   = 'Sin resultados',
}) {
  const id        = useId();
  const listId    = `ac-list-${id.replace(/:/g, '')}`;
  const inputRef  = useRef(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen]           = useState(false);

  const normalized = useMemo(() => options.map(normalize), [options]);

  const filtered = useMemo(() => {
    if (!value) return normalized;
    const q = value.toLowerCase();
    return normalized.filter((o) => o.label.toLowerCase().includes(q));
  }, [value, normalized]);

  const { refs, floatingStyles } = useFloatingLib({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  const handleSelect = useCallback((opt) => {
    onSelect?.(opt.value);
    onChange?.(opt.label);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  }, [onSelect, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (e.key === 'ArrowDown') { setOpen(true); setActiveIdx(0); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(filtered[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  }, [open, filtered, activeIdx, handleSelect]);

  const activeId = activeIdx >= 0 ? `${listId}-opt-${activeIdx}` : undefined;

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={`${id}-input`} className={styles.label}>{label}</label>}

      <input
        ref={(el) => { inputRef.current = el; refs.setReference(el); }}
        id={`${id}-input`}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        className={styles.input}
        onChange={(e) => { onChange?.(e.target.value); setOpen(true); setActiveIdx(-1); }}
        onKeyDown={handleKeyDown}
        onFocus={() => value && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {/* Lista de opciones — Popover API + floating-ui */}
      {open && filtered.length > 0 && (
        <ul
          id={listId}
          ref={refs.setFloating}
          role="listbox"
          className={styles.list}
          style={floatingStyles}
          aria-label={label ?? 'Sugerencias'}
        >
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              className={`${styles.option} ${i === activeIdx ? styles.optionActive : ''}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {/* Mensaje de sin resultados */}
      {open && value && filtered.length === 0 && (
        <div
          ref={refs.setFloating}
          className={`${styles.list} ${styles.noResults}`}
          style={floatingStyles}
          role="status"
        >
          {noResults}
        </div>
      )}
    </div>
  );
}
