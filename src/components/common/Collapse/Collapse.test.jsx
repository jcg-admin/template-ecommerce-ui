import { render, screen, fireEvent } from '@testing-library/react';
import { Collapse, Accordion } from './Collapse';

describe('Collapse', () => {
  it('renderiza el summary y los children', () => {
    render(<Collapse summary="Título"><p>Contenido</p></Collapse>);
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('details está cerrado por defecto', () => {
    render(<Collapse summary="Título"><p>x</p></Collapse>);
    expect(screen.getByRole('group')).not.toHaveAttribute('open');
  });

  it('click en summary abre el details', () => {
    render(<Collapse summary="Click me"><p>Oculto</p></Collapse>);
    fireEvent.click(screen.getByText('Click me'));
    expect(screen.getByRole('group')).toHaveAttribute('open');
  });

  it('llama onToggle al disparar el evento toggle del details', () => {
    // Nota BUG-JSDOM-01: jsdom no dispara toggle automaticamente al hacer click.
    // Disparamos el evento manualmente para testear el handler.
    const onToggle = jest.fn();
    render(<Collapse summary="T" onToggle={onToggle}><p>x</p></Collapse>);
    const details = document.querySelector('details');
    fireEvent(details, new Event('toggle'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('controlado: open=true muestra el details abierto', () => {
    render(<Collapse summary="T" open={true}><p>Visible</p></Collapse>);
    expect(screen.getByRole('group')).toHaveAttribute('open');
  });
});

describe('Accordion', () => {
  it('renderiza todos los items', () => {
    const items = [
      { summary: '¿Pregunta 1?', content: 'Respuesta 1' },
      { summary: '¿Pregunta 2?', content: 'Respuesta 2' },
    ];
    render(<Accordion items={items} />);
    expect(screen.getByText('¿Pregunta 1?')).toBeInTheDocument();
    expect(screen.getByText('¿Pregunta 2?')).toBeInTheDocument();
  });

  it('todos los details tienen el mismo name (exclusividad nativa)', () => {
    const items = [
      { summary: 'A', content: 'a' },
      { summary: 'B', content: 'b' },
    ];
    render(<Accordion items={items} />);
    const details = document.querySelectorAll('details');
    expect(details[0].getAttribute('name')).toBe(details[1].getAttribute('name'));
  });
});
