/**
 * Tests: Switch — toggle accesible nativo (sin deps).
 * Inspirado en kno-react-inputs Switch.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Switch from './index';

describe('Switch', () => {
  it('expone role="switch" con aria-checked reflejando checked', () => {
    const { rerender } = render(<Switch checked={false} ariaLabel="Activo" />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveAttribute('aria-label', 'Activo');

    rerender(<Switch checked={true} ariaLabel="Activo" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('al hacer click llama onChange con !checked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Switch checked={false} onChange={onChange} ariaLabel="Activo" />);

    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('al hacer click sobre uno checked llama onChange(false)', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Switch checked={true} onChange={onChange} ariaLabel="Activo" />);

    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('disabled bloquea el toggle', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Switch checked={false} onChange={onChange} disabled ariaLabel="Activo" />);

    const sw = screen.getByRole('switch');
    expect(sw).toBeDisabled();
    await user.click(sw);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('teclado (Space) hace toggle', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Switch checked={false} onChange={onChange} ariaLabel="Activo" />);

    screen.getByRole('switch').focus();
    await user.keyboard('[Space]');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('teclado (Enter) hace toggle', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Switch checked={true} onChange={onChange} ariaLabel="Activo" />);

    screen.getByRole('switch').focus();
    await user.keyboard('[Enter]');
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('teclado no hace nada cuando disabled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Switch checked={false} onChange={onChange} disabled ariaLabel="Activo" />);

    screen.getByRole('switch').focus();
    await user.keyboard('[Space]');
    expect(onChange).not.toHaveBeenCalled();
  });
});
