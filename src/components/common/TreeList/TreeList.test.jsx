/**
 * TreeList -- tests (TDD: rojo antes que implementacion)
 * Cubre: render de jerarquia, expandir/colapsar (aria-expanded),
 * celdas por columna (node[col.key]), acciones por fila (renderActions),
 * y render seguro con nodes vacio.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TreeList from './index';

const nodes = [
  {
    id: 'electronica',
    label: 'Electronica',
    items: 120,
    status: 'Activa',
    children: [
      { id: 'telefonos', label: 'Telefonos', items: 40, status: 'Activa' },
      {
        id: 'ordenadores',
        label: 'Ordenadores',
        items: 80,
        status: 'Inactiva',
        children: [
          { id: 'portatiles', label: 'Portatiles', items: 30, status: 'Activa' },
        ],
      },
    ],
  },
  { id: 'ropa', label: 'Ropa', items: 50, status: 'Activa' },
];

const columns = [
  { key: 'items', label: 'Articulos' },
  { key: 'status', label: 'Estado' },
];

describe('TreeList', () => {
  it('renderiza un treegrid con aria-label y cabeceras de columna', () => {
    render(<TreeList nodes={nodes} columns={columns} ariaLabel="Categorias" />);

    const grid = screen.getByRole('treegrid', { name: 'Categorias' });
    expect(grid).toBeInTheDocument();

    expect(screen.getByText('Articulos')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('muestra los nodos raiz como filas con sus celdas de columna', () => {
    render(<TreeList nodes={nodes} columns={columns} ariaLabel="Categorias" />);

    expect(screen.getByText('Electronica')).toBeInTheDocument();
    expect(screen.getByText('Ropa')).toBeInTheDocument();

    // Celdas de la fila Ropa: items=50, status=Activa
    const ropaRow = screen.getByText('Ropa').closest('[role="row"]');
    expect(within(ropaRow).getByText('50')).toBeInTheDocument();
    expect(within(ropaRow).getByText('Activa')).toBeInTheDocument();
  });

  it('los hijos no son visibles hasta expandir el nodo padre', () => {
    render(<TreeList nodes={nodes} columns={columns} ariaLabel="Categorias" />);

    expect(screen.queryByText('Telefonos')).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /expandir electronica/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('expande y colapsa un nodo con hijos al pulsar el toggle', async () => {
    const user = userEvent.setup();
    render(<TreeList nodes={nodes} columns={columns} ariaLabel="Categorias" />);

    const toggle = screen.getByRole('button', { name: /expandir electronica/i });
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Telefonos')).toBeInTheDocument();
    expect(screen.getByText('Ordenadores')).toBeInTheDocument();
    // El nieto sigue oculto (ordenadores no esta expandido)
    expect(screen.queryByText('Portatiles')).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Telefonos')).not.toBeInTheDocument();
  });

  it('respeta defaultExpandedIds para mostrar hijos al montar', () => {
    render(
      <TreeList
        nodes={nodes}
        columns={columns}
        defaultExpandedIds={['electronica']}
        ariaLabel="Categorias"
      />,
    );

    expect(screen.getByText('Telefonos')).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /colapsar electronica/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('renderiza acciones por fila mediante renderActions(node)', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    render(
      <TreeList
        nodes={nodes}
        columns={columns}
        ariaLabel="Categorias"
        renderActions={(node) => (
          <button type="button" onClick={() => onEdit(node.id)}>
            Editar {node.label}
          </button>
        )}
      />,
    );

    // La accion vive en la celda de su fila
    const ropaRow = screen.getByText('Ropa').closest('[role="row"]');
    const action = within(ropaRow).getByRole('button', { name: 'Editar Ropa' });
    await user.click(action);
    expect(onEdit).toHaveBeenCalledWith('ropa');
  });

  it('renderiza de forma segura cuando nodes esta vacio', () => {
    render(<TreeList nodes={[]} columns={columns} ariaLabel="Categorias" />);

    const grid = screen.getByRole('treegrid', { name: 'Categorias' });
    expect(grid).toBeInTheDocument();
    expect(screen.queryByText('Electronica')).not.toBeInTheDocument();
  });

  it('no rompe sin nodes ni columns (defaults)', () => {
    render(<TreeList ariaLabel="Vacio" />);
    expect(screen.getByRole('treegrid', { name: 'Vacio' })).toBeInTheDocument();
  });
});
