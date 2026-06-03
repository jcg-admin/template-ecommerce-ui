/**
 * Tests — exportWorkbook + zipStore (UC-ADM-XLSX)
 *
 * Verifica:
 *  (a) exportXlsx crea un Blob con el MIME xlsx,
 *  (b) los bytes empiezan con la firma ZIP PK\x03\x04,
 *  (c) las entradas XML STORED son decodificables y contienen los labels de
 *      columna, un valor de fila, y la parte worksheets/sheet1.xml,
 *  (d) CRC32 contra vector conocido (crc32("123456789") === 0xCBF43926),
 *  (e) escapado XML.
 *
 * @jest-environment jsdom
 */
import {
  exportXlsx,
  buildXlsx,
  escapeXml,
  XLSX_MIME,
} from './exportWorkbook';
import { crc32, zipStore } from './zipStore';

const COLUMNS = [
  { key: 'bucket', label: 'Fecha' },
  { key: 'revenue', label: 'Ingreso' },
  { key: 'orders', label: 'Órdenes' },
];

const ROWS = [
  { bucket: '2026-05-01', revenue: 1000, orders: 3 },
  { bucket: '2026-05-02', revenue: 1500, orders: 4 },
];

// Decodifica los bytes UTF-8 a string.
function decode(bytes) {
  return new TextDecoder().decode(bytes);
}

