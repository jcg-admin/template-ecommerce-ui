/**
 * AdminVoucherReportPage — UC-PRO-04: Ver Reporte de Uso de Vouchers
 *
 * Reporte AGREGADO por voucher (no por-voucher): usos, descuento otorgado,
 * ordenes generadas, ingresos y ROI, ordenado por -current_uses. Filtros por
 * estado y rango de fechas; exportacion CSV (Alt-B/C del UC).
 *
 * Usa el componente adaptado `DataGrid` (de kno-react/ui-core) para la tabla,
 * consistente con AdminUsersPage / AdminVoucherDetailPage.
 *
 *   GET /api/v1/admin/vouchers/report/
 */
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVoucherReport } from '@redux/slices/vouchersSlice';
import { MetaTag, Button } from '@components/common/primitives';
import DataGrid from '@components/common/DataGrid';
import DatePicker from '@components/common/DatePicker/DatePicker';
import styles from './AdminTablePage.module.scss';

// DatePicker emite un Date en onChange; el query param canónico
// (created_after/created_before) es string ISO 'YYYY-MM-DD'.
const toISO = (d) => (d instanceof Date && !Number.isNaN(d) ? d.toISOString().slice(0, 10) : '');

const STATUS = [
  { id: '',         label: 'Todos' },
  { id: 'active',   label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
];

const COLUMNS = [
  { key: 'code',           label: 'Código',          sortable: true },
  { key: 'type',           label: 'Tipo' },
  { key: 'current_uses',   label: 'Usos',            sortable: true },
  { key: 'total_discount', label: 'Descuento total', sortable: true },
  { key: 'orders_count',   label: 'Órdenes' },
  { key: 'revenue',        label: 'Ingresos',        sortable: true },
  { key: 'roi',            label: 'ROI',             sortable: true },
];

const CSV_KEYS = COLUMNS.map((c) => c.key);

function toCsv(rows) {
  const lines = [CSV_KEYS.join(',')];
  rows.forEach((r) => lines.push(CSV_KEYS.map((k) => r[k] ?? '').join(',')));
  return lines.join('\n');
}

export default function AdminVoucherReportPage() {
  const dispatch = useDispatch();
  const report = useSelector((s) => s.vouchers?.report || []);

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
          <DatePicker
            value={createdAfter || null}
            onChange={(d) => setCreatedAfter(toISO(d))}
            placeholder="Desde"
          />
        </label>
        <label className={styles.filter}>
          <span>Hasta</span>
          <DatePicker
            value={createdBefore || null}
            onChange={(d) => setCreatedBefore(toISO(d))}
            placeholder="Hasta"
          />
        </label>
      </div>

      <DataGrid
        columns={COLUMNS}
        rows={report}
        pageSize={20}
        getRowKey={(r) => r.code}
        emptyText="Aún no hay uso de vouchers."
        ariaLabel="Reporte de uso de vouchers"
      />
    </div>
  );
}
