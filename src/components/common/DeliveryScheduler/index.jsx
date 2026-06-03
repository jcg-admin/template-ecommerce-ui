/**
 * DeliveryScheduler — ecommerce-ui
 * Selector nativo de fecha/franja de entrega. Sin dependencias externas.
 *
 * Renderiza las franjas (`slots`) agrupadas por `date`, cada una como un
 * botón seleccionable. La franja activa (`value`) se marca con
 * aria-pressed/aria-checked. Las franjas con `available === false` quedan
 * deshabilitadas. El contenedor es un grupo accesible (role="group").
 *
 * UC-CHT-SCHED.
 */
import { useId } from 'react';
import styles from './DeliveryScheduler.module.scss';

// Agrupa las franjas por su fecha preservando el orden de aparición.
function groupByDate(slots) {
  const groups = [];
  const index = new Map();
  for (const slot of slots) {
    if (!index.has(slot.date)) {
      index.set(slot.date, groups.length);
      groups.push({ date: slot.date, slots: [] });
    }
    groups[index.get(slot.date)].slots.push(slot);
  }
  return groups;
}

export default function DeliveryScheduler({
  slots = [],
  value,
  onSelect,
  ariaLabel = 'Fecha de entrega',
}) {
  const baseId = useId();
  const groups = groupByDate(slots);

  return (
    <div className={styles.scheduler} role="group" aria-label={ariaLabel}>
      {groups.map((group) => {
        const headingId = `${baseId}-${group.date}`;
        return (
          <section
            key={group.date}
            className={styles.group}
            aria-labelledby={headingId}
          >
            <h3 id={headingId} className={styles.groupHeading}>
              {group.date}
            </h3>
            <div className={styles.slots}>
              {group.slots.map((slot) => {
                const disabled = slot.available === false;
                const selected = slot.id === value;
                const slotLabel = `${slot.date} ${slot.label}`;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    className={`${styles.slot}${selected ? ` ${styles.slotSelected}` : ''}`}
                    aria-label={slotLabel}
                    aria-pressed={selected}
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      onSelect?.(slot.id);
                    }}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
