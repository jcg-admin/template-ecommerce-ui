/**
 * useEscapeKey — ecommerce-ui
 * Llama `handler` cuando el usuario presiona la tecla Escape.
 * Solo activo cuando `enabled=true`.
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-102)
 */
import { useEffect } from 'react';

export default function useEscapeKey(handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      if (event.key === 'Escape') handler(event);
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [handler, enabled]);
}
