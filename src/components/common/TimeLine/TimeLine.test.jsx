/**
 * Tests: TimeLine — línea de tiempo vertical de eventos (UC-ORD / UC-LOG).
 *
 * Nota: los CSS Modules están mockeados a {} en Jest (styleMock.js), por lo
 * que las clases SCSS no aparecen en el DOM. El estado se verifica vía el
 * atributo estable `data-status` y `aria-current`, que no dependen del mock.
 */
import { render, screen } from '@testing-library/react';
import TimeLine from './index';

const EVENTS = [
  { title: 'Pedido confirmado', date: '02 jun', description: 'Pago aprobado', status: 'done' },
  { title: 'En preparación',    date: '03 jun', description: 'Empacado y sellado', status: 'done' },
  { title: 'Enviado',           date: '04 jun', description: 'Con DHL', status: 'current' },
  { title: 'En reparto',        date: '05 jun', status: 'pending' },
  { title: 'Entregado',         status: 'pending' },
];

describe('TimeLine', () => {
  it('renderiza todos los títulos de los eventos', () => {
    render(<TimeLine events={EVENTS} />);
    EVENTS.forEach((e) => {
      expect(screen.getByText(e.title)).toBeInTheDocument();
    });
  });

  it('renderiza las fechas de los eventos que las tienen', () => {
    render(<TimeLine events={EVENTS} />);
    expect(screen.getByText('02 jun')).toBeInTheDocument();
    expect(screen.getByText('03 jun')).toBeInTheDocument();
    expect(screen.getByText('04 jun')).toBeInTheDocument();
    expect(screen.getByText('05 jun')).toBeInTheDocument();
  });

  it('renderiza las descripciones opcionales', () => {
    render(<TimeLine events={EVENTS} />);
    expect(screen.getByText('Pago aprobado')).toBeInTheDocument();
    expect(screen.getByText('Con DHL')).toBeInTheDocument();
  });

  it('aplica el estado done/current/pending vía data-status', () => {
    render(<TimeLine events={EVENTS} />);
    const done = screen.getByText('Pedido confirmado').closest('li');
    const current = screen.getByText('Enviado').closest('li');
    const pending = screen.getByText('Entregado').closest('li');

    expect(done).toHaveAttribute('data-status', 'done');
    expect(current).toHaveAttribute('data-status', 'current');
    expect(pending).toHaveAttribute('data-status', 'pending');
  });

  it('cae a status pending cuando no se especifica o es inválido', () => {
    render(<TimeLine events={[{ title: 'Sin estado' }, { title: 'Raro', status: 'xyz' }]} />);
    expect(screen.getByText('Sin estado').closest('li')).toHaveAttribute('data-status', 'pending');
    expect(screen.getByText('Raro').closest('li')).toHaveAttribute('data-status', 'pending');
  });

  it('marca el evento current con aria-current=step', () => {
    render(<TimeLine events={EVENTS} />);
    const current = screen.getByText('Enviado').closest('li');
    expect(current).toHaveAttribute('aria-current', 'step');
  });

  it('usa el ariaLabel por defecto en la lista', () => {
    render(<TimeLine events={EVENTS} />);
    expect(screen.getByRole('list', { name: 'Línea de tiempo' })).toBeInTheDocument();
  });

  it('acepta un ariaLabel personalizado', () => {
    render(<TimeLine events={EVENTS} ariaLabel="Seguimiento del envío" />);
    expect(screen.getByRole('list', { name: 'Seguimiento del envío' })).toBeInTheDocument();
  });

  it('renderiza el icono opcional del evento', () => {
    render(<TimeLine events={[{ title: 'Con icono', icon: <span data-testid="tl-icon">★</span> }]} />);
    expect(screen.getByTestId('tl-icon')).toBeInTheDocument();
  });

  it('renderiza con gracia cuando events está vacío (lista sin items)', () => {
    render(<TimeLine events={[]} />);
    const list = screen.getByRole('list', { name: 'Línea de tiempo' });
    expect(list).toBeInTheDocument();
    expect(list).toBeEmptyDOMElement();
  });

  it('renderiza con gracia sin pasar events (default [])', () => {
    render(<TimeLine />);
    expect(screen.getByRole('list')).toBeEmptyDOMElement();
  });
});
