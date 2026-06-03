/**
 * AdminProductImportPage — Práctica Yorùbà
 * UC-INV-05: Carga masiva de productos por CSV.
 *
 * Flujo single-shot contra el backend real:
 *   POST /api/v1/admin/inventory/import/   (multipart: file + initial_state)
 *     → { created, failed, products_created, products_failed,
 *         error_report: [{ row, field, reason }], download_url }
 *
 * Delega en inventorySlice.importProductsCsv (mismo endpoint real que usa
 * AdminInventoryImportPage). No existe preview/confirm/template en el backend:
 * la importación se aplica en una sola llamada y devuelve el reporte directo.
 */

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  importProductsCsv,
  clearInventoryActionState,
  clearImportReport,
} from '@redux/slices/inventorySlice';
import { MetaTag, Button } from '@components/common/primitives';
import styles from './AdminBulkPage.module.scss';

// Encabezados que el importador real consume (apps/inventory/views.py
// _process_import_csv). REQUIRED = {name, sku, base_price, category_slug}.
const COLUMN_MAP = [
  { csv: 'sku',           model: 'sku',          required: true },
  { csv: 'name',          model: 'name',         required: true },
  { csv: 'base_price',    model: 'price',        required: true },
  { csv: 'category_slug', model: 'category',     required: true },
  { csv: 'description',   model: 'description',  required: false },
];

// initial_state del backend: 'ACTIVO' publica el producto; cualquier otro
// valor (default 'BORRADOR') lo crea en borrador.
const INITIAL_STATES = [
  { id: 'BORRADOR', label: 'Borrador (no visible en tienda)' },
  { id: 'ACTIVO',   label: 'Publicado (visible en tienda)' },
];

