/**
 * ToastContainer — ecommerce-ui
 * Renderiza las notificaciones toast del store.
 *
 * Corrige BUG-T01: el timer de autohide se pausa en mouseenter/focusin
 * y se reanuda en mouseleave/focusout.
 *
 * Corrige BUG-T02: type='error'/'warning' → role='alert' (aria-live assertive).
 * type='success'/'info' → role='status' (aria-live polite).
 *
 * Iniciativa: integrar-componentes-ui-core-js (T-205)
 */
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectToasts } from '@redux/selectors';
import { removeToast } from '@redux/slices/uiSlice';
import styles from './ToastContainer.module.scss';

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'i',
};

// BUG-T02: mapear tipo a role ARIA correcto
const ARIA_ROLE = {
  error:   'alert',    // aria-live assertive — urgente, anuncia inmediatamente
  warning: 'alert',
  success: 'status',   // aria-live polite — espera a que el usuario termine
  info:    'status',
};

function Toast({ toast, onRemove }) {
  const timerRef = useRef(null);
  const duration = toast.duration ?? 5000;

  const startTimer = useCallback(() => {
    if (!duration) return;
    timerRef.current = setTimeout(() => onRemove(toast.id), duration);
  }, [toast.id, duration, onRemove]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  // BUG-T01: pausar en hover/focus, reanudar en salida
  const handleMouseEnter = useCallback(() => clearTimer(), [clearTimer]);
  const handleMouseLeave = useCallback(() => startTimer(), [startTimer]);

  const role = ARIA_ROLE[toast.type] ?? 'status';

  return (
    <div
      className={`${styles.toast} ${styles[`toast--${toast.type}`]}`}
      role={role}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <span className={styles.icon} aria-hidden="true">{ICONS[toast.type] ?? 'i'}</span>
      <div className={styles.body}>
        {toast.title   && <p className={styles.title}>{toast.title}</p>}
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      <button
        className={styles.close}
        onClick={() => { clearTimer(); onRemove(toast.id); }}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const dispatch = useDispatch();
  const toasts   = useSelector(selectToasts);
  const handleRemove = useCallback((id) => dispatch(removeToast(id)), [dispatch]);

  if (!toasts.length) return null;

  return (
    <div className={styles.container} aria-label="Notificaciones">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={handleRemove} />
      ))}
    </div>
  );
}
