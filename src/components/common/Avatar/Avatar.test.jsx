/**
 * Tests: Avatar — image / initials / glyph fallback + size & shape
 */
import { render, screen } from '@testing-library/react';
import Avatar from './index';

describe('Avatar', () => {
  it('renderiza <img> cuando hay src', () => {
    render(<Avatar src="/u/ada.png" alt="Ada Lovelace" />);
    const img = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/u/ada.png');
  });

  it('usa name como alt de la imagen si no se pasa alt', () => {
    render(<Avatar src="/u/ada.png" name="Ada Lovelace" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
      'src',
      '/u/ada.png',
    );
  });

  it('renderiza iniciales a partir de name cuando no hay src', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
  });

  it('una sola palabra produce una inicial en mayúscula', () => {
    render(<Avatar name="madonna" />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('no renderiza <img> cuando solo hay name', () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('renderiza el glifo genérico cuando no hay src ni name', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Usuario' })).toBeInTheDocument();
  });

  it('refleja size en data-size (sm / lg)', () => {
    const { container, rerender } = render(<Avatar name="Ada" size="sm" />);
    expect(container.firstChild).toHaveAttribute('data-size', 'sm');
    rerender(<Avatar name="Ada" size="lg" />);
    expect(container.firstChild).toHaveAttribute('data-size', 'lg');
  });

  it('usa size md por defecto', () => {
    const { container } = render(<Avatar name="Ada" />);
    expect(container.firstChild).toHaveAttribute('data-size', 'md');
  });

  it('refleja shape en data-shape (square / circle)', () => {
    const { container, rerender } = render(<Avatar name="Ada" shape="square" />);
    expect(container.firstChild).toHaveAttribute('data-shape', 'square');
    rerender(<Avatar name="Ada" shape="circle" />);
    expect(container.firstChild).toHaveAttribute('data-shape', 'circle');
  });

  it('usa shape circle por defecto', () => {
    const { container } = render(<Avatar name="Ada" />);
    expect(container.firstChild).toHaveAttribute('data-shape', 'circle');
  });
});
