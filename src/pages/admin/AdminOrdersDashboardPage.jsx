/**
 * AdminOrdersDashboardPage — ecommerce-ui
 * UC-ORD-10: Dashboard transaccional del administrador.
 *
 * Cuatro bloques en una sola respuesta:
 *   1) contadores por estado
 *   2) alertas de ordenes proximas a expirar (>80% del timeout de pago)
 *   3) resumen del dia (pagos aprobados hoy)
 *   4) ultimas 10 ordenes
 *
 * Lectura: useAdminDashboard (React Query).
 */
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAdminDashboard } from '@hooks/domain/useOrders';
import { updateOrderStatus } from '@redux/slices/adminSlice';
import KanbanBoard from '@components/common/KanbanBoard';
import styles from './AdminOrdersDashboardPage.module.scss';

const STATUS_LABEL = {
  PENDING:        'Pendiente',
  PROCESSING:     'En proceso',
  IN_PREPARATION: 'En preparacion',
  SHIPPED:        'Enviado',
  DELIVERED:      'Entregado',
  CANCELLED:      'Cancelado',
};

// UC-ADM-KANBAN (F5-T13): columnas del tablero = estados operativos del
// pedido en el dominio (los mismos que STATUS_LABEL, sin CANCELLED, que no
// es un estado "movible" del flujo).
const KANBAN_COLUMNS = [
  { id: 'PENDING',        title: STATUS_LABEL.PENDING },
  { id: 'PROCESSING',     title: STATUS_LABEL.PROCESSING },
  { id: 'IN_PREPARATION', title: STATUS_LABEL.IN_PREPARATION },
  { id: 'SHIPPED',        title: STATUS_LABEL.SHIPPED },
  { id: 'DELIVERED',      title: STATUS_LABEL.DELIVERED },
];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-MX');
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export default function AdminOrdersDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard();
  const dispatch = useDispatch();

  // UC-ADM-KANBAN: al soltar/mover una tarjeta, despacha el cambio de estado
  // del pedido. Se reutiliza el thunk real updateOrderStatus del adminSlice
  // (PATCH /api/v1/orders/:orderNumber/status/). cardId es el order_number.
  const handleCardMove = useCallback(
    (cardId, toColumnId) => {
      dispatch(updateOrderStatus({ orderNumber: cardId, status: toColumnId }));
    },
    [dispatch],
  );

  if (isLoading) return <p>Cargando dashboard…</p>;
  if (isError || !data) {
    return (
      <p role="alert" className={styles.error}>
        No se pudo cargar el dashboard transaccional.
      </p>
    );
  }

  const counts          = data.order_counts ?? {};
  const expiringOrders  = data.expiring_orders ?? [];
  const daySummary      = data.day_summary ?? {};
  const latestOrders    = data.latest_orders ?? [];

  // UC-ADM-KANBAN: tarjetas del tablero a partir de los ultimos pedidos.
  // columnId = estado del pedido; cada tarjeta usa el order_number como id.
  const kanbanCards = latestOrders.map((o) => ({
    id:       o.order_number,
    columnId: o.status,
    order:    o,
  }));

  return (
    <section className={styles.page} aria-labelledby="dash-title">
      <header className={styles.header}>
        <h1 id="dash-title" className={styles.title}>Dashboard transaccional</h1>
      </header>

      <section aria-labelledby="counts-title" className={styles.section}>
        <h2 id="counts-title">Pedidos por estado</h2>
        <ul className={styles.counters}>
          <li><span>Pendientes</span><strong>{counts.pending ?? 0}</strong></li>
          <li><span>En proceso</span><strong>{counts.processing ?? 0}</strong></li>
          <li><span>En preparacion</span><strong>{counts.in_preparation ?? 0}</strong></li>
          <li><span>Enviados</span><strong>{counts.shipped ?? 0}</strong></li>
          <li><span>Activos</span><strong>{counts.total_active ?? 0}</strong></li>
        </ul>
      </section>

      <section aria-labelledby="expiring-title" className={styles.section}>
        <h2 id="expiring-title">Pedidos proximos a expirar</h2>
        {expiringOrders.length === 0 ? (
          <p>No hay pedidos cerca del limite del timeout de pago.</p>
        ) : (
          <ul className={styles.expiring}>
            {expiringOrders.map((o) => (
              <li key={o.order_number}>
                <Link to={`/admin/orders/${o.order_number}`}>{o.order_number}</Link>
                <span>{o.user__email ?? '—'}</span>
                <span>{formatDate(o.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="day-title" className={styles.section}>
        <h2 id="day-title">Resumen del dia</h2>
        <dl className={styles.day}>
          <dt>Pagos aprobados hoy</dt><dd>{daySummary.orders_count ?? 0}</dd>
          <dt>Ingresos del dia</dt><dd>{formatCurrency(daySummary.total_revenue ?? 0)}</dd>
        </dl>
      </section>

      <section aria-labelledby="latest-title" className={styles.section}>
        <h2 id="latest-title">Ultimos pedidos</h2>
        {latestOrders.length === 0 ? (
          <p>No hay pedidos recientes.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Numero</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha</th>
                <th scope="col">Comprador</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((o) => (
                <tr key={o.order_number}>
                  <td>
                    <Link to={`/admin/orders/${o.order_number}`}>{o.order_number}</Link>
                  </td>
                  <td>{STATUS_LABEL[o.status] ?? o.status}</td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{o.user__email ?? '—'}</td>
                  <td>{formatCurrency(o.value__total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="kanban-title" className={styles.section}>
        <h2 id="kanban-title">Tablero</h2>
        {kanbanCards.length === 0 ? (
          <p>No hay pedidos para mostrar en el tablero.</p>
        ) : (
          <KanbanBoard
            ariaLabel="Pedidos por estado"
            columns={KANBAN_COLUMNS}
            cards={kanbanCards}
            onCardMove={handleCardMove}
            renderCard={(card) => (
              <Link to={`/admin/orders/${card.id}`}>
                <strong>{card.id}</strong>
                <span>{card.order?.user__email ?? '—'}</span>
                <span>{formatCurrency(card.order?.value__total)}</span>
              </Link>
            )}
          />
        )}
      </section>
    </section>
  );
}
