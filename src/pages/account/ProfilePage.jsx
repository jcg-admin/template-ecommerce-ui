/**
 * ProfilePage — e-comerce-ui
 * Ver y editar el perfil del comprador (UC-AUTH-05 y UC-AUTH-06).
 *
 * Tras T-017 de `revisar-arquitectura-de-mocks` el componente despacha
 * siempre los thunks reales `fetchProfile` y `updateProfile`. Cuando
 * `PROFILE_SOURCE=mock` (el default) MSW intercepta a nivel de red
 * via `/api/v1/auth/profile/` (GET/PATCH); cuando es `real`, la
 * request sale al backend.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from '@redux/slices/authSlice';
import { selectUser, selectAuthLoading } from '@redux/selectors';
import styles from './ProfilePage.module.scss';

const IS_MOCK_MODE = process.env.PROFILE_SOURCE === 'mock';

function CompletenessBar({ value }) {
  const color = value === 100 ? '#5a9e5a' : value >= 60 ? '#B8860B' : '#c0392b';
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>
        Completitud del perfil: <strong>{value}%</strong>
      </p>
      <div style={{ height: 8, background: '#e9e5e0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color,
                      borderRadius: 4, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const dispatch  = useDispatch();
  const user      = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);

  const [editing, setEditing]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [fields, setFields]       = useState({
    first_name: '', last_name: '', phone: '',
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFields({
        first_name: user.first_name || '',
        last_name:  user.last_name  || '',
        phone:      user.phone      || '',
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    const result = await dispatch(updateProfile(fields));
    if (updateProfile.fulfilled.match(result)) {
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (isLoading && !user) return <div className={styles.page}><p>Cargando perfil...</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Mi perfil</h1>

        {user && (
          <CompletenessBar value={user.profile_completeness ?? 0} />
        )}

        {success && (
          <p className={styles.successMsg} role="status">
            Perfil actualizado correctamente.
          </p>
        )}

        {editing ? (
          <div className={styles.form}>
            <div className={styles.field}>
              <label>Nombre</label>
              <input name="first_name" value={fields.first_name} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Apellido</label>
              <input name="last_name" value={fields.last_name} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Telefono</label>
              <input name="phone" type="tel" value={fields.phone} onChange={handleChange} />
            </div>
            <div className={styles.actions}>
              <button onClick={handleSave} className={styles.primaryBtn}>
                Guardar cambios
              </button>
              <button onClick={() => setEditing(false)} className={styles.secondaryBtn}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.info}>
            <Row label="Usuario"  value={user?.username} />
            <Row label="Email"    value={user?.email} />
            <Row label="Nombre"   value={user?.first_name || '—'} />
            <Row label="Apellido" value={user?.last_name  || '—'} />
            <Row label="Telefono" value={user?.phone      || '—'} />
            {user?.pending_fields?.length > 0 && (
              <p className={styles.pending}>
                Completa tu perfil: {user.pending_fields.join(', ')}
              </p>
            )}
            <button onClick={() => setEditing(true)} className={styles.primaryBtn}>
              Editar perfil
            </button>
          </div>
        )}

        {IS_MOCK_MODE && (
          <p className={styles.mockBadge}>Modo mock activo (PROFILE_SOURCE=mock)</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}