// Lee un Blob a Uint8Array. jsdom no implementa Blob.arrayBuffer(), por lo que
// usamos FileReader.readAsArrayBuffer (sí soportado) para obtener los bytes.
function blobToBytes(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

// Extrae las entradas STORED de un ZIP recorriendo los local file headers.
// Devuelve { [name]: textoUTF8 }. Solo soporta STORE (metodo 0), que es lo
// que produce zipStore.
function readStoredEntries(zipBytes) {
  const view = new DataView(
    zipBytes.buffer,
    zipBytes.byteOffset,
    zipBytes.byteLength,
  );
  const entries = {};
  let pos = 0;
  while (pos + 4 <= zipBytes.length) {
    const sig = view.getUint32(pos, true);
    if (sig !== 0x04034b50) break; // ya no hay mas local headers
    const nameLen = view.getUint16(pos + 26, true);
    const extraLen = view.getUint16(pos + 28, true);
    const compSize = view.getUint32(pos + 18, true);
    const nameStart = pos + 30;
    const name = decode(zipBytes.subarray(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    const data = zipBytes.subarray(dataStart, dataStart + compSize);
    entries[name] = decode(data);
    pos = dataStart + compSize;
  }
  return entries;
}

describe('crc32', () => {
  it('coincide con el vector conocido crc32("123456789") = 0xCBF43926', () => {
    const bytes = new TextEncoder().encode('123456789');
    expect(crc32(bytes)).toBe(0xcbf43926);
  });

  it('crc32 de cadena vacia es 0', () => {
    expect(crc32(new Uint8Array([]))).toBe(0);
  });
});

describe('escapeXml', () => {
  it('escapa los caracteres reservados de XML', () => {
    expect(escapeXml('a & b < c > d "e" \'f\'')).toBe(
      'a &amp; b &lt; c &gt; d &quot;e&quot; &#39;f&#39;',
    );
  });

  it('null/undefined producen cadena vacia', () => {
    expect(escapeXml(null)).toBe('');
    expect(escapeXml(undefined)).toBe('');
  });
});

describe('zipStore', () => {
  it('produce bytes que empiezan con la firma ZIP PK\\x03\\x04', () => {
    const bytes = zipStore([{ name: 'a.txt', data: 'hola' }]);
    expect(bytes[0]).toBe(0x50); // P
    expect(bytes[1]).toBe(0x4b); // K
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
  });

  it('round-trip: la entrada STORED se recupera intacta', () => {
    const bytes = zipStore([{ name: 'dir/file.xml', data: '<x>1</x>' }]);
    const entries = readStoredEntries(bytes);
    expect(entries['dir/file.xml']).toBe('<x>1</x>');
  });

  it('termina con la firma EOCD PK\\x05\\x06', () => {
    const bytes = zipStore([{ name: 'a.txt', data: 'x' }]);
    // EOCD sin comentario son 22 bytes finales.
    const eocd = bytes.subarray(bytes.length - 22);
    expect(eocd[0]).toBe(0x50);
    expect(eocd[1]).toBe(0x4b);
    expect(eocd[2]).toBe(0x05);
    expect(eocd[3]).toBe(0x06);
  });
});

describe('buildXlsx', () => {
  it('empaqueta las cinco partes OOXML', () => {
    const bytes = buildXlsx({ columns: COLUMNS, rows: ROWS });
    const entries = readStoredEntries(bytes);
    expect(Object.keys(entries).sort()).toEqual(
      [
        '[Content_Types].xml',
        '_rels/.rels',
        'xl/_rels/workbook.xml.rels',
        'xl/workbook.xml',
        'xl/worksheets/sheet1.xml',
      ].sort(),
    );
  });

  it('la hoja contiene los labels de columna y un valor de fila', () => {
    const bytes = buildXlsx({ columns: COLUMNS, rows: ROWS });
    const sheet = readStoredEntries(bytes)['xl/worksheets/sheet1.xml'];
    expect(sheet).toContain('Fecha');
    expect(sheet).toContain('Ingreso');
    expect(sheet).toContain('Órdenes');
    expect(sheet).toContain('2026-05-01');
    // revenue 1000 como numero (t="n")
    expect(sheet).toContain('<v>1000</v>');
  });

  it('serializa numeros como t="n" y strings como inlineStr', () => {
    const bytes = buildXlsx({ columns: COLUMNS, rows: ROWS });
    const sheet = readStoredEntries(bytes)['xl/worksheets/sheet1.xml'];
    expect(sheet).toContain('t="n"');
    expect(sheet).toContain('t="inlineStr"');
  });

  it('respeta el sheetName en workbook.xml', () => {
    const bytes = buildXlsx({
      sheetName: 'Reporte',
      columns: COLUMNS,
      rows: ROWS,
    });
    const wb = readStoredEntries(bytes)['xl/workbook.xml'];
    expect(wb).toContain('name="Reporte"');
  });
});

describe('exportXlsx (jsdom download)', () => {
  let createdBlob;
  let originalCreate;
  let originalRevoke;
  let clickSpy;

  beforeEach(() => {
    createdBlob = null;
    originalCreate = URL.createObjectURL;
    originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn((blob) => {
      createdBlob = blob;
      return 'blob:mock-url';
    });
    URL.revokeObjectURL = jest.fn();
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    clickSpy.mockRestore();
  });

  it('crea un Blob con el MIME xlsx', async () => {
    exportXlsx({ filename: 'r.xlsx', columns: COLUMNS, rows: ROWS });
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(createdBlob).toBeInstanceOf(Blob);
    expect(createdBlob.type).toBe(XLSX_MIME);
  });

  it('los bytes del blob empiezan con la firma ZIP PK', async () => {
    exportXlsx({ filename: 'r.xlsx', columns: COLUMNS, rows: ROWS });
    const buf = await blobToBytes(createdBlob);
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
    expect(buf[2]).toBe(0x03);
    expect(buf[3]).toBe(0x04);
  });

  it('el blob contiene las partes y los datos decodificables', async () => {
    exportXlsx({ filename: 'r.xlsx', columns: COLUMNS, rows: ROWS });
    const buf = await blobToBytes(createdBlob);
    const entries = readStoredEntries(buf);
    expect(entries['xl/worksheets/sheet1.xml']).toContain('Fecha');
    expect(entries['xl/worksheets/sheet1.xml']).toContain('2026-05-01');
    expect(entries['[Content_Types].xml']).toContain('worksheets/sheet1.xml');
  });

  it('dispara click en el anchor y revoca la URL', () => {
    exportXlsx({ filename: 'r.xlsx', columns: COLUMNS, rows: ROWS });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
