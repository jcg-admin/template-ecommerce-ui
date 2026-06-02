/**
 * OrderDetailPage — Práctica Yorùbà
 * Detalle de un pedido con timeline + items + dirección + totales.
 *
 * Endpoints:
 *   GET /{order_number}/
 *   POST /{order_number}/cancel/
 *   POST /payments/{n}/refund/
 */

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, Navigate } from 'react-router-dom';
import { fetchOrderDetail } from '@redux/slices/ordersSlice';
import { reportShippingIssue } from '@redux/slices/logisticsSlice';
import { MetaTag, Price, Button, SumRow } from '@components/common/primitives';
import PdfViewer from '@components/common/PdfViewer';
import { invoicePdfUrl } from '@utils/generateInvoicePdf';
import styles from './OrderDetailPage.module.scss';

const TIMELINE_STEPS = [
  { id: 'PENDING',        t: 'Pedido confirmado',  detail: 'Pago aprobado' },
  { id: 'PROCESSING',     t: 'Procesando pago',    detail: 'Gateway confirmó el cargo' },
  { id: 'IN_PREPARATION', t: 'En preparación',     detail: 'Empacado y sellado' },
  { id: 'SHIPPED',        t: 'Enviado',            detail: 'Con DHL' },
  { id: 'IN_DELIVERY',    t: 'En reparto',         detail: 'Día de la entrega' },
  { id: 'DELIVERED',      t: 'Entregado',          detail: '' },
];

