/**
 * AdminStaticPageEditorPage — Práctica Yorùbà
 * Editor de página estática con versionado.
 *
 * Endpoints:
 *   GET   /admin/pages/<slug>/
 *   PATCH /admin/pages/<slug>/                       (guardar borrador)
 *   POST  /admin/pages/<slug>/publish/
 *   POST  /admin/pages/<slug>/versions/<n>/restore/
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchAdminPage, savePageDraft, publishPage, restorePageVersion,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import ConfirmModal from '@components/shared/ConfirmModal/ConfirmModal';
import styles from './AdminStaticPageEditorPage.module.scss';

export default function AdminStaticPageEditorPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(null);
  const page = useSelector((s) => s.admin?.currentPage);
  const versions = useSelector((s) => s.admin?.pageVersions || []);
  const isLoading = useSelector((s) => s.admin?.isLoadingPages);

  const [form, setForm] = useState({ title: '', content: '', meta_description: '' });
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState('');

  useEffect(() => { dispatch(fetchAdminPage(slug)); }, [dispatch, slug]);
  useEffect(() => {
    if (page) setForm({
      title: page.title || '',
      content: page.draft_content || page.content || '',
      meta_description: page.meta_description || '',
    });
  }, [page]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await dispatch(savePageDraft({ slug, data: form })).unwrap();
      setSavedToast('Borrador guardado');
      setTimeout(() => setSavedToast(''), 2500);
    } finally { setSaving(false); }
  };

  const handlePublish = () => {
    setConfirm({
      message: '¿Publicar esta versión? El contenido será visible públicamente.',
      action:  async () => {
        setSaving(true);
        try {
          await dispatch(publishPage(slug)).unwrap();
          setSavedToast('Publicado ✓');
          setTimeout(() => setSavedToast(''), 2500);
        } finally { setSaving(false); }
      },
    });
  };

  const handleRestore = (versionId) => {
    setConfirm({
      message: `¿Restaurar versión v${versions.find(v => v.id === versionId)?.version}? Se creará un nuevo borrador.`,
      action:  () => { dispatch(restorePageVersion({ slug, versionId })); setActiveVersionId(null); },
    });
  };

  if (isLoading) return <div className={styles.loading}>Cargando…</div>;

  const preview = activeVersionId
    ? versions.find(v => v.id === activeVersionId)?.content || ''
    : form.content;

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
            {page?.has_unsaved_changes && ' · cambios sin guardar'}
          </MetaTag>
          <h1 className={styles.title}>{form.title || 'Sin título'}</h1>
        </div>
        <div className={styles.headerActions}>
          {savedToast && <span className={styles.toast}>{savedToast}</span>}
          <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar borrador'}
          </Button>
          <Button variant="primary" onClick={handlePublish} disabled={saving}>
            Publicar
          </Button>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.editor}>
          <Field label="Título de la página" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Field label="Meta descripción (SEO)" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} textarea hint="Máximo 160 caracteres" />

          <label className={styles.contentLabel}>Contenido (HTML)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className={styles.contentArea}
            spellCheck={false}
            placeholder="<p>Escribe el contenido aquí. Acepta HTML básico (p, h2, h3, ul, li, strong, em, a).</p>"
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
                    v{v.version} {v.is_current && <span className={styles.currentBadge}>actual</span>}
                  </div>
                  <div className={styles.versionMeta}>
                    {new Date(v.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} · {v.by_user}
                  </div>
                  {v.note && <div className={styles.versionNote}>"{v.note}"</div>}
                </button>
                {!v.is_current && (
                  <button
                    type="button"
                    className={styles.restoreBtn}
                    onClick={() => handleRestore(v.id)}
                  >Restaurar</button>
                )}
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
