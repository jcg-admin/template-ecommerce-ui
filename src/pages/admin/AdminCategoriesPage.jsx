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
import styles from './AdminCategoriesPage.module.scss';

export default function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const tree = useSelector((s) => s.admin?.categoryTree || []);
  const isLoading = useSelector((s) => s.admin?.isLoadingCategories);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(null); // parentId
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => { dispatch(fetchAdminCategories()); }, [dispatch]);

  const toggle = (id) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  return (
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
        {!isLoading && tree.map((node) => (
          <CategoryNode
            key={node.id}
            node={node}
            depth={0}
            expanded={expanded}
            onToggle={toggle}
            onEdit={(c) => setEditing(c)}
            onDelete={(c) => {
              if (window.confirm(`¿Eliminar "${c.name}"? Se moverán sus subcategorías al padre.`)) {
                dispatch(deleteCategory(c.id));
              }
            }}
            onAddChild={(parentId) => setCreating(parentId)}
            onMove={(id, dir) => dispatch(moveCategoryNode({ id, direction: dir }))}
          />
        ))}
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
  );
}

function CategoryNode({ node, depth, expanded, onToggle, onEdit, onDelete, onAddChild, onMove }) {
  const hasChildren = node.children?.length > 0;
  const isOpen = expanded.has(node.id);
  return (
    <>
      <div className={styles.node} style={{ paddingLeft: depth * 24 + 12 }}>
        <button
          type="button" className={styles.expandBtn}
          onClick={() => hasChildren && onToggle(node.id)}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >{isOpen ? '▼' : '▶'}</button>
        <div className={styles.nodeInfo}>
          <span className={styles.nodeName}>{node.name}</span>
          <span className={styles.nodeMeta}>
            {node.slug} · {node.product_count || 0} productos
          </span>
        </div>
        {!node.is_active && <span className={styles.inactive}>Inactiva</span>}
        <div className={styles.nodeActions}>
          <button type="button" onClick={() => onMove(node.id, 'up')} className={styles.iconBtn} aria-label="Mover arriba">↑</button>
          <button type="button" onClick={() => onMove(node.id, 'down')} className={styles.iconBtn} aria-label="Mover abajo">↓</button>
          <button type="button" onClick={() => onAddChild(node.id)} className={styles.iconBtn} aria-label="Añadir hija">+</button>
          <button type="button" onClick={() => onEdit(node)} className={styles.iconBtn} aria-label="Editar">✎</button>
          <button type="button" onClick={() => onDelete(node)} className={`${styles.iconBtn} ${styles.iconBtnDelete}`} aria-label="Eliminar">×</button>
        </div>
      </div>
      {hasChildren && isOpen && node.children.map((child) => (
        <CategoryNode
          key={child.id} node={child} depth={depth + 1}
          expanded={expanded} onToggle={onToggle}
          onEdit={onEdit} onDelete={onDelete}
          onAddChild={onAddChild} onMove={onMove}
        />
      ))}
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
