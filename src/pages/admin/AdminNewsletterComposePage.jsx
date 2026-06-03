/**
 * AdminNewsletterComposePage — ecommerce-ui
 * UC-NEW-04: el admin compone y envia (o programa) una campana.
 */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendNewsletterBroadcast,
  clearNewsletterActionState,
} from '@redux/slices/newsletterSlice';
import styles from './AdminNewsletterComposePage.module.scss';

// El backend (CampaignCreateSerializer.audience_filter) acepta uno de los
// SubscriberStatus: PENDING | CONFIRMED | UNSUBSCRIBED (default CONFIRMED).
const AUDIENCES = [
  { value: 'CONFIRMED',    label: 'Suscriptores confirmados' },
  { value: 'PENDING',      label: 'Pendientes de confirmar' },
  { value: 'UNSUBSCRIBED', label: 'Dados de baja' },
];

const INITIAL = {
  subject:        '',
  body:           '',
  audienceFilter: 'CONFIRMED',
};

function validate(form) {
  const errors = {};
  if (!form.subject.trim()) errors.subject = 'El asunto es obligatorio.';
  if (!form.body.trim())    errors.body    = 'El contenido es obligatorio.';
  return errors;
}

export default function AdminNewsletterComposePage() {
  const dispatch = useDispatch();
  const { isActioning, actionError, lastAction, lastCampaign } =
    useSelector((s) => s.newsletter);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const setField = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    dispatch(clearNewsletterActionState());
    dispatch(sendNewsletterBroadcast({
      subject:        form.subject.trim(),
      body:           form.body,
      audienceFilter: form.audienceFilter,
    }));
  };

  return (
    <section className={styles.page} aria-labelledby="compose-title">
      <header className={styles.header}>
        <h1 id="compose-title" className={styles.title}>Nueva campana</h1>
        <p className={styles.description}>
          Envia un boletin al segmento de suscriptores seleccionado.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="campaign-subject">Asunto</label>
          <input
            id="campaign-subject"
            type="text"
            value={form.subject}
            onChange={setField('subject')}
            aria-invalid={Boolean(errors.subject)}
          />
          {errors.subject && <span className={styles.fieldError}>{errors.subject}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="campaign-audience">Audiencia</label>
          <select
            id="campaign-audience"
            value={form.audienceFilter}
            onChange={setField('audienceFilter')}
          >
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="campaign-body">Contenido</label>
          <textarea
            id="campaign-body"
            rows={8}
            value={form.body}
            onChange={setField('body')}
            aria-invalid={Boolean(errors.body)}
          />
          {errors.body && <span className={styles.fieldError}>{errors.body}</span>}
        </div>

        {actionError && (
          <p role="alert" className={styles.error}>
            {actionError.message || 'No se pudo enviar la campana.'}
          </p>
        )}

        {lastAction === 'broadcast_sent' && (
          <p role="status" className={styles.success}>
            Campana encolada
            {lastCampaign?.recipients_count
              ? ` para ${lastCampaign.recipients_count} destinatarios.`
              : '.'}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={isActioning}
          >
            {isActioning ? 'Enviando…' : 'Enviar campana'}
          </button>
        </div>
      </form>
    </section>
  );
}
