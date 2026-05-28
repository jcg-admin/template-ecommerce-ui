/**
 * OTPInput — ecommerce-ui
 * N inputs con auto-avance de foco y paste inteligente.
 * Referencia: ui-core otp-input.js (T-501)
 * Iniciativa: integrar-componentes-ui-core-js
 */
import { useRef, useCallback } from 'react';
import styles from './OTPInput.module.scss';

export default function OTPInput({
  length      = 6,
  value       = '',
  onChange,
  disabled    = false,
  placeholder = '·',
  ariaLabel   = (i, total) => `Dígito ${i + 1} de ${total}`,
}) {
  const inputsRef = useRef([]);
  // BUG-OTP-01: ''.padEnd(n,'') no rellena (fillString vacío = sin relleno)
  // Corrección: Array.from para generar los slots garantizando N elementos
  const chars = Array.from({ length }, (_, i) => value[i] ?? '');

  const focus = useCallback((i) => {
    inputsRef.current[Math.max(0, Math.min(i, length - 1))]?.focus();
  }, [length]);

  const handleChange = useCallback((i, e) => {
    const char = e.target.value.slice(-1);  // tomar solo el último carácter
    const next = chars.map((c, idx) => idx === i ? char : c);
    onChange?.(next.join('').trimEnd());
    if (char) focus(i + 1);
  }, [chars, onChange, focus]);

  const handleKeyDown = useCallback((i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (chars[i]) {
        const next = chars.map((c, idx) => idx === i ? '' : c);
        onChange?.(next.join('').trimEnd());
      } else {
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft')  { e.preventDefault(); focus(i - 1); }
    else if  (e.key === 'ArrowRight') { e.preventDefault(); focus(i + 1); }
  }, [chars, onChange, focus]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange?.(pasted);
    focus(Math.min(pasted.length, length - 1));
  }, [length, onChange, focus]);

  return (
    <div className={styles.otp} role="group" aria-label="Código de verificación">
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={char}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.input} ${char ? styles.inputFilled : ''}`}
          aria-label={ariaLabel(i, length)}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
