/**
 * Tests: Gauge — medidor radial SVG accesible nativo (sin deps).
 * Iniciativa: UC-ADM-GAUGE.
 */
import { render, screen } from '@testing-library/react';
import Gauge from './index';

describe('Gauge', () => {
  it('expone role="meter" con los atributos aria', () => {
    render(<Gauge value={40} min={0} max={100} label="Stock" ariaLabel="Nivel de stock" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '40');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('aria-label', 'Nivel de stock');
  });

  it('muestra el valor numérico en el centro y el label debajo', () => {
    render(<Gauge value={73} min={0} max={100} label="Stock" ariaLabel="Stock" />);
    expect(screen.getByText('73')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
  });

  it('muestra la unidad junto al valor cuando se pasa unit', () => {
    render(<Gauge value={50} min={0} max={100} label="Stock" unit="%" ariaLabel="Stock" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('rellena el arco proporcionalmente a (value-min)/(max-min)', () => {
    const { container } = render(<Gauge value={25} min={0} max={100} label="Stock" ariaLabel="Stock" />);
    const arc = container.querySelector('[data-testid="gauge-arc"]');
    // 25% de relleno
    expect(arc).toHaveStyle({ strokeDashoffset: '75' });
  });

  it('respeta min distinto de 0 en la proporción del arco', () => {
    const { container } = render(<Gauge value={75} min={50} max={100} label="Stock" ariaLabel="Stock" />);
    const arc = container.querySelector('[data-testid="gauge-arc"]');
    // (75-50)/(100-50) = 50%
    expect(arc).toHaveStyle({ strokeDashoffset: '50' });
  });

  it('clampa value por encima de max al 100%', () => {
    const { container } = render(<Gauge value={150} min={0} max={100} label="Stock" ariaLabel="Stock" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');
    const arc = container.querySelector('[data-testid="gauge-arc"]');
    expect(arc).toHaveStyle({ strokeDashoffset: '0' });
  });

  it('clampa value por debajo de min al 0%', () => {
    const { container } = render(<Gauge value={-10} min={0} max={100} label="Stock" ariaLabel="Stock" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    const arc = container.querySelector('[data-testid="gauge-arc"]');
    expect(arc).toHaveStyle({ strokeDashoffset: '100' });
  });

  it('con max==min renderiza 0% de forma segura (sin división por cero)', () => {
    const { container } = render(<Gauge value={50} min={50} max={50} label="Stock" ariaLabel="Stock" />);
    const arc = container.querySelector('[data-testid="gauge-arc"]');
    expect(arc).toHaveStyle({ strokeDashoffset: '100' });
  });
});
