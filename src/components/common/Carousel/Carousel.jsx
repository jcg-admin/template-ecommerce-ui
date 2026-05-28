/**
 * Carousel — ecommerce-ui
 * Carrusel basado en scroll-snap CSS nativo.
 * Sin dependencias de JS para el scroll — el browser gestiona el snapping.
 *
 * Referencia: ui-core carousel.js (T-502)
 * Iniciativa: integrar-componentes-ui-core-js
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import styles from './Carousel.module.scss';

export default function Carousel({
  children,
  autoPlay  = false,
  interval  = 4000,
  showDots  = true,
  showArrows = true,
  className = '',
  ariaLabel = 'Carrusel de contenido',
}) {
  const trackRef  = useRef(null);
  const timerRef  = useRef(null);
  const [current, setCurrent] = useState(0);
  const count     = Array.isArray(children) ? children.length : 1;

  const goTo = useCallback((index) => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.children[index];
    if (!slide) return;
    slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    setCurrent(index);
  }, []);

  const next = useCallback(() => goTo((current + 1) % count), [goTo, current, count]);
  const prev = useCallback(() => goTo((current - 1 + count) % count), [goTo, current, count]);

  // Auto-play con pausa en hover
  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, next, interval]);

  const pauseAutoPlay = useCallback(() => clearInterval(timerRef.current), []);
  const resumeAutoPlay = useCallback(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(next, interval);
  }, [autoPlay, next, interval]);

  // IntersectionObserver para saber qué slide es visible
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(track.children).indexOf(entry.target);
            if (idx >= 0) setCurrent(idx);
          }
        });
      },
      { root: track, threshold: 0.6 }
    );

    Array.from(track.children).forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [count]);

  return (
    <section
      className={`${styles.carousel} ${className}`}
      aria-label={ariaLabel}
      aria-roledescription="carrusel"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Track con scroll-snap */}
      <div ref={trackRef} className={styles.track} aria-live="polite">
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={i}
                className={styles.slide}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${i + 1} de ${count}`}
              >
                {child}
              </div>
            ))
          : <div className={styles.slide}>{children}</div>
        }
      </div>

      {/* Controles */}
      {showArrows && count > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={prev}
            aria-label="Diapositiva anterior"
          >‹</button>
          <button
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={next}
            aria-label="Siguiente diapositiva"
          >›</button>
        </>
      )}

      {/* Dots de navegación */}
      {showDots && count > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Navegar por diapositivas">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              role="tab"
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              aria-selected={i === current}
              aria-label={`Ir a diapositiva ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
