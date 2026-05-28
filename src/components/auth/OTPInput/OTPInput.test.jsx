import { render, screen, fireEvent } from '@testing-library/react';
import OTPInput from './OTPInput';

// Helper: obtener inputs por aria-label numerico
const getInputs = (container) =>
  Array.from(container.querySelectorAll('input[aria-label]'));

describe('OTPInput', () => {
  it('renderiza N inputs según length', () => {
    const { container } = render(<OTPInput length={6} value="" onChange={jest.fn()} />);
    expect(getInputs(container)).toHaveLength(6);
  });

  it('cada input tiene aria-label con su posición', () => {
    const { container } = render(<OTPInput length={4} value="" onChange={jest.fn()} />);
    const inputs = getInputs(container);
    expect(inputs[0].getAttribute('aria-label')).toMatch(/1/);
    expect(inputs[3].getAttribute('aria-label')).toMatch(/4/);
  });

  it('paste distribuye los dígitos entre los inputs', () => {
    const onChange = jest.fn();
    const { container } = render(<OTPInput length={6} value="" onChange={onChange} />);
    const first = getInputs(container)[0];
    fireEvent.paste(first, {
      clipboardData: { getData: () => '123456' },
    });
    expect(onChange).toHaveBeenCalledWith('123456');
  });

  it('paste ignora caracteres no numéricos', () => {
    const onChange = jest.fn();
    const { container } = render(<OTPInput length={4} value="" onChange={onChange} />);
    fireEvent.paste(getInputs(container)[0], {
      clipboardData: { getData: () => 'ab12' },
    });
    expect(onChange).toHaveBeenCalledWith('12');
  });

  it('Backspace en campo con valor lo limpia', () => {
    const onChange = jest.fn();
    const { container } = render(<OTPInput length={4} value="12" onChange={onChange} />);
    const inputs = getInputs(container);
    inputs[1].focus();
    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    expect(onChange).toHaveBeenCalled();
  });

  it('tiene role=group con aria-label', () => {
    render(<OTPInput length={4} value="" onChange={jest.fn()} />);
    expect(screen.getByRole('group', { name: /código de verificación/i })).toBeInTheDocument();
  });
});