const STATUS_ORDER = TIMELINE_STEPS.map(s => s.id);

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const order = useSelector((s) => s.orders?.current);
  const isLoading = useSelector((s) => s.orders?.isLoading);

  useEffect(() => { dispatch(fetchOrderDetail(id)); }, [dispatch, id]);

  if (isLoading || (!order && id)) {
    return <main className={styles.loading}>Cargando pedido…</main>;
  }
  if (!order) {
    return <Navigate to="/account/orders" replace />;
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to="/account">Mi cuenta</Link><span>/</span>
          <Link to="/account/orders">Mis pedidos</Link><span>/</span>
          <span className={styles.bcCurrent}>{order.order_number}</span>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div>
            <div className={styles.heroMeta}>
              <MetaTag tone="bronze">Pedido · {new Date(order.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</MetaTag>
              <span>·</span>
              <MetaTag tone="coral">{order.status_label || order.status}</MetaTag>
            </div>
            <h1 className={styles.heroTitle}>{order.order_number}</h1>
            {order.eta && (
              <p className={styles.heroEta}>
                Entrega estimada: <strong>{order.eta}</strong>
              </p>
            )}
          </div>
          <div className={styles.heroActions}>
            {order.invoice_url && (
              <a href={order.invoice_url} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">Descargar factura</Button>
              </a>
            )}
            {order.tracking_url && (
              <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm">Rastrear ↗</Button>
              </a>
            )}
          </div>
        </header>

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <Timeline order={order} currentIndex={currentStatusIndex} />
            <ItemsBlock items={order.items || []} />
            <AddressBlock address={order.shipping_address} />
            <InvoiceBlock order={order} />
          </div>

          <aside className={styles.sideCol}>
            <TotalsCard order={order} />
            <PaymentCard payment={order.payment} />
            <SupportCard order={order} dispatch={dispatch} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Timeline({ order, currentIndex }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Seguimiento del envío</h2>
      <div className={styles.timeline}>
        <div className={styles.timelineRail} />
        {TIMELINE_STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const log = (order.status_logs || []).find(l => l.status === step.id);
          return (
            <div key={step.id} className={styles.timelineRow}>
              <div className={`${styles.timelineDot} ${done ? styles.timelineDotDone : ''} ${active ? styles.timelineDotActive : ''}`} />
              <div>
                <div className={`${styles.timelineTitle} ${(done || active) ? styles.timelineTitleActive : ''}`}>
                  {step.t}
                </div>
                {step.detail && <div className={styles.timelineDetail}>{step.detail}</div>}
              </div>
              <div className={styles.timelineWhen}>
                {log ? new Date(log.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : 'pendiente'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ItemsBlock({ items }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Piezas en este pedido</h2>
      <div className={styles.itemsList}>
        {items.map((it, i) => (
          <div key={it.id ?? it.product_id ?? i} className={styles.itemRow}>
            <div className={styles.itemThumb}>
              {it.image_url ? <img src={it.image_url} alt={it.product_name} /> : null}
            </div>
            <div className={styles.itemInfo}>
              {it.orisha_name && <MetaTag tone="coral">{it.orisha_name}</MetaTag>}
              <div className={styles.itemName}>{it.product_name}</div>
              <div className={styles.itemSku}>
                SKU · {it.sku} · Cantidad {it.quantity}
                {it.variant_label && <> · {it.variant_label}</>}
              </div>
            </div>
            <Price amount={it.unit_price * it.quantity} size="md" />
          </div>
        ))}
      </div>
    </section>
  );
}

function InvoiceBlock({ order }) {
  // UC-ORD-PDF: factura estatica (asset mock en DEMO via order.invoice_url).
  // UC-ORD-PDFGEN: ademas se puede GENERAR la factura en el cliente desde los
  // datos del pedido (jsPDF) y verla en el mismo visor.
  const [pdfUrl, setPdfUrl] = useState(order.invoice_url || null);
  const generatedRef = useRef(null);

  const revoke = (url) => {
    if (url && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
  };

  const handleGenerate = () => {
    revoke(generatedRef.current);
    const url = invoicePdfUrl(order);
    generatedRef.current = url;
    setPdfUrl(url);
  };

  useEffect(() => () => revoke(generatedRef.current), []);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Factura</h2>
      <Button variant="secondary" size="sm" onClick={handleGenerate}>
        Generar factura en PDF
      </Button>
      {pdfUrl && (
        <PdfViewer url={pdfUrl} title={`Factura ${order.order_number}`} height={480} />
      )}
    </section>
  );
}

function AddressBlock({ address }) {
  if (!address) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Dirección de entrega</h2>
      <div className={styles.addressBox}>
        <div>
          <MetaTag tone="bronze">Recibirá</MetaTag>
          <address className={styles.addressLines}>
            <strong>{address.recipient_name}</strong><br />
            {address.street}<br />
            {address.colony}, {address.city}<br />
            {address.zip_code} {address.state}, {address.country}<br />
            {address.phone}
          </address>
        </div>
        {address.notes && (
          <div>
            <MetaTag tone="bronze">Notas para el repartidor</MetaTag>
            <p className={styles.addressNotes}>"{address.notes}"</p>
            <div className={styles.addressFootnote}>
              Esta dirección es un snapshot inmutable del pedido
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TotalsCard({ order }) {
  return (
    <div className={styles.sideCard}>
      <h3 className={styles.sideCardTitle}>Total cobrado</h3>
      <SumRow label={`Subtotal · ${order.item_count} piezas`} value={`$${order.subtotal?.toLocaleString('es-MX')} MXN`} />
      {order.voucher_code && (
        <SumRow label={`Voucher ${order.voucher_code}`} value={`−$${order.voucher_discount?.toLocaleString('es-MX')} MXN`} tone="lime" />
      )}
      <SumRow label="Envío" value={order.shipping_cost > 0 ? `$${order.shipping_cost.toLocaleString('es-MX')} MXN` : 'Gratis'} tone={order.shipping_cost > 0 ? 'default' : 'lime'} />
      <SumRow label="IVA incluido" value={`$${order.tax_included?.toLocaleString('es-MX')} MXN`} muted />
      <div className={styles.sideCardTotal}>
        <span>Total</span>
        <Price amount={order.total} size="lg" />
      </div>
    </div>
  );
}

function PaymentCard({ payment }) {
  if (!payment) return null;
  return (
    <div className={styles.sideCardOutline}>
      <MetaTag tone="bronze">Forma de pago</MetaTag>
      <div className={styles.paymentMethod}>
        {payment.gateway_label} {payment.card_last4 && `· Tarjeta •••• ${payment.card_last4}`}
      </div>
      <div className={styles.paymentMeta}>
        Cobrado el {new Date(payment.captured_at).toLocaleDateString('es-MX')}
        {payment.installments > 1 && ` · ${payment.installments} cuotas sin intereses`}
      </div>
      <Link to={`/account/orders/${payment.order_number}/payment-history`} className={styles.paymentLink}>
        VER HISTORIAL DE PAGOS →
      </Link>
    </div>
  );
}

function SupportCard({ order, dispatch }) {
  const canRefund = order.status === 'DELIVERED' && !order.refund_requested;
  // UC-LOG-07 — reportar problema de envío
  const [showIssue, setShowIssue] = useState(false);
  const [issueMsg, setIssueMsg] = useState('');
  const [issueSent, setIssueSent] = useState(false);

  const handleReport = async (e) => {
    e.preventDefault();
    if (!issueMsg.trim()) return;
    await dispatch(reportShippingIssue({ orderNumber: order.order_number, message: issueMsg.trim() }));
    setIssueSent(true);
    setShowIssue(false);
    setIssueMsg('');
  };

  return (
    <div className={styles.sideCardOutline}>
      <MetaTag tone="bronze">¿Hay algo con tu pedido?</MetaTag>
      <p className={styles.supportText}>
        Si necesitas ayuda con esta entrega o quieres solicitar reembolso, podemos atenderte.
      </p>
      <div className={styles.supportActions}>
        <Button variant="secondary" block size="sm">Solicitar ayuda</Button>
        <Button variant="secondary" block size="sm" onClick={() => setShowIssue(true)}>
          Reportar problema de envío
        </Button>
        {canRefund && (
          <Button variant="ghost" block size="sm">Solicitar reembolso</Button>
        )}
      </div>
      {issueSent && (
        <p className={styles.supportText}>Recibimos tu reporte. Te contactaremos pronto.</p>
      )}

      {showIssue && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1050, display: 'grid', placeItems: 'center', padding: 16 }}
          onClick={() => setShowIssue(false)}
        >
          <div
            style={{ background: 'var(--c-base-2, #161D04)', border: '1px solid rgba(245,247,238,0.14)', maxWidth: 520, width: '100%', padding: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 14 }}>Reportar problema de envío</h3>
            <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <textarea
                aria-label="Describe el problema de envío"
                placeholder="Describe qué pasó con tu envío"
                value={issueMsg}
                onChange={(e) => setIssueMsg(e.target.value)}
                rows={4}
                required
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button type="button" variant="ghost" onClick={() => setShowIssue(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" disabled={!issueMsg.trim()}>Enviar reporte</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
