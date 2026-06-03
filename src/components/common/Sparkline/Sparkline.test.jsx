/**
 * Tests: Sparkline — micro-gráfico SVG inline accesible nativo (sin deps).
 * Iniciativa: UC-REP-01 (mini-charts de reporte) / KPIs admin.
 */
import { render, screen } from '@testing-library/react';
import Sparkline from './index';

describe('Sparkline', () => {
  it('renderiza un <svg> con role="img"', () => {
    render(<Sparkline data={[1, 2, 3]} ariaLabel="Ventas" />);
    const svg = screen.getByRole('img');
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('expone el aria-label provisto', () => {
    render(<Sparkline data={[1, 2, 3]} ariaLabel="Ventas semanales" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Ventas semanales');
  });

  it('genera un aria-label por defecto que resume primer→último valor', () => {
    render(<Sparkline data={[3, 9, 7, 12]} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Tendencia de 3 a 12');
  });

  it('type="line" (default) produce un polyline', () => {
    const { container } = render(<Sparkline data={[1, 4, 2, 8]} />);
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
    // 4 puntos → 4 pares "x,y"
    expect(polyline.getAttribute('points').trim().split(/\s+/)).toHaveLength(4);
  });

  it('type="bar" produce N rects (uno por dato)', () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 4, 5]} type="bar" />);
    const rects = container.querySelectorAll('rect');
    expect(rects).toHaveLength(5);
  });

  it('type="area" produce un path de área más el polyline de borde', () => {
    const { container } = render(<Sparkline data={[2, 5, 3]} type="area" />);
    expect(container.querySelector('path')).toBeInTheDocument();
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });

  it('data vacío renderiza sin crashear (svg válido, sin geometría)', () => {
    const { container } = render(<Sparkline data={[]} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Gráfico sin datos');
    expect(container.querySelector('polyline')).not.toBeInTheDocument();
    expect(container.querySelector('rect')).not.toBeInTheDocument();
  });

  it('data undefined renderiza sin crashear', () => {
    render(<Sparkline />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('un solo punto se renderiza sin crashear (line)', () => {
    const { container } = render(<Sparkline data={[7]} />);
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
    expect(polyline.getAttribute('points').trim().split(/\s+/)).toHaveLength(1);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Valor 7');
  });

  it('un solo punto en modo bar produce un rect', () => {
    const { container } = render(<Sparkline data={[7]} type="bar" />);
    expect(container.querySelectorAll('rect')).toHaveLength(1);
  });

  it('respeta width y height en el viewBox y atributos', () => {
    render(<Sparkline data={[1, 2]} width={200} height={50} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('viewBox', '0 0 200 50');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '50');
  });

  it('filtra valores no finitos (NaN, Infinity, strings no numéricos) sin crashear', () => {
    const { container } = render(<Sparkline data={[1, NaN, Infinity, 'x', 4]} />);
    const polyline = container.querySelector('polyline');
    // Solo 1 y 4 sobreviven el filtro de Number.isFinite → 2 puntos
    expect(polyline.getAttribute('points').trim().split(/\s+/)).toHaveLength(2);
  });

  it('valores constantes (rango 0) no producen NaN en las coordenadas', () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} />);
    const points = container.querySelector('polyline').getAttribute('points');
    expect(points).not.toMatch(/NaN/);
  });
});
