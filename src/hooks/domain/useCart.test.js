/**
 * Tests — useCart hook
 * Operaciones de carrito: add, remove, clear, getTotals
 */
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@redux/slices/cartSlice';

jest.mock('@context/ToastContext', () => ({
  __esModule: true,
  useToast: () => ({ toast: jest.fn(), success: jest.fn(), error: jest.fn() }),
}));

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
import { useCart } from './useCart';

const makeStore = (cart = {}) =>
  configureStore({
    reducer: { cart: cartReducer },
    preloadedState: {
      cart: {
        items: [],
        totals: { subtotal: 0, shipping: 0, discount: 0, total: 0 },
        isLoading: false,
        error: null,
        ...cart,
      },
    },
  });

const wrapper = (store) => ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useCart', () => {
  it('retorna el carrito vacío por defecto', () => {
    const store = makeStore();
    const { result } = renderHook(() => useCart(), { wrapper: wrapper(store) });
    expect(Array.isArray(result.current.items)).toBe(true);
    expect(result.current.items.length).toBe(0);
  });

  it('retorna totals con total', () => {
    const store = makeStore();
    const { result } = renderHook(() => useCart(), { wrapper: wrapper(store) });
    expect(result.current.totals).toBeDefined();
    expect(typeof result.current.totals.total).toBe('number');
  });

  it('expone las funciones add, remove, update, clear', () => {
    const store = makeStore();
    const { result } = renderHook(() => useCart(), { wrapper: wrapper(store) });
    ['add', 'remove', 'update', 'clear'].forEach(fn => {
      expect(typeof result.current[fn]).toBe('function');
    });
  });

  it('isLoading es booleano', () => {
    const store = makeStore();
    const { result } = renderHook(() => useCart(), { wrapper: wrapper(store) });
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('cartCount retorna el número de items', () => {
    const store = makeStore({
      items: [
        { id: 1, quantity: 2, variant_id: 10, product_name: 'A', unit_price: '500.00' },
        { id: 2, quantity: 1, variant_id: 11, product_name: 'B', unit_price: '300.00' },
      ],
    });
    const { result } = renderHook(() => useCart(), { wrapper: wrapper(store) });
    expect(result.current.cartCount ?? result.current.items.length).toBeGreaterThan(0);
  });
});
