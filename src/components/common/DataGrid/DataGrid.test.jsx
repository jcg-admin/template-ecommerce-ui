/**
 * Tests: DataGrid — UC-ADM-GRID
 * Tabla nativa accesible con orden, filtro global y paginación.
 * Cubre: render, orden asc/desc por columna, filtro reduce filas,
 * paginación cambia de página, estado vacío.
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import DataGrid from './index';

const columns = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'age', label: 'Edad', sortable: true },
  { key: 'city', label: 'Ciudad' },
];

const rows = [
  { id: 1, name: 'Carol', age: 30, city: 'Lima' },
  { id: 2, name: 'Alice', age: 45, city: 'Quito' },
  { id: 3, name: 'Bob', age: 25, city: 'Bogota' },
];

const setup = (props = {}) =>
  render(
    <DataGrid
      columns={columns}
      rows={rows}
      ariaLabel="Tabla de usuarios"
      {...props}
    />,
  );

// Helpers: leer celdas de la primera columna en orden de filas del tbody.
const bodyRows = () => {
  const table = screen.getByRole('table');
  const [, tbody] = within(table).getAllByRole('rowgroup');
  return within(tbody).getAllByRole('row');
};
const firstColValues = () =>
  bodyRows().map((r) => within(r).getAllByRole('cell')[0].textContent);

describe('DataGrid — render', () => {
  it('renderiza una tabla accesible con el ariaLabel', () => {
    setup();
    const table = screen.getByRole('table', { name: 'Tabla de usuarios' });
    expect(table).toBeInTheDocument();
  });

  it('renderiza cabeceras con scope=col', () => {
    setup();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(columns.length);
    headers.forEach((h) => expect(h).toHaveAttribute('scope', 'col'));
    expect(screen.getByRole('columnheader', { name: /Nombre/ })).toBeInTheDocument();
  });

  it('renderiza las filas de datos', () => {
    setup();
    expect(firstColValues()).toEqual(['Carol', 'Alice', 'Bob']);
  });
});

describe('DataGrid — orden', () => {
  it('click en cabecera ordenable ordena asc y marca aria-sort', () => {
    setup();
    const header = screen.getByRole('columnheader', { name: /Nombre/ });
    fireEvent.click(within(header).getByRole('button'));
    expect(firstColValues()).toEqual(['Alice', 'Bob', 'Carol']);
    expect(header).toHaveAttribute('aria-sort', 'ascending');
  });

  it('segundo click alterna a desc', () => {
    setup();
    const header = screen.getByRole('columnheader', { name: /Nombre/ });
    const btn = within(header).getByRole('button');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(firstColValues()).toEqual(['Carol', 'Bob', 'Alice']);
    expect(header).toHaveAttribute('aria-sort', 'descending');
  });

  it('ordena numéricamente por la columna edad', () => {
    setup();
    const header = screen.getByRole('columnheader', { name: /Edad/ });
    fireEvent.click(within(header).getByRole('button'));
    expect(firstColValues()).toEqual(['Bob', 'Carol', 'Alice']); // 25, 30, 45
  });

  it('una columna no ordenable no tiene botón y no marca aria-sort', () => {
    setup();
    const header = screen.getByRole('columnheader', { name: /Ciudad/ });
    expect(within(header).queryByRole('button')).toBeNull();
    expect(header).not.toHaveAttribute('aria-sort');
  });
});

describe('DataGrid — filtro', () => {
  it('el filtro global reduce las filas (case-insensitive)', () => {
    setup({ filterable: true });
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'quito' } });
    expect(firstColValues()).toEqual(['Alice']);
  });

  it('sin coincidencias muestra el emptyText', () => {
    setup({ filterable: true, emptyText: 'Nada aquí' });
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'zzz' },
    });
    expect(screen.getByText('Nada aquí')).toBeInTheDocument();
  });

  it('sin filterable no se renderiza el input de búsqueda', () => {
    setup();
    expect(screen.queryByRole('searchbox')).toBeNull();
  });
});

describe('DataGrid — paginación', () => {
  const many = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `User${String(i + 1).padStart(2, '0')}`,
    age: 20 + i,
    city: 'X',
  }));

  it('muestra solo pageSize filas por página', () => {
    render(
      <DataGrid columns={columns} rows={many} pageSize={10} ariaLabel="t" />,
    );
    expect(bodyRows()).toHaveLength(10);
  });

  it('el botón siguiente cambia de página', () => {
    render(
      <DataGrid columns={columns} rows={many} pageSize={10} ariaLabel="t" />,
    );
    expect(firstColValues()[0]).toBe('User01');
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(firstColValues()[0]).toBe('User11');
  });

  it('el botón anterior retrocede de página', () => {
    render(
      <DataGrid columns={columns} rows={many} pageSize={10} ariaLabel="t" />,
    );
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /anterior/i }));
    expect(firstColValues()[0]).toBe('User01');
  });

  it('anterior está deshabilitado en la primera página', () => {
    render(
      <DataGrid columns={columns} rows={many} pageSize={10} ariaLabel="t" />,
    );
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
  });

  it('siguiente está deshabilitado en la última página', () => {
    render(
      <DataGrid columns={columns} rows={many} pageSize={10} ariaLabel="t" />,
    );
    const next = screen.getByRole('button', { name: /siguiente/i });
    fireEvent.click(next); // page 2
    fireEvent.click(next); // page 3 (last, 5 rows)
    expect(next).toBeDisabled();
    expect(bodyRows()).toHaveLength(5);
  });

  it('indica la página actual y el total', () => {
    render(
      <DataGrid columns={columns} rows={many} pageSize={10} ariaLabel="t" />,
    );
    expect(screen.getByText(/1\s*\/\s*3/)).toBeInTheDocument();
  });
});

describe('DataGrid — vacío', () => {
  it('rows=[] renderiza el emptyText', () => {
    render(
      <DataGrid
        columns={columns}
        rows={[]}
        emptyText="Sin datos"
        ariaLabel="t"
      />,
    );
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  it('render seguro sin rows (undefined) usa emptyText', () => {
    render(<DataGrid columns={columns} emptyText="Sin datos" ariaLabel="t" />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });
});
