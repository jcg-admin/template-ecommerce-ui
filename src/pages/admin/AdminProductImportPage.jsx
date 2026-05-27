/**
 * AdminProductImportPage — Práctica Yorùbà
 * Carga masiva de productos por CSV con preview, validación y dry-run.
 *
 * Endpoints:
 *   POST /admin/inventory/import/upload/        (multipart con file)  → { import_id, preview }
 *   POST /admin/inventory/import/<id>/confirm/  → { task_id }
 *   GET  /admin/inventory/import/<id>/status/   → { state, processed, total, errors }
 *   GET  /admin/inventory/import/template/      → CSV template download
 */

import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  uploadProductCSV, confirmProductImport, fetchImportStatus, downloadImportTemplate,
} from '@redux/slices/adminSlice';
import { MetaTag, Button } from '@components/common/primitives';
import styles from './AdminBulkPage.module.scss';

const COLUMN_MAP = [
  { csv: 'sku',           model: 'sku',           required: true },
  { csv: 'name',          model: 'name',          required: true },
  { csv: 'category_slug', model: 'category',      required: true },
  { csv: 'orisha_slug',   model: 'orisha',        required: false },
  { csv: 'base_price',    model: 'base_price',    required: true },
  { csv: 'stock',         model: 'stock',         required: true },
  { csv: 'description',   model: 'description',   required: false },
  { csv: 'is_published',  model: 'is_published',  required: false },
];

export default function AdminProductImportPage() {
  const dispatch = useDispatch();
  const fileRef = useRef();
  const pollRef = useRef();
  const [file, setFile] = useState(null);
  const [importId, setImportId] = useState(null);
  const [preview, setPreview] = useState([]);
  const [step, setStep] = useState('upload'); // upload | preview | processing | done
  const [progress, setProgress] = useState({ processed: 0, total: 0, errors: [] });
  const [summary, setSummary] = useState(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const handleFile = async (selected) => {
    setFile(selected);
    try {
      const res = await dispatch(uploadProductCSV(selected)).unwrap();
      setImportId(res.import_id);
      setPreview(res.preview || []);
      setStep('preview');
    } catch (err) {
      alert(err?.detail || 'No se pudo procesar el CSV');
    }
  };

  const handleConfirm = async () => {
    setStep('processing');
    setProgress({ processed: 0, total: preview.length, errors: [] });
    await dispatch(confirmProductImport(importId));
    pollRef.current = setInterval(async () => {
      const status = await dispatch(fetchImportStatus(importId)).unwrap();
      setProgress(status);
      if (status.state === 'DONE' || status.state === 'FAILED') {
        clearInterval(pollRef.current);
        setSummary(status);
        setStep('done');
      }
    }, 1500);
  };

  const reset = () => {
    setFile(null); setImportId(null); setPreview([]);
    setStep('upload'); setProgress({ processed: 0, total: 0, errors: [] });
    setSummary(null);
    if (fileRef.current) fileRef.current.value = '';
  };

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
            Sube un archivo con tus productos. Validamos cada fila antes de aplicar
            los cambios. Las filas con errores se reportan al final.
          </p>
        </div>
        <Button variant="ghost" onClick={() => dispatch(downloadImportTemplate())}>
          ↓ Descargar plantilla CSV
        </Button>
      </header>

      <ProgressSteps step={step} />

      {step === 'upload' && (
        <section className={styles.uploadCard}>
          <DropZone fileRef={fileRef} onFile={handleFile} />
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
        </section>
      )}

      {step === 'preview' && (
        <section>
          <div className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>
              Previsualización · {preview.length} filas detectadas
            </h3>
            <div className={styles.previewStats}>
              <Stat n={preview.filter(r => r.action === 'create').length} label="Crear" tone="lime" />
              <Stat n={preview.filter(r => r.action === 'update').length} label="Actualizar" tone="coral" />
              <Stat n={preview.filter(r => r.action === 'skip').length} label="Saltar" tone="muted" />
              <Stat n={preview.filter(r => r.errors?.length).length} label="Con errores" tone="vino" />
            </div>
          </div>

          <div className={styles.previewTable}>
            <table>
              <thead>
                <tr><th></th><th>SKU</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acción</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {preview.slice(0, 50).map((row, i) => (
                  <tr key={i} className={row.errors?.length ? styles.rowError : ''}>
                    <td className={styles.mono}>{i + 1}</td>
                    <td className={styles.mono}>{row.sku}</td>
                    <td>{row.name}</td>
                    <td className={styles.mono}>${row.base_price?.toLocaleString('es-MX')}</td>
                    <td className={styles.mono}>{row.stock}</td>
                    <td>
                      <span className={`${styles.actionBadge} ${styles[`act_${row.action}`]}`}>{row.action}</span>
                    </td>
                    <td>
                      {row.errors?.length > 0
                        ? <span className={styles.errorMsg}>{row.errors.join(', ')}</span>
                        : <span className={styles.okMsg}>✓ OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 50 && (
              <div className={styles.previewMore}>
                + {preview.length - 50} filas más se procesarán al confirmar
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={reset}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={preview.every(r => r.errors?.length)}
            >
              Confirmar y aplicar
            </Button>
          </div>
        </section>
      )}

      {step === 'processing' && (
        <section className={styles.processingBox}>
          <div className={styles.spinner} />
          <h3 className={styles.processingTitle}>Procesando…</h3>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(progress.processed / progress.total) * 100}%` }} />
          </div>
          <div className={styles.progressMeta}>
            {progress.processed} de {progress.total} filas
          </div>
        </section>
      )}

      {step === 'done' && summary && (
        <section className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${summary.state === 'DONE' ? styles.iconOk : styles.iconFail}`}>
            {summary.state === 'DONE' ? '✓' : '✕'}
          </div>
          <h3 className={styles.summaryTitle}>
            {summary.state === 'DONE' ? 'Importación completa' : 'Importación con errores'}
          </h3>
          <div className={styles.summaryStats}>
            <Stat n={summary.created || 0} label="Creados" tone="lime" />
            <Stat n={summary.updated || 0} label="Actualizados" tone="coral" />
            <Stat n={summary.skipped || 0} label="Saltados" tone="muted" />
            <Stat n={(summary.errors || []).length} label="Errores" tone="vino" />
          </div>
          {summary.errors_csv_url && (
            <a href={summary.errors_csv_url} className={styles.errorDownload}>
              ↓ Descargar CSV de errores ({summary.errors.length} filas)
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
    { id: 'preview',    label: 'Validar' },
    { id: 'processing', label: 'Procesar' },
    { id: 'done',       label: 'Resumen' },
  ];
  const currentIdx = steps.findIndex(s => s.id === step);
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

function DropZone({ fileRef, onFile }) {
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
      <div className={styles.dropTitle}>Arrastra tu CSV aquí o haz clic para seleccionar</div>
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
