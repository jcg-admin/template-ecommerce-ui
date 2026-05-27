/**
 * AdminPriceSyncPage — Práctica Yorùbà
 * Sincronización masiva de precios por CSV. Solo actualiza, no crea.
 *
 * Endpoints:
 *   POST /admin/inventory/price-sync/upload/    → preview con diffs
 *   POST /admin/inventory/price-sync/<id>/confirm/
 *   GET  /admin/inventory/price-sync/template/
 */

import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  uploadPriceCSV, confirmPriceSync, downloadPriceTemplate,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Price } from '@components/common/primitives';
import styles from './AdminBulkPage.module.scss';

export default function AdminPriceSyncPage() {
  const dispatch = useDispatch();
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file) => {
    setLoading(true);
    try {
      const res = await dispatch(uploadPriceCSV(file)).unwrap();
      setPreview(res);
    } catch (err) {
      alert(err?.detail || 'No se pudo procesar el CSV');
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await dispatch(confirmPriceSync(preview.sync_id)).unwrap();
      setConfirmed(true);
    } finally { setLoading(false); }
  };

  const reset = () => {
    setPreview(null); setConfirmed(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (confirmed) {
    return (
      <div className={styles.page}>
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconOk}`}>✓</div>
          <h3 className={styles.summaryTitle}>Precios actualizados</h3>
          <p style={{ color: 'var(--c-ink-dim)', marginBottom: 24 }}>
            Se aplicaron {preview.diffs.length} cambios de precio.
          </p>
          <div className={styles.actions}>
            <Button variant="primary" onClick={reset}>Hacer otra sincronización</Button>
            <Link to="/admin/products"><Button variant="secondary">Ver catálogo</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <Link to="/admin/products">Productos</Link><span>/</span>
        <span className={styles.bcCurrent}>Sincronizar precios</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Operación masiva · precios</MetaTag>
          <h1 className={styles.title}>Sincronizar precios desde CSV</h1>
          <p className={styles.lead}>
            Actualiza precios de productos existentes en bloque. Solo cambia precios;
            no crea ni elimina productos. Modo dry-run obligatorio antes de aplicar.
          </p>
        </div>
        <Button variant="ghost" onClick={() => dispatch(downloadPriceTemplate())}>
          ↓ Plantilla CSV
        </Button>
      </header>

      {!preview && (
        <div className={styles.uploadCard} style={{ gridTemplateColumns: '1fr' }}>
          <label
            className={styles.dropZone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          >
            <input
              ref={fileRef}
              type="file" accept=".csv,text/csv" hidden
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />
            <div className={styles.dropIcon}>↓</div>
            <div className={styles.dropTitle}>{loading ? 'Validando…' : 'Arrastra el CSV de precios'}</div>
            <div className={styles.dropHint}>Columnas: sku, new_price · max 5 MB</div>
          </label>
        </div>
      )}

      {preview && (
        <section>
          <div className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>
              {preview.diffs.length} productos cambiarán de precio
            </h3>
            <div className={styles.previewStats}>
              <div className={styles.stat}>
                <div className={`${styles.statN} ${styles.statLime}`}>
                  ${preview.total_increase?.toLocaleString('es-MX') || 0}
                </div>
                <div className={styles.statLabel}>Δ medio incremento</div>
              </div>
              <div className={styles.stat}>
                <div className={`${styles.statN} ${styles.statVino}`}>
                  {preview.not_found?.length || 0}
                </div>
                <div className={styles.statLabel}>SKU no encontrados</div>
              </div>
            </div>
          </div>

          <div className={styles.previewTable}>
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Precio actual</th>
                  <th>Precio nuevo</th>
                  <th>Δ</th>
                </tr>
              </thead>
              <tbody>
                {preview.diffs.slice(0, 100).map((d, i) => {
                  const delta = d.new_price - d.old_price;
                  const pct = ((delta / d.old_price) * 100).toFixed(1);
                  return (
                    <tr key={i}>
                      <td className={styles.mono}>{d.sku}</td>
                      <td>{d.name}</td>
                      <td className={styles.mono}><Price amount={d.old_price} size="sm" /></td>
                      <td className={styles.mono}><Price amount={d.new_price} size="sm" /></td>
                      <td className={delta > 0 ? styles.statLime : styles.statVino}>
                        {delta > 0 ? '+' : ''}{delta.toLocaleString('es-MX')} ({pct}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {preview.diffs.length > 100 && (
              <div className={styles.previewMore}>+ {preview.diffs.length - 100} cambios más al confirmar</div>
            )}
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={reset}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Aplicando…' : `Confirmar ${preview.diffs.length} cambios`}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
