/**
 * Tests: KanbanBoard — tablero nativo por columnas con tarjetas movibles.
 *
 * El movimiento se prueba via los controles de teclado/botones (mover a la
 * columna anterior/siguiente). El drag real con la HTML DnD API no se ejercita
 * porque jsdom no lo soporta de forma fiable.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanBoard from './index';

const columns = [
  { id: 'todo', title: 'Por hacer' },
  { id: 'doing', title: 'En curso' },
  { id: 'done', title: 'Completado' },
];

const cards = [
  { id: 'p1', columnId: 'todo', label: 'Pedido 1' },
  { id: 'p2', columnId: 'todo', label: 'Pedido 2' },
  { id: 'p3', columnId: 'doing', label: 'Pedido 3' },
];

const renderCard = (card) => <span>{card.label}</span>;

const setup = (props = {}) =>
  render(
    <KanbanBoard
      columns={columns}
      cards={cards}
      renderCard={renderCard}
      ariaLabel="Pedidos por estado"
      {...props}
    />,
  );

describe('KanbanBoard', () => {
  it('renderiza una region por cada columna con su titulo', () => {
    setup();
    expect(screen.getByRole('region', { name: 'Por hacer' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'En curso' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Completado' })).toBeInTheDocument();
  });

  it('expone el aria-label del tablero', () => {
    setup();
    expect(screen.getByRole('group', { name: 'Pedidos por estado' })).toBeInTheDocument();
  });

  it('agrupa cada tarjeta en su columna segun columnId', () => {
    setup();
    const todo = screen.getByRole('region', { name: 'Por hacer' });
    const doing = screen.getByRole('region', { name: 'En curso' });
    expect(within(todo).getByText('Pedido 1')).toBeInTheDocument();
    expect(within(todo).getByText('Pedido 2')).toBeInTheDocument();
    expect(within(doing).getByText('Pedido 3')).toBeInTheDocument();
    expect(within(doing).queryByText('Pedido 1')).not.toBeInTheDocument();
  });

  it('muestra el contador de tarjetas por columna', () => {
    setup();
    const todo = screen.getByRole('region', { name: 'Por hacer' });
    const done = screen.getByRole('region', { name: 'Completado' });
    expect(within(todo).getByText('2')).toBeInTheDocument();
    expect(within(done).getByText('0')).toBeInTheDocument();
  });

  it('llama onCardMove con la columna siguiente al pulsar el control "siguiente"', async () => {
    const user = userEvent.setup();
    const onCardMove = jest.fn();
    setup({ onCardMove });
    const next = screen.getByRole('button', {
      name: 'Mover Pedido 1 a la columna siguiente',
    });
    await user.click(next);
    expect(onCardMove).toHaveBeenCalledWith('p1', 'doing');
  });

  it('llama onCardMove con la columna anterior al pulsar el control "anterior"', async () => {
    const user = userEvent.setup();
    const onCardMove = jest.fn();
    setup({ onCardMove });
    const prev = screen.getByRole('button', {
      name: 'Mover Pedido 3 a la columna anterior',
    });
    await user.click(prev);
    expect(onCardMove).toHaveBeenCalledWith('p3', 'todo');
  });

  it('deshabilita "anterior" en la primera columna y "siguiente" en la ultima', () => {
    setup({
      cards: [
        { id: 'a', columnId: 'todo', label: 'A' },
        { id: 'z', columnId: 'done', label: 'Z' },
      ],
    });
    expect(
      screen.getByRole('button', { name: 'Mover A a la columna anterior' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Mover Z a la columna siguiente' }),
    ).toBeDisabled();
  });

  it('no falla con columns y cards vacios', () => {
    const { container } = render(
      <KanbanBoard columns={[]} cards={[]} renderCard={renderCard} />,
    );
    expect(container).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('no lanza si onCardMove no se proporciona', async () => {
    const user = userEvent.setup();
    setup({ onCardMove: undefined });
    const next = screen.getByRole('button', {
      name: 'Mover Pedido 1 a la columna siguiente',
    });
    await user.click(next);
    expect(next).toBeInTheDocument();
  });

  it('mueve la tarjeta soltada en otra columna via drag-and-drop', () => {
    const onCardMove = jest.fn();
    setup({ onCardMove });
    const card = screen.getByText('Pedido 1').closest('[draggable="true"]');
    const doing = screen.getByRole('region', { name: 'En curso' });

    const dataTransfer = {
      store: {},
      setData(type, val) { this.store[type] = val; },
      getData(type) { return this.store[type]; },
    };

    const dragStart = new Event('dragstart', { bubbles: true });
    dragStart.dataTransfer = dataTransfer;
    card.dispatchEvent(dragStart);

    const drop = new Event('drop', { bubbles: true });
    drop.dataTransfer = dataTransfer;
    drop.preventDefault = () => {};
    doing.dispatchEvent(drop);

    expect(onCardMove).toHaveBeenCalledWith('p1', 'doing');
  });
});
