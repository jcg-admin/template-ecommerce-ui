/**
 * AdminUsersPage — Práctica Yorùbà (re-skin)
 * Tabla de usuarios con filtros + búsqueda + creación + edición.
 * Reusa los estilos compartidos de AdminTablePage.module.scss.
 *
 * Mantén tu lógica Redux existente; solo cambia la presentación.
 */

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAdminUsers } from '@redux/slices/adminSlice';
import { MetaTag, Button } from '@components/common/primitives';
import DataGrid from '@components/common/DataGrid';
import styles from './AdminTablePage.module.scss';

const ROLE_FILTERS = [
  { id: 'all',      label: 'Todos' },
  { id: 'customer', label: 'Compradores' },
  { id: 'admin',    label: 'Administradores' },
  { id: 'staff',    label: 'Staff' },
];

const STATUS_FILTERS = [
  { id: 'active',     label: 'Activos' },
  { id: 'unverified', label: 'Sin verificar' },
  { id: 'inactive',   label: 'Inactivos' },
];

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('active');
  const search = '';
  const users = useSelector((s) => s.admin?.users || []);
  const isLoading = useSelector((s) => s.admin?.isLoading);

  useEffect(() => {
    dispatch(fetchAdminUsers({ role, status, search }));
  }, [dispatch, role, status, search]);

  // Columnas del DataGrid. Las columnas con texto plano (correo, rol, estado,
  // pedidos, actividad) se marcan sortable para que el orden/filtro nativos del
  // grid operen sobre valores comparables. Las celdas con JSX (avatar, nombre
  // con enlace, acción) se quedan sin sortable.
  const columns = useMemo(
    () => [
      { key: 'avatar', label: '' },
      { key: 'name', label: 'Usuario', sortable: true },
      { key: 'email', label: 'Correo', sortable: true },
      { key: 'roleLabel', label: 'Rol', sortable: true },
      { key: 'statusLabel', label: 'Estado', sortable: true },
      { key: 'order_count', label: 'Pedidos', sortable: true },
      { key: 'lastActivity', label: 'Última actividad', sortable: true },
      { key: 'actions', label: '' },
    ],
    [],
  );

  // Filas del DataGrid: cada columna sortable recibe un valor de texto/numérico
  // comparable; las celdas presentacionales reciben nodos JSX.
  const gridRows = useMemo(
    () =>
      users.map((u) => {
        const roleLabel = u.is_admin ? 'Admin' : u.is_staff ? 'Staff' : 'Comprador';
        const statusLabel = !u.is_active
          ? 'Inactivo'
          : !u.email_verified
            ? 'Sin verificar'
            : 'Activo';
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        return {
          id: u.id,
          name: fullName || u.username || '',
          email: u.email,
          roleLabel,
          statusLabel,
          order_count: u.order_count ?? 0,
          lastActivity: u.last_login
            ? new Date(u.last_login).toLocaleDateString('es-MX')
            : '—',
          avatar: (
            <div className={styles.avatarSm}>
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" />
              ) : (
                <span>{(u.first_name?.[0] || '') + (u.last_name?.[0] || '')}</span>
              )}
            </div>
          ),
          actions: (
            <Link to={`/admin/users/${u.id}`} className={styles.actionBtn} title="Ver">
              Ver →
            </Link>
          ),
        };
      }),
    [users],
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Comunidad · {users.length} usuarios</MetaTag>
          <h1 className={styles.title}>Usuarios</h1>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary">Exportar CSV</Button>
          <Button variant="primary">+ Nuevo admin</Button>
        </div>
      </header>

      <div className={styles.toolbar} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className={styles.filters}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--c-ink-mute)', letterSpacing: '0.12em', paddingTop: 8, marginRight: 8 }}>ROL:</span>
          {ROLE_FILTERS.map((r) => (
            <button
              key={r.id}
              className={`${styles.filterBtn} ${role === r.id ? styles.filterBtnActive : ''}`}
              onClick={() => setRole(r.id)}
            >{r.label}</button>
          ))}
        </div>
        <div className={styles.filters}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--c-ink-mute)', letterSpacing: '0.12em', paddingTop: 8, marginRight: 8 }}>ESTADO:</span>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              className={`${styles.filterBtn} ${status === s.id ? styles.filterBtnActive : ''}`}
              onClick={() => setStatus(s.id)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        {isLoading ? (
          <p className={styles.loading}>Cargando usuarios…</p>
        ) : (
          <DataGrid
            columns={columns}
            rows={gridRows}
            pageSize={10}
            filterable
            getRowKey={(r) => r.id}
            emptyText="Sin usuarios que coincidan"
            ariaLabel="Listado de usuarios"
          />
        )}
      </div>
    </div>
  );
}
