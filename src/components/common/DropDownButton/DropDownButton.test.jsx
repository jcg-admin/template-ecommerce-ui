/**
 * Tests: DropDownButton — botón que abre un menú de acciones.
 * Cubre: aria-haspopup, menú oculto inicial, apertura por click,
 * ejecución de item + cierre, Escape, trigger deshabilitado,
 * y navegación por flechas entre items.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import DropDownButton from './index';

const makeItems = () => [
  { label: 'Editar', onClick: jest.fn() },
  { label: 'Duplicar', onClick: jest.fn() },
  { label: 'Eliminar', onClick: jest.fn(), disabled: true },
];

describe('DropDownButton', () => {
  it('el trigger expone aria-haspopup="menu"', () => {
    render(<DropDownButton text="Acciones" items={makeItems()} />);
    expect(screen.getByRole('button', { name: 'Acciones' }))
      .toHaveAttribute('aria-haspopup', 'menu');
  });

  it('el menú está oculto inicialmente', () => {
    render(<DropDownButton text="Acciones" items={makeItems()} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acciones' }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('click en el trigger abre el menú (aria-expanded=true)', () => {
    render(<DropDownButton text="Acciones" items={makeItems()} />);
    const trigger = screen.getByRole('button', { name: 'Acciones' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('click en un item llama su onClick y cierra el menú', () => {
    const items = makeItems();
    render(<DropDownButton text="Acciones" items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Editar' }));
    expect(items[0].onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acciones' }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('un item deshabilitado no dispara su onClick', () => {
    const items = makeItems();
    render(<DropDownButton text="Acciones" items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
    const eliminar = screen.getByRole('menuitem', { name: 'Eliminar' });
    expect(eliminar).toBeDisabled();
    fireEvent.click(eliminar);
    expect(items[2].onClick).not.toHaveBeenCalled();
  });

  it('Escape cierra el menú', () => {
    render(<DropDownButton text="Acciones" items={makeItems()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('un trigger deshabilitado no abre el menú', () => {
    render(<DropDownButton text="Acciones" items={makeItems()} disabled />);
    const trigger = screen.getByRole('button', { name: 'Acciones' });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('ArrowDown en el trigger abre el menú', () => {
    render(<DropDownButton text="Acciones" items={makeItems()} />);
    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Acciones' }),
      { key: 'ArrowDown' },
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('ArrowDown navega entre items habilitados saltando el deshabilitado', () => {
    render(<DropDownButton text="Acciones" items={makeItems()} />);
    const trigger = screen.getByRole('button', { name: 'Acciones' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    // Primer enabled (Editar) recibe foco.
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    // Siguiente enabled (Duplicar); Eliminar está disabled y se omite.
    expect(screen.getByRole('menuitem', { name: 'Duplicar' })).toHaveFocus();
  });

  it('renderiza el icono del item cuando se provee', () => {
    const items = [{ label: 'Ver', onClick: jest.fn(), icon: <span data-testid="ic">◎</span> }];
    render(<DropDownButton text="Acciones" items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });
});
