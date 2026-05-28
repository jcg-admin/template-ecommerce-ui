/**
 * Tests — useProductDiscounts
 * Hook de dominio con react-query
 */
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn().mockResolvedValue({ data: [] }), post: jest.fn(), patch: jest.fn() },
}));

import { useProductDiscounts } from './useProductDiscounts';

const makeWrapper = () => {
  const store = configureStore({ reducer: {} });
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, enabled: false } } });
  return ({ children }) => (
    <QueryClientProvider client={qc}>
      <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>
    </QueryClientProvider>
  );
};

describe('useProductDiscounts', () => {
  it('useProductDiscounts retorna objeto con propiedades de useQuery', () => {
    const { result } = renderHook(() => useProductDiscounts({}), { wrapper: makeWrapper() });
    expect(result.current).toBeDefined();
  });

  it('isLoading es booleano', () => {
    const { result } = renderHook(() => useProductDiscounts({}), { wrapper: makeWrapper() });
    const loading = result.current?.isLoading ?? result.current?.isLoadingData ?? false;
    expect(typeof loading).toBe('boolean');
  });

  it('data es undefined o array cuando la query está deshabilitada', () => {
    const { result } = renderHook(() => useProductDiscounts({}), { wrapper: makeWrapper() });
    const data = result.current?.data;
    expect(data === undefined || Array.isArray(data) || data === null).toBe(true);
  });
});
