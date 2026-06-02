import { useMemo, useState } from 'react';
import styles from './DataGrid.module.scss';

/**
 * DataGrid — tabla nativa accesible con orden, filtro global y paginación.
 * UC-ADM-GRID. Sin dependencias externas. Estado interno (no controlado).
 *
 * Props:
 *   columns: [{ key, label, sortable?:true }]
 *   rows: [{ ...keys de columns }]
 *   pageSize: número de filas por página (default 10)
 *   filterable: muestra input de búsqueda global
 *   getRowKey: row => clave estable (default row.id ?? índice)
 *   emptyText: texto cuando no hay filas
 *   ariaLabel: etiqueta accesible de la tabla
 */
const ARROW = { asc: ' ▲', desc: ' ▼' };

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b));
}

export default function DataGrid({
  columns = [],
  rows = [],
  pageSize = 10,
  filterable = false,
  getRowKey,
  emptyText = 'Sin datos',
  ariaLabel = 'Tabla',
}) {
  const [sort, setSort] = useState(null); // { key, dir: 'asc' | 'desc' }
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const safeRows = Array.isArray(rows) ? rows : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return safeRows;
    return safeRows.filter((row) =>
      columns.some((col) => {
        const v = row[col.key];
        return v != null && String(v).toLowerCase().includes(q);
      }),
    );
  }, [safeRows, columns, query]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const res = compareValues(a[sort.key], b[sort.key]);
      return sort.dir === 'asc' ? res : -res;
    });
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const toggleSort = (key) => {
    setPage(0);
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  const onFilter = (e) => {
    setQuery(e.target.value);
    setPage(0);
  };

  const keyFor = (row, index) => {
    if (getRowKey) return getRowKey(row);
    return row.id != null ? row.id : index;
  };

  const ariaSortFor = (col) => {
    if (!col.sortable || !sort || sort.key !== col.key) return undefined;
    return sort.dir === 'asc' ? 'ascending' : 'descending';
  };

  const hasRows = pageRows.length > 0;

  return (
    <div className={styles.dataGrid}>
      {filterable && (
        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.search}
            placeholder="Buscar..."
            value={query}
            onChange={onFilter}
            aria-label="Buscar en la tabla"
          />
        </div>
      )}

      <table className={styles.table} aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((col) => {
              const sortState = ariaSortFor(col);
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={styles.th}
                  {...(sortState ? { 'aria-sort': sortState } : {})}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      {sort && sort.key === col.key ? ARROW[sort.dir] : ''}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            pageRows.map((row, index) => (
              <tr key={keyFor(row, start + index)} className={styles.tr}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.empty} colSpan={columns.length || 1}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {hasRows && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Página anterior"
          >
            Anterior
          </button>
          <span className={styles.pageInfo} aria-live="polite">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
