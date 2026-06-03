/**
 * AdminPriceSyncPage — Práctica Yorùbà
 * Sincronización masiva de precios. Solo actualiza, no crea.
 *
 * Dos modos (contrato real apps/catalogue/price_sync_views.py):
 *   CSV:
 *     POST /admin/price-sync/preview-csv/   → { session_id, preview, errors }
 *     POST /admin/price-sync/apply-csv/     ← { session_id } → { updated_count }
 *     GET  /admin/price-sync/template.csv
 *   Porcentaje:
 *     POST /admin/price-sync/preview-percentage/  ← { pct, category_id?,
 *           price_min?, price_max? } → { session_id, preview, pct }
 *     POST /admin/price-sync/apply-percentage/    ← { session_id }
 *
 * Flujo: preview (dry-run) → confirmar. apply-* aplica la sesión almacenada
 * en el server; no acepta ediciones de precio del cliente.
 */

import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  uploadPriceCSV, confirmPriceSync, downloadPriceTemplate,
  previewPriceSyncPercentage, applyPriceSyncPercentage,
} from '@redux/slices/adminSlice';
import { MetaTag, Button, Price } from '@components/common/primitives';
import styles from './AdminBulkPage.module.scss';

const MODES = [
  { id: 'csv',        label: 'Desde CSV' },
  { id: 'percentage', label: 'Ajuste por porcentaje' },
];

export default function AdminPriceSyncPage() {
  const dispatch = useDispatch();
  const fileRef = useRef();
  const [mode, setMode] = useState('csv');
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado del formulario de porcentaje.
  const [pct, setPct] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const handleFile = async (file) => {
    setLoading(true);
    try {
      const res = await dispatch(uploadPriceCSV(file)).unwrap();
      setPreview(res);
    } catch (err) {
      alert(err?.detail || 'No se pudo procesar el CSV');
    } finally { setLoading(false); }
  };

  const handlePercentagePreview = async () => {
    if (pct === '' || Number.isNaN(Number(pct))) return;
    setLoading(true);
    try {
      const res = await dispatch(previewPriceSyncPercentage({
        pct: Number(pct), price_min: priceMin, price_max: priceMax,
      })).unwrap();
      setPreview(res);
    } catch (err) {
      alert(err?.detail || 'No se pudo previsualizar el ajuste');
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const apply = mode === 'percentage' ? applyPriceSyncPercentage : confirmPriceSync;
      await dispatch(apply(preview.session_id)).unwrap();
      setConfirmed(true);
    } finally { setLoading(false); }
  };

  const reset = () => {
    setPreview(null); setConfirmed(false);
    setPct(''); setPriceMin(''); setPriceMax('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const switchMode = (id) => { setMode(id); reset(); };

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
          <h1 className={styles.title}>Sincronizar precios</h1>
          <p className={styles.lead}>
            Actualiza precios de productos existentes en bloque, desde un CSV o
            aplicando un porcentaje. Solo cambia precios; no crea ni elimina
            productos. Modo dry-run obligatorio antes de aplicar.
          </p>
        </div>
        {mode === 'csv' && (
          <Button variant="ghost" onClick={() => dispatch(downloadPriceTemplate())}>
            ↓ Plantilla CSV
          </Button>
        )}
      </header>

      {!preview && (
        <div className={styles.modeTabs} role="tablist" aria-label="Modo de sincronización">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={`${styles.modeTab} ${mode === m.id ? styles.modeTabActive : ''}`}
              onClick={() => switchMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {!preview && mode === 'csv' && (
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
            <div className={styles.dropHint}>Columnas: sku, price · max 5 MB</div>
          </label>
        </div>
      )}

      {!preview && mode === 'percentage' && (
        <div className={styles.uploadCard} style={{ gridTemplateColumns: '1fr' }}>
          <div className={styles.pctForm}>
            <label className={styles.field}>
              <span>Porcentaje de ajuste (%)</span>
              <input
                type="number" step="0.1" value={pct}
                onChange={(e) => setPct(e.target.value)}
                placeholder="Ej: 10 (sube 10%), -5 (baja 5%)"
              />
            </label>
            <label className={styles.field}>
              <span>Precio mínimo (opcional)</span>
              <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Precio máximo (opcional)</span>
              <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
            </label>
            <Button
              variant="primary"
              onClick={handlePercentagePreview}
              disabled={loading || pct === ''}
            >
              {loading ? 'Calculando…' : 'Previsualizar ajuste'}
            </Button>
          </div>
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
                  const pctDelta = ((delta / d.old_price) * 100).toFixed(1);
                  return (
                    <tr key={d.sku ?? i}>
                      <td className={styles.mono}>{d.sku}</td>
                      <td>{d.name}</td>
                      <td className={styles.mono}><Price amount={d.old_price} size="sm" /></td>
                      <td className={styles.mono}><Price amount={d.new_price} size="sm" /></td>
                      <td className={delta > 0 ? styles.statLime : styles.statVino}>
                        {delta > 0 ? '+' : ''}{delta.toLocaleString('es-MX')} ({pctDelta}%)
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
