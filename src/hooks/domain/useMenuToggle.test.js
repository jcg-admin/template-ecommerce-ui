/**
 * Tests — useMenuToggle
 * Toggle de menú lateral (Redux)
 */
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '@redux/slices/uiSlice';
import { useMenuToggle } from './useMenuToggle';



const makeWrapper = () => {
  const store = configureStore({ reducer: {ui: uiReducer} });
  return ({ children }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );
};

describe('useMenuToggle', () => {
  it('retorna objeto válido', () => {
    const { result } = renderHook(
      () => useMenuToggle(),
      { wrapper: makeWrapper() }
    );
    expect(result.current).toBeDefined();
  });

  it('el resultado es un objeto o primitivo', () => {
    const { result } = renderHook(
      () => useMenuToggle(),
      { wrapper: makeWrapper() }
    );
    expect(result.current !== null).toBe(true);
  });
});
