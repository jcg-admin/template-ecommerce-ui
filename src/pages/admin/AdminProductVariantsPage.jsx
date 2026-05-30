/**
 * AdminProductVariantsPage — Práctica Yorùbà
 * Tabla generada de combinaciones (Talla × Color, etc.).
 * Edición inline + bulk update de precio/stock.
 *
 * Endpoints:
 *   GET   /admin/products/<id>/variants/
 *   PATCH /admin/products/<id>/variants/bulk/  { variants: [{ id, ...changes }] }
 *   POST  /admin/products/<id>/variants/regenerate/   → re-genera combinaciones
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  fetchProductVariants, bulkUpdateVariants, regenerateVariants,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Price } from '@components/common/primitives';
import ConfirmModal from '@components/shared/ConfirmModal/ConfirmModal';
import styles from './AdminVariantsPage.module.scss';

export default function AdminProductVariantsPage() {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(null);
  const variants = useSelector((s) => s.admin?.productVariants || []);
  const [edited, setEdited] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [bulkValue, setBulkValue] = useState('');
  const [bulkField, setBulkField] = useState('price_override');
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchProductVariants(productId)); }, [dispatch, productId]);

  const setField = (id, field, value) => {
    setEdited({
      ...edited,
      [id]: { ...edited[id], [field]: value },
    });
  };

  const handleSave = async () => {
    const payload = Object.entries(edited).map(([id, changes]) => ({ id: Number(id), ...changes }));
    if (payload.length === 0) return;
    setSaving(true);
    try {
      await dispatch(bulkUpdateVariants({ productId, variants: payload })).unwrap();
      setEdited({});
    } finally { setSaving(false); }
  };

  const handleBulkApply = () => {
    if (!bulkValue || selected.size === 0) return;
    const updates = { ...edited };
    selected.forEach((id) => {
      updates[id] = { ...updates[id], [bulkField]: Number(bulkValue) };
    });
    setEdited(updates);
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === variants.length) setSelected(new Set());
    else setSelected(new Set(variants.map((v) => v.id)));
  };

  const hasChanges = Object.keys(edited).length > 0;

  return (
    <>
      <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <Link to="/admin/products">Productos</Link><span>/</span>
        <Link to={`/admin/products/${productId}`}>Producto {productId}</Link><span>/</span>
        <span className={styles.bcCurrent}>Variantes</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">{variants.length} combinaciones · {Object.keys(edited).length} sin guardar</MetaTag>
          <h1 className={styles.title}>Variantes del producto</h1>
        </div>
        <div className={styles.headerActions}>
          <Link to={`/admin/products/${productId}/tipos-variante`}>
            <Button variant="ghost">← Tipos de variante</Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              setConfirm({
      message: 'Re-generar combinaciones: se crearán nuevas variantes por cada combinación de opciones. ¿Continuar?',
      action:  () => dispatch(generateVariants(productId)),
    });
            }}
          >Re-generar combinaciones</Button>
          <Button variant="primary" onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? 'Guardando…' : `Guardar (${Object.keys(edited).length})`}
          </Button>
        </div>
      </header>

      {selected.size > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkLabel}>
            {selected.size} variantes seleccionadas · aplicar a todas:
          </span>
          <select aria-label="Campo a modificar en masa" value={bulkField} onChange={(e) => setBulkField(e.target.value)} className={styles.bulkSelect}>
            <option value="price_override">Precio override</option>
            <option value="stock">Stock</option>
          </select>
          <input
            type="number"
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            placeholder="Valor"
            className={styles.bulkInput}
          />
          <Button variant="primary" size="sm" onClick={handleBulkApply} disabled={!bulkValue}>
            Aplicar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Limpiar selección</Button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.variantsTable}>
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <input
                  type="checkbox"
                  checked={selected.size > 0 && selected.size === variants.length}
                  ref={(el) => el && (el.indeterminate = selected.size > 0 && selected.size < variants.length)}
                  onChange={toggleAll}
                />
              </th>
              <th>SKU completo</th>
              <th>Combinación</th>
              <th>Sufijo SKU</th>
              <th>Precio override</th>
              <th>Stock</th>
              <th>Activa</th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>Sin variantes. Define tipos primero o usa "Re-generar".</td></tr>
            )}
            {variants.map((v) => {
              const isEdited = !!edited[v.id];
              const merged = { ...v, ...edited[v.id] };
              return (
                <tr key={v.id} className={isEdited ? styles.rowDirty : ''}>
                  <td>
                    <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)} />
                  </td>
                  <td className={styles.mono}>{v.sku}</td>
                  <td>
                    <div className={styles.combo}>
                      {v.options?.map((o, i) => (
                        <span key={`${o.type_name}-${o.label}`} className={styles.comboChip}>
                          {o.type_name}: <strong>{o.label}</strong>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text" className={styles.cellInput}
                      value={merged.sku_suffix || ''}
                      onChange={(e) => setField(v.id, 'sku_suffix', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number" className={`${styles.cellInput} ${styles.cellInputNum}`}
                      value={merged.price_override ?? ''}
                      onChange={(e) => setField(v.id, 'price_override', e.target.value === '' ? null : Number(e.target.value))}
                      placeholder={`(base $${v.base_price})`}
                    />
                  </td>
                  <td>
                    <input
                      type="number" className={`${styles.cellInput} ${styles.cellInputNum}`}
                      value={merged.stock}
                      onChange={(e) => setField(v.id, 'stock', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!merged.is_active}
                      onChange={(e) => setField(v.id, 'is_active', e.target.checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
