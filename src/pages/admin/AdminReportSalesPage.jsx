/**
 * AdminReportSalesPage — ecommerce-ui
 * UC-REP-01: Reporte ejecutivo de ingresos y ventas.
 * UC-REP-05: Exportar el reporte a CSV o PDF (boton de descarga).
 */
import { useMemo, useState } from 'react';
import {
  useSalesReport,
  buildReportExportUrl,
} from '@hooks/domain/useReports';
import { exportSheet } from '@utils/exportSheet';
import { exportXlsx } from '@utils/exportWorkbook';
import PivotTable from '@components/common/PivotTable';
import styles from './AdminReportPage.module.scss';

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

// La serie temporal trae una sola dimensión (bucket = fecha ISO). Para el
// reporte pivote derivamos dos dimensiones del propio bucket: año (filas) y
// mes (columnas), agregando el ingreso por suma. Las filas con bucket no
// parseable (formato no ISO) se descartan del pivote.
function buildPivotRows(series) {
  const rows = [];
  for (const row of series) {
    const match = /^(\d{4})-(\d{2})/.exec(String(row?.bucket ?? ''));
    if (!match) continue;
    const year = match[1];
    const month = MONTH_LABELS[Number(match[2]) - 1] ?? match[2];
    rows.push({
      year,
      month,
      revenue: Number(row.revenue) || 0,
    });
  }
  return rows;
}

// Columnas del CSV de la serie temporal del reporte (UC-ADM-XLSX).
const SERIES_EXPORT_COLUMNS = [
  { key: 'bucket',  label: 'Fecha' },
  { key: 'revenue', label: 'Ingreso' },
  { key: 'orders',  label: 'Órdenes' },
];

const PERIOD_OPTIONS = [
  { value: 'today',   label: 'Hoy' },
  { value: 'week',    label: 'Semana' },
  { value: 'month',   label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year',    label: 'Año' },
];

const DEFAULT_PERIOD = 'month';

export default function AdminReportSalesPage() {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const params = useMemo(() => ({ period }), [period]);
  const { data, isLoading, error } = useSalesReport(params);

  const totals     = data?.totals     ?? {};
  const comparison = data?.comparison ?? {};
  const series     = useMemo(() => data?.series ?? [], [data]);
  const breakdown  = data?.payment_breakdown ?? [];

  const pivotRows = useMemo(() => buildPivotRows(series), [series]);

  const pdfHref = buildReportExportUrl('sales', { ...params, format: 'pdf' });

  const handleExportCsv = () => {
    exportSheet({
      filename: `reporte-ventas-${period}.csv`,
      columns: SERIES_EXPORT_COLUMNS,
      rows: series,
    });
  };

  const handleExportXlsx = () => {
    exportXlsx({
      filename: `reporte-ventas-${period}.xlsx`,
      sheetName: 'Ventas',
      columns: SERIES_EXPORT_COLUMNS,
      rows: series,
    });
  };

  const delta = comparison?.gross_revenue_delta_pct;
  const deltaClass =
    delta == null ? '' :
    delta >= 0   ? styles.metricDeltaUp : styles.metricDeltaDown;

  return (
    <section className={styles.page} aria-labelledby="report-sales-title">
      <header className={styles.header}>
        <h1 id="report-sales-title" className={styles.title}>
          Reporte de ingresos y ventas
        </h1>
        <div className={styles.exportGroup}>
          <button
            type="button"
            className={styles.exportLink}
            onClick={handleExportCsv}
          >
            Exportar CSV
          </button>
          <button
            type="button"
            className={styles.exportLink}
            onClick={handleExportXlsx}
          >
            Exportar Excel
          </button>
          <a href={pdfHref} className={styles.exportLink}>Exportar PDF</a>
        </div>
      </header>

      <div className={styles.filters}>
        <label className={styles.filter}>
          <span>Periodo</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <p>Cargando reporte…</p>}
      {error && (
        <p role="alert" className={styles.error}>
          No se pudo cargar el reporte. Intenta de nuevo.
        </p>
      )}

      <div className={styles.totals} aria-label="Totales del periodo">
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Ingreso bruto</span>
          <span className={styles.metricValue}>
            {totals.gross_revenue ?? '—'}
          </span>
          {delta != null && (
            <span className={`${styles.metricDelta} ${deltaClass}`}>
              {delta >= 0 ? '+' : ''}{delta}% vs periodo anterior
            </span>
          )}
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Ingreso neto</span>
          <span className={styles.metricValue}>{totals.net_revenue ?? '—'}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Órdenes</span>
          <span className={styles.metricValue}>{totals.orders ?? 0}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Ticket promedio</span>
          <span className={styles.metricValue}>{totals.average_ticket ?? '—'}</span>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Tendencia del periodo</h2>
      {series.length === 0 ? (
        <p className={styles.empty}>Sin datos en el periodo.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Ingreso</th>
              <th>Órdenes</th>
            </tr>
          </thead>
          <tbody>
            {series.map((row) => (
              <tr key={row.bucket}>
                <td>{row.bucket}</td>
                <td>{row.revenue}</td>
                <td>{row.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className={styles.sectionTitle}>Desglose por método de pago</h2>
      {breakdown.length === 0 ? (
        <p className={styles.empty}>Sin pagos registrados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Método</th>
              <th>Ingreso</th>
              <th>Órdenes</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row) => (
              <tr key={row.method}>
                <td>{row.method}</td>
                <td>{row.revenue}</td>
                <td>{row.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className={styles.sectionTitle}>Tabla pivote</h2>
      {pivotRows.length === 0 ? (
        <p className={styles.empty}>Sin datos para el pivote.</p>
      ) : (
        <PivotTable
          data={pivotRows}
          rowKey="year"
          colKey="month"
          valueKey="revenue"
          aggregate="sum"
          rowLabel="Año / Mes"
          ariaLabel="Ingresos por año y mes"
        />
      )}
    </section>
  );
}
