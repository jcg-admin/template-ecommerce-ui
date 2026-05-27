/**
 * AdminShippingMethodsPage — Práctica Yorùbà
 * CRUD de métodos de envío.
 *
 * Endpoints:
 *   GET / POST   /admin/shipping-methods/
 *   PATCH / DELETE /admin/shipping-methods/<id>/
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchShippingMethods, createShippingMethod, updateShippingMethod, deleteShippingMethod,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import styles from './AdminTablePage.module.scss';

export default function AdminShippingMethodsPage() {
  const dispatch = useDispatch();
  const methods = useSelector((s) => s.admin?.shippingMethods || []);
  const isLoading = useSelector((s) => s.admin?.isLoadingShipping);
  const [editing, setEditing] = useState(null);

  useEffect(() => { dispatch(fetchShippingMethods()); }, [dispatch]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Configuración · {methods.length} métodos</MetaTag>
          <h1 className={styles.title}>Métodos de envío</h1>
        </div>
        <Button variant="primary" onClick={() => setEditing({})}>+ Nuevo método</Button>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Carrier</th>
              <th>Costo base</th>
              <th>Umbral gratis</th>
              <th>Días</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className={styles.loading}>Cargando…</td></tr>}
            {!isLoading && methods.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>Sin métodos configurados. Crea el primero.</td></tr>
            )}
            {!isLoading && methods.map((m) => (
              <tr key={m.id}>
                <td><span className={styles.itemName}>{m.name}</span></td>
                <td className={styles.mono}>{m.carrier}</td>
                <td className={styles.mono}>${m.base_cost?.toLocaleString('es-MX') || 0}</td>
                <td className={styles.mono}>
                  {m.free_threshold ? `$${m.free_threshold.toLocaleString('es-MX')}` : '—'}
                </td>
                <td className={styles.mono}>{m.delivery_days_min}–{m.delivery_days_max}</td>
                <td>
                  <span className={`${styles.statusPill} ${styles[`pill_${m.is_active ? 'lime' : 'muted'}`]}`}>
                    {m.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => setEditing(m)} title="Editar">✎</button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionDelete}`}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar "${m.name}"?`)) dispatch(deleteShippingMethod(m.id));
                    }}
                    title="Eliminar"
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <MethodModal
          method={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            if (editing.id) await dispatch(updateShippingMethod({ id: editing.id, data }));
            else await dispatch(createShippingMethod(data));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function MethodModal({ method, onClose, onSave }) {
  const [data, setData] = useState({
    name: method.name || '',
    carrier: method.carrier || 'DHL',
    base_cost: method.base_cost || 0,
    free_threshold: method.free_threshold || '',
    delivery_days_min: method.delivery_days_min || 2,
    delivery_days_max: method.delivery_days_max || 4,
    is_active: method.is_active ?? true,
  });
  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setData({ ...data, [k]: v });
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1050, display: 'grid', placeItems: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--c-base-2, #161D04)', border: '1px solid rgba(245,247,238,0.14)', maxWidth: 520, width: '100%', padding: 28 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: 'var(--c-ink, #F5F7EE)', marginBottom: 18 }}>
          {method.id ? 'Editar método de envío' : 'Nuevo método de envío'}
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nombre" value={data.name} onChange={set('name')} required placeholder="Ej. Estándar resguardado" />
          <Field label="Carrier" value={data.carrier} onChange={set('carrier')} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Costo base (MXN)" type="number" value={data.base_cost} onChange={set('base_cost')} required />
            <Field label="Umbral envío gratis" type="number" value={data.free_threshold} onChange={set('free_threshold')} hint="Vacío = no aplica" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Días mínimos" type="number" value={data.delivery_days_min} onChange={set('delivery_days_min')} required />
            <Field label="Días máximos" type="number" value={data.delivery_days_max} onChange={set('delivery_days_max')} required />
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--c-ink-dim, #B8B7A5)', fontSize: 14, cursor: 'pointer', marginTop: 6 }}>
            <input type="checkbox" checked={data.is_active} onChange={set('is_active')} />
            <span>Disponible para clientes</span>
          </label>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary">{method.id ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
