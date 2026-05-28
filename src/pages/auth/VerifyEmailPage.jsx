/**
 * VerifyEmailPage — Práctica Yorùbà
 * Recibe ?uid=&token= del enlace del correo, o ?email= para mostrar
 * "revisa tu correo" tras un registro recién hecho.
 *
 * Endpoints:
 *   POST /auth/verify-email/         { uid, token }
 *   POST /auth/resend-verification/  { email }
 */

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail, resendVerification } from '@redux/slices/authSlice';
import { Button, Field, MetaTag } from '@components/common/primitives';
import OTPInput from '@components/auth/OTPInput/OTPInput';
import logoUrl from '@assets/practica-yoruba-logo.png';
import styles from '../auth/AuthSimplePage.module.scss';

const STATE = {
  CHECK_INBOX: 'check_inbox',
  LOADING: 'loading',
  SUCCESS: 'success',
  EXPIRED: 'expired',
  ALREADY: 'already_verified',
  OTP_ENTRY: 'otp_entry',
  INVALID: 'invalid_token',
};

export default function VerifyEmailPage() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const uid   = params.get('uid');
  const token = params.get('token');
  const initialEmail = params.get('email') || '';

  const [state, setState] = useState(uid && token ? STATE.LOADING : STATE.CHECK_INBOX);
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!uid || !token) return;
    (async () => {
      try {
        await dispatch(verifyEmail({ uid, token })).unwrap();
        setState(STATE.SUCCESS);
      } catch (err) {
        const code = err?.code || err?.detail;
        if (code === 'token_expired') setState(STATE.EXPIRED);
        else if (code === 'already_verified') setState(STATE.ALREADY);
        else setState(STATE.INVALID);
      }
    })();
  }, [dispatch, uid, token]);

  const handleResend = async (e) => {
    e?.preventDefault();
    if (!email) return;
    try {
      await dispatch(resendVerification({ email })).unwrap();
      setResent(true);
    } catch {
      setResent(true); // anti-enumeración: comportarse igual
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <img src={logoUrl} alt="" className={styles.brandLogo} />
          <div>
            <div className={styles.brandName}>Práctica Yorùbà</div>
            <div className={styles.brandTag}>Ifá · Òrìsà · Olódùmarè</div>
          </div>
        </Link>

        {state === STATE.LOADING && (
          <>
            <div className={styles.envelope} style={{ borderColor: 'var(--c-bronze)' }}>↻</div>
            <MetaTag tone="bronze">Verificando</MetaTag>
            <h1 className={styles.title}>Estamos activando tu cuenta…</h1>
            <p className={styles.lead}>Esto toma un par de segundos.</p>
          </>
        )}

        {state === STATE.SUCCESS && (
          <>
            <div className={styles.envelope} style={{ color: 'var(--c-lime-soft)' }}>✓</div>
            <MetaTag tone="lime">Cuenta activa</MetaTag>
            <h1 className={styles.title}>¡Bienvenido!</h1>
            <p className={styles.lead}>
              Tu cuenta quedó verificada. Ya puedes iniciar sesión y comenzar a explorar el catálogo.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link to="/auth/login"><Button variant="primary" size="lg">Iniciar sesión</Button></Link>
            </div>
          </>
        )}

        {state === STATE.ALREADY && (
          <>
            <div className={styles.envelope}>✓</div>
            <MetaTag tone="bronze">Ya estaba verificada</MetaTag>
            <h1 className={styles.title}>Tu cuenta ya está activa</h1>
            <p className={styles.lead}>Este enlace ya se había usado antes. Inicia sesión normalmente.</p>
            <div style={{ marginTop: 32 }}>
              <Link to="/auth/login"><Button variant="primary">Iniciar sesión</Button></Link>
            </div>
          </>
        )}

        {(state === STATE.EXPIRED || state === STATE.INVALID) && (
          <>
            <div className={styles.envelope} style={{ borderColor: 'var(--c-vino)', color: 'var(--c-vino-soft)' }}>!</div>
            <MetaTag tone="vino">
              {state === STATE.EXPIRED ? 'Enlace caducado' : 'Enlace inválido'}
            </MetaTag>
            <h1 className={styles.title}>
              {state === STATE.EXPIRED ? 'Este enlace expiró' : 'No pudimos validar el enlace'}
            </h1>
            <p className={styles.lead}>
              {state === STATE.EXPIRED
                ? 'Los enlaces son válidos por 24 horas. Solicita uno nuevo escribiendo tu correo.'
                : 'El enlace puede estar roto o ya usado. Solicita uno nuevo abajo.'}
            </p>
            <ResendForm email={email} setEmail={setEmail} onSubmit={handleResend} sent={resent} />
          </>
        )}

        {state === STATE.CHECK_INBOX && (
          <>
            <div className={styles.envelope}>✉</div>
            <MetaTag tone="bronze">Casi listo</MetaTag>
            <h1 className={styles.title}>Revisa tu correo</h1>
            <p className={styles.lead}>
              Te enviamos un enlace a {email ? <strong>{email}</strong> : 'tu correo'} para verificar tu cuenta.
              El enlace es válido por <strong>24 horas</strong> y solo se puede usar una vez.
            </p>
            <div className={styles.note}>
              ¿No lo ves? Revisa tu bandeja de spam. Si sigue sin aparecer, podemos reenviarlo.
            </div>
            <ResendForm email={email} setEmail={setEmail} onSubmit={handleResend} sent={resent} />
          </>
        )}

        <div className={styles.footer}>
          ¿Ya tienes cuenta activa? <Link to="/auth/login">Iniciar sesión →</Link>
        </div>
      </div>
    </main>
  );
}

function ResendForm({ email, setEmail, onSubmit, sent }) {
  if (sent) {
    return (
      <div className={styles.note} style={{ marginTop: 24 }}>
        Si la dirección está registrada, te enviamos un correo nuevo. Revisa tu bandeja.
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} style={{ marginTop: 24, textAlign: 'left' }}>
      <Field
        label="Tu correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div style={{ marginTop: 16 }}>
        <Button type="submit" variant="primary" block disabled={!email}>
          Reenviar enlace
        </Button>
      </div>
    </form>
  );
}
