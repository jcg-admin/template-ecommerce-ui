/**
 * Tests: DataSheet — UC-ADM-SHEET
 * Grid editable por celda tipo hoja de cálculo. Nativo, sin dependencias.
 * Estado controlado por `rows` (el padre actualiza vía onCellChange).
 * Cubre: render de celdas, editar celda dispara onCellChange con args
 * correctos (text y number), celda no editable sin input, estado vacío,
 * accesibilidad (scope=col, aria-label de inputs).
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import DataSheet from './index';

const columns = [
  { key: 'name', label: 'Nombre', editable: true, type: 'text' },
  { key: 'age', label: 'Edad', editable: true, type: 'number' },
  { key: 'city', label: 'Ciudad' },
];

const rows = [
  { id: 1, name: 'Carol', age: 30, city: 'Lima' },
  { id: 2, name: 'Alice', age: 45, city: 'Quito' },
];

const setup = (props = {}) =>
  render(
    <DataSheet
      columns={columns}
      rows={rows}
      ariaLabel="Hoja de usuarios"
      {...props}
    />,
  );

describe('DataSheet — render', () => {
  it('renderiza una tabla accesible con el ariaLabel', () => {
    setup();
    expect(
      screen.getByRole('table', { name: 'Hoja de usuarios' }),
    ).toBeInTheDocument();
  });

  it('renderiza cabeceras con scope=col', () => {
    setup();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    headers.forEach((h) => expect(h).toHaveAttribute('scope', 'col'));
    expect(headers.map((h) => h.textContent)).toEqual([
      'Nombre',
      'Edad',
      'Ciudad',
    ]);
  });

  it('renderiza el valor de cada celda', () => {
    setup();
    expect(screen.getByDisplayValue('Carol')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByText('Lima')).toBeInTheDocument();
    expect(screen.getByText('Quito')).toBeInTheDocument();
  });

  it('usa inputs de tipo text y number según la columna', () => {
    setup();
    const textInput = screen.getByDisplayValue('Carol');
    expect(textInput).toHaveAttribute('type', 'text');
    const numberInput = screen.getByDisplayValue('30');
    expect(numberInput).toHaveAttribute('type', 'number');
  });

  it('asigna aria-label "{label} fila {n}" a cada input editable', () => {
    setup();
    expect(
      screen.getByRole('textbox', { name: 'Nombre fila 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: 'Edad fila 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Nombre fila 2' }),
    ).toBeInTheDocument();
  });
});

describe('DataSheet — edición', () => {
  it('editar una celda de texto dispara onCellChange(rowIndex, key, value)', () => {
    const onCellChange = jest.fn();
    setup({ onCellChange });
    const input = screen.getByRole('textbox', { name: 'Nombre fila 1' });
    fireEvent.change(input, { target: { value: 'Carolina' } });
    expect(onCellChange).toHaveBeenCalledTimes(1);
    expect(onCellChange).toHaveBeenCalledWith(0, 'name', 'Carolina');
  });

  it('editar la segunda fila usa su índice correcto', () => {
    const onCellChange = jest.fn();
    setup({ onCellChange });
    const input = screen.getByRole('textbox', { name: 'Nombre fila 2' });
    fireEvent.change(input, { target: { value: 'Alicia' } });
    expect(onCellChange).toHaveBeenCalledWith(1, 'name', 'Alicia');
  });

  it('editar una celda numérica dispara onCellChange con la key correcta', () => {
    const onCellChange = jest.fn();
    setup({ onCellChange });
    const input = screen.getByRole('spinbutton', { name: 'Edad fila 1' });
    fireEvent.change(input, { target: { value: '31' } });
    expect(onCellChange).toHaveBeenCalledWith(0, 'age', '31');
  });

  it('no falla al editar si no se pasa onCellChange', () => {
    setup();
    const input = screen.getByRole('textbox', { name: 'Nombre fila 1' });
    expect(() =>
      fireEvent.change(input, { target: { value: 'X' } }),
    ).not.toThrow();
  });
});

describe('DataSheet — celdas no editables', () => {
  it('una celda no editable se renderiza como texto sin input', () => {
    setup();
    const table = screen.getByRole('table');
    const cityCells = within(table)
      .getAllByRole('cell')
      .filter((c) => c.textContent === 'Lima' || c.textContent === 'Quito');
    expect(cityCells).toHaveLength(2);
    cityCells.forEach((cell) => {
      expect(within(cell).queryByRole('textbox')).toBeNull();
      expect(within(cell).queryByRole('spinbutton')).toBeNull();
    });
  });
});

describe('DataSheet — estado vacío', () => {
  it('renderiza de forma segura con rows=[]', () => {
    render(<DataSheet columns={columns} rows={[]} ariaLabel="Vacía" />);
    expect(screen.getByRole('table', { name: 'Vacía' })).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  it('renderiza de forma segura sin props de datos', () => {
    expect(() => render(<DataSheet />)).not.toThrow();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

describe('DataSheet — getRowKey', () => {
  it('usa getRowKey para las keys de fila cuando se provee', () => {
    const getRowKey = jest.fn((row) => `r-${row.id}`);
    setup({ getRowKey });
    expect(getRowKey).toHaveBeenCalledWith(rows[0], 0);
  });
});
