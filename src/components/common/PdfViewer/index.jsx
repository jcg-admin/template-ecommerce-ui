/**
 * PdfViewer — ecommerce-ui
 * Visor de PDF por URL para facturas de pedido / fichas técnicas.
 *
 * Implementación NATIVA propia (inspirada conceptualmente en el PDF Viewer
 * de KendoReact, pero sin importar ni copiar nada de @progress/kendo-* y sin
 * añadir librerías nuevas). El documento se embebe vía <iframe> apuntando a
 * la URL del PDF — lo nativo posible sin parsear el binario del PDF.
 *
 * @param {string} url    — URL del PDF a mostrar
 * @param {string} title  — título mostrado en la toolbar y usado como
 *                          título accesible del iframe (opcional)
 * @param {number} height — alto del cuerpo del visor en px (default 600)
 */
import { useState } from 'react';
import styles from './PdfViewer.module.scss';

export default function PdfViewer({ url, title, height = 600, className = '' }) {
  const [loading, setLoading] = useState(Boolean(url));

  const frameTitle = title || 'Documento PDF';

  // Estado vacío: sin URL no hay nada que embeber.
  if (!url) {
    return (
      <div className={`${styles.viewer} ${className}`}>
        <div className={styles.toolbar}>
          <span className={styles.title}>{title || 'Documento PDF'}</span>
        </div>
        <div
          role="status"
          className={styles.empty}
          style={{ height }}
        >
          No hay documento disponible
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.viewer} ${className}`}>
      <div className={styles.toolbar}>
        <span className={styles.title}>{title || 'Documento PDF'}</span>
        <div className={styles.actions}>
          <a
            className={styles.action}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir el documento PDF en una pestaña nueva"
          >
            Abrir en pestaña nueva
          </a>
          <a
            className={styles.action}
            href={url}
            download
            aria-label="Descargar el documento PDF"
          >
            Descargar
          </a>
        </div>
      </div>

      <div className={styles.body} style={{ height }}>
        {loading && (
          <div role="status" className={styles.loading}>
            Cargando documento…
          </div>
        )}
        <iframe
          title={frameTitle}
          src={url}
          className={styles.frame}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}

export { PdfViewer };