export default function AdminProductImportPage() {
  const dispatch = useDispatch();
  const fileRef = useRef();
  const { isActioning, actionError, importReport } =
    useSelector((s) => s.inventory);

  const [file, setFile] = useState(null);
  const [initialState, setInitialState] = useState('BORRADOR');

  useEffect(() => () => {
    dispatch(clearInventoryActionState());
    dispatch(clearImportReport());
  }, [dispatch]);

  const step = importReport ? 'done' : (isActioning ? 'processing' : 'upload');

  const handleFile = (selected) => setFile(selected);

  const handleImport = () => {
    if (!file) return;
    dispatch(importProductsCsv({ file, initialState }));
  };

  const reset = () => {
    setFile(null);
    setInitialState('BORRADOR');
    dispatch(clearImportReport());
    dispatch(clearInventoryActionState());
    if (fileRef.current) fileRef.current.value = '';
  };

  const errorMessage = (() => {
    if (!actionError) return null;
    if (typeof actionError === 'string') return actionError;
    if (actionError?.detail) return actionError.detail;
    if (actionError?.message) return actionError.message;
    return 'No se pudo procesar el CSV. Intenta de nuevo.';
  })();

  const errorRows = importReport?.error_report ?? [];

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Admin</Link><span>/</span>
        <Link to="/admin/products">Productos</Link><span>/</span>
        <span className={styles.bcCurrent}>Importar CSV</span>
      </nav>

      <header className={styles.header}>
        <div>
          <MetaTag tone="bronze">Operación masiva · carga de productos</MetaTag>
          <h1 className={styles.title}>Importar productos desde CSV</h1>
          <p className={styles.lead}>
            Sube un archivo con tus productos. El sistema valida cada fila y
            aplica la importación en una sola operación; las filas con errores
            se reportan al final.
          </p>
        </div>
      </header>

      <ProgressSteps step={step} />

      {step === 'upload' && (
        <section className={styles.uploadCard}>
          <DropZone fileRef={fileRef} onFile={handleFile} selectedName={file?.name} />

          <div className={styles.mappingBox}>
            <MetaTag tone="bronze">Columnas esperadas</MetaTag>
            <table className={styles.mappingTable}>
              <thead>
                <tr><th>Columna CSV</th><th>Campo modelo</th><th>Requerido</th></tr>
              </thead>
              <tbody>
                {COLUMN_MAP.map((c) => (
                  <tr key={c.csv}>
                    <td className={styles.mono}>{c.csv}</td>
                    <td>{c.model}</td>
                    <td>{c.required ? <span className={styles.req}>Sí</span> : <span className={styles.muted}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mappingBox}>
            <label htmlFor="initial-state">Estado inicial de los productos</label>
            <select
              id="initial-state"
              value={initialState}
              onChange={(e) => setInitialState(e.target.value)}
            >
              {INITIAL_STATES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <p role="alert" className={styles.errorMsg}>{errorMessage}</p>
          )}

          <div className={styles.actions}>
            <Button variant="primary" onClick={handleImport} disabled={!file}>
              Importar
            </Button>
          </div>
        </section>
      )}

      {step === 'processing' && (
        <section className={styles.processingBox}>
          <div className={styles.spinner} />
          <h3 className={styles.processingTitle}>Procesando importación…</h3>
        </section>
      )}

      {step === 'done' && importReport && (
        <section className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${errorRows.length === 0 ? styles.iconOk : styles.iconFail}`}>
            {errorRows.length === 0 ? '✓' : '!'}
          </div>
          <h3 className={styles.summaryTitle}>
            {errorRows.length === 0 ? 'Importación completa' : 'Importación con errores'}
          </h3>
          <div className={styles.summaryStats}>
            <Stat n={importReport.products_created ?? importReport.created ?? 0} label="Creados" tone="lime" />
            <Stat n={importReport.products_failed ?? importReport.failed ?? 0} label="Fallidos" tone="vino" />
          </div>

          {errorRows.length > 0 && (
            <div className={styles.previewTable}>
              <table>
                <thead>
                  <tr><th>Fila</th><th>Campo</th><th>Motivo</th></tr>
                </thead>
                <tbody>
                  {errorRows.map((row, i) => (
                    <tr key={`row-${row.row ?? i}`} className={styles.rowError}>
                      <td className={styles.mono}>{row.row ?? '—'}</td>
                      <td>{row.field ?? '—'}</td>
                      <td><span className={styles.errorMsg}>{row.reason ?? '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {importReport.download_url && (
            <a href={importReport.download_url} className={styles.errorDownload} download>
              ↓ Descargar CSV de errores ({errorRows.length} filas)
            </a>
          )}

          <div className={styles.actions}>
            <Button variant="primary" onClick={reset}>Hacer otra importación</Button>
            <Link to="/admin/products"><Button variant="secondary">Ver catálogo</Button></Link>
          </div>
        </section>
      )}
    </div>
  );
}

function ProgressSteps({ step }) {
  const steps = [
    { id: 'upload',     label: 'Subir CSV' },
    { id: 'processing', label: 'Procesar' },
    { id: 'done',       label: 'Resumen' },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);
  return (
    <div className={styles.stepBar}>
      {steps.map((s, i) => (
        <div key={s.id} className={`${styles.stepItem} ${i <= currentIdx ? styles.stepActive : ''}`}>
          <span className={styles.stepN}>0{i + 1}</span>
          <span className={styles.stepLabel}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function DropZone({ fileRef, onFile, selectedName }) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      className={`${styles.dropZone} ${drag ? styles.dropZoneActive : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
    >
      <input
        ref={fileRef}
        type="file" accept=".csv,text/csv" hidden
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      <div className={styles.dropIcon}>↓</div>
      <div className={styles.dropTitle}>
        {selectedName || 'Arrastra tu CSV aquí o haz clic para seleccionar'}
      </div>
      <div className={styles.dropHint}>Tamaño máximo: 5 MB · Codificación: UTF-8</div>
    </label>
  );
}

function Stat({ n, label, tone }) {
  const cls = { lime: styles.statLime, coral: styles.statCoral, vino: styles.statVino, muted: styles.statMuted }[tone];
  return (
    <div className={styles.stat}>
      <div className={`${styles.statN} ${cls}`}>{n}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
