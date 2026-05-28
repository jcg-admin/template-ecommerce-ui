/**
 * Modal — ecommerce-ui
 * Componente modal basado en <dialog> nativo del navegador.
 *
 * El browser gestiona nativamente:
 *   - Focus trap (Tab / Shift+Tab no escapan)
 *   - Scroll lock del body
 *   - Cierre con Escape (dispara evento 'close')
 *   - Top layer (z-index sobre todo, incluyendo fixed/sticky)
 *   - ::backdrop para el fondo oscuro
 *
 * Corrige BUG-M01 y BUG-M02 (backdrop manual sin accesibilidad).
 * Iniciativa: integrar-componentes-ui-core-js (T-201)
 *
 * @param {boolean}   open       — controla apertura/cierre
 * @param {Function}  onClose    — callback al cerrar (Escape o backdrop)
 * @param {ReactNode} children
 * @param {string}    className  — clase adicional para el dialog
 * @param {boolean}   closeOnBackdrop — si true (default), click en backdrop cierra
 */
import { useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Modal.module.scss';

export default function Modal({
  open,
  onClose,
  children,
  className = '',
  closeOnBackdrop = true,
}) {
  const dialogRef = useRef(null);

  // Sincronizar estado React con la API imperativa del dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Cierre al hacer click en el ::backdrop
  // El backdrop no es un elemento hijo — se detecta comparando el target
  const handleClick = useCallback((event) => {
    if (!closeOnBackdrop) return;
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { clientX: x, clientY: y } = event;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      onClose?.();
    }
  }, [closeOnBackdrop, onClose]);

  // El evento 'close' del dialog se dispara con Escape y con dialog.close()
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.dialog
          ref={dialogRef}
          className={`${styles.dialog} ${className}`}
          onClick={handleClick}
          onClose={handleClose}
          initial={{ opacity: 0, scale: 0.96, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          aria-modal="true"
        >
          {children}
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}
