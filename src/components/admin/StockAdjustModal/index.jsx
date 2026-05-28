/**
 * StockAdjustModal — Práctica Yorùbà
 * Modal de ajuste de inventario con motivo obligatorio.
 *
 * Endpoints:
 *   POST /admin/inventory/<product_id>/adjust/
 *   POST /admin/inventory/variants/<variant_id>/adjust/
 */

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { adjustProductStock, adjustVariantStock } from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import Modal from '@components/common/Modal/Modal';
import styles from './StockAdjustModal.module.scss';

const TYPES = [
  { id: 'IN',     label: 'Entrada (compra a proveedor)' },
  { id: 'OUT',    label: 'Salida (venta manual u otra)' },
  { id: 'ADJUST', label: 'Ajuste de inventario (conteo)' },
  { id: 'WASTE',  label: 'Merma (rotura, deterioro)' },
  { id: 'RETURN', label: 'Devolución de cliente' },
];

export default function StockAdjustModal({ item, onClose, onSaved }) {
  const dispatch = useDispatch();
  const [type, setType] = useState('IN');
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const numericDelta = ['OUT', 'WASTE'].includes(type)
        ? -Math.abs(Number(delta))
        : Math.abs(Number(delta));
      const payload = { type, delta: numericDelta, reason };
      if (item.variant_id) {
        await dispatch(adjustVariantStock({ variantId: item.variant_id, ...payload })).unwrap();
      } else {
        await dispatch(adjustProductStock({ productId: item.product_id, ...payload })).unwrap();
      }
      onSaved?.();
    } catch (err) {
      setError(err?.detail || 'No se pudo aplicar el ajuste.');
    } finally { setSaving(false); }
  };

  const newStock = item.stock + (
    ['OUT', 'WASTE'].includes(type) ? -Math.abs(Number(delta) || 0) : Math.abs(Number(delta) || 0)
  );

  return (
    <Modal open={true} onClose={onClose} className={styles.modal}>
        <header className={styles.header}>
          <MetaTag tone="bronze">Ajuste de inventario</MetaTag>
          <h2 className={styles.title}>{item.product_name}</h2>
          <div className={styles.meta}>
            SKU · {item.sku}
            {item.variant_label && <> · {item.variant_label}</>}
            <span className={styles.dot}>·</span>
            Stock actual: <strong className={styles.current}>{item.stock}</strong>
          </div>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label className={styles.label}>Tipo de movimiento</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={styles.select}
            >
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <Field
            label="Cantidad"
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            required
            hint={['OUT', 'WASTE'].includes(type)
              ? 'Se restará del stock actual'
              : 'Se sumará al stock actual'}
          />

          {delta && (
            <div className={styles.preview}>
              <span className={styles.previewLabel}>Stock resultante:</span>
              <span className={`${styles.previewValue} ${newStock < 0 ? styles.previewError : ''}`}>
                {item.stock} {['OUT', 'WASTE'].includes(type) ? '−' : '+'} {Math.abs(Number(delta))} = <strong>{newStock}</strong>
              </span>
            </div>
          )}

          <Field
            label="Motivo (visible en el historial)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            textarea
            required
            placeholder="Ej. Compra a proveedor Mateos · Folio 14982"
          />

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving || newStock < 0 || !reason.trim() || !delta}>
              {saving ? 'Aplicando…' : 'Aplicar ajuste'}
            </Button>
          </div>
        </form>
  </Modal>
);
}
