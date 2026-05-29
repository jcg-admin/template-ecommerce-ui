/**
 * AdminProductDetailPage — Práctica Yorùbà
 * CRUD de producto con 4 tabs: General · Imágenes · Variantes · SEO
 *
 * Endpoints:
 *   GET / PATCH / POST / DELETE  /admin/products/<id>/
 *   POST    /admin/products/<id>/images/
 *   DELETE  /admin/products/<id>/images/<img_id>/
 *   PATCH   /admin/products/<id>/images/reorder/   { order: [id1, id2, ...] }
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchAdminProduct, createProduct, updateProduct, deleteProduct,
  uploadProductImage, deleteProductImage, reorderProductImages,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import ConfirmModal from '@components/shared/ConfirmModal/ConfirmModal';
import styles from './AdminProductDetailPage.module.scss';

const TABS = [
  { id: 'general',   label: 'General' },
  { id: 'images',    label: 'Imágenes' },
  { id: 'variants',  label: 'Variantes' },
  { id: 'seo',       label: 'SEO' },
];

const slugify = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(null);
  const navigate = useNavigate();
  const isNew = id === 'nuevo';

  const existing = useSelector((s) => s.admin?.currentProduct);
  const isLoading = useSelector((s) => s.admin?.isLoadingProduct);
  const [tab, setTab] = useState('general');
  const [form, setForm] = useState({
    name: '', slug: '', sku: '',
    category_id: '', orisha_id: '',
    base_price: '', stock: 0,
    description: '', short_description: '',
    meta_title: '', meta_description: '',
    is_published: false, is_featured: false,
  });
  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!isNew) dispatch(fetchAdminProduct(id)); }, [dispatch, id, isNew]);
  useEffect(() => { if (existing && !isNew) setForm(existing); }, [existing, isNew]);

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const updates = { [k]: value };
    if (k === 'name' && autoSlug) updates.slug = slugify(value);
    setForm({ ...form, ...updates });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setSaving(true);
    try {
      if (isNew) {
        const created = await dispatch(createProduct(form)).unwrap();
        navigate(`/admin/products/${created.id}`);
      } else {
        await dispatch(updateProduct({ id, data: form })).unwrap();
      }
    } catch (err) {
      setErrors(err.fields || { _form: 'No se pudo guardar.' });
    } finally { setSaving(false); }
  };

  const handleDelete = () => {
    setConfirm({
      message: `¿Eliminar "${form.name}"? Esta acción es irreversible.`,
      action:  async () => { await dispatch(deleteProduct(id)); navigate('/admin/products'); },
    });
  };

  if (!isNew && isLoading) return <div className={styles.loading}>Cargando producto…</div>;

  return (
    <>
      <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <Link to="/admin/products">Productos</Link><span>/</span>
        <span className={styles.bcCurrent}>{isNew ? 'Nuevo producto' : form.name || id}</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">{isNew ? 'Nuevo producto' : `SKU · ${form.sku}`}</MetaTag>
          <h1 className={styles.title}>{form.name || 'Sin nombre'}</h1>
        </div>
        <div className={styles.headerActions}>
          {!isNew && <Button variant="ghost" onClick={handleDelete}>Eliminar</Button>}
          <Button type="submit" form="product-form" variant="primary" disabled={saving}>
            {saving ? 'Guardando…' : (isNew ? 'Crear producto' : 'Guardar cambios')}
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

      <form id="product-form" className={styles.form} onSubmit={handleSubmit}>
        {tab === 'general' && (
          <div className={styles.section}>
            <div className={styles.row2}>
              <Field label="Nombre del producto" value={form.name} onChange={set('name')} error={errors.name} required />
              <div>
                <label className={styles.fieldLabel}>Slug (URL)</label>
                <div className={styles.slugRow}>
                  <input
                    type="text" className={styles.input}
                    value={form.slug}
                    onChange={(e) => { setAutoSlug(false); setForm({ ...form, slug: e.target.value }); }}
                  />
                  <label className={styles.checkInline}>
                    <input type="checkbox" checked={autoSlug} onChange={(e) => setAutoSlug(e.target.checked)} />
                    auto
                  </label>
                </div>
              </div>
            </div>
            <div className={styles.row3}>
              <Field label="SKU" value={form.sku} onChange={set('sku')} required />
              <Field label="Precio base (MXN)" type="number" value={form.base_price} onChange={set('base_price')} required />
              <Field label="Stock" type="number" value={form.stock} onChange={set('stock')} />
            </div>
            <div className={styles.row2}>
              <Field label="Categoría (ID)" value={form.category_id} onChange={set('category_id')} required hint="Selector real conectado al endpoint /admin/categories/" />
              <Field label="Òrìsà (ID)" value={form.orisha_id} onChange={set('orisha_id')} hint="Selector real con tags por orisha" />
            </div>
            <Field label="Descripción corta" value={form.short_description} onChange={set('short_description')} textarea />
            <Field label="Descripción larga (HTML)" value={form.description} onChange={set('description')} textarea hint="Acepta HTML básico. Editor rich-text en próxima iteración." />
            <div className={styles.toggles}>
              <label className={styles.toggle}>
                <input type="checkbox" checked={form.is_published} onChange={set('is_published')} />
                <span>Publicado en catálogo</span>
              </label>
              <label className={styles.toggle}>
                <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} />
                <span>Destacar en home</span>
              </label>
            </div>
          </div>
        )}

        {tab === 'images' && !isNew && (
          <div className={styles.section}>
            <MetaTag tone="bronze">Imágenes del producto · arrastra para reordenar</MetaTag>
            <ImageGallery
              images={existing?.images || []}
              onUpload={(file) => dispatch(uploadProductImage({ productId: id, file }))}
              onDelete={(imgId) => dispatch(deleteProductImage({ productId: id, imageId: imgId }))}
              onReorder={(order) => dispatch(reorderProductImages({ productId: id, order }))}
            />
          </div>
        )}
        {tab === 'images' && isNew && (
          <div className={styles.hint}>Guarda el producto primero para subir imágenes.</div>
        )}

        {tab === 'variants' && !isNew && (
          <div className={styles.section}>
            <p className={styles.hint}>
              Esta vista enlaza a la gestión completa de variantes:
            </p>
            <Link to={`/admin/products/${id}/variantes`}>
              <Button variant="primary">Gestionar variantes →</Button>
            </Link>
          </div>
        )}
        {tab === 'variants' && isNew && (
          <div className={styles.hint}>Guarda el producto primero para añadir variantes.</div>
        )}

        {tab === 'seo' && (
          <div className={styles.section}>
            <Field label="Meta título" value={form.meta_title} onChange={set('meta_title')} hint="Máximo 60 caracteres" />
            <Field label="Meta descripción" value={form.meta_description} onChange={set('meta_description')} textarea hint="Máximo 160 caracteres" />
          </div>
        )}

        {errors._form && <div className={styles.errorBox}>{errors._form}</div>}
      </form>
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

function ImageGallery({ images, onUpload, onDelete, onReorder }) {
  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(onUpload);
  };
  return (
    <div className={styles.gallery}>
      {images.map((img) => (
        <div key={img.id} className={styles.galleryItem}>
          <img src={img.url} alt="" />
          {img.is_cover && <span className={styles.galleryCover}>Cover</span>}
          <button type="button" className={styles.galleryDelete} onClick={() => onDelete(img.id)}>×</button>
        </div>
      ))}
      <label className={styles.galleryUpload}>
        <input type="file" multiple accept="image/*" onChange={handleUpload} hidden />
        <span>+ Subir</span>
      </label>
      </div>
  );
}
