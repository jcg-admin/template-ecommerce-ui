import { useMemo } from 'react';
import styles from './PivotTable.module.scss';

/**
 * PivotTable — tabla pivote nativa con agregación. UC-ADM-PIVOT.
 * Sin dependencias externas. A partir de `data` (array de objetos)
 * construye una matriz: filas = valores únicos de data[rowKey],
 * columnas = valores únicos de data[colKey], celda = agregación
 * (`sum` por defecto o `count`) de data[valueKey] para esa combinación.
 * Incluye totales por fila y por columna.
 *
 * Props:
 *   data: [{ ...rowKey, ...colKey, ...valueKey }]
 *   rowKey: clave del objeto que define las filas
 *   colKey: clave del objeto que define las columnas
 *   valueKey: clave numérica a agregar
 *   aggregate: 'sum' (default) | 'count'
 *   rowLabel: encabezado de la esquina superior izquierda (default '')
 *   colLabelOrder: orden explícito de las columnas
 *   ariaLabel: etiqueta accesible de la <table>
 */
const TOTAL_LABEL = 'Total';

function uniqueInOrder(values) {
  const seen = new Set();
  const out = [];
  for (const v of values) {
    const key = String(v);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  return out;
}

export default function PivotTable({
  data = [],
  rowKey,
  colKey,
  valueKey,
  aggregate = 'sum',
  rowLabel = '',
  colLabelOrder,
  ariaLabel = 'Tabla pivote',
}) {
  const { rows, cols, matrix, rowTotals, colTotals, grandTotal } = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];

    const rowKeys = uniqueInOrder(safeData.map((d) => d[rowKey]));
    let colKeys = uniqueInOrder(safeData.map((d) => d[colKey]));

    if (Array.isArray(colLabelOrder)) {
      const present = new Set(colKeys.map((c) => String(c)));
      const ordered = colLabelOrder.filter((c) => present.has(String(c)));
      const rest = colKeys.filter((c) => !colLabelOrder.some((o) => String(o) === String(c)));
      colKeys = [...ordered, ...rest];
    }

    // cells[rowIdx][colIdx] = valor agregado
    const cells = rowKeys.map(() => colKeys.map(() => 0));
    const rowIndex = new Map(rowKeys.map((r, i) => [String(r), i]));
    const colIndex = new Map(colKeys.map((c, i) => [String(c), i]));

    for (const d of safeData) {
      const ri = rowIndex.get(String(d[rowKey]));
      const ci = colIndex.get(String(d[colKey]));
      if (ri == null || ci == null) continue;
      if (aggregate === 'count') {
        cells[ri][ci] += 1;
      } else {
        cells[ri][ci] += Number(d[valueKey]) || 0;
      }
    }

    const rTotals = cells.map((r) => r.reduce((a, b) => a + b, 0));
    const cTotals = colKeys.map((_, ci) => cells.reduce((a, r) => a + r[ci], 0));
    const gTotal = rTotals.reduce((a, b) => a + b, 0);

    return {
      rows: rowKeys,
      cols: colKeys,
      matrix: cells,
      rowTotals: rTotals,
      colTotals: cTotals,
      grandTotal: gTotal,
    };
  }, [data, rowKey, colKey, valueKey, aggregate, colLabelOrder]);

  return (
    <table className={styles.pivot} aria-label={ariaLabel}>
      <thead>
        <tr>
          <th scope="col" className={styles.corner}>
            {rowLabel}
          </th>
          {cols.map((c) => (
            <th key={String(c)} scope="col" className={styles.colHead}>
              {String(c)}
            </th>
          ))}
          <th scope="col" className={styles.totalHead}>
            {TOTAL_LABEL}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={String(r)}>
            <th scope="row" className={styles.rowHead}>
              {String(r)}
            </th>
            {cols.map((c, ci) => (
              <td key={String(c)} className={styles.cell}>
                {matrix[ri][ci]}
              </td>
            ))}
            <td className={styles.rowTotal}>{rowTotals[ri]}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className={styles.rowHead}>
            {TOTAL_LABEL}
          </th>
          {cols.map((c, ci) => (
            <td key={String(c)} className={styles.colTotal}>
              {colTotals[ci]}
            </td>
          ))}
          <td className={styles.grandTotal}>{grandTotal}</td>
        </tr>
      </tfoot>
    </table>
  );
}
