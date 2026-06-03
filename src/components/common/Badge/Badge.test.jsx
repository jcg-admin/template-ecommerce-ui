/**
 * Tests: Badge — indicador nativo de conteo/estado (sin deps).
 * Casos de uso: contadores de carrito y notificaciones.
 */
import { render, screen } from '@testing-library/react';
import Badge from './index';

describe('Badge', () => {
  it('renderiza el value numérico', () => {
    render(<Badge value={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renderiza un value de texto', () => {
    render(<Badge value="new" />);
    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('clampa a "99+" por encima del max por defecto', () => {
    render(<Badge value={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('respeta un max personalizado y muestra "<max>+"', () => {
    render(<Badge value={12} max={9} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('no clampa cuando value es igual o menor al max', () => {
    render(<Badge value={9} max={9} />);
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.queryByText('9+')).not.toBeInTheDocument();
  });

  it('expone aria-label con el conteo', () => {
    render(<Badge value={5} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5');
  });

  it('se oculta cuando value es 0', () => {
    render(<Badge value={0} />);
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });

  it('se oculta cuando value es vacío/undefined', () => {
    render(<Badge value={undefined} />);
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });

  it('en modo dot no renderiza texto', () => {
    const { container } = render(<Badge dot value={7} />);
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('');
    expect(container).not.toHaveTextContent('7');
  });

  it('en modo dot permanece visible aunque value sea 0', () => {
    render(<Badge dot value={0} />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('envuelve a los children cuando se pasan', () => {
    render(
      <Badge value={2}>
        <button type="button">Carrito</button>
      </Badge>,
    );
    expect(screen.getByRole('button', { name: 'Carrito' })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('con children y value=0 muestra los children sin badge', () => {
    render(
      <Badge value={0}>
        <button type="button">Carrito</button>
      </Badge>,
    );
    expect(screen.getByRole('button', { name: 'Carrito' })).toBeInTheDocument();
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });
});
