/**
 * AdminSystemSettingsPage — UC-ADM-04
 *
 * Formulario de configuracion del sistema (settings_app).
 *
 *   GET   /api/v1/admin/settings/
 *   PATCH /api/v1/admin/settings/
 *
 * Los campos expuestos son ortogonales: el admin edita lo que necesita
 * y se envia solo el delta via PATCH.
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSystemSettings, SYSTEM_SETTINGS_KEY,
} from '@hooks/domain/useSystemSettings';
import {
  updateSettings, clearSettingsActionState,
} from '@redux/slices/settingsSlice';
import { Button } from '@components/common/primitives';
import styles from './AdminSystemSettingsPage.module.scss';

// Campos alineados al AdminSiteSettingsSerializer real
// (api: apps/settings_app/serializers.py). UC-ADM-04 / UC-CFG-03 / UC-CFG-05.
const FIELDS = [
  { key: 'site_name',               label: 'Nombre del sitio',          type: 'text' },
  { key: 'currency',                label: 'Moneda',                    type: 'text' },
  { key: 'iva_rate',                label: 'Tasa de IVA (%)',           type: 'number' },
  { key: 'free_shipping_threshold', label: 'Umbral de envio gratis',    type: 'number' },
  { key: 'min_stock_threshold',     label: 'Umbral de stock minimo',    type: 'number' },
  { key: 'payment_timeout_minutes', label: 'Timeout de pago (min)',     type: 'number' },
  { key: 'order_timeout_minutes',   label: 'Timeout de orden (min)',    type: 'number' },
  { key: 'max_return_days',         label: 'Dias maximos de devolucion', type: 'number' },
  // UC-CFG-05 — datos de contacto (sub-contrato de SiteSettings)
  { key: 'support_email',           label: 'Email de soporte',          type: 'email' },
  { key: 'phone',                   label: 'Telefono de soporte',       type: 'tel' },
  { key: 'address',                 label: 'Direccion del negocio',     type: 'text' },
];

export default function AdminSystemSettingsPage() {
  const dispatch    = useDispatch();
  const queryClient = useQueryClient();
  const { isActioning, actionError, lastAction } = useSelector((s) => s.settings);
  const { data, isLoading, isError } = useSystemSettings();

  const [form, setForm] = useState({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked
            : type === 'number'   ? (value === '' ? '' : Number(value))
            : value,
    }));
  };

  // UC-CFG-05 — redes sociales (social_links es un dict anidado)
  const handleSocial = (platform) => (e) => {
    const { value } = e.target;
    setForm((p) => ({ ...p, social_links: { ...(p.social_links || {}), [platform]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateSettings(form));
    if (updateSettings.fulfilled.match(result)) {
      dispatch(clearSettingsActionState());
      queryClient.invalidateQueries({ queryKey: SYSTEM_SETTINGS_KEY });
    }
  };

  if (isLoading) return <p>Cargando configuracion…</p>;
  if (isError)   return <p role="alert">No se pudo cargar la configuracion.</p>;

  return (
    <section className={styles.page} aria-labelledby="settings-title">
      <header className={styles.header}>
        <h1 id="settings-title" className={styles.title}>
          Configuracion del Sistema
        </h1>
        <p className={styles.subtitle}>
          Ajustes globales del sitio.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {FIELDS.map((f) => (
          <div key={f.key} className={styles.field}>
            <label htmlFor={`set-${f.key}`}>{f.label}</label>
            {f.type === 'checkbox' ? (
              <input
                id={`set-${f.key}`}
                name={f.key}
                type="checkbox"
                checked={Boolean(form[f.key])}
                onChange={handleChange}
              />
            ) : (
              <input
                id={`set-${f.key}`}
                name={f.key}
                type={f.type}
                value={form[f.key] ?? ''}
                onChange={handleChange}
              />
            )}
          </div>
        ))}

        {/* UC-CFG-05 — redes sociales */}
        <fieldset className={styles.field}>
          <legend>Redes sociales</legend>
          {['facebook', 'instagram', 'youtube'].map((platform) => (
            <div key={platform} className={styles.field}>
              <label htmlFor={`set-social-${platform}`}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </label>
              <input
                id={`set-social-${platform}`}
                name={`social_${platform}`}
                type="url"
                value={form.social_links?.[platform] ?? ''}
                onChange={handleSocial(platform)}
              />
            </div>
          ))}
        </fieldset>

        {actionError && (
          <p role="alert" className={styles.apiError}>
            {actionError.message ?? 'No se pudo guardar la configuracion.'}
          </p>
        )}
        {lastAction === 'updated' && (
          <p role="status" className={styles.success}>
            Configuracion guardada correctamente.
          </p>
        )}

        <div className={styles.actions}>
          <Button type="submit" loading={isActioning}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </section>
  );
}
