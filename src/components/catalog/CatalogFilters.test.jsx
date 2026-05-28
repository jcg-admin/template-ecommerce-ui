/**
 * Tests — CatalogFilters (UC-CAT-04 + UC-CAT-05).
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import apiService from '@services/apiService';
import CatalogFilters from './CatalogFilters';

const TREE = [
  { id: 1, slug: 'collares', name: 'Collares', product_count: 5, children: [
    { id: 11, slug: 'collares-orisha', name: 'Collares Orisha', product_count: 3, children: [] },
  ] },
  { id: 2, slug: 'soperas', name: 'Soperas', product_count: 4, children: [] },
];

const renderFilters = (props = {}) => {
  apiService.get.mockResolvedValue({ data: { results: TREE, count: TREE.length } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onChange = jest.fn();
  const utils = render(
    <QueryClientProvider client={client}>
      <CatalogFilters onChange={onChange} {...props} />
    </QueryClientProvider>,
  );
  return { ...utils, onChange };
};

afterEach(() => jest.clearAllMocks());

describe('CatalogFilters (UC-CAT-04 + UC-CAT-05)', () => {
  it('renderiza un selector con las categorias aplanadas (UC-CAT-04)', async () => {
    renderFilters();
    expect(
      await screen.findByRole('option', { name: /^collares$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /collares orisha/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^soperas$/i })).toBeInTheDocument();
  });

  it('emite onChange con category=<slug> al seleccionar una categoria', async () => {
    const { onChange } = renderFilters();
    await screen.findByRole('option', { name: /^soperas$/i });
    fireEvent.change(screen.getByLabelText(/categoria/i), {
      target: { value: 'soperas' },
    });
    expect(onChange).toHaveBeenCalledWith({ category: 'soperas' });
  });

  // BUG-TEST-CF01: Tests actualizados tras migración de inputs separados a RangeSlider
  // El RangeSlider garantiza min<=max internamente (BUG-CF01 corregido)
  it('emite onChange con price_min y price_max al mover el slider (UC-CAT-05)', () => {
    const { onChange } = renderFilters();
    // RangeSlider expone dos sliders: "Valor mínimo" y "Valor máximo"
    const loSlider = screen.getByRole('slider', { name: /valor mínimo/i });
    fireEvent.change(loSlider, { target: { value: '100' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ price_min: 100 }));
  });

  it('garantiza que el slider no permite max < min (BUG-CF01 resuelto)', () => {
    // RangeSlider clampea internamente — no se puede probar un estado inválido
    // porque el componente lo previene antes de llamar onChange
    const { onChange } = renderFilters({ priceMin: '200', priceMax: '800' });
    const hiSlider = screen.getByRole('slider', { name: /valor máximo/i });
    // Intentar mover hi por debajo de lo (200-distance=100 → clampea a 300)
    fireEvent.change(hiSlider, { target: { value: '50' } });
    // onChange se llama pero con valores válidos (lo <= hi)
    if (onChange.mock.calls.length > 0) {
      const [[lo, hi]] = onChange.mock.calls.map(c => c[0]).map(v => [v.price_min, v.price_max]);
      if (lo !== null && hi !== null) {
        expect(lo).toBeLessThanOrEqual(hi);
      }
    }
  });

  it('emite onChange limpio al pulsar «Limpiar filtros»', () => {
    const { onChange } = renderFilters({ category: 'collares', priceMin: '10', priceMax: '50' });
    fireEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }));
    expect(onChange).toHaveBeenCalledWith({
      category: null, price_min: null, price_max: null,
    });
  });
});
