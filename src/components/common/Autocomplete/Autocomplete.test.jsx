/**
 * Tests: Autocomplete (BUG-SB01)
 * Iniciativa: integrar-componentes-ui-core-js (T-402)
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Autocomplete from './Autocomplete';

const OPTIONS = ['Mango', 'Mamey', 'Mandarina', 'Melón', 'Mora'];

describe('Autocomplete', () => {
  it('renderiza el input con role=combobox', () => {
    render(<Autocomplete value="" onChange={jest.fn()} options={OPTIONS} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('muestra opciones filtradas al escribir', () => {
    render(<Autocomplete value="Man" onChange={jest.fn()} options={OPTIONS} />);
    // Al tener focus + value, la lista aparece
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Mango' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mandarina' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Mora' })).not.toBeInTheDocument();
  });

  it('flecha abajo mueve el foco a la primera opción', () => {
    render(<Autocomplete value="Ma" onChange={jest.fn()} options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('Enter selecciona la opción activa y llama onSelect', () => {
    const onSelect = jest.fn();
    const onChange = jest.fn();
    render(
      <Autocomplete
        value="Man"
        onChange={onChange}
        onSelect={onSelect}
        options={OPTIONS}
      />
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalled();
  });

  it('Escape cierra la lista', () => {
    render(<Autocomplete value="Mo" onChange={jest.fn()} options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('muestra mensaje noResults cuando no hay coincidencias', () => {
    render(
      <Autocomplete
        value="xyz"
        onChange={jest.fn()}
        options={OPTIONS}
        noResults="No encontrado"
      />
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByRole('status')).toHaveTextContent('No encontrado');
  });

  it('click en opción llama onSelect', () => {
    const onSelect = jest.fn();
    render(
      <Autocomplete value="Mo" onChange={jest.fn()} onSelect={onSelect} options={OPTIONS} />
    );
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Mora' }));
    expect(onSelect).toHaveBeenCalledWith('Mora');
  });
});
