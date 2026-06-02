/**
 * Tests: ProgressBar — barra de progreso accesible nativa (sin deps).
 * Iniciativa: UC-CHT-FREESHIP.
 */
import { render, screen } from '@testing-library/react';
import ProgressBar from './index';

describe('ProgressBar', () => {
  it('expone role="progressbar" con los atributos aria', () => {
    render(<ProgressBar value={40} max={100} ariaLabel="Envío gratis" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-label', 'Envío gratis');
  });

  it('rellena la barra proporcionalmente (value/max)', () => {
    const { container } = render(<ProgressBar value={25} max={100} />);
    const fill = container.querySelector('[data-testid="progressbar-fill"]');
    expect(fill).toHaveStyle({ width: '25%' });
  });

  it('clampa value por encima de max al 100%', () => {
    const { container } = render(<ProgressBar value={150} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    const fill = container.querySelector('[data-testid="progressbar-fill"]');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('clampa value negativo a 0%', () => {
    const { container } = render(<ProgressBar value={-10} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    const fill = container.querySelector('[data-testid="progressbar-fill"]');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('con max=0 renderiza 0% de forma segura (sin división por cero)', () => {
    const { container } = render(<ProgressBar value={50} max={0} />);
    const fill = container.querySelector('[data-testid="progressbar-fill"]');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('value=0 renderiza 0%', () => {
    const { container } = render(<ProgressBar value={0} max={100} />);
    const fill = container.querySelector('[data-testid="progressbar-fill"]');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('muestra el label encima cuando se pasa', () => {
    render(<ProgressBar value={10} max={100} label="Progreso" />);
    expect(screen.getByText('Progreso')).toBeInTheDocument();
  });

  it('no muestra label si no se pasa', () => {
    render(<ProgressBar value={10} max={100} />);
    expect(screen.queryByText('Progreso')).not.toBeInTheDocument();
  });

  it('showValue muestra el porcentaje', () => {
    render(<ProgressBar value={30} max={100} showValue />);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('showValue redondea el porcentaje', () => {
    render(<ProgressBar value={1} max={3} showValue />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('sin showValue no muestra el porcentaje', () => {
    render(<ProgressBar value={30} max={100} />);
    expect(screen.queryByText('30%')).not.toBeInTheDocument();
  });

  it('max por defecto es 100', () => {
    render(<ProgressBar value={50} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });
});
