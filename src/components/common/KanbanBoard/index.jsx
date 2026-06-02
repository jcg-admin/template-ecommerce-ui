/**
 * KanbanBoard — ecommerce-ui
 * Tablero nativo (codigo propio, sin dependencias externas) que organiza
 * tarjetas en columnas. Pensado para el panel admin: p. ej. pedidos por
 * estado (Por hacer / En curso / Completado).
 *
 * Movimiento de tarjetas entre columnas por dos vias:
 *   1. Drag-and-drop con la HTML Drag & Drop API nativa.
 *   2. Controles por tarjeta (botones) para mover a la columna anterior /
 *      siguiente, accesibles por teclado y con aria-label descriptivo.
 *
 * En ambos casos se invoca onCardMove(cardId, toColumnId).
 *
 * Props:
 *   columns     — array de { id, title }.
 *   cards       — array de { id, columnId, ... }. Se filtran por columnId.
 *   renderCard  — (card) => ReactNode. Render del contenido de cada tarjeta.
 *   onCardMove  — (cardId, toColumnId) => void. Opcional.
 *   ariaLabel   — etiqueta accesible del tablero.
 *   className    — clases extra para el contenedor.
 */
import styles from './KanbanBoard.module.scss';

const DND_TYPE = 'text/plain';

export default function KanbanBoard({
  columns = [],
  cards = [],
  renderCard,
  onCardMove,
  ariaLabel,
  className,
}) {
  const move = (cardId, toColumnId) => {
    if (cardId == null || toColumnId == null) return;
    if (typeof onCardMove === 'function') onCardMove(cardId, toColumnId);
  };

  const handleDragStart = (event, cardId) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData(DND_TYPE, String(cardId));
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event, toColumnId) => {
    event.preventDefault();
    const cardId = event.dataTransfer && event.dataTransfer.getData(DND_TYPE);
    if (cardId) move(cardId, toColumnId);
  };

  return (
    <div
      className={[styles.board, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
    >
      {columns.map((column, columnIndex) => {
        const columnCards = cards.filter((card) => card.columnId === column.id);
        const prevColumn = columns[columnIndex - 1];
        const nextColumn = columns[columnIndex + 1];

        return (
          <section
            key={column.id}
            className={styles.column}
            role="region"
            aria-label={column.title}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, column.id)}
          >
            <header className={styles.columnHeader}>
              <h3 className={styles.columnTitle}>{column.title}</h3>
              <span className={styles.count} aria-label={`${columnCards.length} tarjetas`}>
                {columnCards.length}
              </span>
            </header>

            <ul className={styles.cardList}>
              {columnCards.map((card) => {
                const cardName = card.label ?? card.title ?? card.id;
                return (
                  <li
                    key={card.id}
                    className={styles.card}
                    draggable="true"
                    onDragStart={(event) => handleDragStart(event, card.id)}
                  >
                    <div className={styles.cardBody}>{renderCard ? renderCard(card) : null}</div>
                    <div className={styles.cardControls}>
                      <button
                        type="button"
                        className={styles.moveButton}
                        aria-label={`Mover ${cardName} a la columna anterior`}
                        disabled={!prevColumn}
                        onClick={() => prevColumn && move(card.id, prevColumn.id)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className={styles.moveButton}
                        aria-label={`Mover ${cardName} a la columna siguiente`}
                        disabled={!nextColumn}
                        onClick={() => nextColumn && move(card.id, nextColumn.id)}
                      >
                        ›
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
