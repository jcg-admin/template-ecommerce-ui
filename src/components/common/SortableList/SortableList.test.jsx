/**
 * Tests: SortableList — UC-ADM-SORT
 *
 * Componente nativo de reordenamiento por drag-and-drop (HTML Drag and Drop
 * API) y por teclado/botones (subir/bajar). jsdom no ejecuta el gesto visual
 * de drag real, así que la lógica de reorden se valida vía los controles de
 * teclado/botones y mediante eventos dragstart/drop sintéticos.
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import SortableList from './index';

const baseItems = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Bravo' },
  { id: 'c', label: 'Charlie' },
];

const renderItem = (item) => <span>{item.label}</span>;

describe('SortableList — render seguro', () => {
  it('renderiza sin romper con items vacío', () => {
    const { container } = render(<SortableList items={[]} renderItem={renderItem} />);
    expect(container.querySelector('[role="list"]')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renderiza sin romper sin prop items', () => {
    expect(() => render(<SortableList renderItem={renderItem} />)).not.toThrow();
  });

  it('renderiza un listitem por elemento usando renderItem', () => {
    render(<SortableList items={baseItems} renderItem={renderItem} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Alpha');
    expect(items[2]).toHaveTextContent('Charlie');
  });

  it('aplica aria-label en la lista cuando se pasa', () => {
    render(
      <SortableList items={baseItems} renderItem={renderItem} ariaLabel="Imágenes del producto" />,
    );
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Imágenes del producto');
  });

  it('marca cada fila como draggable', () => {
    render(<SortableList items={baseItems} renderItem={renderItem} />);
    screen.getAllByRole('listitem').forEach((li) => {
      expect(li).toHaveAttribute('draggable', 'true');
    });
  });
});

describe('SortableList — reorden por teclado/botones', () => {
  it('el botón "bajar" mueve el elemento una posición abajo', () => {
    const onReorder = jest.fn();
    render(<SortableList items={baseItems} renderItem={renderItem} onReorder={onReorder} />);
    const firstRow = screen.getAllByRole('listitem')[0];
    fireEvent.click(within(firstRow).getByRole('button', { name: /bajar/i }));
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder.mock.calls[0][0].map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });

  it('el botón "subir" mueve el elemento una posición arriba', () => {
    const onReorder = jest.fn();
    render(<SortableList items={baseItems} renderItem={renderItem} onReorder={onReorder} />);
    const secondRow = screen.getAllByRole('listitem')[1];
    fireEvent.click(within(secondRow).getByRole('button', { name: /subir/i }));
    expect(onReorder.mock.calls[0][0].map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });

  it('el botón "subir" del primer elemento no hace nada (no llama onReorder)', () => {
    const onReorder = jest.fn();
    render(<SortableList items={baseItems} renderItem={renderItem} onReorder={onReorder} />);
    const firstRow = screen.getAllByRole('listitem')[0];
    fireEvent.click(within(firstRow).getByRole('button', { name: /subir/i }));
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('el botón "bajar" del último elemento no hace nada (no llama onReorder)', () => {
    const onReorder = jest.fn();
    render(<SortableList items={baseItems} renderItem={renderItem} onReorder={onReorder} />);
    const lastRow = screen.getAllByRole('listitem')[2];
    fireEvent.click(within(lastRow).getByRole('button', { name: /bajar/i }));
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('las flechas ArrowUp/ArrowDown sobre la fila reordenan', () => {
    const onReorder = jest.fn();
    render(<SortableList items={baseItems} renderItem={renderItem} onReorder={onReorder} />);
    const firstRow = screen.getAllByRole('listitem')[0];
    fireEvent.keyDown(firstRow, { key: 'ArrowDown' });
    expect(onReorder.mock.calls[0][0].map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });

  it('actualiza el orden visual tras reordenar (componente no controlado)', () => {
    render(<SortableList items={baseItems} renderItem={renderItem} />);
    const firstRow = screen.getAllByRole('listitem')[0];
    fireEvent.click(within(firstRow).getByRole('button', { name: /bajar/i }));
    const labels = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(labels[0]).toContain('Bravo');
    expect(labels[1]).toContain('Alpha');
  });
});

describe('SortableList — reorden por drag sintético', () => {
  it('arrastrar la fila 0 sobre la fila 2 reordena vía onReorder', () => {
    const onReorder = jest.fn();
    render(<SortableList items={baseItems} renderItem={renderItem} onReorder={onReorder} />);
    const rows = screen.getAllByRole('listitem');

    // dataTransfer mínimo para jsdom (no lo provee por defecto).
    const dataTransfer = { setData: jest.fn(), getData: jest.fn(), effectAllowed: '', dropEffect: '' };

    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragOver(rows[2], { dataTransfer });
    fireEvent.drop(rows[2], { dataTransfer });

    expect(onReorder).toHaveBeenCalled();
    const last = onReorder.mock.calls[onReorder.mock.calls.length - 1][0];
    expect(last.map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('SortableList — getKey personalizado', () => {
  it('usa getKey para las keys sin lanzar warnings', () => {
    const items = [
      { uid: 1, label: 'Uno' },
      { uid: 2, label: 'Dos' },
    ];
    expect(() =>
      render(
        <SortableList items={items} getKey={(it) => it.uid} renderItem={(it) => <span>{it.label}</span>} />,
      ),
    ).not.toThrow();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
