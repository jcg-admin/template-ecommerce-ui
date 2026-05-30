/**
 * OTPInput — ecommerce-ui
 * Código OTP / PIN con API completa de ui-core otp-input.js.
 *
 * Opciones de ui-core implementadas:
 *   ariaLabel: fn   — (index, total) => string
 *   autoSubmit: false — enviar el form al completar
 *   disabled: false
 *   id: null        — prefijo para IDs
 *   linear: true    — foco avanza linealmente (no puede saltar campos vacíos)
 *   masked: false   — type=password en los inputs
 *   name: null      — name de los inputs
 *   placeholder: null
 *   readonly: false
 *   required: false
 *   type: 'number' — 'number' | 'text' | 'all'
 *   value: null     — valor inicial
 *
 * Métodos via ref: clear() / reset() / update(config)
 * Evento: onChange(value), onComplete(value), onPaste
 */
import {
  useRef, useCallback,
  useImperativeHandle, forwardRef, useId, useState,
} from 'react';
import styles from './OTPInput.module.scss';

const OTPInput = forwardRef(function OTPInput({
  length         = 6,
  value:         controlled,
  onChange,
  onComplete,
  // Opciones de ui-core
  ariaLabel      = (index, total) => `Dígito ${index + 1} de ${total}`,
  autoSubmit     = false,        // Default ui-core
  disabled       = false,        // Default ui-core
  id:            externalId,     // Default ui-core
  linear         = true,         // Default ui-core
  masked         = false,        // Default ui-core
  name,                          // Default ui-core
  placeholder    = null,         // Default ui-core
  readonly       = false,        // Default ui-core
  required       = false,        // Default ui-core
  type           = 'number',     // Default ui-core: 'number'|'text'|'all'
  className      = '',
}, ref) {
  const generatedId = useId();
  const baseId  = externalId ?? `otp-${generatedId.replace(/:/g, '')}`;
  const inputsRef = useRef([]);

  const [internal, setInternal] = useState(() => {
    const v = controlled ?? '';
    return Array.from({ length }, (_, i) => v[i] ?? '');
  });

  const chars = controlled !== undefined
    ? Array.from({ length }, (_, i) => controlled[i] ?? '')
    : internal;

  const setChars = useCallback((next) => {
    setInternal(next);
    const joined = next.join('');
    onChange?.(joined);
    if (joined.length === length && !next.includes('')) {
      onComplete?.(joined);
      if (autoSubmit) {
        // Buscar el form padre y disparar submit
        inputsRef.current[0]?.closest('form')?.requestSubmit?.();
      }
    }
  }, [onChange, onComplete, length, autoSubmit]);

  // Validar entrada según type — equivale a _isValidInput() de ui-core
  const isValid = useCallback((char) => {
    if (type === 'all')    return true;
    if (type === 'text')   return /^[a-zA-Z]$/.test(char);
    if (type === 'number') return /^\d$/.test(char);
    return true;
  }, [type]);

  const handleKeyDown = useCallback((e, idx) => {
    const { key } = e;

    if (key === 'Backspace') {
      e.preventDefault();
      if (chars[idx]) {
        const next = [...chars];
        next[idx] = '';
        setChars(next);
      } else if (idx > 0) {
        const next = [...chars];
        next[idx - 1] = '';
        setChars(next);
        inputsRef.current[idx - 1]?.focus();
      }
      return;
    }

    if (key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      inputsRef.current[idx - 1]?.focus();
      return;
    }
    if (key === 'ArrowRight' && idx < length - 1) {
      e.preventDefault();
      inputsRef.current[idx + 1]?.focus();
      return;
    }

    if (key.length === 1) {
      e.preventDefault();
      if (!isValid(key)) return;
      const next = [...chars];
      next[idx]  = key;
      setChars(next);
      // linear=true: avanzar solo si el siguiente está vacío o siempre
      if (idx < length - 1) {
        const nextIdx = linear
          ? next.findIndex((c, i) => i > idx && !c) // primer vacío adelante
          : idx + 1;
        if (nextIdx >= 0 && nextIdx <= length - 1) {
          inputsRef.current[nextIdx]?.focus();
        } else if (!linear) {
          inputsRef.current[idx + 1]?.focus();
        }
      }
    }
  }, [chars, length, linear, isValid, setChars]);

  // Paste — equivale a EVENT_PASTE en ui-core
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').slice(0, length);
    const next = Array.from({ length }, (_, i) => (isValid(text[i]) ? text[i] : '') ?? '');
    setChars(next);
    const lastFilled = next.filter(Boolean).length;
    inputsRef.current[Math.min(lastFilled, length - 1)]?.focus();
  }, [length, isValid, setChars]);

  // clear() — equivale a OTPInput.clear() de ui-core
  const clear = useCallback(() => {
    setChars(Array(length).fill(''));
    inputsRef.current[0]?.focus();
  }, [length, setChars]);

  // reset() — equivale a OTPInput.reset() de ui-core
  const reset = useCallback(() => {
    const v = controlled ?? '';
    setInternal(Array.from({ length }, (_, i) => v[i] ?? ''));
  }, [controlled, length]);

  // update(config) — equivale a OTPInput.update()
  const update = useCallback((config) => {
    if (config.value !== undefined) {
      const v = String(config.value);
      setInternal(Array.from({ length }, (_, i) => v[i] ?? ''));
    }
    if (config.masked !== undefined) {
      // Solo actualiza el tipo del input — requiere re-render
    }
  }, [length]);

  useImperativeHandle(ref, () => ({ clear, reset, update }), [clear, reset, update]);

  return (
    <div
      className={`${styles.otp} ${className}`}
      role="group"
      aria-label={`Código de ${length} dígitos`}
    >
      {chars.map((char, i) => (
        <input
          key={`otp-${i}`}
          ref={el => { inputsRef.current[i] = el; }}
          id={`${baseId}-${i}`}
          name={name ? `${name}[${i}]` : undefined}
          type={masked ? 'password' : 'text'}
          inputMode={type === 'number' ? 'numeric' : 'text'}
          maxLength={1}
          value={char}
          disabled={disabled}
          readOnly={readonly}
          required={required}
          placeholder={placeholder !== null ? String(placeholder)[i] ?? '' : undefined}
          className={styles.input}
          aria-label={ariaLabel(i, length)}
          aria-required={required ? true : undefined}
          onChange={() => {}} // Controlled — onChange real está en onKeyDown
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={(e) => i === 0 && handlePaste(e)}
          onFocus={(e) => e.target.select()}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
        />
      ))}
    </div>
  );
});

export default OTPInput;
export { OTPInput };
