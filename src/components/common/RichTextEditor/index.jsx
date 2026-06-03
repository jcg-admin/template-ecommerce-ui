/**
 * RichTextEditor — ecommerce-ui (UC-ADM-RTE)
 * Editor de texto enriquecido nativo, sin dependencias externas.
 *
 * Un área `contentEditable` con role="textbox" y una toolbar de acciones
 * básicas (negrita, cursiva, lista con viñetas, enlace). Aplica los formatos
 * con `document.execCommand`, que es el mecanismo estándar para editores
 * simples y es suficiente para jsdom/demo. Al editar, emite `onChange` con el
 * `innerHTML` actual. Sincroniza el `value` entrante sin romper el cursor.
 *
 * API:
 *   <RichTextEditor
 *     value={htmlString}
 *     onChange={html => …}
 *     placeholder="…"
 *     ariaLabel="Descripción"
 *   />
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import styles from './RichTextEditor.module.scss';

const BoldIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M4 2h5a3 3 0 0 1 1.9 5.3A3 3 0 0 1 9.5 14H4V2zm2 2v3h3a1.5 1.5 0 0 0 0-3H6zm0 5v3h3.5a1.5 1.5 0 0 0 0-3H6z" />
  </svg>
);

const ItalicIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <line x1="10" y1="3" x2="14" y2="3" />
    <line x1="4" y1="13" x2="8" y2="13" />
    <line x1="11" y1="3" x2="6" y2="13" />
  </svg>
);

const ListIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="3" cy="4" r="1" fill="currentColor" stroke="none" />
    <circle cx="3" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
    <line x1="6" y1="4" x2="14" y2="4" />
    <line x1="6" y1="8" x2="14" y2="8" />
    <line x1="6" y1="12" x2="14" y2="12" />
  </svg>
);

const LinkIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <path d="M6.5 9.5l3-3" />
    <path d="M7 4l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1" />
    <path d="M9 12l-1 1a2.5 2.5 0 0 1-3.5-3.5l1-1" />
  </svg>
);

const TOOLS = [
  { command: 'bold', label: 'Negrita', icon: BoldIcon },
  { command: 'italic', label: 'Cursiva', icon: ItalicIcon },
  { command: 'insertUnorderedList', label: 'Lista con viñetas', icon: ListIcon },
  { command: 'createLink', label: 'Enlace', icon: LinkIcon },
];

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = '',
  ariaLabel = 'Editor de texto enriquecido',
}) {
  const editorRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Sincroniza el value entrante sin pisar la edición en curso (evita
  // resetear el cursor cuando el innerHTML ya coincide con el value).
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
    setIsEmpty(!value);
  }, [value]);

  const emitChange = useCallback(() => {
    const html = editorRef.current ? editorRef.current.innerHTML : '';
    setIsEmpty(!html);
    onChange?.(html);
  }, [onChange]);

  const exec = useCallback((command) => {
    editorRef.current?.focus();
    let argument;
    if (command === 'createLink') {
      const url = window.prompt('URL del enlace:');
      if (!url) return; // cancelado: no aplicamos formato
      argument = url;
    }
    document.execCommand(command, false, argument);
    emitChange();
  }, [emitChange]);

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formato de texto">
        {TOOLS.map(({ command, label, icon }) => (
          <button
            key={command}
            type="button"
            className={styles.toolButton}
            aria-label={label}
            title={label}
            // Evita perder la selección del área editable al hacer click.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(command)}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className={styles.surface}>
        <div
          ref={editorRef}
          className={styles.content}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          onInput={emitChange}
        />
        {isEmpty && placeholder && (
          <span className={styles.placeholder} aria-hidden="true">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}

export { RichTextEditor };
