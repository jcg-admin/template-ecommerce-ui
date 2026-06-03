/**
 * Skeleton — placeholder de carga accesible nativo, sin dependencias.
 * Inspirado en la API del Skeleton de kno-react-indicators
 * (shape: text|rectangle|circle, animation: pulse|wave|none).
 *
 * API:
 *   <Skeleton shape="text" count={3} animation="pulse" ariaLabel="Cargando" />
 *   <Skeleton shape="circle" width={48} height={48} />
 *   <Skeleton shape="rectangle" width="100%" height={120} />
 *
 * El root expone role="status" + aria-busy="true" para que los
 * lectores de pantalla anuncien el estado de carga. Las piezas
 * visuales se marcan aria-hidden para no contaminar el anuncio.
 */
import styles from './Skeleton.module.scss';

const SHAPES = { text: styles.text, rectangle: styles.rectangle, circle: styles.circle };
const ANIMATIONS = { pulse: styles.pulse, wave: styles.wave, none: '' };

const toCssSize = (value) => (typeof value === 'number' ? `${value}px` : value);

const Skeleton = ({
  shape = 'text',
  width,
  height,
  animation = 'pulse',
  count = 1,
  ariaLabel = 'Cargando',
}) => {
  const shapeClass = SHAPES[shape] || styles.text;
  const animationClass = ANIMATIONS[animation] ?? styles.pulse;

  const style = {};
  if (width !== undefined) style.width = toCssSize(width);
  if (height !== undefined) style.height = toCssSize(height);

  const safeCount = Number.isFinite(Number(count)) && Number(count) > 0 ? Math.floor(Number(count)) : 1;
  const pieces = shape === 'text' ? safeCount : 1;

  return (
    <span
      className={styles.wrapper}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {Array.from({ length: pieces }, (_, i) => (
        <span
          key={i}
          data-testid="skeleton-piece"
          data-shape={shape}
          data-animation={animation}
          aria-hidden="true"
          className={[styles.piece, shapeClass, animationClass].filter(Boolean).join(' ')}
          style={style}
        />
      ))}
    </span>
  );
};

export default Skeleton;
