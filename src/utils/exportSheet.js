/**
 * exportSheet (UC-ADM-XLSX)
 * Utilidad nativa de exportacion a hoja en formato CSV, SIN dependencias.
 *
 * Nota: un XLSX binario real requiere jszip y queda fuera de alcance.
 * Aqui generamos CSV conforme a RFC 4180 (separador coma, fin de linea CRLF,
 * escapado de coma / comilla doble / salto de linea).
 */

// Separador de campos y fin de linea segun RFC 4180.
const FIELD_SEPARATOR = ',';
const LINE_BREAK = '\r\n';

/**
 * Escapa un valor de celda segun RFC 4180.
 * - null/undefined -> cadena vacia.
 * - Si contiene coma, comilla doble, \n o \r, se envuelve en comillas
 *   dobles y las comillas internas se duplican.
 */
function escapeCell(value) {
  if (value === null || value === undefined) return '';

  const str = String(value);
  const needsQuoting = /[",\n\r]/.test(str);
  if (!needsQuoting) return str;

  // Doblar las comillas dobles y envolver el campo completo.
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Funcion pura: construye el string CSV.
 * @param {Object} config
 * @param {Array<{key: string, label: string}>} config.columns
 * @param {Array<Object>} [config.rows]
 * @returns {string} CSV (cabecera + filas, separadas por CRLF).
 */
export function toCSV({ columns, rows = [] }) {
  // Cabecera: los labels de cada columna, tambien escapados.
  const header = columns.map((col) => escapeCell(col.label)).join(FIELD_SEPARATOR);

  // Cada fila toma row[col.key] en el orden de las columnas.
  const body = rows.map((row) =>
    columns.map((col) => escapeCell(row[col.key])).join(FIELD_SEPARATOR),
  );

  return [header, ...body].join(LINE_BREAK);
}

/**
 * Genera un Blob text/csv a partir de los datos y dispara la descarga
 * en el navegador creando un <a> temporal.
 * @param {Object} config
 * @param {string} [config.filename='export.csv']
 * @param {Array<{key: string, label: string}>} config.columns
 * @param {Array<Object>} [config.rows]
 */
export function exportSheet({ filename = 'export.csv', columns, rows = [] }) {
  const csv = toCSV({ columns, rows });

  // charset=utf-8 ayuda a que Excel interprete bien los acentos.
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.setAttribute('href', url);
  anchor.setAttribute('download', filename);
  anchor.click();

  // Liberar la URL del objeto para no filtrar memoria.
  URL.revokeObjectURL(url);
}
