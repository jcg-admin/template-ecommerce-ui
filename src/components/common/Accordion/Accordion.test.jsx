/**
 * Tests: Accordion — UC-CAT-FAQ
 * Paneles colapsables nativos, sin dependencias externas.
 *
 * Cabecera = <button aria-expanded> que togglea el panel.
 * Panel = role="region" con aria-labelledby apuntando al botón.
 * allowMultiple=false (default): abrir uno cierra los demás.
 * Teclado: Enter / Espacio activan el botón (comportamiento nativo).
 * Render seguro con items=[].
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Accordion from './index';

const items = [
  { id: 'shipping', title: 'Envíos', content: 'Enviamos en 24h' },
  { id: 'returns', title: 'Devoluciones', content: <p>30 días</p> },
  { id: 'payment', title: 'Pagos', content: 'Tarjeta y PayPal' },
];

describe('Accordion — UC-CAT-FAQ', () => {
  it('renderiza una cabecera-botón por cada item', () => {
    render(<Accordion items={items} ariaLabel="Preguntas frecuentes" />);
    expect(screen.getByRole('button', { name: 'Envíos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Devoluciones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pagos' })).toBeInTheDocument();
  });

  it('expone el grupo con el ariaLabel', () => {
    render(<Accordion items={items} ariaLabel="Preguntas frecuentes" />);
    expect(screen.getByLabelText('Preguntas frecuentes')).toBeInTheDocument();
  });

  it('todos los paneles cerrados por defecto (aria-expanded=false)', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
    expect(screen.queryByText('Enviamos en 24h')).not.toBeInTheDocument();
  });

  it('abre el panel al hacer click en su cabecera', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    const btn = screen.getByRole('button', { name: 'Envíos' });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Enviamos en 24h')).toBeInTheDocument();
  });

  it('cierra el panel al hacer click de nuevo (toggle)', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    const btn = screen.getByRole('button', { name: 'Envíos' });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Enviamos en 24h')).not.toBeInTheDocument();
  });

  it('el panel abierto tiene role="region" y aria-labelledby = id del botón', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    const btn = screen.getByRole('button', { name: 'Envíos' });
    fireEvent.click(btn);
    const region = screen.getByRole('region', { name: 'Envíos' });
    expect(region).toBeInTheDocument();
    expect(region.getAttribute('aria-labelledby')).toBe(btn.id);
    expect(btn.id).toBeTruthy();
  });

  it('renderiza content como nodo React', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    fireEvent.click(screen.getByRole('button', { name: 'Devoluciones' }));
    expect(screen.getByText('30 días')).toBeInTheDocument();
  });

  it('allowMultiple=false: abrir uno cierra los demás (acordeón clásico)', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    const a = screen.getByRole('button', { name: 'Envíos' });
    const b = screen.getByRole('button', { name: 'Pagos' });
    fireEvent.click(a);
    expect(a).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(b);
    expect(b).toHaveAttribute('aria-expanded', 'true');
    expect(a).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Enviamos en 24h')).not.toBeInTheDocument();
  });

  it('allowMultiple=true: permite varios paneles abiertos a la vez', () => {
    render(<Accordion items={items} ariaLabel="FAQ" allowMultiple />);
    const a = screen.getByRole('button', { name: 'Envíos' });
    const b = screen.getByRole('button', { name: 'Pagos' });
    fireEvent.click(a);
    fireEvent.click(b);
    expect(a).toHaveAttribute('aria-expanded', 'true');
    expect(b).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Enviamos en 24h')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta y PayPal')).toBeInTheDocument();
  });

  it('defaultOpenIds abre los paneles indicados al montar', () => {
    render(
      <Accordion
        items={items}
        ariaLabel="FAQ"
        allowMultiple
        defaultOpenIds={['shipping', 'payment']}
      />,
    );
    expect(screen.getByRole('button', { name: 'Envíos' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Pagos' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Devoluciones' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('defaultOpenIds con allowMultiple=false respeta solo el primero', () => {
    render(
      <Accordion
        items={items}
        ariaLabel="FAQ"
        defaultOpenIds={['shipping', 'payment']}
      />,
    );
    const open = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-expanded') === 'true',
    );
    expect(open).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Envíos' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('teclado: Enter sobre la cabecera abre el panel', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    const btn = screen.getByRole('button', { name: 'Envíos' });
    btn.focus();
    fireEvent.keyDown(btn, { key: 'Enter' });
    fireEvent.click(btn); // Enter dispara click nativo en un <button>
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('teclado: Espacio sobre la cabecera abre el panel', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    const btn = screen.getByRole('button', { name: 'Pagos' });
    btn.focus();
    fireEvent.keyDown(btn, { key: ' ' });
    fireEvent.click(btn); // Espacio dispara click nativo en un <button>
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('cada cabecera es un <button type="button">', () => {
    render(<Accordion items={items} ariaLabel="FAQ" />);
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toHaveAttribute('type', 'button');
    });
  });

  it('render seguro con items=[]', () => {
    const { container } = render(<Accordion items={[]} ariaLabel="FAQ" />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('render seguro sin prop items', () => {
    expect(() => render(<Accordion ariaLabel="FAQ" />)).not.toThrow();
  });
});
