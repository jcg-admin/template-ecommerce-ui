/**
 * AdminOrderDetailPage — Práctica Yorùbà
 * Vista admin de un pedido con transición de estados, items snapshot,
 * dirección snapshot y acciones (cancelar, reembolsar).
 *
 * Endpoints:
 *   GET   /admin/orders/<order_number>/
 *   PATCH /admin/orders/<order_number>/status/   { status, note }
 *   POST  /admin/orders/<order_number>/cancel/   { reason }
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchAdminOrder, updateOrderStatus, adminCancelOrder,
} from '@redux/slices/adminSlice';
import RefundModal from '@components/admin/RefundModal';
import { MetaTag, Price, Button } from '@components/common/primitives';
import styles from './AdminOrderDetailPage.module.scss';

const STATUS_FLOW = [
  { id: 'PENDING',        label: 'Pendiente de pago' },
  { id: 'PROCESSING',     label: 'Procesando' },
  { id: 'IN_PREPARATION', label: 'En preparación' },
  { id: 'SHIPPED',        label: 'Enviado' },
  { id: 'IN_DELIVERY',    label: 'En reparto' },
  { id: 'DELIVERED',      label: 'Entregado' },
];

const NEXT_STATES = {
  PENDING:        ['PROCESSING', 'CANCELLED'],
  PROCESSING:     ['IN_PREPARATION', 'CANCELLED'],
  IN_PREPARATION: ['SHIPPED', 'CANCELLED'],
  SHIPPED:        ['IN_DELIVERY', 'DELIVERED'],
  IN_DELIVERY:    ['DELIVERED'],
  DELIVERED:      ['REFUNDED'],
  CANCELLED:      [],
  REFUNDED:       [],
};

export default function AdminOrderDetailPage() {
  const { order_number } = useParams();
  const dispatch = useDispatch();
  const order = useSelector((s) => s.admin?.currentOrder);
  const isLoading = useSelector((s) => s.admin?.isLoadingOrder);
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showRefund, setShowRefund] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => { dispatch(fetchAdminOrder(order_number)); }, [dispatch, order_number]);

  if (isLoading || !order) return <div className={styles.loading}>Cargando pedido…</div>;

  const validNext = NEXT_STATES[order.status] || [];
  const currentIdx = STATUS_FLOW.findIndex(s => s.id === order.status);

  const handleAdvance = async (e) => {
    e.preventDefault();
    if (!nextStatus) return;
    if (nextStatus === 'CANCELLED') { setShowCancel(true); return; }
    await dispatch(updateOrderStatus({ orderNumber: order_number, status: nextStatus, note }));
    setNextStatus(''); setNote('');
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    await dispatch(adminCancelOrder({ orderNumber: order_number, reason: cancelReason }));
    setShowCancel(false); setCancelReason('');
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <Link to="/admin/orders">Pedidos</Link><span>/</span>
        <span className={styles.bcCurrent}>{order_number}</span>
      </nav>

      <header className={styles.hero}>
        <div>
          <MetaTag tone="bronze">
            Pedido · {new Date(order.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </MetaTag>
          <h1 className={styles.title}>{order_number}</h1>
          <div className={styles.heroMeta}>
            <span>{order.customer_name}</span><span>·</span>
            <span>{order.customer_email}</span><span>·</span>
            <span>{order.item_count} {order.item_count === 1 ? 'pieza' : 'piezas'}</span>
          </div>
          <div className={styles.heroPills}>
            <span className={`${styles.pill} ${styles[`pill_${order.status_tone || 'muted'}`]}`}>
              {order.status_label || order.status}
            </span>
            {order.payment && (
              <span className={`${styles.pill} ${styles[`pill_${order.payment.status === 'APPROVED' ? 'lime' : 'muted'}`]}`}>
                Pago · {order.payment.status_label}
              </span>
            )}
          </div>
        </div>
        <div className={styles.heroActions}>
          {order.invoice_url && (
            <a href={order.invoice_url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">Factura</Button>
            </a>
          )}
          {order.payment?.status === 'APPROVED' && (
            <Button variant="secondary" size="sm" onClick={() => setShowRefund(true)}>
              Iniciar reembolso
            </Button>
          )}
        </div>
      </header>

      <div className={styles.grid}>
        {/* Estado y transición */}
        <section className={styles.card}>
          <header className={styles.cardHeader}><h2 className={styles.cardTitle}>Estado del pedido</h2></header>
          <div className={styles.timeline}>
            {STATUS_FLOW.map((s, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={s.id} className={styles.tlStep}>
                  <span className={`${styles.tlDot} ${done ? styles.tlDotDone : ''} ${active ? styles.tlDotActive : ''}`} />
                  <span className={`${styles.tlLabel} ${(done || active) ? styles.tlLabelActive : ''}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
          {validNext.length > 0 && (
            <form onSubmit={handleAdvance} className={styles.transitionForm}>
              <MetaTag tone="bronze">Avanzar a</MetaTag>
              <div className={styles.transitionRow}>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">Selecciona…</option>
                  {validNext.map((s) => (
                    <option key={s} value={s}>{s === 'CANCELLED' ? 'Cancelar pedido' : STATUS_FLOW.find(x => x.id === s)?.label || s}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nota interna (opcional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={styles.input}
                />
                <Button type="submit" variant="primary" size="sm" disabled={!nextStatus}>
                  Aplicar cambio
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Items */}
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Items (snapshot inmutable)</h2>
          </header>
          <table className={styles.table}>
            <thead><tr><th>Producto</th><th>SKU</th><th>Cant.</th><th className={styles.right}>Precio unit.</th><th className={styles.right}>Subtotal</th></tr></thead>
            <tbody>
              {(order.items || []).map((it, i) => (
                <tr key={i}>
                  <td>
                    <div>{it.product_name}</div>
                    {it.variant_label && <div className={styles.muted}>{it.variant_label}</div>}
                  </td>
                  <td className={styles.mono}>{it.sku}</td>
                  <td className={styles.mono}>{it.quantity}</td>
                  <td className={styles.right}><Price amount={it.unit_price} size="sm" /></td>
                  <td className={styles.right}><Price amount={it.unit_price * it.quantity} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Dirección + totales lateral */}
        <aside className={styles.side}>
          <div className={styles.card}>
            <header className={styles.cardHeader}><h2 className={styles.cardTitle}>Dirección de envío</h2></header>
            {order.shipping_address ? (
              <address className={styles.addr}>
                <strong>{order.shipping_address.recipient_name}</strong><br/>
                {order.shipping_address.street}<br/>
                {order.shipping_address.colony}, {order.shipping_address.city}<br/>
                {order.shipping_address.zip_code} {order.shipping_address.state}<br/>
                {order.shipping_address.phone}
              </address>
            ) : <div className={styles.muted} style={{ padding: 16 }}>Sin dirección registrada</div>}
          </div>
          <div className={styles.card}>
            <header className={styles.cardHeader}><h2 className={styles.cardTitle}>Totales</h2></header>
            <dl className={styles.totals}>
              <div><dt>Subtotal</dt><dd>${order.subtotal?.toLocaleString('es-MX')}</dd></div>
              {order.voucher_discount > 0 && <div><dt>Voucher</dt><dd>−${order.voucher_discount.toLocaleString('es-MX')}</dd></div>}
              <div><dt>Envío</dt><dd>{order.shipping_cost ? `$${order.shipping_cost.toLocaleString('es-MX')}` : 'Gratis'}</dd></div>
              <div><dt>IVA incluido</dt><dd>${order.tax_included?.toLocaleString('es-MX')}</dd></div>
              <div className={styles.totalsFinal}><dt>Total</dt><dd><Price amount={order.total} size="md" /></dd></div>
            </dl>
          </div>
          {order.status_logs?.length > 0 && (
            <div className={styles.card}>
              <header className={styles.cardHeader}><h2 className={styles.cardTitle}>Historial</h2></header>
              <ul className={styles.logList}>
                {order.status_logs.map((l, i) => (
                  <li key={i}>
                    <div className={styles.logStatus}>{l.status_label || l.status}</div>
                    <div className={styles.logMeta}>
                      {new Date(l.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {l.by_user && <> · {l.by_user}</>}
                    </div>
                    {l.note && <div className={styles.logNote}>"{l.note}"</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {showCancel && (
        <div className={styles.modalBackdrop} onClick={() => setShowCancel(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Cancelar este pedido</h3>
            <p className={styles.modalLead}>
              Esta acción es irreversible. El cliente recibirá un correo automático.
            </p>
            <textarea
              placeholder="Motivo de la cancelación (visible para el cliente)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className={styles.modalTextarea}
              rows={3}
              required
            />
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setShowCancel(false)}>Volver</Button>
              <Button variant="vino" onClick={handleCancel} disabled={!cancelReason.trim()}>
                Cancelar pedido
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRefund && (
        <RefundModal
          payment={order.payment}
          orderNumber={order_number}
          onClose={() => setShowRefund(false)}
        />
      )}
    </div>
  );
}
