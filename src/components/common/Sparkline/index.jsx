/**
 * Sparkline — micro-gráfico SVG inline accesible nativo, sin dependencias.
 * Iniciativa: UC-REP-01 (mini-charts de reporte de ventas) / KPIs admin.
 *
 * Inspirado en kno-react-charts Sparkline: un gráfico compacto sin ejes
 * que enfatiza la tendencia del valor. Pura geometría SVG (polyline / path /
 * rects) calculada con escalado min/max — NO usa motor de charting ni deps.
 *
 * API:
 *   <Sparkline
 *     data={[3, 5, 2, 8, 6]}
 *     type="line"        // 'line' | 'bar' | 'area'  (default 'line')
 *     width={120}
 *     height={32}
 *     tone="bronze"      // 'bronze' | 'lime' | 'coral'  (default 'bronze')
 *     ariaLabel="…"
 *   />
 */
import styles from './Sparkline.module.scss';

// Margen interno para que el trazo no se recorte contra los bordes del viewBox.
const PADDING = 2;

const TONE_CLASS = {
  bronze: styles.toneBronze,
  lime: styles.toneLime,
  coral: styles.toneCoral,
};

// Normaliza la entrada a una lista de números finitos.
const toNumbers = (data) =>
  (Array.isArray(data) ? data : [])
    .map((d) => Number(d))
    .filter((n) => Number.isFinite(n));

// Proyecta cada valor a coordenadas SVG con escalado min/max.
// Cuando todos los valores son iguales (rango 0) se dibuja una línea media.
const buildPoints = (values, width, height) => {
  const innerW = width - PADDING * 2;
  const innerH = height - PADDING * 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0;

  return values.map((v, i) => {
    const x = PADDING + (values.length > 1 ? stepX * i : innerW / 2);
    // y invertida: valores altos arriba. Rango 0 → centro vertical.
    const ratio = range === 0 ? 0.5 : (v - min) / range;
    const y = PADDING + innerH - ratio * innerH;
    return { x, y };
  });
};

const Sparkline = ({
  data,
  type = 'line',
  width = 120,
  height = 32,
  tone = 'bronze',
  ariaLabel,
}) => {
  const values = toNumbers(data);
  const toneClass = TONE_CLASS[tone] || TONE_CLASS.bronze;

  // aria-label por defecto: resume primer → último valor (tendencia).
  const computedLabel =
    ariaLabel ||
    (values.length === 0
      ? 'Gráfico sin datos'
      : values.length === 1
        ? `Valor ${values[0]}`
        : `Tendencia de ${values[0]} a ${values[values.length - 1]}`);

  const svgProps = {
    className: `${styles.svg} ${toneClass}`,
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    role: 'img',
    'aria-label': computedLabel,
    preserveAspectRatio: 'none',
    focusable: 'false',
  };

  // Estado vacío: SVG válido sin geometría, no rompe el render.
  if (values.length === 0) {
    return <svg {...svgProps} data-testid="sparkline-empty" />;
  }

  const points = buildPoints(values, width, height);

  if (type === 'bar') {
    // Ancho de barra con un pequeño gap proporcional al número de barras.
    const innerW = width - PADDING * 2;
    const slot = innerW / values.length;
    const gap = slot * 0.25;
    const barW = Math.max(slot - gap, 0.5);
    const baseline = height - PADDING;

    return (
      <svg {...svgProps}>
        {points.map((p, i) => {
          const x = PADDING + slot * i + gap / 2;
          const barH = Math.max(baseline - p.y, 0);
          return (
            <rect
              key={i}
              className={styles.bar}
              data-testid="sparkline-bar"
              x={x}
              y={p.y}
              width={barW}
              height={barH}
            />
          );
        })}
      </svg>
    );
  }

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  if (type === 'area') {
    // El área cierra el polyline contra la baseline inferior.
    const baseline = height - PADDING;
    const areaPath =
      `M ${points[0].x},${baseline} ` +
      points.map((p) => `L ${p.x},${p.y}`).join(' ') +
      ` L ${points[points.length - 1].x},${baseline} Z`;

    return (
      <svg {...svgProps}>
        <path className={styles.area} data-testid="sparkline-area" d={areaPath} />
        <polyline
          className={styles.line}
          data-testid="sparkline-line"
          points={linePoints}
        />
      </svg>
    );
  }

  // type === 'line' (default)
  return (
    <svg {...svgProps}>
      <polyline
        className={styles.line}
        data-testid="sparkline-line"
        points={linePoints}
      />
    </svg>
  );
};

export default Sparkline;
