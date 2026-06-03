/**
 * Card — contenedor de contenido nativo, sin dependencias.
 *
 * Inspirado en kno-react-layout Card (CardHeader/CardBody/CardFooter/
 * CardTitle/CardSubtitle, type/themeColor). Adaptado al template: una
 * sola pieza componible con header (título/subtítulo) opcional, body y
 * footer opcionales, más subcomponentes exportados para composición
 * manual cuando el caso lo requiere.
 *
 * API (modo simple):
 *   <Card title="Pedido #123" subtitle="2 artículos" footer={<Button/>}>
 *     contenido…
 *   </Card>
 *
 * API (modo composición):
 *   <Card>
 *     <CardHeader><h3>Título</h3></CardHeader>
 *     <CardBody>contenido…</CardBody>
 *     <CardFooter><Button/></CardFooter>
 *   </Card>
 *
 * Props:
 *   - title:    ReactNode opcional — se renderiza como heading (h3) en el header.
 *   - subtitle: ReactNode opcional — texto secundario bajo el título.
 *   - children: ReactNode — el cuerpo de la card.
 *   - footer:   ReactNode opcional — pie de la card (acciones, totales…).
 *   - tone:     'default'|'vino'|'lime'|'coral'|'bronze' (default 'default').
 *   - padding:  'none'|'sm'|'md'|'lg' (default 'md') — relleno del body.
 *   - className: string opcional — clases extra sobre el contenedor.
 *   - as:       string — elemento del contenedor (default 'section').
 */
import styles from './Card.module.scss';

const TONES = ['default', 'vino', 'lime', 'coral', 'bronze'];
const PADDINGS = ['none', 'sm', 'md', 'lg'];

export function CardHeader({ children, className = '' }) {
  return <div className={`${styles.header} ${className}`.trim()}>{children}</div>;
}

export function CardBody({ children, padding = 'md', className = '' }) {
  const safePadding = PADDINGS.includes(padding) ? padding : 'md';
  return (
    <div
      className={[styles.body, styles[`padding_${safePadding}`], className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return <div className={`${styles.footer} ${className}`.trim()}>{children}</div>;
}

const Card = ({
  title,
  subtitle,
  children,
  footer,
  tone = 'default',
  padding = 'md',
  className = '',
  as: Element = 'section',
}) => {
  const safeTone = TONES.includes(tone) ? tone : 'default';
  const hasHeader = title != null || subtitle != null;

  return (
    <Element
      className={[styles.card, styles[`tone_${safeTone}`], className]
        .filter(Boolean)
        .join(' ')}
      data-testid="card"
      data-tone={safeTone}
    >
      {hasHeader && (
        <CardHeader>
          {title != null && <h3 className={styles.title}>{title}</h3>}
          {subtitle != null && <p className={styles.subtitle}>{subtitle}</p>}
        </CardHeader>
      )}
      {children != null && <CardBody padding={padding}>{children}</CardBody>}
      {footer != null && <CardFooter>{footer}</CardFooter>}
    </Element>
  );
};

export default Card;
