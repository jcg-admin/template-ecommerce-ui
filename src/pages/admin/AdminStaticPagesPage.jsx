/**
 * AdminStaticPagesPage — Práctica Yorùbà
 * Listado de páginas estáticas (about, terms, privacy, returns, faq…)
 *
 * Endpoints:
 *   GET /admin/pages/
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAdminPages } from '@redux/slices/adminSlice';
import { MetaTag, Button } from '@components/common/primitives';
import styles from './AdminTablePage.module.scss';

export default function AdminStaticPagesPage() {
  const dispatch = useDispatch();
  const pages = useSelector((s) => s.admin?.staticPages || []);
  const isLoading = useSelector((s) => s.admin?.isLoadingPages);

  useEffect(() => { dispatch(fetchAdminPages()); }, [dispatch]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Contenido · {pages.length} páginas</MetaTag>
          <h1 className={styles.title}>Páginas estáticas</h1>
        </div>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Slug (URL)</th>
              <th>Versión</th>
              <th>Última publicación</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className={styles.loading}>Cargando páginas…</td></tr>}
            {!isLoading && pages.length === 0 && (
              <tr><td colSpan={6} className={styles.empty}>Sin páginas registradas</td></tr>
            )}
            {!isLoading && pages.map((p) => (
              <tr key={p.slug}>
                <td>
                  <Link to={`/admin/pages/${p.slug}`} className={styles.itemName}>
                    {p.title}
                  </Link>
                </td>
                <td className={styles.mono}>/info/{p.slug}</td>
                <td className={styles.mono}>v{p.version}</td>
                <td className={styles.mono}>
                  {p.last_published_at
                    ? new Date(p.last_published_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </td>
                <td>
                  <span className={`${styles.statusPill} ${styles[`pill_${p.status === 'published' ? 'lime' : p.status === 'draft' ? 'bronze' : 'muted'}`]}`}>
                    {p.status === 'published' ? 'Publicada' : p.status === 'draft' ? 'Borrador' : 'Sin publicar'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <Link to={`/admin/pages/${p.slug}`} className={styles.actionBtn} title="Editar">→</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
