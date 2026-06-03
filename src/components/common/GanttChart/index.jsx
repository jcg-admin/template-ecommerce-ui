/**
 * GanttChart — ecommerce-ui
 * Componente NATIVO (codigo propio) inspirado en el Gantt de KendoReact pero
 * sin importar ni copiar nada de @progress/kendo-*. Pensado para visualizar
 * la linea de tiempo de tareas/etapas de fulfillment/logistica de pedidos
 * en el panel admin.
 *
 * Props:
 *   tasks       — array de { id, name, start, end, progress? }
 *                 start/end: fecha ISO string o Date.
 *                 progress: 0-100 (opcional) -> relleno de progreso.
 *   rangeStart  — inicio del rango (ISO|Date). Si falta, min de las tareas.
 *   rangeEnd    — fin del rango (ISO|Date). Si falta, max de las tareas.
 *   ticks       — numero de marcas en el eje temporal (default 5).
 *   showToday   — pinta el marcador de "hoy" si cae en el rango (default true).
 *   className   — clases extra para el contenedor.
 *
 * Calculos de fecha con Date nativo (sin librerias).
 */
import styles from './GanttChart.module.scss';

// Convierte ISO string | Date | number a timestamp (ms). null si invalido.
function toTime(value) {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  const t = d.getTime();
  return Number.isNaN(t) ? null : t;
}

// Etiqueta corta de fecha para el eje (dd MMM).
function formatTick(time) {
  const d = new Date(time);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

// Etiqueta legible para aria-label.
function formatFull(time) {
  if (time == null) return '—';
  return new Date(time).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

const clampPct = (n) => Math.min(100, Math.max(0, n));

export default function GanttChart({
  tasks = [],
  rangeStart,
  rangeEnd,
  ticks = 5,
  _showToday = true,
  className = '',
}) {
  const list = Array.isArray(tasks) ? tasks : [];

  // Normaliza tareas a timestamps utilizables.
  const rows = list.map((t) => {
    const start = toTime(t?.start);
    const end = toTime(t?.end);
    return {
      id: t?.id,
      name: t?.name ?? '',
      start,
      end,
      progress: typeof t?.progress === 'number'
        ? clampPct(t.progress)
        : null,
    };
  });

  // Rango total: props si vienen, si no min/max de las tareas.
  const starts = rows.map((r) => r.start).filter((v) => v != null);
  const ends = rows.map((r) => r.end).filter((v) => v != null);

  const rangeStartTime = toTime(rangeStart)
    ?? (starts.length ? Math.min(...starts) : null);
  const rangeEndTime = toTime(rangeEnd)
    ?? (ends.length ? Math.max(...ends) : null);

  const hasRange = rangeStartTime != null
    && rangeEndTime != null
    && rangeEndTime > rangeStartTime;
  const total = hasRange ? rangeEndTime - rangeStartTime : 0;

  // Posicion/ancho de una barra en % dentro del rango.
  const geometry = (start, end) => {
    if (!hasRange || start == null || end == null) {
      return { left: 0, width: 0 };
    }
    const left = clampPct(((start - rangeStartTime) / total) * 100);
    const rawWidth = ((end - start) / total) * 100;
    const width = clampPct(Math.max(rawWidth, 0));
    return { left, width: Math.min(width, 100 - left) };
  };

  // Marcas del eje temporal.
  const axisTicks = [];
  if (hasRange) {
    const count = Math.max(2, ticks);
    for (let i = 0; i < count; i += 1) {
      const time = rangeStartTime + (total * i) / (count - 1);
      axisTicks.push({
        time,
        left: (i / (count - 1)) * 100,
      });
    }
  }

  // Marcador de "hoy".
  const now = Date.now();
  const todayInRange = hasRange && now >= rangeStartTime && now <= rangeEndTime;
  const todayLeft = todayInRange
    ? clampPct(((now - rangeStartTime) / total) * 100)
    : 0;

  const rootClass = [styles.gantt, className].filter(Boolean).join(' ');

  if (rows.length === 0) {
    return (
      <div className={rootClass} role="figure" aria-label="Diagrama de Gantt vacío">
        <p className={styles.empty}>No hay tareas para mostrar.</p>
      </div>
    );
  }

  return (
    <div className={rootClass} role="figure" aria-label="Diagrama de Gantt">
      {/* Eje temporal */}
      {hasRange && (
        <div className={styles.axis} aria-hidden="true">
          <span className={styles.axisSpacer} />
          <div className={styles.axisTrack}>
            {axisTicks.map((tick) => (
              <span
                key={tick.time}
                className={styles.axisTick}
                style={{ left: `${tick.left}%` }}
              >
                {formatTick(tick.time)}
              </span>
            ))}
            {todayInRange && (
              <span
                className={styles.todayMarker}
                style={{ left: `${todayLeft}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* Filas de tareas */}
      <ul className={styles.rows}>
        {rows.map((row, i) => {
          const { left, width } = geometry(row.start, row.end);
          const label = `${row.name}: del ${formatFull(row.start)} `
            + `al ${formatFull(row.end)}`
            + (row.progress != null ? `, ${row.progress}% completado` : '');

          return (
            <li
              key={row.id ?? `gantt-row-${i}`}
              className={styles.row}
              data-task-id={row.id ?? undefined}
            >
              <span className={styles.label} title={row.name}>
                {row.name}
              </span>
              <div className={styles.track}>
                {todayInRange && (
                  <span
                    className={styles.todayLine}
                    style={{ left: `${todayLeft}%` }}
                    aria-hidden="true"
                  />
                )}
                <div
                  className={styles.bar}
                  role="img"
                  aria-label={label}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {row.progress != null && (
                    <span
                      className={styles.progress}
                      style={{ width: `${row.progress}%` }}
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { GanttChart };
