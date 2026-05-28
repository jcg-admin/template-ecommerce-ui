import { render, screen, fireEvent } from '@testing-library/react';
import MultiSelect from './MultiSelect';

const OPTS = ['Rojo', 'Verde', 'Azul', 'Amarillo'];

const Wrapper = ({ value = [], onChange = jest.fn() }) => (
  <MultiSelect options={OPTS} value={value} onChange={onChange} label="Colores" />
);

describe('MultiSelect', () => {
  it('muestra el placeholder cuando no hay selección', () => {
    render(<Wrapper />);
    expect(screen.getByRole('button', { name: /colores/i })).toHaveTextContent('Seleccionar');
  });

  it('abre el panel al hacer click en el trigger', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByRole('button', { name: /colores/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('seleccionar una opción llama onChange con el array correcto', () => {
    const onChange = jest.fn();
    render(<Wrapper onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /colores/i }));
    fireEvent.mouseDown(screen.getByRole('option', { name: /rojo/i }));
    expect(onChange).toHaveBeenCalledWith(['Rojo']);
  });

  it('deseleccionar una opción la quita del array', () => {
    const onChange = jest.fn();
    render(<Wrapper value={['Rojo', 'Verde']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /colores/i }));
    fireEvent.mouseDown(screen.getByRole('option', { name: /rojo/i }));
    expect(onChange).toHaveBeenCalledWith(['Verde']);
  });

  it('Seleccionar todo agrega todas las opciones', () => {
    const onChange = jest.fn();
    render(<Wrapper onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /colores/i }));
    fireEvent.click(screen.getByRole('button', { name: /seleccionar todo/i }));
    expect(onChange).toHaveBeenCalledWith(['Rojo', 'Verde', 'Azul', 'Amarillo']);
  });

  it('Limpiar vacía la selección', () => {
    const onChange = jest.fn();
    render(<Wrapper value={['Rojo']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /colores/i }));
    fireEvent.click(screen.getByRole('button', { name: /limpiar/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('muestra contador cuando hay más de 1 seleccionado', () => {
    render(<Wrapper value={['Rojo', 'Verde', 'Azul']} />);
    expect(screen.getByRole('button', { name: /colores/i })).toHaveTextContent('3 seleccionados');
  });

  it('aria-expanded cambia con el estado del panel', () => {
    render(<Wrapper />);
    const trigger = screen.getByRole('button', { name: /colores/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
