/**
 * AdminGatewaysPage — Práctica Yorùbà
 * CRUD de pasarelas de pago (Mercado Pago, PayPal).
 * Credenciales se cifran con Fernet en el backend; en frontend solo se editan.
 *
 * Endpoints:
 *   GET / PATCH /admin/gateways/
 *   POST /admin/gateways/<gw>/test/
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchGateways, updateGateway, testGatewayConnection,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import styles from './AdminGatewaysPage.module.scss';

const GATEWAYS = {
  mercadopago: { label: 'Mercado Pago', desc: 'Tarjeta · SPEI · OXXO Pay · cuotas sin intereses', fields: ['public_key', 'access_token', 'webhook_secret'] },
  paypal:      { label: 'PayPal',        desc: 'Cuenta PayPal o tarjeta',                          fields: ['client_id', 'client_secret', 'webhook_id'] },
};

export default function AdminGatewaysPage() {
  const dispatch = useDispatch();
  const gateways = useSelector((s) => s.admin?.gateways || []);
  const [editing, setEditing] = useState(null);
  const [testResult, setTestResult] = useState({});

  useEffect(() => { dispatch(fetchGateways()); }, [dispatch]);

  const handleTest = async (gw) => {
    setTestResult({ ...testResult, [gw]: 'testing' });
    try {
      await dispatch(testGatewayConnection(gw)).unwrap();
      setTestResult({ ...testResult, [gw]: 'ok' });
    } catch {
      setTestResult({ ...testResult, [gw]: 'fail' });
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <span className={styles.bcCurrent}>Pasarelas de pago</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Configuración · Pagos</MetaTag>
          <h1 className={styles.title}>Pasarelas de pago</h1>
          <p className={styles.lead}>
            Credenciales protegidas con cifrado Fernet en el backend. Los campos
            de secreto se muestran enmascarados; solo se actualiza si reescribes.
          </p>
        </div>
      </header>

      <div className={styles.list}>
        {Object.entries(GATEWAYS).map(([key, meta]) => {
          const gw = gateways.find(g => g.code === key) || { code: key, is_active: false };
          const tr = testResult[key];
          return (
            <article key={key} className={styles.card}>
              <header className={styles.cardHeader}>
                <div>
                  <h3 className={styles.gwName}>{meta.label}</h3>
                  <div className={styles.gwDesc}>{meta.desc}</div>
                </div>
                <div className={styles.gwStatus}>
                  <span className={`${styles.statusDot} ${gw.is_active ? styles.statusActive : styles.statusInactive}`} />
                  {gw.is_active ? 'Activa' : 'Inactiva'}
                </div>
              </header>

              <div className={styles.cardBody}>
                <div className={styles.meta}>
                  <div><span className={styles.metaKey}>Modo:</span> <span className={styles.metaVal}>{gw.mode || 'sandbox'}</span></div>
                  <div><span className={styles.metaKey}>Webhook URL:</span> <code className={styles.metaCode}>/api/v1/payments/webhooks/{key}/</code></div>
                  {gw.last_test_at && (
                    <div><span className={styles.metaKey}>Última prueba:</span> <span className={styles.metaVal}>{new Date(gw.last_test_at).toLocaleString('es-MX')}</span></div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <Button variant="secondary" size="sm" onClick={() => handleTest(key)} disabled={tr === 'testing'}>
                    {tr === 'testing' ? 'Probando…' : 'Probar conexión'}
                  </Button>
                  {tr === 'ok' && <span className={styles.testOk}>✓ Conexión correcta</span>}
                  {tr === 'fail' && <span className={styles.testFail}>✕ Error de conexión</span>}
                  <Button variant="primary" size="sm" onClick={() => setEditing({ code: key, meta, ...gw })}>
                    {gw.id ? 'Editar credenciales' : 'Configurar'}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editing && (
        <GatewayEditModal
          gateway={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await dispatch(updateGateway({ code: editing.code, data }));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function GatewayEditModal({ gateway, onClose, onSave }) {
  const [data, setData] = useState({
    is_active: gateway.is_active || false,
    mode: gateway.mode || 'sandbox',
    ...Object.fromEntries(gateway.meta.fields.map(f => [f, ''])),
  });
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Configurar {gateway.meta.label}</h3>
        <p className={styles.modalLead}>
          Deja un campo en blanco si no quieres actualizar ese valor.
          Los secretos se cifran al guardar.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} className={styles.modalForm}>
          <div className={styles.modalRow}>
            <label className={styles.modalLabel}>Modo</label>
            <select value={data.mode} onChange={(e) => setData({ ...data, mode: e.target.value })} className={styles.modalSelect}>
              <option value="sandbox">Sandbox (pruebas)</option>
              <option value="production">Producción</option>
            </select>
          </div>
          {gateway.meta.fields.map((f) => (
            <Field
              key={f}
              label={f.replace(/_/g, ' ').toUpperCase()}
              type="password"
              value={data[f]}
              onChange={(e) => setData({ ...data, [f]: e.target.value })}
              placeholder={gateway[f] ? '•••• (sin cambios)' : 'sin configurar'}
            />
          ))}
          <label className={styles.modalToggle}>
            <input type="checkbox" checked={data.is_active} onChange={(e) => setData({ ...data, is_active: e.target.checked })} />
            <span>Activar esta pasarela para el storefront</span>
          </label>
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
