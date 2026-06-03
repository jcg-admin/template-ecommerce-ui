/**
 * Tests: Checkbox — casilla de verificación accesible nativa (sin deps).
 * Inspirado en kno-react-inputs Checkbox.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './index';

describe('Checkbox', () => {
  it('renderiza el label y un input type=checkbox', () => {
    render(<Checkbox checked={false} label="Acepto los términos" />);
    expect(screen.getByText('Acepto los términos')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('refleja el estado checked en el input', () => {
    const { rerender } = render(<Checkbox checked={false} ariaLabel="Activo" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    rerender(<Checkbox checked={true} ariaLabel="Activo" />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('al hacer click llama onChange con el valor resultante', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Checkbox checked={false} onChange={onChange} label="Acepto" />);

    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('togglea desde checked llamando onChange(false)', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Checkbox checked={true} onChange={onChange} label="Acepto" />);

    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('al hacer click sobre el label también togglea', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Checkbox checked={false} onChange={onChange} label="Acepto" />);

    await user.click(screen.getByText('Acepto'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('disabled bloquea el toggle y no llama onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Checkbox checked={false} onChange={onChange} disabled label="Acepto" />);

    const input = screen.getByRole('checkbox');
    expect(input).toBeDisabled();
    await user.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('setea indeterminate en el elemento input del DOM', () => {
    const { rerender } = render(
      <Checkbox checked={false} indeterminate ariaLabel="Parcial" />,
    );
    expect(screen.getByRole('checkbox').indeterminate).toBe(true);

    rerender(<Checkbox checked={false} ariaLabel="Parcial" />);
    expect(screen.getByRole('checkbox').indeterminate).toBe(false);
  });

  it('expone aria-label cuando se provee', () => {
    render(<Checkbox checked={false} ariaLabel="Sólo lectores" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-label', 'Sólo lectores');
  });
});
