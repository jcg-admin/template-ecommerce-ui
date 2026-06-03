/**
 * Badge — indicador nativo de conteo/estado, sin dependencias.
 *
 * Inspirado en kno-react-indicators Badge (value/content, themeColor,
 * position, max, dot). Adaptado a la paleta del template (bronze/vino/
 * lime/coral).
 *
 * API:
 *   // Inline (sin children): el badge se renderiza solo.
 *   <Badge value={3} tone="coral" />
 *
 *   // Posicionado (con children): el badge se ancla arriba-derecha.
 *   <Badge value={cartCount}>
 *     <CartIcon />
 *   </Badge>
 *
 *   // Modo dot: punto sin texto (siempre visible).
 *   <Badge dot tone="lime"><BellIcon /></Badge>
 *
 * Props:
 *   - value:    number|string — el conteo o etiqueta a mostrar.
 *   - max:      number (default 99) — por encima muestra "<max>+".
 *   - tone:     'bronze'|'vino'|'lime'|'coral' (default 'coral').
 *   - dot:      bool — punto sin texto (ignora value para el contenido).
 *   - children: ReactNode opcional — si está presente, el badge se
 *               posiciona arriba-derecha sobre los children.
 *
 * Se oculta cuando value es 0/vacío salvo que dot sea true.
 * Casos de uso: contadores de carrito y de notificaciones.
 */
import styles from './Badge.module.scss';

const TONES = ['bronze', 'vino', 'lime', 'coral'];

const isEmptyValue = (value) =>
  value === 0 ||
  value === '0' ||
  value === null ||
  value === undefined ||
  value === '';

const Badge = ({ value, max = 99, tone = 'coral', dot = false, children }) => {
  const safeTone = TONES.includes(tone) ? tone : 'coral';

  // En modo dot el badge siempre es visible y no muestra texto.
  // En modo conteo, se oculta cuando el valor es 0/vacío.
  const hidden = !dot && isEmptyValue(value);

  let display = '';
  let ariaLabel;
  if (!dot) {
    const numeric = Number(value);
    if (typeof value === 'number' || (!Number.isNaN(numeric) && value !== '')) {
      const safeMax = Number(max);
      display =
        Number.isFinite(safeMax) && numeric > safeMax
          ? `${safeMax}+`
          : String(value);
    } else {
      display = String(value);
    }
    ariaLabel = display;
  }

  const indicator = hidden ? null : (
    <span
      className={[
        styles.badge,
        styles[safeTone],
        dot && styles.dot,
        children && styles.positioned,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid="badge"
      role="status"
      aria-label={dot ? undefined : ariaLabel}
    >
      {!dot && display}
    </span>
  );

  if (children) {
    return (
      <span className={styles.wrapper}>
        {children}
        {indicator}
      </span>
    );
  }

  return indicator;
};

export default Badge;
