/**
 * Tests: NumericTextBox — adaptación nativa de kno-react-inputs NumericTextBox.
 * Cubre: increment/decrement con clamp, tecleo, respeto de min/max, disabled.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import NumericTextBox from './index';

describe('NumericTextBox', () => {
  it('renderiza input numérico y dos steppers', () => {
    render(<NumericTextBox value={3} onChange={() => {}} />);
    expect(screen.getByLabelText('Cantidad')).toHaveValue(3);
    expect(screen.getByLabelText('Aumentar')).toBeInTheDocument();
    expect(screen.getByLabelText('Disminuir')).toBeInTheDocument();
  });

  it('incrementar llama onChange con value + step', () => {
    const onChange = jest.fn();
    render(<NumericTextBox value={3} step={2} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('decrementar llama onChange con value - step', () => {
    const onChange = jest.fn();
    render(<NumericTextBox value={3} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Disminuir'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('incrementar clampea al max', () => {
    const onChange = jest.fn();
    render(<NumericTextBox value={9} max={10} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('decrementar clampea al min', () => {
    const onChange = jest.fn();
    render(<NumericTextBox value={2} min={1} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Disminuir'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('stepper deshabilitado en el límite inferior', () => {
    render(<NumericTextBox value={1} min={1} onChange={() => {}} />);
    expect(screen.getByLabelText('Disminuir')).toBeDisabled();
    expect(screen.getByLabelText('Aumentar')).not.toBeDisabled();
  });

  it('stepper deshabilitado en el límite superior', () => {
    render(<NumericTextBox value={10} max={10} onChange={() => {}} />);
    expect(screen.getByLabelText('Aumentar')).toBeDisabled();
    expect(screen.getByLabelText('Disminuir')).not.toBeDisabled();
  });

  it('tecleo numérico actualiza el valor (clampeado)', () => {
    const onChange = jest.fn();
    render(<NumericTextBox value={3} min={0} max={100} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '42' } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('tecleo por encima del max se clampea', () => {
    const onChange = jest.fn();
    render(<NumericTextBox value={3} max={10} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '99' } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('tecleo no numérico (NaN) se ignora', () => {
    const onChange = jest.fn();
    render(<NumericTextBox value={3} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: 'abc' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled bloquea steppers y tecleo', () => {
    const onChange = jest.fn();
    render(<NumericTextBox value={3} disabled onChange={onChange} />);
    const input = screen.getByLabelText('Cantidad');
    expect(input).toBeDisabled();
    expect(screen.getByLabelText('Aumentar')).toBeDisabled();
    expect(screen.getByLabelText('Disminuir')).toBeDisabled();
    fireEvent.change(input, { target: { value: '7' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ariaLabel personalizado se aplica al input', () => {
    render(<NumericTextBox value={5} ariaLabel="Stock disponible" onChange={() => {}} />);
    expect(screen.getByLabelText('Stock disponible')).toHaveValue(5);
  });
});
