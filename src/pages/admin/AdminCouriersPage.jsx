/**
 * AdminCouriersPage — UC-LOG-06
 * CRUD de couriers / paqueterías (admin).
 *
 * Endpoints (logisticsSlice):
 *   GET    /api/v1/admin/couriers/
 *   POST   /api/v1/admin/couriers/
 *   PATCH  /api/v1/admin/couriers/:id/
 *   DELETE /api/v1/admin/couriers/:id/
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCouriers, createCourier, updateCourier, deleteCourier,
} from '@redux/slices/logisticsSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import ConfirmModal from '@components/shared/ConfirmModal/ConfirmModal';
import styles from './AdminTablePage.module.scss';

export default function AdminCouriersPage() {
  const dispatch = useDispatch();
  const couriers = useSelector((s) => s.logistics?.couriers || []);
  const isLoading = useSelector((s) => s.logistics?.isActioning);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => { dispatch(fetchCouriers()); }, [dispatch]);

  return (
    <>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <MetaTag tone="bronze">Logística · {couriers.length} couriers</MetaTag>
            <h1 className={styles.title}>Couriers / paqueterías</h1>
          </div>
          <Button variant="primary" onClick={() => setEditing({})}>+ Nuevo courier</Button>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && couriers.length === 0 && (
                <tr><td colSpan={4} className={styles.loading}>Cargando…</td></tr>
              )}
              {!isLoading && couriers.length === 0 && (
                <tr><td colSpan={4} className={styles.empty}>Sin couriers. Crea el primero.</td></tr>
              )}
              {couriers.map((c) => (
                <tr key={c.id}>
                  <td><span className={styles.itemName}>{c.name}</span></td>
                  <td className={styles.mono}>{c.code}</td>
                  <td>
                    <span className={`${styles.statusPill} ${styles[`pill_${c.is_active ? 'lime' : 'muted'}`]}`}>
                      {c.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => setEditing(c)} title="Editar" aria-label={`Editar ${c.name}`}>✎</button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionDelete}`}
                      onClick={() => setConfirm({ message: `¿Eliminar "${c.name}"?`, action: () => dispatch(deleteCourier(c.id)) })}
                      title="Eliminar"
                      aria-label={`Eliminar ${c.name}`}
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <CourierModal
            courier={editing}
            onClose={() => setEditing(null)}
            onSave={async (data) => {
              if (editing.id) await dispatch(updateCourier({ id: editing.id, data }));
              else await dispatch(createCourier(data));
              setEditing(null);
            }}
          />
        )}
      </div>

      <ConfirmModal
        open={confirm !== null}
        message={confirm?.message ?? ''}
        onConfirm={() => { confirm?.action(); setConfirm(null); }}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

function CourierModal({ courier, onClose, onSave }) {
  const [data, setData] = useState({
    name: courier.name || '',
    code: courier.code || '',
    is_active: courier.is_active ?? true,
  });
  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setData({ ...data, [k]: v });
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1050, display: 'grid', placeItems: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--c-base-2, #161D04)', border: '1px solid rgba(245,247,238,0.14)', maxWidth: 480, width: '100%', padding: 28 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 18 }}>{courier.id ? 'Editar courier' : 'Nuevo courier'}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nombre" value={data.name} onChange={set('name')} required placeholder="Ej. DHL Express" />
          <Field label="Código" value={data.code} onChange={set('code')} required placeholder="Ej. DHL" />
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', marginTop: 6 }}>
            <input type="checkbox" checked={data.is_active} onChange={set('is_active')} />
            <span>Activo</span>
          </label>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary">{courier.id ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
