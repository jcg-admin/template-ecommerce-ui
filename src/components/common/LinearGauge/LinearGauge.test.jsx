/**
 * Tests: LinearGauge — medidor lineal horizontal accesible nativo (sin deps).
 * Inspirado en kno-react-gauges LinearGauge. Mapea a UC-INV-01 / KPIs admin.
 */
import { render, screen } from '@testing-library/react';
import LinearGauge from './index';

describe('LinearGauge', () => {
  it('expone role="meter" con los atributos aria', () => {
    render(<LinearGauge value={40} min={0} max={100} ariaLabel="Nivel de stock" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '40');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('aria-label', 'Nivel de stock');
  });

  it('rellena la barra proporcionalmente a (value-min)/(max-min)', () => {
    render(<LinearGauge value={25} min={0} max={100} ariaLabel="Stock" />);
    const fill = screen.getByTestId('lineargauge-fill');
    expect(fill).toHaveStyle({ width: '25%' });
  });

  it('respeta min distinto de 0 en la proporción de la barra', () => {
    render(<LinearGauge value={75} min={50} max={100} ariaLabel="Stock" />);
    // (75-50)/(100-50) = 50%
    const fill = screen.getByTestId('lineargauge-fill');
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('clampa value por encima de max al 100%', () => {
    render(<LinearGauge value={150} min={0} max={100} ariaLabel="Stock" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByTestId('lineargauge-fill')).toHaveStyle({ width: '100%' });
  });

  it('clampa value por debajo de min al 0%', () => {
    render(<LinearGauge value={-10} min={0} max={100} ariaLabel="Stock" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByTestId('lineargauge-fill')).toHaveStyle({ width: '0%' });
  });

  it('con max==min renderiza 0% de forma segura (sin división por cero)', () => {
    render(<LinearGauge value={50} min={50} max={50} ariaLabel="Stock" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByTestId('lineargauge-fill')).toHaveStyle({ width: '0%' });
  });

  it('muestra el valor numérico cuando showValue es true', () => {
    render(<LinearGauge value={73} min={0} max={100} showValue ariaLabel="Stock" />);
    expect(screen.getByTestId('lineargauge-value')).toHaveTextContent('73');
  });

  it('no muestra el valor numérico cuando showValue es false', () => {
    render(<LinearGauge value={73} min={0} max={100} ariaLabel="Stock" />);
    expect(screen.queryByTestId('lineargauge-value')).not.toBeInTheDocument();
  });

  it('muestra el label cuando se pasa', () => {
    render(<LinearGauge value={30} min={0} max={100} label="Stock" ariaLabel="Stock" />);
    expect(screen.getByText('Stock')).toBeInTheDocument();
  });

  it('aplica el tono del umbral activo al relleno', () => {
    // value 90 supera el corte success(80), cae en el corte error(100).
    render(
      <LinearGauge
        value={90}
        min={0}
        max={100}
        thresholds={[
          { value: 80, tone: 'success' },
          { value: 100, tone: 'error' },
        ]}
        ariaLabel="Stock"
      />,
    );
    const fill = screen.getByTestId('lineargauge-fill');
    expect(fill).toHaveAttribute('data-tone', 'error');
  });

  it('usa el tono del primer umbral que cubre al valor actual', () => {
    // value 50 cae dentro del primer corte success(80).
    render(
      <LinearGauge
        value={50}
        min={0}
        max={100}
        thresholds={[
          { value: 80, tone: 'success' },
          { value: 100, tone: 'error' },
        ]}
        ariaLabel="Stock"
      />,
    );
    const fill = screen.getByTestId('lineargauge-fill');
    expect(fill).toHaveAttribute('data-tone', 'success');
  });

  it('renderiza zonas de umbral sobre el track', () => {
    render(
      <LinearGauge
        value={50}
        min={0}
        max={100}
        thresholds={[
          { value: 40, tone: 'warning' },
          { value: 100, tone: 'success' },
        ]}
        ariaLabel="Stock"
      />,
    );
    const zones = screen.getAllByTestId('lineargauge-zone');
    expect(zones.length).toBeGreaterThan(0);
    // Primera zona arranca en 0% y cubre hasta el corte 40%.
    expect(zones[0]).toHaveStyle({ left: '0%', width: '40%' });
  });

  it('sin thresholds usa el tono primary por defecto', () => {
    render(<LinearGauge value={50} min={0} max={100} ariaLabel="Stock" />);
    const fill = screen.getByTestId('lineargauge-fill');
    expect(fill).toHaveAttribute('data-tone', 'primary');
    expect(screen.queryByTestId('lineargauge-zone')).not.toBeInTheDocument();
  });
});
