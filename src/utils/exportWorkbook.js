/**
 * exportWorkbook (UC-ADM-XLSX)
 * Exportacion nativa a XLSX (Excel) REAL, SIN dependencias.
 *
 * Adapta la tecnica OOXML del paquete kno-ooxml (estructura de partes
 * [Content_Types].xml, _rels/.rels, xl/workbook.xml,
 * xl/_rels/workbook.xml.rels, xl/worksheets/sheet1.xml) pero las construye
 * como strings y las empaqueta con un ZIP STORE-only propio (zipStore.js),
 * en lugar de jszip + DEFLATE.
 *
 * API espejo de exportSheet.js: { columns: [{key,label}], rows: [{...}] }.
 *
 * Numeros -> <c t="n"><v>...</v></c>.
 * Strings -> <c t="inlineStr"><is><t>...</t></is></c> (sin sharedStrings).
 */

import { zipStore } from './zipStore';

export const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Escapa los caracteres reservados de XML en un valor de texto.
 * @param {*} value
 * @returns {string}
 */
export function escapeXml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Detecta valores que deben serializarse como numero de Excel (t="n").
// Excluye NaN, Infinity, strings, booleanos y null/undefined.
function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

// Convierte un indice de columna 0-based a su letra Excel (0->A, 26->AA).
function columnLetter(index) {
  let result = '';
  let n = index;
  do {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return result;
}

// Genera una celda <c>: numero (t="n") o string inline (t="inlineStr").
function cellXml(ref, value) {
  if (isFiniteNumber(value)) {
    return `<c r="${ref}" t="n"><v>${value}</v></c>`;
  }
  if (value === null || value === undefined || value === '') {
    return `<c r="${ref}"/>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
    value,
  )}</t></is></c>`;
}

const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

// [Content_Types].xml — declara los content types del paquete.
function contentTypesXml() {
  return `${XML_DECL}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;
}

// _rels/.rels — relacion raiz que apunta a xl/workbook.xml.
function rootRelsXml() {
  return `${XML_DECL}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

// xl/workbook.xml — define la unica hoja.
function workbookXml(sheetName) {
  return `${XML_DECL}
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

// xl/_rels/workbook.xml.rels — relaciona la hoja con su archivo.
function workbookRelsXml() {
  return `${XML_DECL}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;
}

/**
 * xl/worksheets/sheet1.xml — la hoja: una fila de cabecera (labels) + filas.
 * @param {Array<{key:string,label:string}>} columns
 * @param {Array<Object>} rows
 */
function worksheetXml(columns, rows) {
  const lines = [];

  // Fila 1: cabecera con los labels (siempre string).
  const headerCells = columns
    .map((col, ci) => cellXml(`${columnLetter(ci)}1`, col.label))
    .join('');
  lines.push(`<row r="1">${headerCells}</row>`);

  // Filas de datos a partir de la fila 2.
  rows.forEach((row, ri) => {
    const rowIndex = ri + 2;
    const cells = columns
      .map((col, ci) =>
        cellXml(`${columnLetter(ci)}${rowIndex}`, row[col.key]),
      )
      .join('');
    lines.push(`<row r="${rowIndex}">${cells}</row>`);
  });

  // Dimension del rango usado (A1 : ultima columna / ultima fila).
  const lastCol = columns.length > 0 ? columnLetter(columns.length - 1) : 'A';
  const lastRow = rows.length + 1;
  const dimension = `A1:${lastCol}${lastRow}`;

  return `${XML_DECL}
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  <sheetData>${lines.join('')}</sheetData>
</worksheet>`;
}

/**
 * Construye los bytes del archivo .xlsx (ZIP STORE de las partes OOXML).
 * Funcion pura — util para tests sin tocar el DOM.
 * @param {Object} config
 * @param {string} [config.sheetName='Hoja1']
 * @param {Array<{key:string,label:string}>} config.columns
 * @param {Array<Object>} [config.rows]
 * @returns {Uint8Array}
 */
export function buildXlsx({ sheetName = 'Hoja1', columns, rows = [] }) {
  const entries = [
    { name: '[Content_Types].xml', data: contentTypesXml() },
    { name: '_rels/.rels', data: rootRelsXml() },
    { name: 'xl/workbook.xml', data: workbookXml(sheetName) },
    { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXml() },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: worksheetXml(columns, rows),
    },
  ];
  return zipStore(entries);
}

/**
 * Genera un Blob XLSX real y dispara la descarga en el navegador.
 * Mismo patron de descarga que exportSheet.
 * @param {Object} config
 * @param {string} [config.filename='export.xlsx']
 * @param {string} [config.sheetName='Hoja1']
 * @param {Array<{key:string,label:string}>} config.columns
 * @param {Array<Object>} [config.rows]
 */
export function exportXlsx({
  filename = 'export.xlsx',
  sheetName = 'Hoja1',
  columns,
  rows = [],
}) {
  const bytes = buildXlsx({ sheetName, columns, rows });

  const blob = new Blob([bytes], { type: XLSX_MIME });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.setAttribute('href', url);
  anchor.setAttribute('download', filename);
  anchor.click();

  // Liberar la URL del objeto para no filtrar memoria.
  if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
}
