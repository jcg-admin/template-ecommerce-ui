/**
 * Tests: Rating — API completa de ui-core rating.js
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createRef } from 'react';
import Rating from './Rating';

describe('Rating — API completa ui-core', () => {
  it('renderiza itemCount estrellas (default 5)', () => {
    render(<Rating />);
    expect(screen.getAllByRole('radio').length).toBe(5);
  });

  it('itemCount configura el número de estrellas', () => {
    render(<Rating itemCount={3} />);
    expect(screen.getAllByRole('radio').length).toBe(3);
  });

  it('value selecciona la estrella correspondiente', () => {
    render(<Rating value={3} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[2]).toBeChecked();
  });

  it('onChange se llama al seleccionar una estrella', () => {
    const onChange = jest.fn();
    render(<Rating onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('radio')[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('allowClear=true borra el valor al clicar la misma estrella', () => {
    const onChange = jest.fn();
    render(<Rating value={3} allowClear onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('radio')[2]);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('readOnly=true impide cambios', () => {
    const onChange = jest.fn();
    render(<Rating value={2} readOnly onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('radio')[4]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled=true deshabilita los inputs', () => {
    render(<Rating disabled />);
    screen.getAllByRole('radio').forEach(r => expect(r).toBeDisabled());
  });

  it('tooltips=true muestra el número como title', () => {
    const { container } = render(<Rating tooltips />);
    const labels = container.querySelectorAll('label[title]');
    expect(labels.length).toBe(5);
    expect(labels[0]).toHaveAttribute('title', '1');
  });

  it('tooltips como array usa las etiquetas', () => {
    const tips = ['Muy malo','Malo','Regular','Bueno','Excelente'];
    const { container } = render(<Rating tooltips={tips} />);
    const label = container.querySelector('label[title="Excelente"]');
    expect(label).toBeInTheDocument();
  });

  it('ref.update(config) actualiza el valor', () => {
    const ref = createRef();
    render(<Rating ref={ref} />);
    act(() => ref.current.update({ value: 4 }));
    expect(screen.getAllByRole('radio')[3]).toBeChecked();
  });

  it('ref.reset() borra el valor', () => {
    const onChange = jest.fn();
    const ref = createRef();
    render(<Rating defaultValue={3} ref={ref} onChange={onChange} />);
    act(() => ref.current.reset());
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
