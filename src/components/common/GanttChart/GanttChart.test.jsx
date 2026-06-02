/**
 * Tests: GanttChart — componente nativo de linea de tiempo de tareas.
 */
import { render, screen } from '@testing-library/react';
import GanttChart from './index';

const tasks = [
  { id: 'a', name: 'Recepción', start: '2026-01-01', end: '2026-01-05' },
  { id: 'b', name: 'Empaque', start: '2026-01-06', end: '2026-01-10', progress: 50 },
  { id: 'c', name: 'Envío', start: '2026-01-20', end: '2026-01-25' },
];

// Extrae el porcentaje numerico de un style.left/style.width tipo "12.5%".
const pct = (value) => parseFloat(value);

describe('GanttChart', () => {
  it('renderiza una barra por tarea con su nombre', () => {
    render(<GanttChart tasks={tasks} />);
    expect(screen.getByText('Recepción')).toBeInTheDocument();
    expect(screen.getByText('Empaque')).toBeInTheDocument();
    expect(screen.getByText('Envío')).toBeInTheDocument();
  });

  it('cada barra expone un aria-label con la tarea y fechas', () => {
    render(<GanttChart tasks={tasks} />);
    const bar = screen.getByRole('img', { name: /Recepción/i });
    expect(bar).toBeInTheDocument();
    expect(bar.getAttribute('aria-label')).toMatch(/al/i);
  });

  it('el aria-label incluye el progreso cuando viene definido', () => {
    render(<GanttChart tasks={tasks} />);
    const bar = screen.getByRole('img', { name: /Empaque/i });
    expect(bar.getAttribute('aria-label')).toMatch(/50% completado/);
  });

  it('una tarea más tardía tiene mayor left que una más temprana', () => {
    render(<GanttChart tasks={tasks} />);
    const early = screen.getByRole('img', { name: /Recepción/i });
    const late = screen.getByRole('img', { name: /Envío/i });
    expect(pct(late.style.left)).toBeGreaterThan(pct(early.style.left));
  });

  it('las barras tienen estilo de width', () => {
    render(<GanttChart tasks={tasks} />);
    const bar = screen.getByRole('img', { name: /Recepción/i });
    expect(bar.style.width).toMatch(/%$/);
    expect(pct(bar.style.width)).toBeGreaterThan(0);
  });

  it('pinta el relleno de progreso dentro de la barra', () => {
    const { container } = render(<GanttChart tasks={tasks} />);
    const bar = screen.getByRole('img', { name: /Empaque/i });
    const progress = bar.querySelector('span');
    expect(progress).not.toBeNull();
    expect(progress.style.width).toBe('50%');
  });

  it('respeta rangeStart/rangeEnd cuando se pasan', () => {
    render(
      <GanttChart
        tasks={[{ id: 'x', name: 'Mitad', start: '2026-01-15', end: '2026-01-16' }]}
        rangeStart="2026-01-01"
        rangeEnd="2026-01-31"
      />,
    );
    const bar = screen.getByRole('img', { name: /Mitad/i });
    const left = pct(bar.style.left);
    expect(left).toBeGreaterThan(40);
    expect(left).toBeLessThan(55);
  });

  it('tasks=[] no rompe y muestra estado vacío', () => {
    render(<GanttChart tasks={[]} />);
    expect(screen.getByText(/No hay tareas/i)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('no rompe sin prop tasks', () => {
    expect(() => render(<GanttChart />)).not.toThrow();
  });
});
