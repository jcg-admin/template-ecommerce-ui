/**
 * ConfirmModal — ecommerce-ui
 * Diálogo de confirmación reutilizable. Reemplaza window.confirm().
 *
 * Uso:
 *   const [confirmProps, openConfirm] = useConfirm();
 *   // ...
 *   <button onClick={() => openConfirm('¿Eliminar?', () => dispatch(deleteX(id)))}>
 *     Eliminar
 *   </button>
 *   <ConfirmModal {...confirmProps} />
 *
 * O con estado local:
 *   const [confirm, setConfirm] = useState(null);
 *   // ...
 *   setConfirm({ message: '¿Eliminar?', onConfirm: () => dispatch(deleteX(id)) });
 *   <ConfirmModal
 *     open={confirm !== null}
 *     message={confirm?.message}
 *     onConfirm={() => { confirm?.onConfirm(); setConfirm(null); }}
 *     onClose={() => setConfirm(null)}
 *   />
 */

import { Modal, LoadingButton } from '@components/common';
import { Button }               from '@components/common/primitives';
import styles from './ConfirmModal.module.scss';

export default function ConfirmModal({
  open,
  message     = '¿Continuar con esta acción?',
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  variant      = 'danger',
  loading      = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      centered
      size="sm"
      backdrop="static"
    >
      <div className={styles.body}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <LoadingButton variant={variant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </LoadingButton>
        </div>
      </div>
    </Modal>
  );
}
