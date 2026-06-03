import { useState } from 'react';
import styles from './ChatWidget.module.scss';

function ChatWidget({
  messages = [],
  onSend,
  title = 'Soporte',
  placeholder = 'Escribe un mensaje…',
}) {
  const [text, setText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    if (typeof onSend === 'function') onSend(value);
    setText('');
  };

  return (
    <section className={styles.widget}>
      <header className={styles.header}>{title}</header>

      <div className={styles.thread} role="log" aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            data-from={message.from}
            className={`${styles.bubble} ${
              message.from === 'user' ? styles.bubbleUser : styles.bubbleAgent
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder || 'Escribe un mensaje'}
        />
        <button type="submit" className={styles.send}>
          Enviar
        </button>
      </form>
    </section>
  );
}

export default ChatWidget;
