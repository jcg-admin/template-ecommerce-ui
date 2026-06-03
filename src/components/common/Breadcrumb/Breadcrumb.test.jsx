/**
 * Tests: Breadcrumb — migas de pan nativas (UC-CAT navigation)
 * Router-agnostic: items con `to` -> <a>, sin `to` -> <button>.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Breadcrumb from './Breadcrumb';

const items = [
  { label: 'Inicio', to: '/' },
  { label: 'Catálogo', onClick: jest.fn() },
  { label: 'Producto actual' },
];

describe('Breadcrumb', () => {
  it('renderiza todas las labels', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Producto actual')).toBeInTheDocument();
  });

  it('expone <nav> con aria-label por defecto', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('navigation', { name: 'Migas de pan' })).toBeInTheDocument();
  });

  it('el ultimo item es texto plano con aria-current="page"', () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByText('Producto actual');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.tagName).toBe('SPAN');
  });

  it('item con `to` se renderiza como enlace con href', () => {
    render(<Breadcrumb items={items} />);
    const link = screen.getByRole('link', { name: 'Inicio' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('item sin `to` se renderiza como <button>', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('button', { name: 'Catálogo' })).toBeInTheDocument();
  });

  it('click en un item no-ultimo llama a su onClick', () => {
    const onClick = jest.fn();
    const data = [
      { label: 'Inicio', onClick },
      { label: 'Final' },
    ];
    render(<Breadcrumb items={data} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inicio' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('onItemSelect se dispara al seleccionar un item no-ultimo', () => {
    const onItemSelect = jest.fn();
    render(<Breadcrumb items={items} onItemSelect={onItemSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Catálogo' }));
    expect(onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Catálogo' }),
    );
  });

  it('inserta separadores entre items (N items -> N-1 separadores)', () => {
    const { container } = render(<Breadcrumb items={items} separator="/" />);
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(items.length - 1);
    separators.forEach((sep) => expect(sep).toHaveTextContent('/'));
  });

  it('acepta un separador custom como node', () => {
    const { container } = render(<Breadcrumb items={items} separator="›" />);
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators[0]).toHaveTextContent('›');
  });

  it('no renderiza nada si items esta vacio', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
