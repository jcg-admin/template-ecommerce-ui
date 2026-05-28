/**
 * useClickOutside — ecommerce-ui
 * Llama `handler` cuando el usuario hace click fuera del elemento
 * referenciado por `ref`. Limpia el listener en unmount.
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-101)
 *
 * @param {React.RefObject} ref    — ref del elemento a vigilar
 * @param {Function}        handler — callback cuando el click es externo
 * @param {boolean}         enabled — activa/desactiva el listener
 */
import { useEffect } from 'react';

export default function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      // Ignorar si el click fue dentro del elemento o si ref no existe
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    // mousedown en lugar de click para cerrar antes de que el foco se mueva
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
