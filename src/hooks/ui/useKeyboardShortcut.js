/**
 * useKeyboardShortcut — ecommerce-ui
 * Registra un atajo de teclado y llama `handler` cuando coincide.
 *
 * @param {{ key, ctrl, meta, shift, alt }} shortcut
 * @param {Function} handler
 * @param {boolean}  enabled
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-103)
 */
import { useEffect } from 'react';

export default function useKeyboardShortcut(shortcut, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const { key, ctrl = false, meta = false, shift = false, alt = false } = shortcut;

    const listener = (event) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey  === ctrl  &&
        event.metaKey  === meta  &&
        event.shiftKey === shift &&
        event.altKey   === alt
      ) {
        event.preventDefault();
        handler(event);
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [shortcut, handler, enabled]);
}
