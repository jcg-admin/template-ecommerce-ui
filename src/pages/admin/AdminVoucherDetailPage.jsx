/**
 * AdminVoucherDetailPage — Práctica Yorùbà
 * Form CRUD del voucher + changelog.
 *
 * Endpoints:
 *   GET / POST / PATCH / DELETE /admin/vouchers/<id>/
 *   GET /admin/vouchers/<id>/changelog/
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchAdminVoucher, createVoucher, updateVoucher, deleteVoucher,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import styles from './AdminVoucherDetailPage.module.scss';

const TYPES = [
  { id: 'FIXED',         label: 'Monto fijo' },
  { id: 'PERCENTAGE',    label: 'Porcentaje' },
  { id: 'FREE_SHIPPING', label: 'Envío gratis' },
];

export default function AdminVoucherDetailPage() {
  const { id } = useParams();
  const isNew = id === 'nuevo';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const voucher = useSelector((s) => s.admin?.currentVoucher);
  const changelog = useSelector((s) => s.admin?.voucherChangelog || []);

  const [form, setForm] = useState({
    code: '', voucher_type: 'PERCENTAGE',
    discount_value: '', discount_pct: '', max_discount: '',
    min_order_amount: 0, max_uses: '',
    restricted_to_email: '',
    valid_from: '', valid_until: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!isNew) dispatch(fetchAdminVoucher(id)); }, [dispatch, id, isNew]);
  useEffect(() => { if (voucher && !isNew) setForm(voucher); }, [voucher, isNew]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [k]: k === 'code' ? v.toUpperCase() : v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const created = await dispatch(createVoucher(form)).unwrap();
        navigate(`/admin/vouchers/${created.id}`);
      } else {
        await dispatch(updateVoucher({ id, data: form })).unwrap();
      }
    } finally { setSaving(false); }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <Link to="/admin/vouchers">Vouchers</Link><span>/</span>
        <span className={styles.bcCurrent}>{isNew ? 'Nuevo' : form.code || id}</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">
            {isNew ? 'Nuevo voucher' : `Usos: ${voucher?.current_uses || 0} / ${voucher?.max_uses || '∞'}`}
          </MetaTag>
          <h1 className={styles.title}>{form.code || 'Sin código'}</h1>
        </div>
        <div className={styles.headerActions}>
          {!isNew && (
            <Button variant="ghost" onClick={() => {
              if (window.confirm(`¿Eliminar voucher "${form.code}"?`)) {
                dispatch(deleteVoucher(id));
                navigate('/admin/vouchers');
              }
            }}>Eliminar</Button>
          )}
          <Button type="submit" form="voucher-form" variant="primary" disabled={saving}>
            {saving ? 'Guardando…' : (isNew ? 'Crear voucher' : 'Guardar cambios')}
          </Button>
        </div>
      </header>

      <div className={styles.layout}>
        <form id="voucher-form" onSubmit={handleSubmit} className={styles.form}>
          <Field label="Código (mayúsculas)" value={form.code} onChange={set('code')} required hint="Ej. BIENVENIDA10" />

          <div>
            <label className={styles.label}>Tipo</label>
            <select value={form.voucher_type} onChange={set('voucher_type')} className={styles.select}>
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          {form.voucher_type === 'FIXED' && (
            <Field label="Monto fijo (MXN)" type="number" value={form.discount_value} onChange={set('discount_value')} required />
          )}
          {form.voucher_type === 'PERCENTAGE' && (
            <div className={styles.row2}>
              <Field label="Porcentaje %" type="number" value={form.discount_pct} onChange={set('discount_pct')} required />
              <Field label="Descuento máximo (MXN)" type="number" value={form.max_discount} onChange={set('max_discount')} hint="Tope opcional" />
            </div>
          )}

          <div className={styles.row2}>
            <Field label="Monto mínimo de pedido (MXN)" type="number" value={form.min_order_amount} onChange={set('min_order_amount')} />
            <Field label="Máximo de usos" type="number" value={form.max_uses} onChange={set('max_uses')} hint="Vacío = ilimitado" />
          </div>

          <Field label="Restringido al correo (opcional)" type="email" value={form.restricted_to_email} onChange={set('restricted_to_email')} hint="Solo este cliente podrá usarlo" />

          <div className={styles.row2}>
            <Field label="Válido desde" type="datetime-local" value={form.valid_from} onChange={set('valid_from')} required />
            <Field label="Válido hasta" type="datetime-local" value={form.valid_until} onChange={set('valid_until')} hint="Vacío = sin caducidad" />
          </div>

          <label className={styles.toggle}>
            <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
            <span>Voucher activo</span>
          </label>
        </form>

        {!isNew && (
          <aside className={styles.changelog}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Historial de cambios</h2>
            </header>
            {changelog.length === 0 ? (
              <div className={styles.empty}>Sin cambios registrados</div>
            ) : (
              <ul className={styles.changelogList}>
                {changelog.map((entry, i) => (
                  <li key={i} className={styles.changelogItem}>
                    <div className={styles.changelogMeta}>
                      {new Date(entry.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {entry.by_user}
                    </div>
                    <div className={styles.changelogAction}>{entry.action_label}</div>
                    {entry.diff && (
                      <ul className={styles.changelogDiff}>
                        {Object.entries(entry.diff).map(([k, [from, to]]) => (
                          <li key={k}>
                            <span className={styles.diffKey}>{k}:</span>{' '}
                            <span className={styles.diffFrom}>{String(from)}</span>{' → '}
                            <span className={styles.diffTo}>{String(to)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
