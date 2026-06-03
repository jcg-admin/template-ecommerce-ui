/**
 * ShippingIssueReport — UC-LOG-07: Reportar problema de envío (comprador)
 *
 * Feature fabricada del template. El comprador abre una incidencia sobre una
 * orden ya despachada: elige un motivo y describe el problema. Se envía a
 * `POST /api/v1/logistics/shipping-issues/` vía `reportShippingIssue`.
 */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { reportShippingIssue } from '@redux/slices/ordersSlice';
import { Button } from '@components/common/primitives';
import styles from './ShippingIssueReport.module.scss';

const REASONS = [
  { id: 'NO_LLEGO',   label: 'No llegó mi pedido' },
  { id: 'DANADO',     label: 'Llegó dañado' },
  { id: 'INCOMPLETO', label: 'Faltan productos' },
  { id: 'RETRASO',    label: 'Retraso en la entrega' },
  { id: 'OTRO',       label: 'Otro' },
];

export default function ShippingIssueReport({ orderId }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !description.trim()) {
      setError('Elige un motivo y describe el problema.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await dispatch(reportShippingIssue({ orderId, reason, description: description.trim() })).unwrap();
      setDone(true);
    } catch (err) {
      setError(err?.detail || err?.message || 'No se pudo enviar el reporte. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={styles.wrap}>
        <p className={styles.success} role="status">
          ✓ Reporte enviado. Nuestro equipo revisará tu incidencia de envío.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className={styles.wrap}>
        <Button variant="secondary" block size="sm" onClick={() => setOpen(true)}>
          Reportar problema de envío
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit} aria-label="Reportar problema de envío">
      <label className={styles.field}>
        <span>Motivo</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Selecciona un motivo…</option>
          {REASONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </label>

      <label className={styles.field}>
        <span>Descripción</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cuéntanos qué pasó con tu envío"
        />
      </label>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="sm" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar reporte'}
        </Button>
      </div>
    </form>
  );
}
