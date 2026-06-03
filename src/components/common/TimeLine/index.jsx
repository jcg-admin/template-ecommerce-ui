/**
 * TimeLine — línea de tiempo vertical de eventos fechados, nativa, sin deps.
 * Inspirada en kno-react-layout TimeLine (events [{date, title, ...}]).
 * Sirve el seguimiento de pedido/envío (UC-ORD / UC-LOG): cada evento es un
 * hito con dot de estado (done/current/pending), título, fecha y descripción.
 *
 * API:
 *   <TimeLine
 *     events={[{ title, date?, description?, status?, icon? }]}
 *     ariaLabel="Línea de tiempo"
 *   />
 *
 * status: 'done' | 'current' | 'pending' (default 'pending').
 */
import styles from './TimeLine.module.scss';

// Clase de dot por estado. Las claves son el contrato estable del status;
// los valores (styles.*) están mockeados a undefined bajo Jest, por lo que
// la validación de status usa VALID_STATUS (claves), no estos valores.
const DOT_STATE = {
  done:    styles.dotDone,
  current: styles.dotCurrent,
  pending: styles.dotPending,
};

const VALID_STATUS = new Set(['done', 'current', 'pending']);

const TimeLine = ({ events = [], ariaLabel = 'Línea de tiempo' }) => {
  const items = Array.isArray(events) ? events : [];

  return (
    <ol className={styles.timeline} aria-label={ariaLabel}>
      {items.map((event, i) => {
        const status = VALID_STATUS.has(event?.status) ? event.status : 'pending';
        const isLast = i === items.length - 1;

        return (
          <li
            key={`tl-${i}`}
            className={[
              styles.item,
              styles[`item_${status}`],
              isLast ? styles.itemLast : '',
            ].filter(Boolean).join(' ')}
            data-status={status}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            <span className={`${styles.dot} ${DOT_STATE[status]}`} aria-hidden="true">
              {event?.icon ?? null}
            </span>

            <div className={styles.body}>
              <div className={styles.title}>{event?.title}</div>
              {event?.date && <time className={styles.date}>{event.date}</time>}
              {event?.description && (
                <div className={styles.description}>{event.description}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default TimeLine;
