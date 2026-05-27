/**
 * OrderEditPage — Práctica Yorùbà
 * Permite editar dirección y método de envío de un pedido antes de SHIPPED.
 *
 * Endpoints:
 *   GET   /<order_number>/
 *   PATCH /<order_number>/address/
 *   PATCH /<order_number>/shipping/
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchOrderDetail, updateOrderAddress, updateOrderShipping,
} from '@redux/slices/ordersSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import styles from './OrderEditPage.module.scss';

const EDITABLE_STATUSES = ['PENDING', 'PROCESSING', 'IN_PREPARATION'];

const SHIPPING_OPTIONS = [
  { id: 'std',    t: 'Estándar resguardado', sub: 'DHL · 2 a 4 días hábiles',           price: 'Sin costo' },
  { id: 'exp',    t: 'Expedito · 24 horas',  sub: 'DHL Express · solo CDMX y zona metro', price: '$280 MXN' },
  { id: 'pickup', t: 'Recoger en tienda',    sub: 'Punto de recogida · L-V 10-19',      price: 'Sin costo' },
];

export default function OrderEditPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((s) => s.orders?.current);
  const isLoading = useSelector((s) => s.orders?.isLoadingDetail);

  const [tab, setTab] = useState('address');
  const [address, setAddress] = useState({});
  const [shipping, setShipping] = useState('std');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { dispatch(fetchOrderDetail(id)); }, [dispatch, id]);
  useEffect(() => {
    if (order) {
      setAddress(order.shipping_address || {});
      setShipping(order.shipping_method?.id || 'std');
    }
  }, [order]);

  if (isLoading || !order) {
    return <div className={styles.loading}>Cargando pedido…</div>;
  }

  if (!EDITABLE_STATUSES.includes(order.status)) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.lockedBox}>
            <MetaTag tone="vino">No editable</MetaTag>
            <h1 className={styles.title} style={{ marginTop: 16 }}>
              Este pedido ya no se puede editar
            </h1>
            <p className={styles.lead}>
              Solo es posible cambiar dirección o envío antes de que el pedido salga
              del almacén. Tu pedido está actualmente en estado{' '}
              <strong>{order.status_label || order.status}</strong>.
            </p>
            <div style={{ marginTop: 24 }}>
              <Link to={`/account/orders/${id}`}>
                <Button variant="primary">Ver detalle del pedido</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const set = (k) => (e) => setAddress({ ...address, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (tab === 'address') {
        await dispatch(updateOrderAddress({ orderNumber: id, address })).unwrap();
      } else {
        await dispatch(updateOrderShipping({ orderNumber: id, shipping_method: shipping })).unwrap();
      }
      navigate(`/account/orders/${id}`);
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el cambio.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to="/account">Mi cuenta</Link><span>/</span>
          <Link to="/account/orders">Mis pedidos</Link><span>/</span>
          <Link to={`/account/orders/${id}`}>{id}</Link><span>/</span>
          <span className={styles.bcCurrent}>Editar</span>
        </nav>

        <header className={styles.header}>
          <MetaTag tone="bronze">Pedido {id} · {order.status_label || order.status}</MetaTag>
          <h1 className={styles.title}>Editar pedido</h1>
          <p className={styles.lead}>
            Puedes cambiar la dirección de envío o el método mientras el pedido no haya salido del almacén.
          </p>
        </header>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'address' ? styles.tabActive : ''}`}
            onClick={() => setTab('address')}
          >Dirección de envío</button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'shipping' ? styles.tabActive : ''}`}
            onClick={() => setTab('shipping')}
          >Método de envío</button>
        </div>

        <form className={styles.form} onSubmit={handleSave}>
          {tab === 'address' && (
            <div className={styles.formGroup}>
              <div className={styles.row2}>
                <Field label="Nombre completo" value={address.recipient_name} onChange={set('recipient_name')} required />
                <Field label="Teléfono" value={address.phone} onChange={set('phone')} required />
              </div>
              <Field label="Calle y número" value={address.street} onChange={set('street')} required />
              <div className={styles.row3}>
                <Field label="Colonia" value={address.colony} onChange={set('colony')} required />
                <Field label="C.P." value={address.zip_code} onChange={set('zip_code')} required />
                <Field label="Ciudad" value={address.city} onChange={set('city')} required />
              </div>
              <div className={styles.row2}>
                <Field label="Estado" value={address.state} onChange={set('state')} required />
                <Field label="País" value={address.country || 'México'} onChange={set('country')} />
              </div>
              <Field label="Referencias (opcional)" value={address.notes} onChange={set('notes')} textarea />
            </div>
          )}

          {tab === 'shipping' && (
            <div className={styles.formGroup}>
              {SHIPPING_OPTIONS.map((o) => {
                const active = shipping === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setShipping(o.id)}
                    className={`${styles.optionCard} ${active ? styles.optionCardActive : ''}`}
                  >
                    <span className={`${styles.radio} ${active ? styles.radioActive : ''}`} />
                    <div className={styles.optionInfo}>
                      <div className={styles.optionT}>{o.t}</div>
                      <div className={styles.optionSub}>{o.sub}</div>
                    </div>
                    <div className={styles.optionPrice}>{o.price}</div>
                  </button>
                );
              })}
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            <Link to={`/account/orders/${id}`}>
              <Button type="button" variant="ghost">Cancelar</Button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
