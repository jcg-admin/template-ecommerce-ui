/**
 * ProductGallery — ecommerce-ui
 * Galería de imágenes de producto NATIVA (código propio).
 * Inspirada conceptualmente en un ScrollView/visor de imágenes, pero sin
 * importar ni copiar nada de @progress/kendo-* — implementación 100% propia.
 *
 * Props:
 *   images       — Array<{ id, url, alt }>  (default [])
 *   initialIndex — número, índice inicial mostrado (default 0)
 *   className    — clase extra opcional para el contenedor
 *
 * Comportamiento:
 *   - Imagen principal grande + tira de thumbnails clicables.
 *   - El thumbnail activo se resalta (aria-current="true").
 *   - Botones anterior/siguiente con navegación CON WRAP (al pasar del último
 *     vuelve al primero y viceversa), consistente con el Carousel vecino.
 *   - Teclado: ArrowLeft / ArrowRight cuando la galería (o un hijo) tiene foco.
 *   - images vacío → render seguro (placeholder accesible), no rompe.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './ProductGallery.module.scss';

export default function ProductGallery({
  images = [],
  initialIndex = 0,
  className = '',
}) {
  const total = Array.isArray(images) ? images.length : 0;

  // Índice inicial saneado dentro del rango válido.
  const clampInitial = total > 0
    ? Math.min(Math.max(initialIndex, 0), total - 1)
    : 0;

  const [current, setCurrent] = useState(clampInitial);
  const rootRef = useRef(null);

  // Si cambia el set de imágenes y el índice queda fuera de rango, lo reajusta.
  useEffect(() => {
    if (current > total - 1) {
      setCurrent(total > 0 ? total - 1 : 0);
    }
  }, [total, current]);

  const goTo = useCallback((idx) => {
    if (total === 0) return;
    const next = ((idx % total) + total) % total; // wrap en ambos sentidos
    setCurrent(next);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  const handleKeyDown = useCallback((e) => {
    if (total <= 1) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  }, [total, prev, next]);

  // Caso vacío: render seguro con placeholder accesible.
  if (total === 0) {
    return (
      <div
        className={[styles.gallery, className].filter(Boolean).join(' ')}
        role="group"
        aria-label="Galería de imágenes del producto"
      >
        <div className={styles.placeholder} role="img" aria-label="Sin imágenes disponibles">
          Sin imágenes disponibles
        </div>
      </div>
    );
  }

  const activeImage = images[current];

  return (
    <div
      ref={rootRef}
      className={[styles.gallery, className].filter(Boolean).join(' ')}
      role="group"
      aria-roledescription="galería de imágenes"
      aria-label="Galería de imágenes del producto"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.main}>
        <img
          className={styles.mainImage}
          src={activeImage.url}
          alt={activeImage.alt || ''}
          data-testid="product-gallery-main"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              className={`${styles.control} ${styles.controlPrev}`}
              onClick={prev}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.control} ${styles.controlNext}`}
              onClick={next}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <ul className={styles.thumbs} aria-label="Miniaturas del producto">
          {images.map((img, i) => {
            const isActive = i === current;
            return (
              <li key={img.id ?? i} className={styles.thumbItem}>
                <button
                  type="button"
                  className={`${styles.thumb} ${isActive ? styles.thumbActive : ''}`}
                  onClick={() => goTo(i)}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`Ver imagen ${i + 1} de ${total}${img.alt ? `: ${img.alt}` : ''}`}
                >
                  <img
                    className={styles.thumbImage}
                    src={img.url}
                    alt={img.alt || ''}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
