/**
 * AdminDashboardPage — Práctica Yorùbà
 * Vista general: KPIs + alertas + pedidos recientes.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAdminMetrics } from '@redux/slices/adminSlice';
import { MetaTag, Price, Button } from '@components/common/primitives';
import Gauge from '@components/common/Gauge';
import Sparkline from '@components/common/Sparkline';
import LinearGauge from '@components/common/LinearGauge';
import styles from './AdminDashboardPage.module.scss';

/**
 * Metas operativas para los indicadores radiales (Gauges).
 *
 * El endpoint /api/v1/admin/metrics/ no expone metas ("target"/"goal"),
 * así que se definen aquí como constantes razonables y documentadas:
 *  - DAILY_SALES_TARGET: meta de facturación diaria en MXN.
 *  - DAILY_ORDERS_TARGET: meta de pedidos cerrados por día.
 *  - STOCK_ALERT_CEILING: nº de alertas a partir del cual la salud de
 *    inventario se considera 0%. Con 0 alertas la salud es 100%.
 */
const DAILY_SALES_TARGET = 20000; // MXN
const DAILY_ORDERS_TARGET = 60;
const STOCK_ALERT_CEILING = 10;

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const m = useSelector((s) => s.admin?.metrics) || {};

  useEffect(() => { dispatch(fetchAdminMetrics()); }, [dispatch]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Panel administrativo</MetaTag>
          <h1 className={styles.title}>Resumen del día</h1>
          <div className={styles.headerMeta}>
            Hoy · {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary">Exportar reporte</Button>
        </div>
      </header>

      {/* KPIs */}
      <section className={styles.kpis}>
        <Kpi
          label="Ventas del día"
          value={`$${(m.sales_today || 0).toLocaleString('es-MX')} MXN`}
          seriesValue={m.sales_today}
          delta={m.sales_delta_pct}
          tone="lime"
        />
        <Kpi
          label="Pedidos del día"
          value={m.orders_today || 0}
          seriesValue={m.orders_today}
          delta={m.orders_delta_pct}
          tone="coral"
        />
        <Kpi
          label="Ticket promedio"
          value={`$${(m.avg_ticket || 0).toLocaleString('es-MX')} MXN`}
          seriesValue={m.avg_ticket}
          delta={m.ticket_delta_pct}
          tone="bronze"
        />
        <Kpi
          label="Nuevos usuarios"
          value={m.new_users_today || 0}
          seriesValue={m.new_users_today}
          delta={m.users_delta_pct}
          tone="muted"
        />
      </section>

      {/* Indicadores radiales (KPIs derivados de los datos reales) */}
      <section className={styles.gauges} aria-label="Indicadores">
        <header className={styles.gaugesHeader}>
          <h2 className={styles.cardTitle}>Indicadores</h2>
        </header>
        <div className={styles.gaugesRow}>
          {(() => {
            const sales = m.sales_today || 0;
            const orders = m.orders_today || 0;
            const alertCount = (m.alerts || []).length;

            // % de meta de ventas y pedidos (el Gauge ya hace clamp 0..max).
            const salesPct = Math.round((sales / DAILY_SALES_TARGET) * 100);
            const ordersPct = Math.round((orders / DAILY_ORDERS_TARGET) * 100);

            // Salud de inventario: 100% sin alertas, decae con cada alerta
            // hasta 0% cuando se alcanza STOCK_ALERT_CEILING.
            const stockHealth = Math.max(
              0,
              Math.round((1 - alertCount / STOCK_ALERT_CEILING) * 100),
            );

            return (
              <>
                <Gauge
                  value={salesPct}
                  min={0}
                  max={100}
                  label="Meta de ventas"
                  unit="%"
                  ariaLabel={`Meta de ventas del día: ${salesPct}% de $${DAILY_SALES_TARGET.toLocaleString('es-MX')} MXN`}
                />
                <Gauge
                  value={ordersPct}
                  min={0}
                  max={100}
                  label="Meta de pedidos"
                  unit="%"
                  ariaLabel={`Meta de pedidos del día: ${ordersPct}% de ${DAILY_ORDERS_TARGET}`}
                />
                <Gauge
                  value={stockHealth}
                  min={0}
                  max={100}
                  label="Salud de inventario"
                  unit="%"
                  ariaLabel={`Salud de inventario: ${stockHealth}% (${alertCount} alertas activas)`}
                />
              </>
            );
          })()}
        </div>
      </section>

      <div className={styles.grid}>
        {/* Recent orders */}
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pedidos recientes</h2>
            <Link to="/admin/orders" className={styles.cardLink}>Ver todos →</Link>
          </header>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(m.recent_orders || []).slice(0, 6).map((o) => (
                <tr key={o.order_number}>
                  <td className={styles.mono}>
                    <Link to={`/admin/orders/${o.order_number}`}>{o.order_number}</Link>
                  </td>
                  <td>{o.customer_name}</td>
                  <td>
                    <span className={`${styles.statusPill} ${styles[`pill_${o.tone || 'muted'}`]}`}>
                      {o.status_label}
                    </span>
                  </td>
                  <td className={styles.right}><Price amount={o.total} size="sm" /></td>
                </tr>
              ))}
              {(!m.recent_orders || m.recent_orders.length === 0) && (
                <tr><td colSpan={4} className={styles.empty}>Sin pedidos recientes</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Alerts */}
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Alertas</h2>
            <span className={styles.cardBadge}>{(m.alerts || []).length}</span>
          </header>
          <ul className={styles.alertList}>
            {(m.alerts || []).map((a, i) => (
              <li key={a.product_id ?? a.id ?? i} className={`${styles.alert} ${styles[`alert_${a.severity || 'info'}`]}`}>
                <span className={styles.alertDot} />
                <div>
                  <div className={styles.alertTitle}>{a.title}</div>
                  <div className={styles.alertDesc}>{a.description}</div>
                </div>
                {a.action_to && <Link to={a.action_to} className={styles.alertCta}>→</Link>}
              </li>
            ))}
            {(!m.alerts || m.alerts.length === 0) && (
              <li className={styles.empty}>Sin alertas pendientes ✓</li>
            )}
          </ul>
          {/* Nivel de alertas de stock acotado por STOCK_ALERT_CEILING. */}
          <div className={styles.stockGauge}>
            <LinearGauge
              value={(m.alerts || []).length}
              min={0}
              max={STOCK_ALERT_CEILING}
              thresholds={[
                { value: 3, tone: 'success' },
                { value: 6, tone: 'warning' },
                { value: STOCK_ALERT_CEILING, tone: 'error' },
              ]}
              label="Nivel de alertas"
              showValue
              ariaLabel={`Nivel de alertas de stock: ${(m.alerts || []).length} de ${STOCK_ALERT_CEILING}`}
            />
            <div className={styles.stockGaugeCaption}>
              {(m.alerts || []).length} / {STOCK_ALERT_CEILING} antes de saturación
            </div>
          </div>
        </section>

        {/* Top products */}
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Top productos · 30 días</h2>
            <Link to="/admin/products" className={styles.cardLink}>Ver todos →</Link>
          </header>
          <ul className={styles.topList}>
            {(m.top_products || []).slice(0, 5).map((p, i) => (
              <li key={p.id} className={styles.topItem}>
                <span className={styles.topRank}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.topInfo}>
                  <div className={styles.topName}>{p.name}</div>
                  <div className={styles.topMeta}>{p.orisha_name} · {p.units_sold} vendidos</div>
                </div>
                <Price amount={p.revenue} size="sm" />
              </li>
            ))}
          </ul>
        </section>

        {/* By òrìsà */}
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Ventas por òrìsà</h2>
          </header>
          {/* Mini bar chart de la distribución por òrìsà (revenue o pct). */}
          {(m.sales_by_orisha || []).length > 1 && (
            <div className={styles.orishaChart}>
              <span className={styles.orishaChartLabel}>Distribución</span>
              <Sparkline
                data={(m.sales_by_orisha || []).map((o) =>
                  Number(o.revenue ?? o.pct ?? 0))}
                type="bar"
                tone="lime"
                width={260}
                height={36}
                ariaLabel="Distribución de ventas por òrìsà"
              />
            </div>
          )}
          <div className={styles.barList}>
            {(m.sales_by_orisha || []).map((o) => (
              <div key={o.orisha} className={styles.bar}>
                <div className={styles.barLabel}>{o.orisha}</div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${o.pct}%` }} />
                </div>
                <div className={styles.barValue}>{o.pct}%</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Construye una micro-serie de tendencia para el Sparkline del KPI.
 *
 * El endpoint /api/v1/admin/metrics/ no expone series históricas por KPI,
 * así que derivamos una mini-serie de 5 puntos a partir del valor actual y
 * su variación (delta %): se reconstruye el valor de "ayer" y se interpola
 * una rampa hacia el valor de hoy. Es una aproximación visual de la
 * tendencia, no un dato histórico real. Defensiva ante valores no numéricos.
 */
function buildKpiSeries(rawValue, delta) {
  const today = Number(rawValue);
  if (!Number.isFinite(today)) return [];
  const pct = Number(delta);
  // Valor de "ayer" implícito en el delta; si no hay delta, serie plana.
  const yesterday = Number.isFinite(pct) && pct !== -100
    ? today / (1 + pct / 100)
    : today;
  const steps = 5;
  return Array.from({ length: steps }, (_, i) =>
    yesterday + ((today - yesterday) * i) / (steps - 1));
}

function Kpi({ label, value, delta, tone, seriesValue }) {
  const positive = (delta ?? 0) >= 0;
  const series = buildKpiSeries(seriesValue, delta);
  const sparkTone = tone === 'lime' || tone === 'coral' ? tone : 'bronze';
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={`${styles.kpiValue} ${styles[`kpi_${tone}`]}`}>{value}</div>
      {delta != null && (
        <div className={`${styles.kpiDelta} ${positive ? styles.kpiDeltaUp : styles.kpiDeltaDown}`}>
          {positive ? '↑' : '↓'} {Math.abs(delta)}% vs ayer
        </div>
      )}
      {series.length > 1 && (
        <div className={styles.kpiSpark}>
          <Sparkline
            data={series}
            type="area"
            tone={sparkTone}
            width={140}
            height={28}
            ariaLabel={`Tendencia de ${label}`}
          />
        </div>
      )}
    </div>
  );
}
