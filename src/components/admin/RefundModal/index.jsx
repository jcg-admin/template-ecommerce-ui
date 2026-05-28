/**
 * RefundModal — Práctica Yorùbà
 * Modal para iniciar un reembolso parcial o total sobre un pago aprobado.
 *
 * Endpoint:
 *   POST /admin/<payment_id>/refund/   { amount, reason, notify_customer }
 */

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { adminCreateRefund } from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import Modal from '@components/common/Modal/Modal';
import styles from './RefundModal.module.scss';

export default function RefundModal({ payment, orderNumber, onClose, onDone }) {
  const dispatch = useDispatch();
  const [type, setType] = useState('full'); // full | partial
  const [amount, setAmount] = useState(payment?.amount || 0);
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const maxAmount = (payment?.amount || 0) - (payment?.refunded_amount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const refundAmount = type === 'full' ? maxAmount : Number(amount);
    if (refundAmount <= 0 || refundAmount > maxAmount) {
      setError(`El monto debe estar entre 1 y ${maxAmount}`);
      return;
    }
    if (!reason.trim()) {
      setError('El motivo es obligatorio');
      return;
    }
    setError(''); setSaving(true);
    try {
      await dispatch(adminCreateRefund({
        paymentId: payment.id,
        orderNumber,
        amount: refundAmount,
        reason,
        notify_customer: notify,
      })).unwrap();
      onDone?.();
      onClose();
    } catch (err) {
      setError(err?.detail || 'No se pudo iniciar el reembolso.');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={true} onClose={onClose} className={styles.modal}>
        <header className={styles.header}>
          <MetaTag tone="bronze">Iniciar reembolso</MetaTag>
          <h2 className={styles.title}>Pedido {orderNumber}</h2>
          <div className={styles.meta}>
            Pago aprobado: <strong>${payment?.amount?.toLocaleString('es-MX')} MXN</strong>
            {payment?.refunded_amount > 0 && (
              <> · Ya reembolsado: <strong>${payment.refunded_amount.toLocaleString('es-MX')}</strong></>
            )}
            <br />
            Disponible para reembolsar: <strong className={styles.maxAmount}>${maxAmount.toLocaleString('es-MX')}</strong>
          </div>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label className={styles.label}>Tipo de reembolso</label>
            <div className={styles.typeRow}>
              <label className={`${styles.typeCard} ${type === 'full' ? styles.typeCardActive : ''}`}>
                <input type="radio" name="type" value="full" checked={type === 'full'} onChange={() => { setType('full'); setAmount(maxAmount); }} />
                <span className={styles.typeTitle}>Reembolso total</span>
                <span className={styles.typeSub}>${maxAmount.toLocaleString('es-MX')} MXN</span>
              </label>
              <label className={`${styles.typeCard} ${type === 'partial' ? styles.typeCardActive : ''}`}>
                <input type="radio" name="type" value="partial" checked={type === 'partial'} onChange={() => setType('partial')} />
                <span className={styles.typeTitle}>Reembolso parcial</span>
                <span className={styles.typeSub}>Especificar monto</span>
              </label>
            </div>
          </div>

          {type === 'partial' && (
            <Field
              label="Monto a reembolsar (MXN)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              hint={`Máximo: $${maxAmount.toLocaleString('es-MX')}`}
            />
          )}

          <Field
            label="Motivo del reembolso"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            textarea
            required
            placeholder="Ej. Pieza llegó dañada, devolución dentro del periodo de 30 días"
          />

          <label className={styles.toggleRow}>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            <span>Notificar al cliente por correo cuando se procese</span>
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="vino" disabled={saving || !reason.trim()}>
              {saving ? 'Procesando…' : `Reembolsar $${(type === 'full' ? maxAmount : Number(amount) || 0).toLocaleString('es-MX')}`}
            </Button>
          </div>

          <div className={styles.hint}>
            El reembolso se ejecuta contra la pasarela original ({payment?.gateway_label || 'gateway'}).
            Puede tardar 2–5 días hábiles en reflejarse en la tarjeta del cliente.
          </div>
        </form>
  </Modal>
);
}
