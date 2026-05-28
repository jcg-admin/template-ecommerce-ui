/**
 * Tests — useSearch hook
 * Búsqueda de productos con debounce y historial
 */
import { renderHook, act } from '@testing-library/react';
import { Provider }  from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import catalogReducer from '@redux/slices/catalogSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
import apiService from '@services/apiService';
import useSearch from './useSearch';

const makeStore = () => configureStore({
  reducer: { catalog: catalogReducer },
  preloadedState: {
    catalog: {
      searchResults: [], searchQuery: '',
      isSearching: false, searchError: null,
    },
  },
});

const wrapper = (store) => ({ children }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    </QueryClientProvider>
  );
};

describe('useSearch', () => {
  it('retorna valores iniciales', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSearch(), { wrapper: wrapper(store) });
    expect(result.current).toBeDefined();
  });

  it('retorna el objeto de useQuery con data/isLoading', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSearch({ q: '' }), { wrapper: wrapper(store) });
    // useSearch retorna el resultado de useQuery
    expect(result.current).toBeDefined();
    expect('isLoading' in result.current || 'isFetching' in result.current).toBe(true);
  });

  it('isLoading es booleano', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSearch({ q: 'test' }), { wrapper: wrapper(store) });
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('data es null/undefined o tiene results array cuando no hay query', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSearch({ q: '' }), { wrapper: wrapper(store) });
    // Sin query válido, la query está deshabilitada — data es undefined
    const results = result.current.data?.results ?? [];
    expect(Array.isArray(results)).toBe(true);
  });
});
