/**
 * Avatar — ecommerce-ui
 * Representa a una persona o entidad con una imagen, iniciales o un glifo.
 *
 * Inspirado en el Avatar de kno-react-layout (@progress/kno-react-layout):
 * tipos image | text | icon, tamaño, forma (rounded/square) y themeColor.
 * Aquí la API se adapta a las convenciones del repo: la fuente de datos
 * (src / name) decide el tipo de render, en lugar de un prop `type` explícito.
 *
 *   - src presente            → <img>
 *   - sin src pero con name   → iniciales (1-2 letras, mayúsculas)
 *   - sin src ni name         → glifo genérico de usuario
 *
 * Uso típico: UC-AUTH (perfil / header).
 */
import styles from './Avatar.module.scss';

const USER_GLYPH = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
       className={styles.glyph}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
  </svg>
);

// Deriva 1-2 iniciales en mayúsculas a partir del nombre.
// "Ada Lovelace" → "AL" · "madonna" → "M" · "  " → ""
function initialsFrom(name) {
  if (!name || typeof name !== 'string') return '';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export default function Avatar({
  src,
  alt,
  name,
  size  = 'md',     // 'sm' | 'md' | 'lg'
  shape = 'circle', // 'circle' | 'square'
  tone  = 'bronze', // 'bronze' | 'primary' | 'muted' (color del fallback)
  className = '',
}) {
  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size] || styles.sizeMd;

  const shapeClass = {
    circle: styles.shapeCircle,
    square: styles.shapeSquare,
  }[shape] || styles.shapeCircle;

  const toneClass = {
    bronze:  styles.toneBronze,
    primary: styles.tonePrimary,
    muted:   styles.toneMuted,
  }[tone] || styles.toneBronze;

  const cls = [styles.avatar, sizeClass, shapeClass, className]
    .filter(Boolean).join(' ');

  // data-* expone size/shape/variant para estilos externos y tests
  // (los CSS Modules se mockean en Jest, así que las clases no son
  // observables; los data-attrs sí).
  const dataAttrs = { 'data-size': size, 'data-shape': shape };

  // Render por imagen.
  if (src) {
    return (
      <span className={cls} {...dataAttrs} data-variant="image">
        <img
          src={src}
          alt={alt ?? name ?? ''}
          className={styles.img}
        />
      </span>
    );
  }

  const initials = initialsFrom(name);

  // Render por iniciales.
  if (initials) {
    return (
      <span
        className={`${cls} ${styles.fallback} ${toneClass}`}
        {...dataAttrs}
        data-variant="text"
        role="img"
        aria-label={alt ?? name}
      >
        <span className={styles.initials} aria-hidden="true">{initials}</span>
      </span>
    );
  }

  // Render por glifo genérico.
  return (
    <span
      className={`${cls} ${styles.fallback} ${toneClass}`}
      {...dataAttrs}
      data-variant="icon"
      role="img"
      aria-label={alt ?? 'Usuario'}
    >
      {USER_GLYPH}
    </span>
  );
}
export { Avatar };
