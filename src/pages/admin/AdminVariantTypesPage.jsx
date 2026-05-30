/**
 * AdminVariantTypesPage — Práctica Yorùbà
 * Gestión de tipos de variante de un producto (Talla, Longitud, Color…)
 * y sus opciones (S, M, L, etc.).
 *
 * Endpoints (chartsize):
 *   GET /admin/products/<id>/variant-types/
 *   POST/PATCH/DELETE /admin/products/<id>/variant-types/<typeId>/
 *   POST/PATCH/DELETE /admin/products/<id>/variant-types/<typeId>/options/[<optId>/]
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchVariantTypes, createVariantType, updateVariantType, deleteVariantType,
  createVariantOption, updateVariantOption, deleteVariantOption,
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
            productId={productId}
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

function VariantTypeCard({ type, productId, onEdit, onDelete }) {
  const dispatch = useDispatch();
  const [adding, setAdding] = useState(false);
  const [editingOpt, setEditingOpt] = useState(null);

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
            <div className={styles.optionActions}>
              <button type="button" onClick={() => setEditingOpt(opt)} className={styles.smallBtn}>✎</button>
              <button
                type="button"
                className={`${styles.smallBtn} ${styles.smallBtnDelete}`}
                onClick={() => setConfirm({
                  message: `¿Eliminar opción "${opt.label}"?`,
                  action:  () => dispatch(deleteVariantOption({ productId, typeId: type.id, optionId: opt.id })),
                })}
              >×</button>
            </div>
          </div>
        ))}
        {adding && (
          <OptionInlineForm
            onCancel={() => setAdding(false)}
            onSave={async (data) => {
              await dispatch(createVariantOption({ productId, typeId: type.id, data }));
              setAdding(false);
            }}
          />
        )}
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className={styles.addOption}>
            + Añadir opción
          </button>
        )}
      </div>

      {editingOpt && (
        <OptionModal
          option={editingOpt}
          onClose={() => setEditingOpt(null)}
          onSave={async (data) => {
            await dispatch(updateVariantOption({ productId, typeId: type.id, optionId: editingOpt.id, data }));
            setEditingOpt(null);
          }}
        />
      )}
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

function OptionModal({ option, onClose, onSave }) {
  const [data, setData] = useState({
    label: option.label || '',
    sub_label: option.sub_label || '',
    order: option.order || 0,
  });
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Editar opción</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(data); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Etiqueta" value={data.label} onChange={(e) => setData({ ...data, label: e.target.value })} required />
          <Field label="Sub-etiqueta (opcional)" value={data.sub_label} onChange={(e) => setData({ ...data, sub_label: e.target.value })} hint="Ej. 'media · estándar'" />
          <Field label="Orden" type="number" value={data.order} onChange={(e) => setData({ ...data, order: e.target.value })} />
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OptionInlineForm({ onCancel, onSave }) {
  const [label, setLabel] = useState('');
  const [subLabel, setSubLabel] = useState('');
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (label.trim()) onSave({ label, sub_label: subLabel }); }}
      className={styles.inlineForm}
    >
      <input className={styles.inlineInput} placeholder="Etiqueta" value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Etiqueta de variante" autoFocus />
      <input className={styles.inlineInput} placeholder="Sub-etiqueta (opcional)" value={subLabel} aria-label="Sub-etiqueta de variante" onChange={(e) => setSubLabel(e.target.value)} />
      <button type="submit" className={styles.smallBtn} disabled={!label.trim()}>✓</button>
      <button type="button" onClick={onCancel} className={styles.smallBtn}>×</button>
      </form>
  );
}
