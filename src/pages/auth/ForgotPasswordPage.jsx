/**
 * ForgotPasswordPage — e-comerce-ui
 * Solicitar recuperacion de contrasena (UC-AUTH-09 Fase 1).
 *
 * Tras T-019 de `revisar-arquitectura-de-mocks`, la pagina hace fetch
 * siempre. MSW intercepta `/api/v1/auth/password-reset/` en modo dev
 * (handler en `src/mocks/handlers/auth.ts`); en `AUTH_SOURCE=real` la
 * request sale al backend. El badge "Modo mock activo" se mantiene
 * solo como indicador visual.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.scss';

const API_URL = '/api/v1/auth/password-reset/';
const IS_MOCK_MODE = process.env.AUTH_SOURCE === 'mock';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Ingresa un email valido.'); return; }
    setIsLoading(true);
    setError('');

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setError('Error de red. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Revisa tu email</h1>
          <p className={styles.message}>
            Si <strong>{email}</strong> esta registrado, recibiras
            las instrucciones para recuperar tu contrasena.
          </p>
          <Link to="/auth/login" className={styles.backLink}>
            Volver al inicio de sesion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Recuperar contrasena</h1>
        <p className={styles.subtitle}>
          Ingresa tu email y te enviaremos un enlace para restablecer
          tu contrasena.
        </p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              aria-invalid={!!error}
            />
            {error && <span className={styles.error}>{error}</span>}
          </div>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <Link to="/auth/login" className={styles.backLink}>
          Volver al inicio de sesion
        </Link>
      </div>
    </div>
  );
}
