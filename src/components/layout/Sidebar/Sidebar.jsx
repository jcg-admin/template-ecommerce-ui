/**
 * Sidebar — ecommerce-ui
 * Componente lateral comun para AdminSidebar y AccountSidebar.
 *
 * Corrige:
 *   BUG-S01: sin modo narrow, sin backdrop mobile, sin scroll lock
 *   BUG-S02/S03: lógica duplicada entre AdminLayout y AdminSidebar
 *   BUG-S04: overlay sin accesibilidad
 *   BUG-S05: aria-label del botón de hamburguesa no dinámico
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-202)
 *
 * Props:
 *   open      {boolean}  — visible en mobile (overlay)
 *   onClose   {Function} — callback al cerrar en mobile
 *   narrow    {boolean}  — modo rail (64px, solo iconos)
 *   className {string}
 *   children
 */
import { useEffect, useCallback } from 'react';
import useScrollLock from '@hooks/ui/useScrollLock';
import useEscapeKey  from '@hooks/ui/useEscapeKey';
import styles from './Sidebar.module.scss';

export default function Sidebar({
  open      = false,
  onClose,
  narrow    = false,
  className = '',
  children,
}) {
  // BUG-S01: scroll lock en mobile cuando el sidebar overlay está abierto
  useScrollLock(open);

  // Cierre con Escape cuando está en modo overlay
  useEscapeKey(useCallback(() => onClose?.(), [onClose]), open);

  const handleOverlayClick = useCallback(() => onClose?.(), [onClose]);

  const handleOverlayKey = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') onClose?.();
  }, [onClose]);

  const cls = [
    styles.sidebar,
    open   && styles.sidebarOpen,
    narrow && styles.sidebarNarrow,
    className,
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* BUG-S04: backdrop mobile accesible */}
      {open && (
        <div
          className={styles.backdrop}
          onClick={handleOverlayClick}
          onKeyDown={handleOverlayKey}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menú"
        />
      )}

      <aside className={cls} aria-label="Navegación lateral" data-narrow={narrow}>
        {children}
      </aside>
    </>
  );
}
