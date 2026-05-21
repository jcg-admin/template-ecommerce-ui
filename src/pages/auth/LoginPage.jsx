/**
 * LoginPage — e-comerce-ui
 * Inicio de sesion JWT (UC-AUTH-02).
 *
 * Tras T-017 de `revisar-arquitectura-de-mocks` el componente despacha
 * siempre el thunk real `loginUser`. Cuando `AUTH_SOURCE=mock` (el
 * default) los handlers MSW de `/api/v1/auth/login/` interceptan a
 * nivel de red y devuelven el usuario mock; cuando `AUTH_SOURCE=real`
 * el handler se desactiva y la request sale al backend.
 *
 * El componente NO conoce el modo mock: el bagde "Modo mock activo"
 * solo lee la flag para mostrar la senal en UI, pero el flujo es
 * identico en ambos modos.
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '@redux/slices/authSlice';
import { selectAuthLoading, selectAuthError } from '@redux/selectors';
import styles from './LoginPage.module.scss';

const IS_MOCK_MODE = process.env.AUTH_SOURCE === 'mock';

export default function LoginPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const isLoading  = useSelector(selectAuthLoading);
  const authError  = useSelector(selectAuthError);

  const [fields, setFields]   = useState({ username: '', password: '' });
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!fields.username.trim()) e.username = 'El usuario es obligatorio.';
    if (!fields.password)        e.password = 'La contrasena es obligatoria.';
    return e;
  };

  const handleChange = (e) => {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) { setErrors(validation); return; }

    const result = await dispatch(loginUser(fields));
    if (loginUser.fulfilled.match(result)) navigate('/account');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar sesion</h1>
        <p className={styles.subtitle}>
          Bienvenido a e-comerce-ui
        </p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="username">Usuario o email</label>
            <input
              id="username" name="username" type="text"
              autoComplete="username"
              value={fields.username}
              onChange={handleChange}
              aria-invalid={!!errors.username}
            />
            {errors.username && <span className={styles.error}>{errors.username}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Contrasena</label>
            <input
              id="password" name="password" type="password"
              autoComplete="current-password"
              value={fields.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          {authError && (
            <p className={styles.globalError} role="alert">
              Usuario o contrasena incorrectos.
            </p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Iniciar sesion'}
          </button>
        </form>

        <p className={styles.links}>
          <Link to="/auth/forgot-password">Olvide mi contrasena</Link>
          {' \u00b7 '}
          <Link to="/auth/register">Crear cuenta</Link>
        </p>

        {IS_MOCK_MODE && (
          <p className={styles.mockBadge}>
            Modo mock activo (AUTH_SOURCE=mock)
          </p>
        )}
      </div>
    </div>
  );
}
