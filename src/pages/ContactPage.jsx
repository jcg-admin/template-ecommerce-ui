/**
 * ContactPage — ecommerce-ui
 * UC-COM-01: formulario publico de contacto.
 */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendContactMessage,
  clearContactActionState,
} from '@redux/slices/contactSlice';
import ChatWidget from '@components/common/ChatWidget';
import { usePublicSettings } from '@hooks/domain/usePublicSettings';
import styles from './ContactPage.module.scss';

const INITIAL_CHAT = [
  { id: 'chat-welcome', from: 'agent', text: 'Hola, ¿en qué podemos ayudarte?' },
];

const INITIAL = { name: '', email: '', subject: '', message: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim())    errors.name    = 'El nombre es obligatorio.';
  if (!form.email.trim())   errors.email   = 'El email es obligatorio.';
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
    errors.email = 'El email no tiene un formato valido.';
  if (!form.subject.trim()) errors.subject = 'El asunto es obligatorio.';
  if (!form.message.trim()) errors.message = 'El mensaje es obligatorio.';
  return errors;
}

export default function ContactPage() {
  const dispatch = useDispatch();
  const { isActioning, actionError, lastAction } =
    useSelector((s) => s.contact);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);

  // Chat de soporte (UC-SUP-CHAT): sin backend de chat, el hilo se mantiene
  // con estado local. Al enviar se añade el mensaje del usuario y una
  // autorespuesta simulada del agente.
  const handleChatSend = (text) => {
    const userMessage = { id: `u-${Date.now()}`, from: 'user', text };
    const agentReply = {
      id: `a-${Date.now()}`,
      from: 'agent',
      text: 'Gracias, te responderemos pronto.',
    };
    setChatMessages((prev) => [...prev, userMessage, agentReply]);
  };

  const chatSection = (
    <section className={styles.chat} aria-labelledby="contact-chat-title">
      <h2 id="contact-chat-title" className={styles.chatTitle}>
        Chat de soporte
      </h2>
      <ChatWidget
        messages={chatMessages}
        onSend={handleChatSend}
        title="Soporte"
        placeholder="Escribe un mensaje…"
      />
    </section>
  );

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
    dispatch(clearContactActionState());
    dispatch(sendContactMessage({
      name:    form.name.trim(),
      email:   form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    }));
  };

  const handleReset = () => {
    setForm(INITIAL);
    setErrors({});
    dispatch(clearContactActionState());
  };

  if (lastAction === 'sent') {
    return (
      <section className={styles.page} aria-labelledby="contact-success-title">
        <h1 id="contact-success-title" className={styles.title}>
          Mensaje recibido
        </h1>
        <p className={styles.successMessage}>
          Gracias por escribirnos. Te responderemos en un plazo aproximado de
          24 a 48 horas habiles.
        </p>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={handleReset}
        >
          Enviar otro mensaje
        </button>
        {chatSection}
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="contact-title">
      <header className={styles.header}>
        <h1 id="contact-title" className={styles.title}>Contacto</h1>
        <p className={styles.description}>
          Escribenos y nuestro equipo te respondera lo antes posible.
        </p>
      </header>

      <ContactInfo />

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="contact-name">Nombre</label>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={setField('name')}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-subject">Asunto</label>
          <input
            id="contact-subject"
            type="text"
            value={form.subject}
            onChange={setField('subject')}
            aria-invalid={Boolean(errors.subject)}
          />
          {errors.subject && <span className={styles.fieldError}>{errors.subject}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-message">Mensaje</label>
          <textarea
            id="contact-message"
            rows={6}
            value={form.message}
            onChange={setField('message')}
            aria-invalid={Boolean(errors.message)}
          />
          {errors.message && <span className={styles.fieldError}>{errors.message}</span>}
        </div>

        {actionError && (
          <p role="alert" className={styles.error}>
            {actionError.message || 'No se pudo enviar el mensaje. Intenta de nuevo.'}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={isActioning}
          >
            {isActioning ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </div>
      </form>

      {chatSection}
    </section>
  );
}

// UC-CFG-05 — datos de contacto del negocio, visibles de inmediato (POST-02).
function ContactInfo() {
  const settings = usePublicSettings({});
  const social = settings.social_links || {};
  const socialEntries = Object.entries(social).filter(([, url]) => url);
  if (!settings.support_email && !settings.phone && !settings.address) return null;

  return (
    <aside className={styles.contactInfo} aria-label="Datos de contacto">
      {settings.support_email && (
        <p>Email: <a href={`mailto:${settings.support_email}`}>{settings.support_email}</a></p>
      )}
      {settings.phone && <p>Teléfono: {settings.phone}</p>}
      {settings.address && <p>Dirección: {settings.address}</p>}
      {socialEntries.length > 0 && (
        <p>
          {socialEntries.map(([platform, url]) => (
            <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={{ marginRight: 12 }}>
              {platform}
            </a>
          ))}
        </p>
      )}
    </aside>
  );
}
