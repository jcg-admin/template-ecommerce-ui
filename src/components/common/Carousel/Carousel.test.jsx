import { render, screen, fireEvent } from '@testing-library/react';
import Carousel from './Carousel';

const slides = ['Slide 1', 'Slide 2', 'Slide 3'];

describe('Carousel', () => {
  it('renderiza todos los slides', () => {
    render(<Carousel>{slides.map((s, i) => <div key={i}>{s}</div>)}</Carousel>);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });

  it('tiene aria-label de carrusel', () => {
    render(<Carousel ariaLabel="Galería de productos">{slides.map((s, i) => <div key={i}>{s}</div>)}</Carousel>);
    expect(screen.getByRole('region', { name: 'Galería de productos' })).toBeInTheDocument();
  });

  it('muestra botones de navegación prev/next', () => {
    render(<Carousel>{slides.map((s, i) => <div key={i}>{s}</div>)}</Carousel>);
    expect(screen.getByRole('button', { name: 'Diapositiva anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente diapositiva' })).toBeInTheDocument();
  });

  it('muestra dots de navegación', () => {
    render(<Carousel>{slides.map((s, i) => <div key={i}>{s}</div>)}</Carousel>);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('dot activo tiene aria-selected=true', () => {
    render(<Carousel>{slides.map((s, i) => <div key={i}>{s}</div>)}</Carousel>);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('cada slide tiene aria-roledescription y aria-label', () => {
    render(<Carousel>{slides.map((s, i) => <div key={i}>{s}</div>)}</Carousel>);
    const groups = screen.getAllByRole('group');
    expect(groups[0]).toHaveAttribute('aria-label', '1 de 3');
  });
});
