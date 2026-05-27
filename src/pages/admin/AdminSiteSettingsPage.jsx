/**
 * AdminSiteSettingsPage — Práctica Yorùbà
 * Singleton SiteSettings con 4 tabs.
 *
 * Endpoints:
 *   GET / PATCH /admin/settings/
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchSiteSettings, updateSiteSettings } from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import styles from './AdminSiteSettingsPage.module.scss';

const TABS = [
  { id: 'commerce',  label: 'Comercio' },
  { id: 'shipping',  label: 'Envíos' },
  { id: 'returns',   label: 'Devoluciones' },
  { id: 'comms',     label: 'Comunicación' },
];

export default function AdminSiteSettingsPage() {
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.admin?.siteSettings) || {};
  const [tab, setTab] = useState('commerce');
  const [form, setForm] = useState({});
  const [savedToast, setSavedToast] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchSiteSettings()); }, [dispatch]);
  useEffect(() => { if (settings.id) setForm(settings); }, [settings]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [k]: v });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateSiteSettings(form)).unwrap();
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <span className={styles.bcCurrent}>Ajustes del sitio</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Configuración global</MetaTag>
          <h1 className={styles.title}>Ajustes del sitio</h1>
          <p className={styles.lead}>
            Estos valores afectan al storefront y al checkout en tiempo real.
            Cambios sensibles (IVA, moneda) deben coordinarse con contabilidad.
          </p>
        </div>
        <div className={styles.headerActions}>
          {savedToast && <span className={styles.toast}>✓ Guardado</span>}
          <Button form="settings-form" type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </header>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      <form id="settings-form" onSubmit={handleSave} className={styles.form}>
        {tab === 'commerce' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Configuración comercial</h3>
            <div className={styles.row3}>
              <Field label="Moneda (ISO)"        value={form.currency || 'MXN'} onChange={set('currency')} required />
              <Field label="Tasa de IVA (decimal)" type="number" step="0.0001" value={form.vat_rate} onChange={set('vat_rate')} required hint="0.16 = 16%" />
              <Field label="País por defecto (ISO-2)" value={form.country_default || 'MX'} onChange={set('country_default')} />
            </div>
            <Field label="Umbral envío gratis (MXN)" type="number" value={form.free_shipping_threshold} onChange={set('free_shipping_threshold')} hint="0 desactiva envío gratis automático" />
            <Field label="Stock mínimo (umbral de alerta)" type="number" value={form.min_stock_threshold} onChange={set('min_stock_threshold')} />
            <label className={styles.toggle}>
              <input type="checkbox" checked={!!form.public_read_enabled} onChange={set('public_read_enabled')} />
              <span>Permitir que el storefront lea estos ajustes públicamente</span>
            </label>
          </div>
        )}

        {tab === 'shipping' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Envíos</h3>
            <Field label="Método de envío por defecto" value={form.default_shipping_method} onChange={set('default_shipping_method')} hint="ID del método (ver pestaña Envíos → Métodos)" />
            <Field label="Timeout de orden sin pagar (minutos)" type="number" value={form.payment_timeout_minutes} onChange={set('payment_timeout_minutes')} hint="Tras este tiempo, las órdenes PENDING se cancelan automáticamente" />
            <div className={styles.note}>
              <strong>Zonas de envío</strong> — Por ahora solo México. Para soporte multi-país,
              añadir <code>shipping_zones</code> al singleton del backend.
            </div>
          </div>
        )}

        {tab === 'returns' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Política de devoluciones</h3>
            <div className={styles.row2}>
              <Field label="Días para devolver (desde entrega)" type="number" value={form.return_days} onChange={set('return_days')} required />
              <Field label="Días para procesar reembolso" type="number" value={form.refund_processing_days} onChange={set('refund_processing_days')} />
            </div>
            <Field label="Política (texto que verá el cliente)" value={form.return_policy_text} onChange={set('return_policy_text')} textarea />
          </div>
        )}

        {tab === 'comms' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Comunicación con el cliente</h3>
            <div className={styles.row2}>
              <Field label="Correo de soporte" type="email" value={form.support_email} onChange={set('support_email')} />
              <Field label="Teléfono de soporte" value={form.support_phone} onChange={set('support_phone')} />
            </div>
            <Field label="Horario de atención" value={form.support_hours} onChange={set('support_hours')} placeholder="L-V 10:00 — 19:00" />
            <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>Redes sociales</h3>
            <div className={styles.row2}>
              <Field label="Facebook" value={form.facebook_url} onChange={set('facebook_url')} />
              <Field label="Instagram" value={form.instagram_url} onChange={set('instagram_url')} />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
