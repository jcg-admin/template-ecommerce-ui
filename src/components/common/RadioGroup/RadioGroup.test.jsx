/**
 * Tests: RadioGroup — grupo de opciones excluyentes nativo (sin deps).
 * Inspirado en kno-react-inputs RadioGroup/RadioButton.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RadioGroup from './index';

const items = [
  { label: 'Tarjeta', value: 'card' },
  { label: 'Transferencia', value: 'transfer' },
  { label: 'Efectivo', value: 'cash', disabled: true },
];

describe('RadioGroup', () => {
  it('renderiza todos los items dentro de un role="radiogroup"', () => {
    render(<RadioGroup items={items} value="card" ariaLabel="Metodo de pago" />);

    const group = screen.getByRole('radiogroup', { name: 'Metodo de pago' });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByLabelText('Tarjeta')).toBeInTheDocument();
    expect(screen.getByLabelText('Transferencia')).toBeInTheDocument();
    expect(screen.getByLabelText('Efectivo')).toBeInTheDocument();
  });

  it('refleja value marcando el radio correspondiente como checked', () => {
    render(<RadioGroup items={items} value="transfer" ariaLabel="Pago" />);

    expect(screen.getByLabelText('Tarjeta')).not.toBeChecked();
    expect(screen.getByLabelText('Transferencia')).toBeChecked();
  });

  it('al seleccionar un item llama onChange con su value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <RadioGroup items={items} value="card" onChange={onChange} ariaLabel="Pago" />,
    );

    await user.click(screen.getByLabelText('Transferencia'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('transfer');
  });

  it('un item disabled no es seleccionable y no llama onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <RadioGroup items={items} value="card" onChange={onChange} ariaLabel="Pago" />,
    );

    const disabledRadio = screen.getByLabelText('Efectivo');
    expect(disabledRadio).toBeDisabled();

    await user.click(disabledRadio);
    expect(onChange).not.toHaveBeenCalled();
    expect(disabledRadio).not.toBeChecked();
  });

  it('layout horizontal expone aria-orientation y data-layout', () => {
    render(
      <RadioGroup
        items={items}
        value="card"
        layout="horizontal"
        ariaLabel="Pago"
      />,
    );

    const group = screen.getByRole('radiogroup', { name: 'Pago' });
    expect(group).toHaveAttribute('aria-orientation', 'horizontal');
    expect(group).toHaveAttribute('data-layout', 'horizontal');
  });

  it('layout vertical por defecto', () => {
    render(<RadioGroup items={items} value="card" ariaLabel="Pago" />);

    const group = screen.getByRole('radiogroup', { name: 'Pago' });
    expect(group).toHaveAttribute('aria-orientation', 'vertical');
    expect(group).toHaveAttribute('data-layout', 'vertical');
  });

  it('comparte el name entre todos los radios del grupo', () => {
    render(
      <RadioGroup items={items} value="card" name="pay" ariaLabel="Pago" />,
    );

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toHaveAttribute('name', 'pay');
    });
  });
});
