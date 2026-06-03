/**
 * AdminStaticPageEditorPage — Práctica Yorùbà
 * Editor de página estática con historial de versiones.
 *
 * Endpoints reales (apps.static_content, UC-CFG-04):
 *   GET   /api/v1/admin/static-content/<slug>/   (pagina + versions[] anidadas)
 *   PATCH /api/v1/admin/static-content/<slug>/   (edita: bumpea version)
 *
 * No existe distincion borrador/publicado ni endpoints de publish/restore:
 * cada PATCH persiste y crea una StaticContentVersion. Las versiones se leen
 * del campo `versions[]` del detail serializer (read-only).
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchAdminPage, savePageDraft,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import RichTextEditor from '@components/common/RichTextEditor';
import ConfirmModal from '@components/shared/ConfirmModal/ConfirmModal';
import styles from './AdminStaticPageEditorPage.module.scss';

export default function AdminStaticPageEditorPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(null);
  const page = useSelector((s) => s.admin?.currentPage);
  const versions = useSelector((s) => s.admin?.pageVersions || []);
  const isLoading = useSelector((s) => s.admin?.isLoadingPages);

  const [form, setForm] = useState({ title: '', body: '' });
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState('');

  // El detail serializer trae la pagina + sus versiones anidadas en una sola
  // respuesta; no hay endpoint separado de versions/.
  useEffect(() => { dispatch(fetchAdminPage(slug)); }, [dispatch, slug]);
  useEffect(() => {
    if (page) setForm({
      title: page.title || '',
      body: page.body || '',
    });
  }, [page]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(savePageDraft({ slug, data: form })).unwrap();
      setSavedToast('Cambios guardados');
      setTimeout(() => setSavedToast(''), 2500);
    } finally { setSaving(false); }
  };

  if (isLoading) return <div className={styles.loading}>Cargando…</div>;

  const preview = activeVersionId
    ? versions.find(v => v.id === activeVersionId)?.body || ''
    : form.body;

  return (
    <>
      <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <Link to="/admin/pages">Páginas</Link><span>/</span>
        <span className={styles.bcCurrent}>{form.title || slug}</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">
            /info/{slug} · v{page?.version || 1}
          </MetaTag>
          <h1 className={styles.title}>{form.title || 'Sin título'}</h1>
        </div>
        <div className={styles.headerActions}>
          {savedToast && <span className={styles.toast}>{savedToast}</span>}
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.editor}>
          <Field label="Título de la página" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

          <label className={styles.contentLabel}>Contenido (HTML)</label>
          <RichTextEditor
            value={form.body ?? ''}
            onChange={(html) => setForm({ ...form, body: html })}
            ariaLabel="Contenido de la página"
            placeholder="Escribe el contenido aquí. Acepta texto enriquecido (negrita, cursiva, listas, enlaces)."
          />

          <div className={styles.previewBox}>
            <div className={styles.previewLabel}>
              Vista previa {activeVersionId && '(versión histórica)'}
            </div>
            <div
              className={styles.previewContent}
              dangerouslySetInnerHTML={{ __html: preview || '<em>Sin contenido</em>' }}
            />
          </div>
        </section>

        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Historial de versiones</h3>
          {versions.length === 0 && <div className={styles.empty}>Sin versiones previas</div>}
          <ul className={styles.versionList}>
            {versions.map((v) => (
              <li
                key={v.id}
                className={`${styles.versionItem} ${activeVersionId === v.id ? styles.versionActive : ''}`}
              >
                <button
                  type="button"
                  className={styles.versionMain}
                  onClick={() => setActiveVersionId(activeVersionId === v.id ? null : v.id)}
                >
                  <div className={styles.versionLabel}>
                    v{v.version} {v.version === page?.version && <span className={styles.currentBadge}>actual</span>}
                  </div>
                  <div className={styles.versionMeta}>
                    {new Date(v.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} · {v.changed_by_username || '—'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
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
