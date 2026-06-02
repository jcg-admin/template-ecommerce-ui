/**
 * Tests: ChatWidget — hilo de mensajes + envío (UC-SUP-CHAT)
 * Componente nativo sin dependencias.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ChatWidget from './index';

const messages = [
  { id: 'm1', from: 'agent', text: 'Hola, ¿en qué puedo ayudarte?' },
  { id: 'm2', from: 'user', text: 'Tengo una duda con mi pedido' },
];

describe('ChatWidget', () => {
  it('renderiza el hilo como log accesible con aria-live', () => {
    render(<ChatWidget messages={messages} onSend={() => {}} />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('renderiza cada mensaje con estilo distinto según from', () => {
    // Las clases de CSS Modules están mockeadas en Jest, así que se verifica
    // el origen (que gobierna el estilo de la burbuja) vía data-from.
    render(<ChatWidget messages={messages} onSend={() => {}} />);
    const agent = screen.getByText('Hola, ¿en qué puedo ayudarte?');
    const user = screen.getByText('Tengo una duda con mi pedido');
    expect(agent).toHaveAttribute('data-from', 'agent');
    expect(user).toHaveAttribute('data-from', 'user');
    expect(agent.getAttribute('data-from')).not.toBe(user.getAttribute('data-from'));
  });

  it('renderiza el título y el placeholder del input', () => {
    render(
      <ChatWidget
        messages={messages}
        onSend={() => {}}
        title="Soporte"
        placeholder="Escribe un mensaje…"
      />,
    );
    expect(screen.getByText('Soporte')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe un mensaje…')).toBeInTheDocument();
  });

  it('el input tiene aria-label accesible', () => {
    render(<ChatWidget messages={messages} onSend={() => {}} title="Soporte" />);
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  });

  it('al enviar (submit) con texto llama onSend y limpia el input', () => {
    const onSend = jest.fn();
    render(<ChatWidget messages={messages} onSend={onSend} />);
    const input = screen.getByLabelText(/mensaje/i);
    fireEvent.change(input, { target: { value: 'Hola soporte' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('Hola soporte');
    expect(input).toHaveValue('');
  });

  it('al hacer submit del form también llama onSend', () => {
    const onSend = jest.fn();
    const { container } = render(<ChatWidget messages={messages} onSend={onSend} />);
    const input = screen.getByLabelText(/mensaje/i);
    fireEvent.change(input, { target: { value: 'Otra consulta' } });
    fireEvent.submit(container.querySelector('form'));
    expect(onSend).toHaveBeenCalledWith('Otra consulta');
    expect(input).toHaveValue('');
  });

  it('no envía cuando el texto está vacío o son solo espacios', () => {
    const onSend = jest.fn();
    render(<ChatWidget messages={messages} onSend={onSend} />);
    const button = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();

    const input = screen.getByLabelText(/mensaje/i);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('renderiza de forma segura con messages vacío', () => {
    expect(() =>
      render(<ChatWidget messages={[]} onSend={() => {}} />),
    ).not.toThrow();
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('el botón de envío es de tipo submit', () => {
    render(<ChatWidget messages={[]} onSend={() => {}} />);
    expect(screen.getByRole('button', { name: /enviar/i })).toHaveAttribute('type', 'submit');
  });
});
