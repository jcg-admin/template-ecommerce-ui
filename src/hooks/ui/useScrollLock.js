/**
 * useScrollLock — ecommerce-ui
 * Bloquea el scroll del body y compensa el ancho de la scrollbar
 * para evitar layout shift al abrir modales/sidebars.
 *
 * Nota: <dialog>.showModal() gestiona esto nativamente.
 * Este hook existe como fallback para componentes que NO usan <dialog>
 * (ej. Sidebar en mobile, drawers).
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-104)
 */
import { useEffect } from 'react';

export default function useScrollLock(enabled = false) {
  useEffect(() => {
    if (!enabled) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPadding  = document.body.style.paddingRight;

    document.body.style.overflow     = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow     = originalOverflow;
      document.body.style.paddingRight = originalPadding;
    };
  }, [enabled]);
}
