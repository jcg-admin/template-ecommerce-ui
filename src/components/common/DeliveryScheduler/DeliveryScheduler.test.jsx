/**
 * Tests: DeliveryScheduler — selector nativo de fecha/franja de entrega.
 * UC-CHT-SCHED. Sin dependencias, TDD estricto.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import DeliveryScheduler from './index';

const SLOTS = [
  { id: 's1', date: '2026-06-03', label: '09:00 – 12:00', available: true },
  { id: 's2', date: '2026-06-03', label: '12:00 – 15:00', available: false },
  { id: 's3', date: '2026-06-04', label: '09:00 – 12:00', available: true },
];

describe('DeliveryScheduler', () => {
  it('renderiza un grupo accesible con aria-label', () => {
    render(<DeliveryScheduler slots={SLOTS} ariaLabel="Fecha de entrega" />);
    expect(
      screen.getByRole('group', { name: 'Fecha de entrega' }),
    ).toBeInTheDocument();
  });

  it('render seguro con slots=[]', () => {
    render(<DeliveryScheduler slots={[]} ariaLabel="Fecha de entrega" />);
    expect(
      screen.getByRole('group', { name: 'Fecha de entrega' }),
    ).toBeInTheDocument();
  });

  it('render seguro sin prop slots', () => {
    render(<DeliveryScheduler ariaLabel="Fecha de entrega" />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renderiza una franja por cada slot como botón', () => {
    render(<DeliveryScheduler slots={SLOTS} ariaLabel="Fecha de entrega" />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('agrupa por fecha con encabezado', () => {
    render(<DeliveryScheduler slots={SLOTS} ariaLabel="Fecha de entrega" />);
    expect(screen.getByText('2026-06-03')).toBeInTheDocument();
    expect(screen.getByText('2026-06-04')).toBeInTheDocument();
  });

  it('cada botón expone aria-label con fecha y label', () => {
    render(<DeliveryScheduler slots={SLOTS} ariaLabel="Fecha de entrega" />);
    expect(
      screen.getByRole('button', { name: '2026-06-03 09:00 – 12:00' }),
    ).toBeInTheDocument();
  });

  it('deshabilita los slots con available===false', () => {
    render(<DeliveryScheduler slots={SLOTS} ariaLabel="Fecha de entrega" />);
    const disabled = screen.getByRole('button', {
      name: '2026-06-03 12:00 – 15:00',
    });
    expect(disabled).toBeDisabled();
  });

  it('al seleccionar una franja llama onSelect con su id', () => {
    const onSelect = jest.fn();
    render(
      <DeliveryScheduler
        slots={SLOTS}
        onSelect={onSelect}
        ariaLabel="Fecha de entrega"
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: '2026-06-03 09:00 – 12:00' }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('s1');
  });

  it('no llama onSelect en un slot deshabilitado', () => {
    const onSelect = jest.fn();
    render(
      <DeliveryScheduler
        slots={SLOTS}
        onSelect={onSelect}
        ariaLabel="Fecha de entrega"
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: '2026-06-03 12:00 – 15:00' }),
    );
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('marca la franja activa con aria-pressed/aria-checked', () => {
    render(
      <DeliveryScheduler
        slots={SLOTS}
        value="s1"
        ariaLabel="Fecha de entrega"
      />,
    );
    const active = screen.getByRole('button', {
      name: '2026-06-03 09:00 – 12:00',
    });
    expect(active).toHaveAttribute('aria-pressed', 'true');
    expect(active).toHaveAttribute('aria-checked', 'true');
  });

  it('las franjas no seleccionadas no están activas', () => {
    render(
      <DeliveryScheduler
        slots={SLOTS}
        value="s1"
        ariaLabel="Fecha de entrega"
      />,
    );
    const other = screen.getByRole('button', {
      name: '2026-06-04 09:00 – 12:00',
    });
    expect(other).toHaveAttribute('aria-pressed', 'false');
  });

  it('no falla si onSelect no se pasa', () => {
    render(<DeliveryScheduler slots={SLOTS} ariaLabel="Fecha de entrega" />);
    expect(() =>
      fireEvent.click(
        screen.getByRole('button', { name: '2026-06-03 09:00 – 12:00' }),
      ),
    ).not.toThrow();
  });
});
