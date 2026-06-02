/**
 * CoverageMap — ecommerce-ui (UC-LOG-MAP)
 * Mapa de cobertura de envío renderizado como un SVG ESTÁTICO dibujado a
 * mano: una celda rectangular por zona dispuesta en una cuadrícula. No usa
 * tiles, imágenes externas ni librerías de mapas; todo es SVG nativo.
 *
 * Cada zona es interactiva (click -> onZoneClick(id)) y accesible: cada
 * celda expone role="img" + aria-label "{name}: cubierta/no cubierta". Las
 * zonas cubiertas (covered === true) se pintan distinto de las no cubiertas.
 * Una leyenda simple describe ambos estados. Render seguro con zones=[].
 *
 * @param {Array<{id,name,covered}>} zones      — zonas a representar
 * @param {Function}                 onZoneClick — callback(id) al pulsar zona
 * @param {string}                   ariaLabel   — etiqueta accesible del mapa
 */
import styles from './CoverageMap.module.scss';

const COLUMNS = 3;
const CELL = 64;
const GAP = 8;

export default function CoverageMap({ zones = [], onZoneClick, ariaLabel }) {
  const columns = Math.min(COLUMNS, Math.max(zones.length, 1));
  const rows = Math.max(Math.ceil(zones.length / columns), 0);
  const width = columns * CELL + (columns + 1) * GAP;
  const height = rows * CELL + (rows + 1) * GAP;

  const handleZoneClick = (id) => {
    if (typeof onZoneClick === 'function') onZoneClick(id);
  };

  return (
    <div className={styles.root}>
      <svg
        role="img"
        aria-label={ariaLabel}
        className={styles.map}
        viewBox={`0 0 ${width} ${Math.max(height, GAP)}`}
        width={width}
        height={Math.max(height, GAP)}
      >
        {zones.map((zone, index) => {
          const col = index % columns;
          const row = Math.floor(index / columns);
          const x = GAP + col * (CELL + GAP);
          const y = GAP + row * (CELL + GAP);
          const state = zone.covered ? 'cubierta' : 'no cubierta';
          return (
            <rect
              key={zone.id}
              role="img"
              aria-label={`${zone.name}: ${state}`}
              data-covered={zone.covered ? 'true' : 'false'}
              className={zone.covered ? styles.covered : styles.uncovered}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx="6"
              tabIndex={0}
              onClick={() => handleZoneClick(zone.id)}
            />
          );
        })}
      </svg>
      <ul className={styles.legend}>
        <li className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.covered}`} aria-hidden="true" />
          <span>Cubierta</span>
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.uncovered}`} aria-hidden="true" />
          <span>No cubierta</span>
        </li>
      </ul>
    </div>
  );
}
