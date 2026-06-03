/**
 * zipStore (UC-ADM-XLSX)
 * Escritor minimo de archivos ZIP en modo STORE (sin compresion), nativo y
 * SIN dependencias. Suficiente para empaquetar un .xlsx: Excel/LibreOffice
 * abren entradas STORED igual que DEFLATE.
 *
 * Layout del contenedor ZIP (todo little-endian):
 *   - Por cada entrada: Local File Header (firma PK\x03\x04) + nombre + datos.
 *   - Central Directory: un record por entrada (firma PK\x01\x02).
 *   - End Of Central Directory (firma PK\x05\x06).
 *
 * La parte cargante es el CRC32 de cada entrada y los offsets little-endian:
 * si el byte layout no es exacto, Excel rechaza el paquete.
 */

// Tabla CRC32 (polinomio reflejado 0xEDB88320), precomputada una vez.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

/**
 * CRC32 estandar (IEEE 802.3) sobre un Uint8Array.
 * Vector de prueba: crc32(utf8("123456789")) === 0xCBF43926.
 * @param {Uint8Array} bytes
 * @returns {number} CRC32 sin signo (0..0xFFFFFFFF)
 */
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Codifica un string a UTF-8. Usa TextEncoder cuando existe (browser/jsdom);
 * cae a un encoder manual minimo si no.
 * @param {string} str
 * @returns {Uint8Array}
 */
function utf8(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  // Fallback manual (entornos sin TextEncoder).
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // par sustituto
      const next = str.charCodeAt(++i);
      code = 0x10000 + ((code & 0x3ff) << 10) + (next & 0x3ff);
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    } else {
      out.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return new Uint8Array(out);
}

// Helpers de escritura little-endian sobre un array de bytes (push).
function pushU16(arr, value) {
  arr.push(value & 0xff, (value >>> 8) & 0xff);
}

function pushU32(arr, value) {
  arr.push(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  );
}

/**
 * Construye un ZIP STORE-only a partir de una lista de entradas.
 * @param {Array<{name: string, data: string|Uint8Array}>} entries
 *   `name` es la ruta dentro del zip (p.ej. "xl/workbook.xml").
 *   `data` puede ser string (se codifica a UTF-8) o bytes crudos.
 * @returns {Uint8Array} el contenido completo del archivo .zip
 */
export function zipStore(entries) {
  const localParts = []; // bytes de cada local file header + datos
  const central = []; // bytes del central directory
  let offset = 0; // offset acumulado del local header actual

  const LOCAL_SIG = 0x04034b50; // PK\x03\x04
  const CENTRAL_SIG = 0x02014b50; // PK\x01\x02
  const EOCD_SIG = 0x06054b50; // PK\x05\x06

  for (const entry of entries) {
    const nameBytes = utf8(entry.name);
    const dataBytes =
      typeof entry.data === 'string' ? utf8(entry.data) : entry.data;
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    // --- Local File Header ---
    const local = [];
    pushU32(local, LOCAL_SIG);
    pushU16(local, 20); // version needed to extract (2.0)
    pushU16(local, 0); // general purpose bit flag
    pushU16(local, 0); // compression method: 0 = STORE
    pushU16(local, 0); // mod file time
    pushU16(local, 0); // mod file date
    pushU32(local, crc); // CRC-32
    pushU32(local, size); // compressed size (== uncompressed en STORE)
    pushU32(local, size); // uncompressed size
    pushU16(local, nameBytes.length); // file name length
    pushU16(local, 0); // extra field length
    for (let i = 0; i < nameBytes.length; i++) local.push(nameBytes[i]);
    for (let i = 0; i < dataBytes.length; i++) local.push(dataBytes[i]);
    localParts.push(local);

    // --- Central Directory Record ---
    pushU32(central, CENTRAL_SIG);
    pushU16(central, 20); // version made by
    pushU16(central, 20); // version needed to extract
    pushU16(central, 0); // general purpose bit flag
    pushU16(central, 0); // compression method: STORE
    pushU16(central, 0); // mod file time
    pushU16(central, 0); // mod file date
    pushU32(central, crc); // CRC-32
    pushU32(central, size); // compressed size
    pushU32(central, size); // uncompressed size
    pushU16(central, nameBytes.length); // file name length
    pushU16(central, 0); // extra field length
    pushU16(central, 0); // file comment length
    pushU16(central, 0); // disk number start
    pushU16(central, 0); // internal file attributes
    pushU32(central, 0); // external file attributes
    pushU32(central, offset); // relative offset of local header
    for (let i = 0; i < nameBytes.length; i++) central.push(nameBytes[i]);

    offset += local.length;
  }

  // --- End Of Central Directory ---
  const centralOffset = offset; // donde empieza el central directory
  const centralSize = central.length;
  const eocd = [];
  pushU32(eocd, EOCD_SIG);
  pushU16(eocd, 0); // number of this disk
  pushU16(eocd, 0); // disk where central dir starts
  pushU16(eocd, entries.length); // central dir records on this disk
  pushU16(eocd, entries.length); // total central dir records
  pushU32(eocd, centralSize); // size of central directory
  pushU32(eocd, centralOffset); // offset of central directory
  pushU16(eocd, 0); // ZIP file comment length

  // Concatenar todo en un solo Uint8Array.
  let total = centralSize + eocd.length;
  for (const part of localParts) total += part.length;

  const out = new Uint8Array(total);
  let pos = 0;
  for (const part of localParts) {
    out.set(part, pos);
    pos += part.length;
  }
  out.set(central, pos);
  pos += central.length;
  out.set(eocd, pos);

  return out;
}
