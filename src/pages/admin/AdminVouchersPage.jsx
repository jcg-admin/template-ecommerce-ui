/**
 * AdminVouchersPage — Práctica Yorùbà
 * Listado de vouchers con filtros + acciones.
 *
 * Endpoints:
 *   GET  /admin/vouchers/?status=&q=
 *   POST /admin/vouchers/<id>/activate/    (toggle → activar)
 *   POST /admin/vouchers/<id>/deactivate/  (toggle → desactivar)
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchAdminVouchers, toggleVoucherActive,
} from '@redux/slices/adminSlice';
import { MetaTag, Button } from '@components/common/primitives';
import styles from './AdminTablePage.module.scss';

const STATUS = [
  { id: 'active',   label: 'Activos' },
  { id: 'expired',  label: 'Expirados' },
  { id: 'exhausted', label: 'Agotados' },
  { id: 'all',      label: 'Todos' },
];

const TYPE_LABEL = {
  FIXED:         'Monto fijo',
  PERCENTAGE:    'Porcentaje',
  FREE_SHIPPING: 'Envío gratis',
};

export default function AdminVouchersPage() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const vouchers = useSelector((s) => s.admin?.vouchers || []);
  const isLoading = useSelector((s) => s.admin?.isLoadingVouchers);

  useEffect(() => { dispatch(fetchAdminVouchers({ status, search })); }, [dispatch, status, search]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Comunidad · {vouchers.length} cupones</MetaTag>
          <h1 className={styles.title}>Vouchers</h1>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/vouchers/nuevo"><Button variant="primary">+ Nuevo voucher</Button></Link>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {STATUS.map((s) => (
            <button
              key={s.id}
              className={`${styles.filterBtn} ${status === s.id ? styles.filterBtnActive : ''}`}
              onClick={() => setStatus(s.id)}
            >{s.label}</button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Buscar por código…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Descuento</th>
              <th>Usos</th>
              <th>Vigencia</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className={styles.loading}>Cargando…</td></tr>}
            {!isLoading && vouchers.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>Sin vouchers que coincidan</td></tr>
            )}
            {!isLoading && vouchers.map((v) => (
              <tr key={v.id}>
                <td>
                  <Link to={`/admin/vouchers/${v.id}`} className={`${styles.itemName} ${styles.mono}`}>
                    {v.code}
                  </Link>
                </td>
                <td>{TYPE_LABEL[v.voucher_type] || v.voucher_type}</td>
                <td className={styles.mono}>
                  {v.voucher_type === 'PERCENTAGE'
                    ? `${v.discount_pct}%`
                    : v.voucher_type === 'FIXED'
                    ? `$${v.discount_value}`
                    : '—'}
                </td>
                <td className={styles.mono}>{v.current_uses} / {v.max_uses || '∞'}</td>
                <td className={styles.mono}>
                  {new Date(v.valid_from).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} —{' '}
                  {v.valid_until ? new Date(v.valid_until).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : 'sin caducidad'}
                </td>
                <td>
                  <span className={`${styles.statusPill} ${styles[`pill_${v.is_active ? 'lime' : 'muted'}`]}`}>
                    {v.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button
                    type="button" className={styles.actionBtn}
                    onClick={() => dispatch(toggleVoucherActive({ id: v.id, isActive: v.is_active }))}
                    title={v.is_active ? 'Desactivar' : 'Activar'}
                  >{v.is_active ? '◐' : '○'}</button>
                  <Link to={`/admin/vouchers/${v.id}`} className={styles.actionBtn} title="Editar">→</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
