/**
 * Tests: DualListBox — UC-ADM-LISTBOX
 * Componente nativo para mover ítems entre dos listas (disponibles/seleccionados).
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import DualListBox from './index';

const ITEMS = [
  { id: 'a', label: 'Collares' },
  { id: 'b', label: 'Elekes' },
  { id: 'c', label: 'Otanes' },
  { id: 'd', label: 'Soperas' },
];

const getList = (name) => screen.getByRole('listbox', { name });

describe('DualListBox — UC-ADM-LISTBOX', () => {
  it('particiona los ítems en disponibles y seleccionados según selectedIds', () => {
    render(
      <DualListBox
        items={ITEMS}
        selectedIds={['b', 'd']}
        onChange={() => {}}
        availableLabel="Disponibles"
        selectedLabel="Seleccionados"
        ariaLabel="Asignación"
      />,
    );

    const available = getList('Disponibles');
    const selected = getList('Seleccionados');

    expect(within(available).getByRole('option', { name: 'Collares' })).toBeInTheDocument();
    expect(within(available).getByRole('option', { name: 'Otanes' })).toBeInTheDocument();
    expect(within(available).queryByRole('option', { name: 'Elekes' })).not.toBeInTheDocument();

    expect(within(selected).getByRole('option', { name: 'Elekes' })).toBeInTheDocument();
    expect(within(selected).getByRole('option', { name: 'Soperas' })).toBeInTheDocument();
    expect(within(selected).queryByRole('option', { name: 'Collares' })).not.toBeInTheDocument();
  });

  it('expone role/aria-label en cada lista y aria-label en la raíz', () => {
    render(
      <DualListBox
        items={ITEMS}
        selectedIds={[]}
        onChange={() => {}}
        availableLabel="Disponibles"
        selectedLabel="Seleccionados"
        ariaLabel="Asignación"
      />,
    );
    expect(screen.getByRole('group', { name: 'Asignación' })).toBeInTheDocument();
    expect(getList('Disponibles')).toBeInTheDocument();
    expect(getList('Seleccionados')).toBeInTheDocument();
  });

  it('mover (añadir) llama onChange con el id agregado a selectedIds', () => {
    const onChange = jest.fn();
    render(
      <DualListBox
        items={ITEMS}
        selectedIds={['b']}
        onChange={onChange}
        availableLabel="Disponibles"
        selectedLabel="Seleccionados"
        ariaLabel="Asignación"
      />,
    );

    const available = getList('Disponibles');
    fireEvent.click(within(available).getByRole('option', { name: 'Collares' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mover a Seleccionados' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['b', 'a']);
  });

  it('mover (quitar) llama onChange con el id removido de selectedIds', () => {
    const onChange = jest.fn();
    render(
      <DualListBox
        items={ITEMS}
        selectedIds={['b', 'd']}
        onChange={onChange}
        availableLabel="Disponibles"
        selectedLabel="Seleccionados"
        ariaLabel="Asignación"
      />,
    );

    const selected = getList('Seleccionados');
    fireEvent.click(within(selected).getByRole('option', { name: 'Elekes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mover a Disponibles' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['d']);
  });

  it('al hacer click en un ítem queda resaltado (aria-selected=true)', () => {
    render(
      <DualListBox
        items={ITEMS}
        selectedIds={[]}
        onChange={() => {}}
        availableLabel="Disponibles"
        selectedLabel="Seleccionados"
        ariaLabel="Asignación"
      />,
    );
    const opt = screen.getByRole('option', { name: 'Collares' });
    expect(opt).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(opt);
    expect(opt).toHaveAttribute('aria-selected', 'true');
  });

  it('botón mover por ítem también funciona sin selección previa', () => {
    const onChange = jest.fn();
    render(
      <DualListBox
        items={ITEMS}
        selectedIds={[]}
        onChange={onChange}
        availableLabel="Disponibles"
        selectedLabel="Seleccionados"
        ariaLabel="Asignación"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Otanes' }));
    expect(onChange).toHaveBeenCalledWith(['c']);
  });

  it('no llama onChange si no hay ítem resaltado al pulsar mover', () => {
    const onChange = jest.fn();
    render(
      <DualListBox
        items={ITEMS}
        selectedIds={['b']}
        onChange={onChange}
        availableLabel="Disponibles"
        selectedLabel="Seleccionados"
        ariaLabel="Asignación"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mover a Seleccionados' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('render seguro con items vacío', () => {
    render(
      <DualListBox
        items={[]}
        selectedIds={[]}
        onChange={() => {}}
        availableLabel="Disponibles"
        selectedLabel="Seleccionados"
        ariaLabel="Asignación"
      />,
    );
    expect(getList('Disponibles')).toBeInTheDocument();
    expect(getList('Seleccionados')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});
