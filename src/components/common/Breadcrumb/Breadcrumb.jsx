/**
 * Breadcrumb — ecommerce-ui
 * Migas de pan para navegacion jerarquica (UC-CAT navigation).
 *
 * Inspirado en kno-react-layout Breadcrumb (data/items, onItemSelect,
 * separator) pero NATIVO y router-agnostic: no importa react-router.
 * Cada item con `to` se renderiza como <a href={to}>; sin `to` se
 * renderiza como <button> que dispara su `onClick` y `onItemSelect`.
 * El ultimo item es texto plano con aria-current="page".
 *
 * Coincide con el estilo visual de las migas ad-hoc del repo
 * (ProductPage / CatalogPage: mono, xs, text-muted, separador '/').
 */
import styles from './Breadcrumb.module.scss';

export default function Breadcrumb({
  items = [],
  separator = '/',
  ariaLabel = 'Migas de pan',
  onItemSelect,
  className = '',
}) {
  if (!items.length) return null;

  const lastIndex = items.length - 1;

  return (
    <nav
      aria-label={ariaLabel}
      className={[styles.breadcrumb, className].filter(Boolean).join(' ')}
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          const key = item.to ?? item.label ?? index;

          const handleSelect = (e) => {
            item.onClick?.(e, item);
            onItemSelect?.(item);
          };

          return (
            <li key={key} className={styles.item}>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : item.to ? (
                <a href={item.to} className={styles.link} onClick={handleSelect}>
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  className={styles.link}
                  onClick={handleSelect}
                >
                  {item.label}
                </button>
              )}

              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumb };
