/**
 * AdminCategoriesPage — Práctica Yorùbà
 * Árbol de categorías expandible + CRUD inline.
 *
 * Endpoints:
 *   GET    /admin/categories/         → árbol jerárquico
 *   POST   /admin/categories/
 *   PATCH  /admin/categories/<id>/
 *   DELETE /admin/categories/<id>/
 *   PATCH  /admin/categories/<id>/move/   { new_parent_id, new_order }
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchAdminCategories, createCategory, updateCategory,
  deleteCategory, moveCategoryNode,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Field } from '@components/common/primitives';
import ConfirmModal from '@components/shared/ConfirmModal/ConfirmModal';
import TreeList from '@components/common/TreeList';
import styles from './AdminCategoriesPage.module.scss';

/**
 * Jerarquia del TreeList:
 * El slice admin ya entrega `categoryTree` como un arbol jerarquico
 * (cada categoria con su array `children`). No hay que agrupar por un
 * campo padre plano: se reusa la jerarquia tal cual viene de la API.
 * `toTreeNodes` solo adapta cada categoria al contrato de TreeList:
 *   - `label`  <- name
 *   - `slug`   columna de texto
 *   - `productos` columna derivada de product_count
 *   - `children` se mapea recursivamente
 * Se conservan los campos crudos (is_active, name, ...) para que
 * renderActions pueda decidir y los handlers reciban la categoria real.
 */
function toTreeNodes(categories = []) {
  return categories.map((c) => ({
    ...c,
    id: c.id,
    label: c.name,
    productos: `${c.product_count || 0} productos`,
    children: toTreeNodes(c.children || []),
  }));
}

const TREE_COLUMNS = [
  { key: 'slug', label: 'Slug' },
  { key: 'productos', label: 'Productos' },
];

function collectIds(categories = []) {
  return categories.flatMap((c) => [c.id, ...collectIds(c.children || [])]);
}

export default function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(null);
  const tree = useSelector((s) => s.admin?.categoryTree || []);
  const isLoading = useSelector((s) => s.admin?.isLoadingCategories);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(null); // parentId

  useEffect(() => { dispatch(fetchAdminCategories()); }, [dispatch]);

  const treeNodes = toTreeNodes(tree);

  const handleDelete = (c) => {
    setConfirm({
      message: `¿Eliminar "${c.name}"? Se moverán sus subcategorías al nivel raíz.`,
      action: () => dispatch(deleteCategory(c.id)),
    });
  };

  const renderActions = (node) => (
    <div className={styles.nodeActions}>
      {!node.is_active && <span className={styles.inactive}>Inactiva</span>}
      <button type="button" onClick={() => dispatch(moveCategoryNode({ id: node.id, direction: 'up' }))} className={styles.iconBtn} aria-label="Mover arriba">↑</button>
      <button type="button" onClick={() => dispatch(moveCategoryNode({ id: node.id, direction: 'down' }))} className={styles.iconBtn} aria-label="Mover abajo">↓</button>
      <button type="button" onClick={() => setCreating(node.id)} className={styles.iconBtn} aria-label="Añadir hija">+</button>
      <button type="button" onClick={() => setEditing(node)} className={styles.iconBtn} aria-label="Editar">✎</button>
      <button type="button" onClick={() => handleDelete(node)} className={`${styles.iconBtn} ${styles.iconBtnDelete}`} aria-label="Eliminar">×</button>
    </div>
  );

  return (
    <>
      <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <span className={styles.bcCurrent}>Categorías</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Configuración del catálogo</MetaTag>
          <h1 className={styles.title}>Categorías</h1>
          <p className={styles.lead}>
            Árbol jerárquico de categorías. Click en una categoría para expandirla,
            editar o eliminar. La API valida ciclos automáticamente.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(null)}>+ Categoría raíz</Button>
      </header>

      <div className={styles.tree}>
        {isLoading && <div className={styles.loading}>Cargando árbol…</div>}
        {!isLoading && tree.length === 0 && <div className={styles.empty}>Sin categorías. Crea la primera.</div>}
        {!isLoading && tree.length > 0 && (
          <TreeList
            nodes={treeNodes}
            columns={TREE_COLUMNS}
            renderActions={renderActions}
            defaultExpandedIds={collectIds(tree)}
            ariaLabel="Categorías"
          />
        )}
      </div>

      {(editing || creating !== undefined) && (
        <CategoryFormModal
          category={editing}
          parentId={creating}
          onSave={async (data) => {
            if (editing) await dispatch(updateCategory({ id: editing.id, data }));
            else await dispatch(createCategory({ ...data, parent_id: creating }));
            setEditing(null); setCreating(undefined);
          }}
          onClose={() => { setEditing(null); setCreating(undefined); }}
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

function CategoryFormModal({ category, parentId, onSave, onClose }) {
  const [data, setData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    is_active: category?.is_active ?? true,
  });
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>
          {category ? 'Editar categoría' : 'Nueva categoría'}
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(data); }}>
          <Field label="Nombre" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required />
          <div style={{ marginTop: 12 }}>
            <Field label="Slug" value={data.slug} onChange={(e) => setData({ ...data, slug: e.target.value })} />
          </div>
          <label className={styles.checkRow}>
            <input type="checkbox" checked={data.is_active} onChange={(e) => setData({ ...data, is_active: e.target.checked })} />
            <span>Categoría activa</span>
          </label>
          {parentId && <div className={styles.modalHint}>Se creará como subcategoría de la categoría seleccionada.</div>}
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary">{category ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </div>
      </div>
  );
}
