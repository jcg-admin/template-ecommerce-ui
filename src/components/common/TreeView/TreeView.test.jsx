/**
 * TreeView -- tests (TDD: rojo antes que implementacion)
 * Cubre: render de jerarquia, expandir/colapsar, onSelect al click,
 * aria-selected del seleccionado, navegacion por teclado, nodes vacio.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TreeView from './index';

const nodes = [
  {
    id: 'electronica',
    label: 'Electronica',
    children: [
      { id: 'telefonos', label: 'Telefonos' },
      {
        id: 'ordenadores',
        label: 'Ordenadores',
        children: [
          { id: 'portatiles', label: 'Portatiles' },
        ],
      },
    ],
  },
  { id: 'ropa', label: 'Ropa' },
];

describe('TreeView', () => {
  it('renderiza la jerarquia con roles ARIA', () => {
    render(<TreeView nodes={nodes} ariaLabel="Categorias" />);

    const tree = screen.getByRole('tree', { name: 'Categorias' });
    expect(tree).toBeInTheDocument();

    // Nivel raiz visible
    expect(screen.getByText('Electronica')).toBeInTheDocument();
    expect(screen.getByText('Ropa')).toBeInTheDocument();

    // treeitems presentes para los nodos de raiz
    expect(screen.getAllByRole('treeitem').length).toBeGreaterThanOrEqual(2);
  });

  it('colapsa los hijos por defecto y los muestra al expandir', async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={nodes} ariaLabel="Categorias" />);

    // Hijos no visibles inicialmente
    expect(screen.queryByText('Telefonos')).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /expandir electronica/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(screen.getByText('Telefonos')).toBeInTheDocument();
    expect(screen.getByText('Ordenadores')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /colapsar electronica/i })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('respeta defaultExpandedIds', () => {
    render(
      <TreeView
        nodes={nodes}
        ariaLabel="Categorias"
        defaultExpandedIds={['electronica']}
      />
    );
    expect(screen.getByText('Telefonos')).toBeInTheDocument();
    expect(screen.getByText('Ordenadores')).toBeInTheDocument();
    // Nieto sigue colapsado
    expect(screen.queryByText('Portatiles')).not.toBeInTheDocument();
  });

  it('renderiza grupos con role="group"', () => {
    render(
      <TreeView
        nodes={nodes}
        ariaLabel="Categorias"
        defaultExpandedIds={['electronica']}
      />
    );
    expect(screen.getAllByRole('group').length).toBeGreaterThanOrEqual(1);
  });

  it('llama onSelect con el id al hacer click en un nodo', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<TreeView nodes={nodes} ariaLabel="Categorias" onSelect={onSelect} />);

    await user.click(screen.getByText('Ropa'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('ropa');
  });

  it('marca aria-selected en el nodo seleccionado', () => {
    render(
      <TreeView nodes={nodes} ariaLabel="Categorias" selectedId="ropa" />
    );
    const item = screen.getByRole('treeitem', { name: /ropa/i });
    expect(item).toHaveAttribute('aria-selected', 'true');
  });

  it('selecciona con Enter y Espacio desde el teclado', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<TreeView nodes={nodes} ariaLabel="Categorias" onSelect={onSelect} />);

    const label = screen.getByText('Ropa');
    label.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('ropa');

    onSelect.mockClear();
    label.focus();
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledWith('ropa');
  });

  it('expande/colapsa con las flechas derecha e izquierda', async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={nodes} ariaLabel="Categorias" />);

    const label = screen.getByText('Electronica');
    label.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Telefonos')).toBeInTheDocument();

    label.focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByText('Telefonos')).not.toBeInTheDocument();
  });

  it('renderiza de forma segura con nodes vacio', () => {
    render(<TreeView nodes={[]} ariaLabel="Categorias" />);
    const tree = screen.getByRole('tree', { name: 'Categorias' });
    expect(tree).toBeInTheDocument();
    expect(screen.queryAllByRole('treeitem')).toHaveLength(0);
  });

  it('no rompe si nodes no se pasa', () => {
    render(<TreeView ariaLabel="Categorias" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });
});
