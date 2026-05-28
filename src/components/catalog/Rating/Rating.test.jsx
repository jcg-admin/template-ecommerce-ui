import { render, screen, fireEvent } from '@testing-library/react';
import Rating from './Rating';

describe('Rating', () => {
  it('renderiza itemCount estrellas', () => {
    render(<Rating value={0} itemCount={5} />);
    // 5 radio inputs (uno por estrella)
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('llama onChange con el valor de la estrella clickeada', () => {
    const onChange = jest.fn();
    render(<Rating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('3 estrellas'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('NO llama onChange en modo readOnly', () => {
    const onChange = jest.fn();
    render(<Rating value={3} onChange={onChange} readOnly />);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    // No hay forma de interactuar
    expect(onChange).not.toHaveBeenCalled();
  });

  it('tiene aria-label con el valor actual en readOnly', () => {
    render(<Rating value={4} itemCount={5} readOnly />);
    expect(screen.getByLabelText('Calificación: 4 de 5')).toBeInTheDocument();
  });

  it('con precision=0.5 renderiza el doble de inputs radio', () => {
    render(<Rating value={2.5} precision={0.5} itemCount={5} />);
    expect(screen.getAllByRole('radio')).toHaveLength(10); // 5 enteras + 5 medias
  });

  it('input de la estrella marcada está checked', () => {
    render(<Rating value={3} />);
    expect(screen.getByLabelText('3 estrellas')).toBeChecked();
  });

  it('botón deshabilitado cuando disabled=true', () => {
    render(<Rating value={2} disabled />);
    // En disabled mode usa la misma representación que readOnly
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Calificación: 2 de 5')).toBeInTheDocument();
  });
});
