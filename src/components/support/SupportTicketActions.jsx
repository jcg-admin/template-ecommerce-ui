/**
 * SupportTicketActions — ecommerce-ui
 * UC-SUPP-04: Cerrar o reabrir el ticket de soporte.
 *
 * Si el ticket esta OPEN o REPLIED muestra «Cerrar ticket».
 * Si el ticket esta CLOSED muestra «Reabrir ticket».
 */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeSupportTicket,
  reopenSupportTicket,
} from '@redux/slices/supportTicketsSlice';
import ConfirmModal from '@components/shared/ConfirmModal/ConfirmModal';
import styles from './SupportTicketActions.module.scss';

const CLOSABLE_STATUSES = new Set(['OPEN', 'REPLIED']);

export default function SupportTicketActions({ ticket }) {
  const dispatch = useDispatch();
  const { isActioning } = useSelector((s) => s.supportTickets);
  const [confirm, setConfirm] = useState(null);

  if (!ticket) return null;

  const handleClose = () => {
    setConfirm({
      message: '¿Marcar este ticket como resuelto? Podrás reabrirlo si el problema persiste.',
      action:  () => dispatch(closeSupportTicket({ id: ticket.id, reason: '' })),
    });
  };

  const handleReopen = () => {
    setConfirm({
      message: '¿Reabrir este ticket?',
      action:  () => dispatch(reopenSupportTicket(ticket.id)),
    });
  };

  const confirmModal = (
    <ConfirmModal
      open={confirm !== null}
      message={confirm?.message ?? ''}
      onConfirm={() => { confirm?.action(); setConfirm(null); }}
      onClose={() => setConfirm(null)}
    />
  );

  if (ticket.status === 'CLOSED') {
    return (
      <>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleReopen}
            disabled={isActioning}
          >
            Reabrir ticket
          </button>
        </div>
        {confirmModal}
      </>
    );
  }

  if (CLOSABLE_STATUSES.has(ticket.status)) {
    return (
      <>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={handleClose}
            disabled={isActioning}
          >
            Cerrar ticket
          </button>
        </div>
        {confirmModal}
      </>
    );
  }

  return null;
}
