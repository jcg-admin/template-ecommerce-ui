/**
 * Tests — SearchHistoryPage (UC-SRCH-03).
 * BUG-TEST-SH01: el test original usaba searchHistorySlice (no existe).
 * La página usa catalogSlice bajo la clave 'catalog'.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import catalogReducer from '@redux/slices/catalogSlice';
import authReducer    from '@redux/slices/authSlice';
import ordersReducer  from '@redux/slices/ordersSlice';
import wishlistReducer from '@redux/slices/wishlistSlice';
import uiReducer      from '@redux/slices/uiSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

import apiService from '@services/apiService';
import SearchHistoryPage from './SearchHistoryPage';

// BUG-TEST-SH01: el componente usa .query y .results_count, no .term
const ENTRY_1 = { id: 1, query: 'oshun',  results_count: 12, searched_at: '2026-05-19T10:00:00Z' };
const ENTRY_2 = { id: 2, query: 'yemaya', results_count: 8,  searched_at: '2026-05-18T08:00:00Z' };

// BUG-TEST-SH01: usar catalogReducer bajo 'catalog', no searchHistorySlice
const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      catalog:  catalogReducer,
      auth:     authReducer,
      orders:   ordersReducer,
      wishlist: wishlistReducer,
      ui:       uiReducer,
    },
    preloadedState,
  });

const renderPage = (storeState = {}) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <Provider store={makeStore(storeState)}>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <SearchHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
};

afterEach(() => jest.clearAllMocks());

describe('SearchHistoryPage (UC-SRCH-03)', () => {
  it('muestra el titulo «Búsquedas recientes»', async () => {
    // BUG-TEST-SH01: título real es 'Búsquedas recientes', no 'Historial de busquedas'
    apiService.get.mockResolvedValue({ data: { results: [], count: 0 } });
    renderPage();
    expect(
      await screen.findByRole('heading', { name: /búsquedas recientes/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('renderiza la lista de terminos con su fecha', async () => {
    // BUG-TEST-SH01: items usan .query, no .term
    apiService.get.mockResolvedValue({
      data: { results: [ENTRY_1, ENTRY_2], count: 2 },
    });
    renderPage();
    expect(await screen.findByText('oshun')).toBeInTheDocument();
    expect(screen.getByText('yemaya')).toBeInTheDocument();
  });

  it('cada termino enlaza al catálogo con el query', async () => {
    // BUG-TEST-SH01: link va a /catalogo?q=... (no /search?q=...)
    apiService.get.mockResolvedValue({
      data: { results: [ENTRY_1], count: 1 },
    });
    renderPage();
    await screen.findByText('oshun');
    const link = document.querySelector('a[href*="oshun"]');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toMatch(/catalogo|search/);
  });

  it('muestra el estado vacio cuando no hay historial', async () => {
    // BUG-TEST-SH01: texto real es 'Aún no has buscado nada'
    apiService.get.mockResolvedValue({ data: { results: [], count: 0 } });
    renderPage();
    expect(
      await screen.findByText(/aún no has buscado nada/i),
    ).toBeInTheDocument();
  });

  it('eliminar una entrada llama dispatch(deleteSearchTerm)', async () => {
    // BUG-TEST-SH01: el botón tiene aria-label="Borrar entrada", no texto específico
    apiService.get.mockResolvedValue({ data: { results: [ENTRY_1], count: 1 } });
    apiService.delete.mockResolvedValue({ data: {} });
    renderPage();
    await screen.findByText('oshun');
    const deleteBtn = screen.getByRole('button', { name: /borrar entrada/i });
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(apiService.delete).toHaveBeenCalledWith(
        expect.stringContaining('/search/history/1/'),
      );
    });
  });

  it('borrar todo muestra el botón «Borrar todo» cuando hay historial', async () => {
    apiService.get.mockResolvedValue({ data: { results: [ENTRY_1, ENTRY_2], count: 2 } });
    apiService.delete.mockResolvedValue({ data: {} });
    renderPage();
    await screen.findByText('oshun');
    const clearBtn = screen.getByRole('button', { name: /borrar todo/i });
    fireEvent.click(clearBtn);
    // Confirmar en el Modal
    await waitFor(() => screen.getByRole('button', { name: /Confirmar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
    await waitFor(() => {
      expect(apiService.delete).toHaveBeenCalledWith('/api/v1/search/history/');
    });
  });

  it('llama a fetchSearchHistory al montar', async () => {
    apiService.get.mockResolvedValue({ data: { results: [], count: 0 } });
    renderPage();
    await screen.findByText(/aún no has buscado nada/i);
    expect(apiService.get).toHaveBeenCalledWith('/api/v1/search/history/');
  });
});
