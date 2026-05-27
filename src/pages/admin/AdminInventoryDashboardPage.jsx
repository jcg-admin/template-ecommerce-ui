/**
 * AdminInventoryDashboardPage — Práctica Yorùbà
 * Vista de inventario con KPIs + movimientos recientes.
 *
 * Endpoints:
 *   GET /admin/inventory/   → { totals, recent_movements, low_stock_count, out_of_stock_count }
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchInventoryDashboard } from '@redux/slices/adminSlice';
import { MetaTag, Price } from '@components/common/primitives';
import styles from './AdminInventoryDashboardPage.module.scss';

const MOVEMENT_TYPES = {
  IN:       { label: 'Entrada',  tone: 'lime' },
  OUT:      { label: 'Salida',   tone: 'coral' },
  ADJUST:   { label: 'Ajuste',   tone: 'bronze' },
  WASTE:    { label: 'Merma',    tone: 'vino' },
  RETURN:   { label: 'Devolución', tone: 'lime' },
};

export default function AdminInventoryDashboardPage() {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.admin?.inventory) || {};

  useEffect(() => { dispatch(fetchInventoryDashboard()); }, [dispatch]);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <span className={styles.bcCurrent}>Inventario</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Operación · Inventario</MetaTag>
          <h1 className={styles.title}>Inventario</h1>
        </div>
        <Link to="/admin/inventory/alertas">
          <span className={styles.alertCta}>
            ⚠ {data.low_stock_count || 0} productos con stock bajo →
          </span>
        </Link>
      </header>

      <section className={styles.kpis}>
        <Kpi label="SKUs totales" value={data.total_skus || 0} />
        <Kpi label="Stock total" value={(data.total_units || 0).toLocaleString('es-MX')} tone="lime" />
        <Kpi label="Stock bajo" value={data.low_stock_count || 0} tone="bronze" />
        <Kpi label="Agotados" value={data.out_of_stock_count || 0} tone="vino" />
        <Kpi label="Valor inventario"
             value={`$${(data.inventory_value || 0).toLocaleString('es-MX')}`}
             tone="muted" />
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Movimientos recientes</h2>
          <Link to="/admin/inventory/alertas" className={styles.cardLink}>Ver alertas →</Link>
        </header>
        <table className={styles.table}>
          <thead>
            <tr><th>Cuándo</th><th>Producto</th><th>SKU</th><th>Tipo</th><th>Cant.</th><th>Motivo</th><th>Usuario</th></tr>
          </thead>
          <tbody>
            {(data.recent_movements || []).length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>Sin movimientos recientes</td></tr>
            )}
            {(data.recent_movements || []).map((m) => {
              const t = MOVEMENT_TYPES[m.type] || MOVEMENT_TYPES.ADJUST;
              return (
                <tr key={m.id}>
                  <td className={styles.mono}>
                    {new Date(m.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>{m.product_name}{m.variant_label && <span className={styles.muted}> · {m.variant_label}</span>}</td>
                  <td className={styles.mono}>{m.sku}</td>
                  <td>
                    <span className={`${styles.pill} ${styles[`pill_${t.tone}`]}`}>{t.label}</span>
                  </td>
                  <td className={`${styles.mono} ${m.delta < 0 ? styles.negative : styles.positive}`}>
                    {m.delta > 0 ? '+' : ''}{m.delta}
                  </td>
                  <td className={styles.reason}>{m.reason}</td>
                  <td className={styles.mono}>{m.by_user}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone = 'default' }) {
  const cls = {
    default: '',
    lime: styles.kpiLime,
    coral: styles.kpiCoral,
    vino: styles.kpiVino,
    bronze: styles.kpiBronze,
    muted: styles.kpiMuted,
  }[tone];
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={`${styles.kpiValue} ${cls}`}>{value}</div>
    </div>
  );
}
