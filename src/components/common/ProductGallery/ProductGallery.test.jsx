/**
 * Tests: ProductGallery — galería de imágenes de producto nativa.
 * Cobertura:
 *   - Renderiza la imagen principal de initialIndex.
 *   - Click en thumbnail cambia la imagen principal y marca aria-current.
 *   - Botón siguiente/anterior avanza/retrocede CON WRAP.
 *   - Teclado ArrowLeft/ArrowRight navega.
 *   - images=[] no rompe (placeholder seguro).
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ProductGallery from './index';

const IMAGES = [
  { id: 'a', url: '/img/a.jpg', alt: 'Imagen A' },
  { id: 'b', url: '/img/b.jpg', alt: 'Imagen B' },
  { id: 'c', url: '/img/c.jpg', alt: 'Imagen C' },
];

describe('ProductGallery', () => {
  it('renderiza la imagen principal de initialIndex', () => {
    render(<ProductGallery images={IMAGES} initialIndex={1} />);
    const main = screen.getByTestId('product-gallery-main');
    expect(main).toHaveAttribute('src', '/img/b.jpg');
    expect(main).toHaveAttribute('alt', 'Imagen B');
  });

  it('usa el índice 0 por defecto', () => {
    render(<ProductGallery images={IMAGES} />);
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/a.jpg');
  });

  it('click en un thumbnail cambia la imagen principal', () => {
    render(<ProductGallery images={IMAGES} />);
    fireEvent.click(screen.getByRole('button', { name: /Ver imagen 3 de 3/ }));
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/c.jpg');
  });

  it('marca el thumbnail activo con aria-current=true', () => {
    render(<ProductGallery images={IMAGES} initialIndex={0} />);
    const thumb1 = screen.getByRole('button', { name: /Ver imagen 1 de 3/ });
    expect(thumb1).toHaveAttribute('aria-current', 'true');
    const thumb2 = screen.getByRole('button', { name: /Ver imagen 2 de 3/ });
    expect(thumb2).not.toHaveAttribute('aria-current');
  });

  it('el botón siguiente avanza la imagen', () => {
    render(<ProductGallery images={IMAGES} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }));
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/b.jpg');
  });

  it('el botón anterior retrocede la imagen', () => {
    render(<ProductGallery images={IMAGES} initialIndex={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Imagen anterior' }));
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/a.jpg');
  });

  it('siguiente desde el último vuelve al primero (wrap)', () => {
    render(<ProductGallery images={IMAGES} initialIndex={2} />);
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }));
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/a.jpg');
  });

  it('anterior desde el primero va al último (wrap)', () => {
    render(<ProductGallery images={IMAGES} initialIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Imagen anterior' }));
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/c.jpg');
  });

  it('ArrowRight / ArrowLeft navegan con foco en la galería', () => {
    render(<ProductGallery images={IMAGES} initialIndex={0} />);
    const gallery = screen.getByRole('group', { name: 'Galería de imágenes del producto' });
    gallery.focus();
    fireEvent.keyDown(gallery, { key: 'ArrowRight' });
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/b.jpg');
    fireEvent.keyDown(gallery, { key: 'ArrowLeft' });
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/a.jpg');
  });

  it('con images=[] no rompe y muestra placeholder seguro', () => {
    render(<ProductGallery images={[]} />);
    expect(screen.getByRole('img', { name: 'Sin imágenes disponibles' })).toBeInTheDocument();
    expect(screen.queryByTestId('product-gallery-main')).not.toBeInTheDocument();
  });

  it('sin prop images no rompe', () => {
    render(<ProductGallery />);
    expect(screen.getByRole('img', { name: 'Sin imágenes disponibles' })).toBeInTheDocument();
  });

  it('con una sola imagen no muestra controles ni thumbnails', () => {
    render(<ProductGallery images={[IMAGES[0]]} />);
    expect(screen.queryByRole('button', { name: 'Imagen siguiente' })).not.toBeInTheDocument();
    expect(screen.getByTestId('product-gallery-main')).toHaveAttribute('src', '/img/a.jpg');
  });
});
