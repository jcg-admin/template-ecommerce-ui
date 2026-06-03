/**
 * Tests: Rating — calificación por estrellas accesible.
 * Adaptado de kno-react-inputs (Rating). Iniciativa: UC-REV-01/02.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Rating from './index';

describe('Rating', () => {
  it('renderiza N estrellas según max (interactivo)', () => {
    render(<Rating value={0} max={5} onChange={() => {}} />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('respeta un max personalizado', () => {
    render(<Rating value={0} max={3} onChange={() => {}} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('al hacer click en una estrella llama onChange con el valor', () => {
    const onChange = jest.fn();
    render(<Rating value={0} max={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '4 de 5 estrellas' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('marca aria-checked en la estrella del valor actual', () => {
    render(<Rating value={3} max={5} onChange={() => {}} />);
    expect(
      screen.getByRole('radio', { name: '3 de 5 estrellas' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('las flechas cambian el valor en modo interactivo', () => {
    const onChange = jest.fn();
    render(<Rating value={2} max={5} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(3);
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('readOnly no es interactivo y no llama onChange al hacer click', () => {
    const onChange = jest.fn();
    render(<Rating value={4} max={5} readOnly onChange={onChange} />);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    const group = screen.getByRole('img');
    fireEvent.click(group);
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sin onChange se comporta como solo display', () => {
    render(<Rating value={2} max={5} />);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('muestra un valor fraccional (media estrella) en modo display', () => {
    const { container } = render(<Rating value={3.5} max={5} />);
    // 3 estrellas llenas + 1 media => 4 paths de relleno (clip parcial incluido).
    const fills = container.querySelectorAll('path[style*="clip-path"]');
    expect(fills).toHaveLength(4);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Calificación: 3.5 de 5',
    );
  });
});
