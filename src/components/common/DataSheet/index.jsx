import styles from './DataSheet.module.scss';

/**
 * DataSheet — grid editable por celda tipo hoja de cálculo.
 * UC-ADM-SHEET. Nativo, sin dependencias externas. Estado controlado:
 * las filas vienen de `rows` y el padre las actualiza desde onCellChange.
 *
 * Props:
 *   columns: [{ key, label, editable?:true, type?:'text'|'number' }]
 *   rows: [{ ...keys de columns }]
 *   onCellChange: (rowIndex, key, value) => void  (al editar una celda)
 *   getRowKey: (row, index) => clave estable (default row.id ?? índice)
 *   ariaLabel: etiqueta accesible de la tabla
 */
export default function DataSheet({
  columns = [],
  rows = [],
  onCellChange,
  getRowKey,
  ariaLabel = 'Hoja',
}) {
  const rowKeyOf = (row, index) =>
    getRowKey ? getRowKey(row, index) : row?.id ?? index;

  return (
    <table className={styles.sheet} aria-label={ariaLabel}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className={styles.th}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowKeyOf(row, rowIndex)} className={styles.tr}>
            {columns.map((column) => {
              const value = row?.[column.key] ?? '';
              if (!column.editable) {
                return (
                  <td key={column.key} className={styles.td}>
                    {value}
                  </td>
                );
              }
              return (
                <td key={column.key} className={styles.td}>
                  <input
                    className={styles.input}
                    type={column.type === 'number' ? 'number' : 'text'}
                    value={value}
                    aria-label={`${column.label} fila ${rowIndex + 1}`}
                    onChange={(event) =>
                      onCellChange?.(rowIndex, column.key, event.target.value)
                    }
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
