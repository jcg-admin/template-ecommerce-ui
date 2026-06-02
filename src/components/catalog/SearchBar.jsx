/**
 * SearchBar — ecommerce-ui
 * Campo de búsqueda UC-CAT-03 / UC-SRCH-01 + autocomplete UC-SRCH-02.
 * Mínimo 2 caracteres para ejecutar búsqueda (FR-CAT-03.02).
 *
 * UC-SRCH-02: mientras el usuario teclea, `useSearchSuggestions` consulta
 * sugerencias en vivo (debounce ~250ms, mínimo 2 chars). Al elegir una
 * sugerencia (clic o Enter sobre la lista) se dispara `onSearch` con ese
 * término. El submit del formulario se conserva como fallback.
 */
import { useState, useRef } from 'react';
import useSearchSuggestions from '@hooks/domain/useSearchSuggestions';
import useClickOutside from '@hooks/ui/useClickOutside';
import styles from './SearchBar.module.scss';

const MIN_LENGTH = 2;

export default function SearchBar({ onSearch, initialValue = '', isSearching = false }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [open, setOpen]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const fieldRef = useRef(null);
  const { suggestions } = useSearchSuggestions(value);

  useClickOutside(fieldRef, () => setOpen(false), open);

  const showSuggestions = open && suggestions.length > 0;

  const runSearch = (raw) => {
    const q = raw.trim().replace(/\s+/g, ' ');
    if (q.length < MIN_LENGTH) {
      setError(`Ingresa al menos ${MIN_LENGTH} caracteres para buscar.`);
      return;
    }
    setError('');
    setOpen(false);
    setActiveIdx(-1);
    onSearch(q);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(value);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    setOpen(true);
    setActiveIdx(-1);
    if (error) setError('');
  };

  const handleSelect = (suggestion) => {
    setValue(suggestion);
    runSearch(suggestion);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const listId = 'search-suggestions';

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      role="search"
      aria-label="Buscar productos"
    >
      <div className={styles.field} ref={fieldRef}>
        <div className={styles.inputWrapper}>
          <span className={styles.icon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            className={styles.input}
            type="search"
            name="q"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder="Buscar collares, pulseras, soperas..."
            aria-label="Término de búsqueda"
            aria-describedby={error ? 'search-error' : undefined}
            autoComplete="off"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined
            }
            maxLength={100}
          />
          {value && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => { setValue(''); setError(''); setOpen(false); }}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        {showSuggestions && (
          <ul id={listId} className={styles.suggestions} role="listbox" aria-label="Sugerencias">
            {suggestions.map((s, i) => (
              <li
                key={s}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIdx}
                className={`${styles.suggestion} ${i === activeIdx ? styles.active : ''}`}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isSearching}
        aria-busy={isSearching}
      >
        {isSearching ? 'Buscando...' : 'Buscar'}
      </button>

      {error && (
        <p id="search-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
