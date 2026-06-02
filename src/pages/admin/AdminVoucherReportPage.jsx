/**
 * AdminVoucherReportPage — UC-PRO-04: Ver Reporte de Uso de Vouchers
 *
 * Reporte AGREGADO por voucher (no por-voucher): usos, descuento otorgado,
 * ordenes generadas, ingresos y ROI, ordenado por -current_uses. Filtros por
 * estado y rango de fechas; exportacion CSV (Alt-B/C del UC).
 *
 *   GET /api/v1/admin/vouchers/report/
 */
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchVoucherReport } from '@redux/slices/vouchersSlice';
import { MetaTag, Button } from '@components/common/primitives';
import styles from './AdminTablePage.module.scss';

const STATUS = [
  { id: '',         label: 'Todos' },
  { id: 'active',   label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
];

const COLUMNS = ['Código', 'Tipo', 'Usos', 'Descuento total', 'Órdenes', 'Ingresos', 'ROI'];

function toCsv(rows) {
  const header = ['code', 'type', 'current_uses', 'total_discount', 'orders_count', 'revenue', 'roi'];
  const lines = [header.join(',')];
  rows.forEach((r) => {
    lines.push(header.map((k) => r[k] ?? '').join(','));
  });
  return lines.join('\n');
}

export default function AdminVoucherReportPage() {
  const dispatch = useDispatch();
  const report = useSelector((s) => s.vouchers?.report || []);
  const isLoading = useSelector((s) => s.vouchers?.isLoadingReport);

  const [status, setStatus] = useState('');
  const [createdAfter, setCreatedAfter] = useState('');
  const [createdBefore, setCreatedBefore] = useState('');

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    if (createdAfter) p.created_after = createdAfter;
    if (createdBefore) p.created_before = createdBefore;
    return p;
  }, [status, createdAfter, createdBefore]);

  useEffect(() => { dispatch(fetchVoucherReport(params)); }, [dispatch, params]);

  const handleExport = () => {
    const csv = toCsv(report);
    if (typeof URL.createObjectURL !== 'function') return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte-vouchers.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Promociones · UC-PRO-04</MetaTag>
          <h1 className={styles.title}>Reporte de uso de vouchers</h1>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleExport} disabled={report.length === 0}>
            Exportar CSV
          </Button>
        </div>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.filter}>
          <span>Estado</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map((s) => <option key={s.id || 'all'} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label className={styles.filter}>
          <span>Desde</span>
          <input type="date" value={createdAfter} onChange={(e) => setCreatedAfter(e.target.value)} />
        </label>
        <label className={styles.filter}>
          <span>Hasta</span>
          <input type="date" value={createdBefore} onChange={(e) => setCreatedBefore(e.target.value)} />
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>{COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={COLUMNS.length} className={styles.loading}>Cargando reporte…</td></tr>
            )}
            {!isLoading && report.length === 0 && (
              <tr><td colSpan={COLUMNS.length} className={styles.empty}>
                Aún no hay uso de vouchers. <Link to="/admin/vouchers">Crear el primero</Link>
              </td></tr>
            )}
            {!isLoading && report.map((r) => (
              <tr key={r.code}>
                <td className={styles.mono}>{r.code}</td>
                <td>{r.type}</td>
                <td className={styles.right}>{r.current_uses}</td>
                <td className={styles.right}>{r.total_discount}</td>
                <td className={styles.right}>{r.orders_count}</td>
                <td className={styles.right}>{r.revenue}</td>
                <td className={styles.right}>{r.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
