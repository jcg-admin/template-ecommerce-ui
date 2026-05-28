/**
 * Tests: Stepper
 * Cubre: BUG-CO01 (aria-current='step'), BUG-CO02 (linear blocks clicking ahead)
 * Iniciativa: integrar-componentes-ui-core-js (T-404)
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Stepper } from './Stepper';

const STEPS = [
  { label: 'Identificación' },
  { label: 'Envío' },
  { label: 'Pago' },
  { label: 'Confirmación' },
];

describe('Stepper — ARIA (BUG-CO01)', () => {
  it('tiene role navigation y aria-label', () => {
    render(<Stepper steps={STEPS} activeStep={1} />);
    expect(screen.getByRole('navigation', { name: /progreso/i })).toBeInTheDocument();
  });

  it('el paso activo tiene aria-current="step"', () => {
    render(<Stepper steps={STEPS} activeStep={1} />);
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  it('pasos completados muestran ✓ en el indicador', () => {
    render(<Stepper steps={STEPS} activeStep={2} />);
    // Los pasos 0 y 1 deben mostrar ✓
    const indicators = document.querySelectorAll('[aria-hidden="true"]');
    const checkmarks = Array.from(indicators).filter(el => el.textContent === '✓');
    expect(checkmarks.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Stepper — linear mode (BUG-CO02)', () => {
  it('con linear=true NO renderiza botón en pasos pendientes', () => {
    render(<Stepper steps={STEPS} activeStep={1} linear={true} onStepClick={jest.fn()} />);
    // Pasos pendientes (2, 3) no deben tener botón clickeable
    const buttons = screen.getAllByRole('button');
    // Solo el paso 0 (completado) es clickeable
    expect(buttons).toHaveLength(1);
  });

  it('con linear=false permite click en cualquier paso', () => {
    render(<Stepper steps={STEPS} activeStep={1} linear={false} onStepClick={jest.fn()} />);
    // Todos los pasos excepto el activo son clickeables (3 botones)
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(3);
  });

  it('onStepClick se llama con el índice correcto al click en completado', () => {
    const onStepClick = jest.fn();
    render(<Stepper steps={STEPS} activeStep={2} linear={true} onStepClick={onStepClick} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});
