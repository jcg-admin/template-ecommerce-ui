/**
 * AdminVariantTypesPage — Práctica Yorùbà
 * Gestión de tipos de variante de un producto (Talla, Longitud, Color…)
 * y sus opciones (S, M, L, etc.).
 *
 * Endpoints (chartsize):
 *   GET /admin/products/<id>/variant-types/
 *   POST/PATCH/DELETE /admin/products/<id>/variant-types/<typeId>/
 *
 * Nota: el backend (VariantTypeAdminViewSet) NO expone CRUD de opciones
 * individuales — `options` viene anidado read-only en el tipo. Las
 * opciones se muestran en modo lectura; su gestion no esta soportada.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchVariantTypes, createVariantType, updateVariantType, deleteVariantType,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import ConfirmModal from '@components/shared/ConfirmModal/ConfirmModal';
import styles from './AdminVariantsPage.module.scss';

export default function AdminVariantTypesPage() {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(null);
  const types = useSelector((s) => s.admin?.variantTypes || []);
  const [editingType, setEditingType] = useState(null);

  useEffect(() => { dispatch(fetchVariantTypes(productId)); }, [dispatch, productId]);

  return (
    <>
      <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <Link to="/admin/products">Productos</Link><span>/</span>
        <Link to={`/admin/products/${productId}`}>Producto {productId}</Link><span>/</span>
        <span className={styles.bcCurrent}>Tipos de variante</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Producto · Tipos de variante</MetaTag>
          <h1 className={styles.title}>Tipos y opciones</h1>
          <p className={styles.lead}>
            Define las dimensiones por las que varía este producto (longitud, color…) y sus
            opciones. Cuando termines, ve a <strong>Variantes</strong> para combinarlas
            y asignar precios/stock por combinación.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => setEditingType({})}>+ Nuevo tipo</Button>
          <Link to={`/admin/products/${productId}/variantes`}>
            <Button variant="primary">Ir a variantes →</Button>
          </Link>
        </div>
      </header>

      <div className={styles.typeList}>
        {types.length === 0 && (
          <div className={styles.empty}>
            Sin tipos definidos. Empieza creando uno (ej. "Longitud", "Color").
          </div>
        )}
        {types.map((type) => (
          <VariantTypeCard
            key={type.id}
            type={type}
            onEdit={() => setEditingType(type)}
            onDelete={() => setConfirm({
              message: `¿Eliminar "${type.name}" y todas sus opciones?`,
              action:  () => dispatch(deleteVariantType({ productId, typeId: type.id })),
            })}
          />
        ))}
      </div>

      {editingType && (
        <TypeModal
          type={editingType}
          onClose={() => setEditingType(null)}
          onSave={async (data) => {
            if (editingType.id) {
              await dispatch(updateVariantType({ productId, typeId: editingType.id, data }));
            } else {
              await dispatch(createVariantType({ productId, data }));
            }
            setEditingType(null);
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

function VariantTypeCard({ type, onEdit, onDelete }) {
  return (
    <article className={styles.typeCard}>
      <header className={styles.typeHeader}>
        <div>
          <h3 className={styles.typeName}>{type.name}</h3>
          <div className={styles.typeMeta}>
            {type.options?.length || 0} {(type.options?.length || 0) === 1 ? 'opción' : 'opciones'}
            {type.is_required && <> · obligatorio</>}
          </div>
        </div>
        <div className={styles.typeActions}>
          <button type="button" onClick={onEdit} className={styles.iconBtn} title="Editar">✎</button>
          <button type="button" onClick={onDelete} className={`${styles.iconBtn} ${styles.iconBtnDelete}`} title="Eliminar">×</button>
        </div>
      </header>

      <div className={styles.options}>
        {(type.options || []).map((opt) => (
          <div key={opt.id} className={styles.option}>
            <div className={styles.optionLabel}>
              <span className={styles.optionName}>{opt.label}</span>
              {opt.sub_label && <span className={styles.optionSub}>{opt.sub_label}</span>}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function TypeModal({ type, onClose, onSave }) {
  const [data, setData] = useState({
    name: type.name || '',
    is_required: type.is_required ?? true,
    order: type.order || 0,
  });
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{type.id ? 'Editar tipo' : 'Nuevo tipo de variante'}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nombre" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required placeholder="Ej. Longitud" />
          <Field label="Orden de visualización" type="number" value={data.order} onChange={(e) => setData({ ...data, order: e.target.value })} />
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--c-ink-dim)', fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={data.is_required} onChange={(e) => setData({ ...data, is_required: e.target.checked })} />
            <span>Obligatorio (el cliente debe elegir una opción)</span>
          </label>
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary">{type.id ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

