/**
 * Tests: PivotTable — tabla pivote con agregación, nativa (sin deps).
 * Iniciativa: UC-ADM-PIVOT.
 */
import { render, screen, within } from '@testing-library/react';
import PivotTable from './index';

const data = [
  { categoria: 'Ropa', mes: 'Ene', total: 100 },
  { categoria: 'Ropa', mes: 'Ene', total: 50 },
  { categoria: 'Ropa', mes: 'Feb', total: 30 },
  { categoria: 'Hogar', mes: 'Ene', total: 70 },
  { categoria: 'Hogar', mes: 'Feb', total: 20 },
];

/** Localiza la fila de <tbody> cuyo encabezado de fila coincide con `label`. */
function getRow(label) {
  const cell = screen.getByRole('rowheader', { name: label });
  return cell.closest('tr');
}

describe('PivotTable', () => {
  it('renderiza una <table> accesible con aria-label', () => {
    render(
      <PivotTable
        data={data}
        rowKey="categoria"
        colKey="mes"
        valueKey="total"
        ariaLabel="Ventas por categoría y mes"
      />,
    );
    const table = screen.getByRole('table', { name: 'Ventas por categoría y mes' });
    expect(table).toBeInTheDocument();
  });

  it('construye filas con los valores únicos de rowKey', () => {
    render(
      <PivotTable data={data} rowKey="categoria" colKey="mes" valueKey="total" ariaLabel="t" />,
    );
    expect(screen.getByRole('rowheader', { name: 'Ropa' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Hogar' })).toBeInTheDocument();
  });

  it('construye columnas con los valores únicos de colKey (thead con scope=col)', () => {
    render(
      <PivotTable data={data} rowKey="categoria" colKey="mes" valueKey="total" ariaLabel="t" />,
    );
    const ene = screen.getByRole('columnheader', { name: 'Ene' });
    const feb = screen.getByRole('columnheader', { name: 'Feb' });
    expect(ene).toHaveAttribute('scope', 'col');
    expect(feb).toHaveAttribute('scope', 'col');
  });

  it('cada celda agrega por suma (default) la combinación fila/columna', () => {
    render(
      <PivotTable data={data} rowKey="categoria" colKey="mes" valueKey="total" ariaLabel="t" />,
    );
    // Ropa/Ene = 100 + 50 = 150
    const ropa = getRow('Ropa');
    const ropaCells = within(ropa).getAllByRole('cell');
    expect(ropaCells[0]).toHaveTextContent('150'); // Ene
    expect(ropaCells[1]).toHaveTextContent('30'); // Feb
  });

  it('calcula totales por fila', () => {
    render(
      <PivotTable data={data} rowKey="categoria" colKey="mes" valueKey="total" ariaLabel="t" />,
    );
    const ropa = getRow('Ropa');
    const ropaCells = within(ropa).getAllByRole('cell');
    // total de fila Ropa = 150 + 30 = 180 (última celda)
    expect(ropaCells[ropaCells.length - 1]).toHaveTextContent('180');
    const hogar = getRow('Hogar');
    const hogarCells = within(hogar).getAllByRole('cell');
    // Hogar = 70 + 20 = 90
    expect(hogarCells[hogarCells.length - 1]).toHaveTextContent('90');
  });

  it('calcula totales por columna y total general en una fila de totales', () => {
    render(
      <PivotTable data={data} rowKey="categoria" colKey="mes" valueKey="total" ariaLabel="t" />,
    );
    const totalRow = getRow('Total');
    const cells = within(totalRow).getAllByRole('cell');
    // Ene total = 150 + 70 = 220, Feb = 30 + 20 = 50, general = 270
    expect(cells[0]).toHaveTextContent('220');
    expect(cells[1]).toHaveTextContent('50');
    expect(cells[cells.length - 1]).toHaveTextContent('270');
  });

  it('soporta aggregate="count" contando ocurrencias por celda', () => {
    render(
      <PivotTable
        data={data}
        rowKey="categoria"
        colKey="mes"
        valueKey="total"
        aggregate="count"
        ariaLabel="t"
      />,
    );
    const ropa = getRow('Ropa');
    const ropaCells = within(ropa).getAllByRole('cell');
    expect(ropaCells[0]).toHaveTextContent('2'); // Ene: 2 registros
    expect(ropaCells[1]).toHaveTextContent('1'); // Feb: 1 registro
    expect(ropaCells[ropaCells.length - 1]).toHaveTextContent('3'); // total fila
  });

  it('respeta colLabelOrder para el orden de las columnas', () => {
    render(
      <PivotTable
        data={data}
        rowKey="categoria"
        colKey="mes"
        valueKey="total"
        colLabelOrder={['Feb', 'Ene']}
        ariaLabel="t"
      />,
    );
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent);
    const ene = headers.indexOf('Ene');
    const feb = headers.indexOf('Feb');
    expect(feb).toBeLessThan(ene);
  });

  it('usa rowLabel como encabezado de la esquina', () => {
    render(
      <PivotTable
        data={data}
        rowKey="categoria"
        colKey="mes"
        valueKey="total"
        rowLabel="Categoría"
        ariaLabel="t"
      />,
    );
    expect(screen.getByRole('columnheader', { name: 'Categoría' })).toBeInTheDocument();
  });

  it('renderiza de forma segura con data vacío', () => {
    render(<PivotTable data={[]} rowKey="categoria" colKey="mes" valueKey="total" ariaLabel="t" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
