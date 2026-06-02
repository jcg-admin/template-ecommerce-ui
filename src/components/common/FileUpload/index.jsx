/**
 * FileUpload — ecommerce-ui
 * Componente nativo de subida de archivos con drag-and-drop, preview en
 * miniatura y barra de progreso opcional. Inspirado en el Upload de
 * KendoReact pero implementación 100% propia (sin dependencias externas).
 *
 * @param {string}   accept     — filtro de tipos, p.ej. "image/*" o ".pdf,.png"
 * @param {boolean}  multiple   — permite seleccionar varios archivos
 * @param {number}   maxSizeMB  — tamaño máximo por archivo en MB (opcional)
 * @param {Function} onFiles    — callback(files[]) con los archivos válidos
 * @param {number}   progress   — 0..100; barra global opcional. Si no se pasa,
 *                                no se muestra progreso (no hay subida real).
 * @param {string}   label      — texto principal de la zona de drop
 * @param {string}   className  — clases extra para el contenedor
 */
import { useRef, useState, useEffect, useCallback, useId } from 'react';
import styles from './FileUpload.module.scss';

const BYTES_PER_MB = 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
}

// Reproduce la semántica del atributo `accept` de <input type="file">:
// admite "image/*", tipos MIME exactos ("image/png") y extensiones (".pdf").
function matchesAccept(file, accept) {
  if (!accept) return true;
  const tokens = accept.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (tokens.length === 0) return true;
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1)); // "image/"
    return type === token;
  });
}

function isImage(file) {
  return (file.type || '').startsWith('image/');
}

export default function FileUpload({
  accept,
  multiple = false,
  maxSizeMB,
  onFiles,
  progress,
  label = 'Arrastra archivos aquí o haz clic para seleccionar',
  className = '',
}) {
  const inputRef = useRef(null);
  const inputId = useId();
  const [items, setItems] = useState([]); // { file, url }
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  // Liberar las URLs de objeto al desmontar para evitar fugas de memoria.
  useEffect(() => () => {
    items.forEach((it) => it.url && URL.revokeObjectURL(it.url));
  }, [items]);

  const validate = useCallback(
    (file) => {
      if (!matchesAccept(file, accept)) {
        return `El archivo "${file.name}" no es de un tipo permitido.`;
      }
      if (maxSizeMB != null && file.size > maxSizeMB * BYTES_PER_MB) {
        return `El archivo "${file.name}" supera el máximo de ${maxSizeMB} MB.`;
      }
      return null;
    },
    [accept, maxSizeMB],
  );

  const ingest = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      if (incoming.length === 0) return;

      const valid = [];
      let firstError = '';
      for (const file of incoming) {
        const err = validate(file);
        if (err) {
          if (!firstError) firstError = err;
          continue;
        }
        valid.push(file);
      }

      setError(firstError);

      if (valid.length === 0) return;

      const newItems = valid.map((file) => ({
        file,
        url: isImage(file) ? URL.createObjectURL(file) : null,
      }));

      setItems((prev) => {
        // Si no es multiple, sustituye y revoca las URLs previas.
        if (!multiple) {
          prev.forEach((it) => it.url && URL.revokeObjectURL(it.url));
          return newItems.slice(0, 1);
        }
        return [...prev, ...newItems];
      });

      const emitted = multiple ? valid : valid.slice(0, 1);
      onFiles?.(emitted);
    },
    [multiple, validate, onFiles],
  );

  const handleInputChange = useCallback(
    (e) => {
      ingest(e.target.files);
      // Permite volver a seleccionar el mismo archivo tras quitarlo.
      e.target.value = '';
    },
    [ingest],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      ingest(e.dataTransfer?.files);
    },
    [ingest],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleZoneKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    },
    [openPicker],
  );

  const removeItem = useCallback(
    (index) => {
      setItems((prev) => {
        const target = prev[index];
        if (target?.url) URL.revokeObjectURL(target.url);
        const next = prev.filter((_, i) => i !== index);
        onFiles?.(next.map((it) => it.file));
        return next;
      });
    },
    [onFiles],
  );

  const hasProgress = typeof progress === 'number' && !Number.isNaN(progress);
  const clampedProgress = hasProgress ? Math.min(100, Math.max(0, progress)) : 0;

  return (
    <div className={`${styles.root} ${className}`.trim()}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`.trim()}
        role="button"
        tabIndex={0}
        aria-label="Zona de subida de archivos. Arrastra archivos aquí o pulsa para seleccionar."
        onClick={openPicker}
        onKeyDown={handleZoneKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className={styles.label}>{label}</span>
        {accept && <span className={styles.hint}>Tipos: {accept}</span>}
        {maxSizeMB != null && (
          <span className={styles.hint}>Máx. {maxSizeMB} MB por archivo</span>
        )}

        <label htmlFor={inputId} className={styles.srOnly}>
          Seleccionar archivos
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className={styles.input}
          accept={accept}
          multiple={multiple}
          aria-label="Seleccionar archivos"
          onChange={handleInputChange}
        />
      </div>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      {hasProgress && (
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Progreso de subida"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.progressBar} style={{ width: `${clampedProgress}%` }} />
        </div>
      )}

      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((it, index) => (
            <li key={`${it.file.name}-${index}`} className={styles.item}>
              {it.url ? (
                <img className={styles.thumb} src={it.url} alt={`Vista previa de ${it.file.name}`} />
              ) : (
                <span className={styles.thumb} aria-hidden="true">
                  {(it.file.name.split('.').pop() || '?').toUpperCase()}
                </span>
              )}
              <span className={styles.meta}>
                <span className={styles.name}>{it.file.name}</span>
                <span className={styles.size}>{formatSize(it.file.size)}</span>
              </span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Quitar ${it.file.name}`}
                onClick={() => removeItem(index)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { FileUpload };
