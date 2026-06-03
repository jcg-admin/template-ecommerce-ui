/**
 * Tests: Skeleton — placeholder de carga accesible nativo (sin deps).
 * Inspirado en kno-react-indicators Skeleton.
 */
import { render, screen } from '@testing-library/react';
import Skeleton from './index';

describe('Skeleton', () => {
  it('expone role="status" con aria-busy', () => {
    render(<Skeleton />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('usa ariaLabel "Cargando" por defecto', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando');
  });

  it('acepta un ariaLabel personalizado', () => {
    render(<Skeleton ariaLabel="Cargando productos" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando productos');
  });

  it('renderiza 1 pieza por defecto (text, count=1)', () => {
    render(<Skeleton />);
    expect(screen.getAllByTestId('skeleton-piece')).toHaveLength(1);
  });

  it('renderiza count líneas para shape text', () => {
    render(<Skeleton shape="text" count={4} />);
    expect(screen.getAllByTestId('skeleton-piece')).toHaveLength(4);
  });

  it('count no afecta a las formas no-text (siempre 1 pieza)', () => {
    render(<Skeleton shape="rectangle" count={5} />);
    expect(screen.getAllByTestId('skeleton-piece')).toHaveLength(1);
  });

  it('aplica width y height en el estilo (numéricos como px)', () => {
    render(<Skeleton shape="rectangle" width={200} height={120} />);
    const piece = screen.getByTestId('skeleton-piece');
    expect(piece).toHaveStyle({ width: '200px', height: '120px' });
  });

  it('acepta width/height como string CSS', () => {
    render(<Skeleton shape="rectangle" width="50%" height="2rem" />);
    const piece = screen.getByTestId('skeleton-piece');
    expect(piece).toHaveStyle({ width: '50%', height: '2rem' });
  });

  it('marca las piezas como aria-hidden', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton-piece')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shape text por defecto', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton-piece')).toHaveAttribute('data-shape', 'text');
  });

  it('variante circle marca data-shape="circle"', () => {
    render(<Skeleton shape="circle" />);
    expect(screen.getByTestId('skeleton-piece')).toHaveAttribute('data-shape', 'circle');
  });

  it('variante rectangle marca data-shape="rectangle"', () => {
    render(<Skeleton shape="rectangle" />);
    expect(screen.getByTestId('skeleton-piece')).toHaveAttribute('data-shape', 'rectangle');
  });

  it('aplica la animación pulse por defecto', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton-piece')).toHaveAttribute('data-animation', 'pulse');
  });

  it('animation="wave" marca data-animation="wave"', () => {
    render(<Skeleton animation="wave" />);
    expect(screen.getByTestId('skeleton-piece')).toHaveAttribute('data-animation', 'wave');
  });

  it('animation="none" marca data-animation="none"', () => {
    render(<Skeleton animation="none" />);
    expect(screen.getByTestId('skeleton-piece')).toHaveAttribute('data-animation', 'none');
  });

  it('count inválido (0) cae a 1 pieza de forma segura', () => {
    render(<Skeleton shape="text" count={0} />);
    expect(screen.getAllByTestId('skeleton-piece')).toHaveLength(1);
  });
});
