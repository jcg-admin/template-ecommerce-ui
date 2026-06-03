/**
 * Tests: exportSheet (UC-ADM-XLSX)
 * Utilidad nativa de exportacion a hoja (CSV, sin dependencias).
 * TDD estricto: test primero -> rojo -> implementacion -> verde.
 */
import { toCSV, exportSheet } from './exportSheet';

describe('toCSV (funcion pura)', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
  ];

  it('genera la cabecera con los labels de las columnas', () => {
    const csv = toCSV({ columns, rows: [] });
    const firstLine = csv.split('\r\n')[0];
    expect(firstLine).toBe('ID,Nombre');
  });

  it('mapea cada fila usando row[col.key]', () => {
    const rows = [
      { id: 1, name: 'Camisa' },
      { id: 2, name: 'Pantalon' },
    ];
    const csv = toCSV({ columns, rows });
    expect(csv).toBe('ID,Nombre\r\n1,Camisa\r\n2,Pantalon');
  });

  it('toma solo las keys declaradas e ignora props extra de la fila', () => {
    const rows = [{ id: 9, name: 'Gorra', secret: 'oculto' }];
    const csv = toCSV({ columns, rows });
    expect(csv).toBe('ID,Nombre\r\n9,Gorra');
  });

  it('escapa valores con coma envolviendo en comillas (RFC 4180)', () => {
    const rows = [{ id: 1, name: 'Rojo, Azul' }];
    const csv = toCSV({ columns, rows });
    expect(csv).toBe('ID,Nombre\r\n1,"Rojo, Azul"');
  });

  it('escapa comillas dobles duplicandolas y envolviendo', () => {
    const rows = [{ id: 1, name: 'Talla "M"' }];
    const csv = toCSV({ columns, rows });
    expect(csv).toBe('ID,Nombre\r\n1,"Talla ""M"""');
  });

  it('escapa saltos de linea envolviendo en comillas', () => {
    const rows = [{ id: 1, name: 'Linea1\nLinea2' }];
    const csv = toCSV({ columns, rows });
    expect(csv).toBe('ID,Nombre\r\n1,"Linea1\nLinea2"');
  });

  it('escapa retornos de carro (\\r) envolviendo en comillas', () => {
    const rows = [{ id: 1, name: 'A\r\nB' }];
    const csv = toCSV({ columns, rows });
    expect(csv).toBe('ID,Nombre\r\n1,"A\r\nB"');
  });

  it('devuelve solo la cabecera cuando no hay filas', () => {
    const csv = toCSV({ columns, rows: [] });
    expect(csv).toBe('ID,Nombre');
  });

  it('trata null y undefined como cadena vacia', () => {
    const rows = [{ id: null, name: undefined }];
    const csv = toCSV({ columns, rows });
    expect(csv).toBe('ID,Nombre\r\n,');
  });

  it('soporta rows omitido (default a lista vacia)', () => {
    const csv = toCSV({ columns });
    expect(csv).toBe('ID,Nombre');
  });

  it('escapa tambien los labels de cabecera si lo requieren', () => {
    const cols = [{ key: 'a', label: 'Precio, USD' }];
    const csv = toCSV({ columns: cols, rows: [] });
    expect(csv).toBe('"Precio, USD"');
  });
});

describe('exportSheet (descarga)', () => {
  const columns = [{ key: 'id', label: 'ID' }];
  const rows = [{ id: 1 }];

  let createObjectURL;
  let revokeObjectURL;
  let clickSpy;
  let createElementSpy;
  let anchor;
  let originalCreateElement;

  beforeEach(() => {
    createObjectURL = jest.fn(() => 'blob:fake-url');
    revokeObjectURL = jest.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    // Espiar la creacion del <a> sin romper el resto de createElement.
    originalCreateElement = document.createElement.bind(document);
    clickSpy = jest.fn();
    createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag) => {
        const el = originalCreateElement(tag);
        if (tag === 'a') {
          anchor = el;
          el.click = clickSpy;
        }
        return el;
      });
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    delete global.URL.createObjectURL;
    delete global.URL.revokeObjectURL;
  });

  it('crea un Blob text/csv y dispara la descarga', () => {
    exportSheet({ filename: 'datos.csv', columns, rows });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain('text/csv');

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(anchor.getAttribute('href')).toBe('blob:fake-url');
    expect(anchor.getAttribute('download')).toBe('datos.csv');

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('usa export.csv como filename por defecto', () => {
    exportSheet({ columns, rows });
    expect(anchor.getAttribute('download')).toBe('export.csv');
  });
});
