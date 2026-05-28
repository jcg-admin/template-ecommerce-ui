/**
 * Tests: OTPInput — API completa de ui-core otp-input.js
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createRef } from 'react';
import OTPInput from './OTPInput';

describe('OTPInput — API completa ui-core', () => {
  it('renderiza N inputs según length', () => {
    render(<OTPInput length={6} />);
    expect(screen.getAllByRole('textbox').length).toBe(6);
  });

  it('type=number rechaza letras', () => {
    render(<OTPInput length={4} type="number" />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.keyDown(inputs[0], { key: 'a' });
    expect(inputs[0].value).toBe('');
  });

  it('tecleando un dígito avanza al siguiente input (linear=true)', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    inputs[0].focus();
    fireEvent.keyDown(inputs[0], { key: '3' });
    expect(inputs[0].value).toBe('3');
  });

  it('Backspace borra el caracter actual', () => {
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.keyDown(inputs[0], { key: '5' });
    fireEvent.keyDown(inputs[0], { key: 'Backspace' });
    expect(inputs[0].value).toBe('');
  });

  it('paste rellena todos los campos', () => {
    render(<OTPInput length={4} type="number" />);
    const first = screen.getAllByRole('textbox')[0];
    fireEvent.paste(first, {
      clipboardData: { getData: () => '1234' },
    });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0].value).toBe('1');
    expect(inputs[3].value).toBe('4');
  });

  it('onChange se llama con el código parcial', () => {
    const onChange = jest.fn();
    render(<OTPInput length={4} onChange={onChange} />);
    fireEvent.keyDown(screen.getAllByRole('textbox')[0], { key: '7' });
    expect(onChange).toHaveBeenCalledWith('7');
  });

  it('onComplete se llama al completar todos los campos', () => {
    const onComplete = jest.fn();
    render(<OTPInput length={2} onComplete={onComplete} />);
    const [a, b] = screen.getAllByRole('textbox');
    fireEvent.keyDown(a, { key: '1' });
    fireEvent.keyDown(b, { key: '2' });
    expect(onComplete).toHaveBeenCalledWith('12');
  });

  it('masked=true usa type=password en cada input', () => {
    render(<OTPInput length={4} masked />);
    const pwds = document.querySelectorAll('input[type=password]');
    expect(pwds.length).toBe(4);
  });

  it('ariaLabel personaliza los aria-label', () => {
    render(<OTPInput length={3} ariaLabel={(i) => `Campo ${i + 1}`} />);
    expect(screen.getByLabelText('Campo 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Campo 3')).toBeInTheDocument();
  });

  it('ref.clear() borra todos los campos', () => {
    const ref = createRef();
    render(<OTPInput length={3} ref={ref} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.keyDown(inputs[0], { key: '1' });
    act(() => ref.current.clear());
    expect(inputs[0].value).toBe('');
  });

  it('ref expone clear / reset / update', () => {
    const ref = createRef();
    render(<OTPInput ref={ref} />);
    ['clear','reset','update'].forEach(m => {
      expect(typeof ref.current?.[m]).toBe('function');
    });
  });
});
